import type { Locator, Page } from '@playwright/test';
import { BasePage } from '../../../framework/pages/BasePage';
import { AddQuoteLocators } from './add-quote.locators';

/** Plain input shape for the Add Quote modal — the spec builds this from
 * alis/knowledge/add-quote.json after resolving its placeholders. Kept
 * independent of the JSON's own shape so this Page Object has no test-data
 * knowledge of its own (see BasePage's rules).
 *
 * Proposed Effective/Proposed Expiry are deliberately not part of this
 * shape: add-quote.md's own "Correction/callout" recommends leaving them at
 * the modal's defaults whenever no specific date is required, and Proposed
 * Expiry is read-only/disabled anyway (confirmed live), so there is nothing
 * for this page to set. */
export interface AddQuoteInput {
  coverage?: string | null;
  cob?: string | null;
  product?: string | null;
  operation?: string | null;
  filingState?: string | null;
  term?: number | string | null;
}

/**
 * Page Object for the Add Quote modal, reached from an existing Submission's
 * (or Quote's) page — see new-insured-form.md / create-submission.page.ts
 * for how a submission is created in the first place. Actions only — no
 * assertions, no JSON imports, no test data (see BasePage's rules).
 */
export class AddQuotePage extends BasePage {
  private readonly locators: AddQuoteLocators;

  constructor(page: Page) {
    super(page);
    this.locators = new AddQuoteLocators(page);
  }

  /** Clicks the "+ Add Quote" trigger and, if the Acknowledgement Email
   * confirm dialog happens to appear, dismisses it with Cancel so the Add
   * Quote modal opens normally.
   *
   * <!-- fragile --> Confirmed live 2026-09-25 this dialog is genuinely
   * inconsistent on this instance (see add-quote.md's "Correction"
   * callouts) — it did not appear at all in the pass this method was built
   * against. Never assume it will or won't appear; wait briefly and only
   * interact with it if it actually renders. */
  async open(): Promise<void> {
    await this.click(this.locators.addQuoteTrigger);

    const ackAppeared = await this.locators
      .acknowledgementEmailDialogButton('Cancel')
      .waitFor({ state: 'visible', timeout: 4000 })
      .then(() => true)
      .catch(() => false);
    if (ackAppeared) {
      await this.click(this.locators.acknowledgementEmailDialogButton('Cancel'));
    }

    // <!-- fragile --> New finding, not yet independently live-verified (see
    // add-quote.locators.ts's own note on notLicensedSwitch): a "Not
    // licensed to work in this State" confirm can appear here too, not only
    // at Create Option time. Same standing instruction as
    // market-selection.md: check the box, click Ok.
    const notLicensedAppeared = await this.locators.notLicensedSwitch
      .waitFor({ state: 'visible', timeout: 4000 })
      .then(() => true)
      .catch(() => false);
    if (notLicensedAppeared) {
      await this.check(this.locators.notLicensedSwitch);
      await this.click(this.locators.notLicensedDialogButton('Ok'));
    }

    await this.waitForVisible(this.locators.coverageField, 15000);
  }

  async fill(input: AddQuoteInput): Promise<void> {
    if (input.coverage) {
      await this.selectLookupSuggestion(this.locators.coverageField, input.coverage);
    }
    if (input.cob) {
      // <!-- fragile --> COB's own suggestions are scoped to whichever
      // Coverage is selected and are NOT reliably matched by typing the
      // Coverage's own name — clearing the field and focusing it empty
      // first surfaces its full scoped option list instead. Confirmed live
      // 2026-09-25 (see add-quote.md's environment-variant callout).
      await this.selectLookupSuggestion(this.locators.cobField, input.cob, { focusEmptyFirst: true });
    }
    if (input.product) {
      await this.selectLookupSuggestion(this.locators.productField, input.product);
    }
    if (input.operation) {
      await this.selectLookupSuggestion(this.locators.operationField, input.operation);
    }
    if (input.filingState) {
      await this.select(this.locators.filingStateDropdown, input.filingState);
    }
    if (input.term != null) {
      await this.select(this.locators.termDropdown, String(input.term));
    }
  }

  /** Clicks "Add Quote" and, if a quote with the same Coverage/COB already
   * exists on this submission, handles the resulting "Quote Already
   * Available. Would you like to Create duplicate Quote?" confirm by
   * clicking Ok — confirmed live 2026-09-25 this proceeds to actually create
   * the duplicate quote, and that this dialog can genuinely appear on a
   * fresh submission whenever the same Coverage/COB combination was already
   * added (e.g. by an earlier run against the same test agency/insured). */
  async submit(): Promise<void> {
    await this.click(this.locators.addQuoteSubmitButton);

    const duplicateAppeared = await this.locators
      .duplicateQuoteDialogButton('Ok')
      .waitFor({ state: 'visible', timeout: 5000 })
      .then(() => true)
      .catch(() => false);
    if (duplicateAppeared) {
      await this.click(this.locators.duplicateQuoteDialogButton('Ok'));
    }

    // <!-- fragile --> New finding, not yet independently live-verified (see
    // add-quote.locators.ts's own note on popupNotesDialogOkButton): a
    // "Popup Notes" dialog (Agency-level System Notes, same shape seen
    // elsewhere in this app) can appear right after submitting. Dismiss it
    // with OK before waiting for the new quote tab. Kept optional rather
    // than a hard assertion (per explicit instruction) — it stays a
    // best-effort step in case a future agency in the JSON data has no
    // System Notes and this never renders. 10s (not the usual 4-5s used
    // elsewhere in this file) because this dialog has been observed to take
    // longer to render than the others.
    const popupNotesAppeared = await this.locators.popupNotesDialogOkButton
      .waitFor({ state: 'visible', timeout: 10000 })
      .then(() => true)
      .catch(() => false);
    if (popupNotesAppeared) {
      await this.click(this.locators.popupNotesDialogOkButton);
    }

    // await this.waitForVisible(this.locators.newQuoteTab, 20000);
  }

  /**
   * Types into a Coverage/COB/Product/Operation type-ahead and clicks the
   * suggestion whose text, after stripping a leading "(CODE) " prefix,
   * exactly equals `label` — never a plain substring match.
   *
   * <!-- fragile --> Confirmed live 2026-09-25: COB's own option list can
   * contain two rows where one's full label is a genuine substring of the
   * other's (e.g. "(COB106) ARTISAN CONTRACTOR" vs. "(WART) WW - ARTISAN
   * CONTRACTORS" — the target label "ARTISAN CONTRACTOR" is a substring of
   * *both*), so `exact: false` text matching is unsafe here. The regex used
   * by `suggestionByExactLabel()` anchors both ends, so it only matches a
   * row whose label, after its code prefix, is exactly `label` — confirmed
   * this correctly isolates "(COB106) ARTISAN CONTRACTOR" alone even with
   * both rows rendered together. This throws (rather than silently clicking
   * `.first()`) if that isn't exactly one match, since a near-duplicate
   * mismatch here is exactly the failure mode this method exists to avoid. */
  private async selectLookupSuggestion(
    field: Locator,
    label: string,
    opts: { focusEmptyFirst?: boolean } = {},
  ): Promise<void> {
    if (opts.focusEmptyFirst) {
      await this.enter(field, '');
      await this.click(field);
    } else {
      await this.enter(field, label);
    }

    const suggestion = this.locators.suggestionByExactLabel(label);
    await this.locators.suggestionContainer.waitFor({ state: 'visible', timeout: 10000 });

    const count = await suggestion.count();
    if (count !== 1) {
      throw new Error(
        `Expected exactly one suggestion exactly matching "${label}", found ${count}. A plain ` +
        `substring match is unsafe on this field — see add-quote.md's near-duplicate callout.`,
      );
    }
    await this.click(suggestion);
  }

  // -------------------------------------------------------------------
  // State getters / readers — exposed for the spec to assert on.
  // -------------------------------------------------------------------

  get newQuoteTabLocator() {
    return this.locators.newQuoteTab;
  }

  async getNewQuoteCode(): Promise<string> {
    return this.textOf(this.locators.newQuoteTab);
  }

  statusBadgeLocator(statusText: string) {
    return this.locators.statusBadge(statusText);
  }
}