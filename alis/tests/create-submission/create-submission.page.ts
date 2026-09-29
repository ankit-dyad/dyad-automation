import type { Locator, Page } from '@playwright/test';
import { BasePage } from '../../../framework/pages/BasePage';
import { CreateSubmissionLocators } from './create-submission.locators';

/** Plain input shape for the Insured section — the spec builds this from
 * alis/knowledge/create-submission.json after resolving its placeholders
 * (see framework/utils/dates.ts). Kept independent of the JSON's own shape so
 * this Page Object has no test-data/JSON knowledge of its own (see
 * BasePage's rules). */
export interface InsuredDetailsInput {
  applicantType: string; // must match a radio's exact visible label on this form, e.g. 'Corp.'
  fullName: string;
  mailingAddress: string;
  mailingAddress2?: string | null;
  /** What to type into the City/State/Zip type-ahead, e.g. "LARUE, MS". */
  cityStateZipSearch: string;
  physicalAddressSameAsMailing: boolean;
  occupation?: string | null;
  co?: string | null;
  dateOfBirth?: string | null;
  email?: string | null;
  phone?: string | null;
  ext?: string | null;
  fax?: string | null;
  identificationType?: 'FEIN' | 'SSN' | null;
  /** true→Yes, false→No, null/undefined→leave the form's own default (see
   * new-insured-form.md for each question's documented default). */
  isApplicantEmployedRetiredOrDisabled?: boolean | null;
  bankruptcyJudgementRepossessionPastDue5Yrs?: boolean | null;
  isRollover?: boolean | null;
  hasSpouseOrCoApplicant?: boolean | null;
  notes?: string | null;
}

export interface AccountInformationInput {
  office: string;
  team: string;
  uwBroker?: string | null;
  assistant?: string | null;
  originatingUwBroker?: string | null;
  secondaryUw?: string | null;
  renewalQuoter?: string | null;
  filingState?: string | null;
}

/**
 * Page Object for the New Insured / Create Submission flow. Actions only — no
 * assertions, no JSON imports, no test data (see BasePage's rules). The spec
 * resolves create-submission.json's placeholders and passes plain values in.
 *
 * This page has no `path`/goto() of its own — it's reached only via the
 * Clearance Search sidebar (openNewInsuredForm()), per new-insured-form.md's
 * documented entry point.
 */
export class CreateSubmissionPage extends BasePage {
  private readonly locators: CreateSubmissionLocators;

  constructor(page: Page) {
    super(page);
    this.locators = new CreateSubmissionLocators(page);
  }

  /** Opens the Clearance Search sidebar (the green "+" icon on the left icon
   * rail), runs a deliberately-blank search (new-insured-form.md: typing into
   * the search first is NOT the correct flow — a blank search returning "No
   * Rows To Show" is expected), waits for the results screen's New Insured
   * button to appear, closes the sidebar so nothing is left overlaying the
   * screen, and only THEN clicks New Insured — per the confirmed manual
   * flow: "Click the + icon, then click Search, then close the search
   * sidebar once New Insured is visible, then click New Insured." Closing
   * the sidebar before that last click (not after) avoids the sidebar/its
   * backdrop ever being able to intercept the click, which is a real risk at
   * narrower viewport widths even though the button itself isn't visually
   * covered at wider ones.
   *
   * Each step waits explicitly (with its own generous timeout) rather than
   * relying on Playwright's default action timeout, because the post-login
   * dashboard (icon rail, header) has been observed to take noticeably
   * longer to finish rendering than a bare click's default wait allows for
   * — a slow first render here should fail with a clear "X never became
   * visible" at the step that's actually slow, not eat the whole test's time
   * budget and surface as a generic timeout on whichever line happened to be
   * running when the clock ran out. */
  async openNewInsuredForm(): Promise<void> {
    await this.waitForVisible(this.locators.clearanceSearchButton, 20000);

    // login.page.ts documents the same symptom on the Log In button: the
    // very first click right after a page finishes navigating can land
    // before Angular has fully wired up its click handlers and gets
    // silently swallowed, even though the element is already visible.
    // Click, give the sidebar a short window to actually open, and click
    // once more if it didn't — rather than assuming one click is enough and
    // failing 10s later on a symptom two steps downstream.
    await this.click(this.locators.clearanceSearchButton);
    const openedOnFirstClick = await this.locators.clearanceSearchPanelSearchButton
      .waitFor({ state: 'visible', timeout: 5000 })
      .then(() => true)
      .catch(() => false);
    if (!openedOnFirstClick) {
      await this.click(this.locators.clearanceSearchButton);
      await this.waitForVisible(this.locators.clearanceSearchPanelSearchButton, 15000);
    }

    await this.click(this.locators.clearanceSearchPanelSearchButton);

    // Wait for the results screen (and its New Insured button) to actually
    // be there before closing the sidebar — closing it too early, while the
    // blank search is still in flight, would just reopen the same race.
    await this.waitForVisible(this.locators.newInsuredButton, 15000);

    await this.waitForVisible(this.locators.clearanceSearchCloseButton, 10000);
    await this.click(this.locators.clearanceSearchCloseButton);

    // Only click New Insured once the sidebar is fully closed and out of the
    // way, per the confirmed flow above.
    await this.click(this.locators.newInsuredButton);
  }

  /** Types into the Agency type-ahead and clicks the exact matching
   * suggestion. Near-duplicate agency names are common on this form (see
   * new-insured-form.md's "near-identical matches" callout) — always
   * disambiguate by the suggestion's own agency-code badge, never assume the
   * first result or rely on keyboard selection for a multi-match search.
   *
   * <!-- fragile --> Two separate issues were confirmed live 2026-09-24,
   * both against a real run of this method, not guessed:
   *  1. Typing the FULL label (including the trailing "(AGT007)"-style
   *     agency code) into the search box returns ZERO suggestions — the
   *     type-ahead only matches on the agency's *name*, and the appended
   *     "(CODE)" breaks the match entirely. Search on the name portion only.
   *  2. Matching the suggestion by name/city text (what this method used to
   *     do) is unsafe: this form's near-duplicate agencies can share the
   *     exact same city/state/zip text, and a suggestion's name renders
   *     duplicated across two nested spans — so a text match can hit zero,
   *     or the wrong, row. The suggestion's own code badge (e.g. "(AGT007)")
   *     is the one part of a row that's both a single clean text node and
   *     guaranteed unique per agency — confirmed unique even with two
   *     near-duplicate agencies showing at once. Click that instead. */
  async selectAgency(agencyLabel: string): Promise<void> {
    const searchName = agencyLabel.replace(/\s*\([^)]*\)\s*$/, '').trim() || agencyLabel;
    await this.enter(this.locators.agencyField, searchName);

    const codeMatch = agencyLabel.match(/\(([^)]+)\)\s*$/);
    if (!codeMatch) {
      throw new Error(
        `selectAgency(): "${agencyLabel}" has no trailing "(CODE)" to disambiguate on. This ` +
          `form's suggestion rows are only reliably matched by their code badge (see this ` +
          `method's own comments and new-insured-form.md's "near-identical matches" callout) ` +
          `— update create-submission.json's "agency" value to include one, e.g. "Name(AGT007)".`,
      );
    }
    await this.page.waitForTimeout(8000); // wait for the type-ahead to render its suggestions
    const suggestion = this.locators.agencySuggestionByCode(`(${codeMatch[1]})`).first();
    await this.page.waitForTimeout(8000); // wait for the type-ahead to render its suggestions
    await suggestion.waitFor({ state: 'visible' });
    await this.click(suggestion);
  }

  async selectApplicantType(label: string): Promise<void> {
    await this.check(this.locators.applicantTypeRadio(label));
  }

  async expandAdditionalInformation(): Promise<void> {
    await this.click(this.locators.addMoreInformationButton);
    // The Additional Information fields are only mounted into the DOM once
    // this section expands — wait for one of them rather than assuming the
    // click's own completion means the new fields are already interactable.
    await this.waitForVisible(this.locators.occupationField, 10000);
  }

  async fillInsuredDetails(input: InsuredDetailsInput): Promise<void> {
    await this.enter(this.locators.fullNameField, input.fullName);
    await this.enter(this.locators.mailingAddressField, input.mailingAddress);
    if (input.mailingAddress2) {
      await this.enter(this.locators.mailingAddress2Field, input.mailingAddress2);
    }

    await this.enter(this.locators.cityStateZipField, input.cityStateZipSearch);
    const searchTerm = input.cityStateZipSearch.split(',')[0].trim();
    const suggestion = this.locators.cityStateZipSuggestion(searchTerm).first();
    await suggestion.waitFor({ state: 'visible' });
    await this.click(suggestion);

    const isChecked = await this.locators.physicalSameAsMailingCheckbox.isChecked();
    if (input.physicalAddressSameAsMailing && !isChecked) {
      await this.check(this.locators.physicalSameAsMailingCheckbox);
    } else if (!input.physicalAddressSameAsMailing && isChecked) {
      await this.uncheck(this.locators.physicalSameAsMailingCheckbox);
    }
  }

  async fillAdditionalInformation(input: InsuredDetailsInput): Promise<void> {
    if (input.occupation) await this.enter(this.locators.occupationField, input.occupation);
    if (input.co) await this.enter(this.locators.coField, input.co);
    if (input.dateOfBirth) await this.enter(this.locators.dateOfBirthField, input.dateOfBirth);
    if (input.email) await this.enter(this.locators.emailField, input.email);
    if (input.phone) await this.enter(this.locators.phoneField, input.phone);
    if (input.ext) await this.enter(this.locators.extnField, input.ext);
    if (input.fax) await this.enter(this.locators.faxField, input.fax);

    if (input.identificationType === 'SSN') {
      await this.check(this.locators.ssnRadio);
    } else if (input.identificationType === 'FEIN') {
      await this.check(this.locators.feinRadio); // also this form's own default
    }

   
    await this.setYesNo(
      input.bankruptcyJudgementRepossessionPastDue5Yrs,
      this.locators.bankruptcyYes,
      this.locators.bankruptcyNo,
    );
    await this.setYesNo(input.isRollover, this.locators.rolloverYes, this.locators.rolloverNo);
    // Defaults to Yes on a fresh form — set explicitly rather than relying on it
    // whenever the JSON specifies a value (see new-insured-form.md).
    await this.setYesNo(input.hasSpouseOrCoApplicant, this.locators.coApplicantYes, this.locators.coApplicantNo);

    if (input.notes) await this.enter(this.locators.notesField, input.notes);
  }

  /** true→Yes, false→No, null/undefined→leave the form's own default untouched. */
  private async setYesNo(value: boolean | null | undefined, yes: Locator, no: Locator): Promise<void> {
    if (value === true) await this.check(yes);
    else if (value === false) await this.check(no);
  }

  async fillAccountInformation(input: AccountInformationInput): Promise<void> {
    // Office and Team MUST be set before any personnel dropdown — see
    // new-insured-form.md's cascading-reset behavior.
    await this.select(this.locators.officeDropdown, input.office);
    await this.page.waitForTimeout(2000); // wait for Team to populate after Office selection
    await this.selectByNormalizedLabel(this.locators.teamDropdown, input.team);
    
   //if (input.uwBroker) { await this.selectByNormalizedLabel(this.locators.uwBrokerDropdown, input.uwBroker);}

  // await this.selectByNormalizedLabel(this.locators.assistantDropdown, input.assistant);
  // if (input.originatingUwBroker) {
  //     await this.selectByNormalizedLabel(this.locators.originatingUwBrokerDropdown, input.originatingUwBroker);
  //   }
    
    // City/State/Zip's type-ahead has been observed to silently reset Team —
    // re-verify/re-set it last, per new-insured-form.md.
    if ((await this.locators.teamDropdown.inputValue()) === '') {
      await this.selectByNormalizedLabel(this.locators.teamDropdown, input.team);
    }

    if (input.filingState) {
      const current = await this.locators.filingStateDropdown.locator('option:checked').textContent();
      // Filing State can auto-resolve from the City/State/Zip selection — only
      // override it if it doesn't already match what the JSON expects.
      if (current?.trim() !== input.filingState) {
        await this.select(this.locators.filingStateDropdown, input.filingState);
      }
    }
  }

  /** Secondary UW / Renewal Quoter render some names with doubled internal
   * spaces (see new-insured-form.md) — match by normalized text rather than
   * Playwright's exact-label selectOption. */

  private async selectByNormalizedLabel(dropdown: Locator, label: string): Promise<void> {
    const normalizedTarget = label.replace(/\s+/g, ' ').trim();
    const optionValue = await dropdown.evaluate((el, target) => {
      const select = el as HTMLSelectElement;
      const opt = Array.from(select.options).find(
        (o) => o.textContent?.replace(/\s+/g, ' ').trim() === target,
      );
      return opt?.value ?? null;
    }, normalizedTarget);

    if (!optionValue) {
      throw new Error(`No option matching "${label}" found in dropdown.`);
    }
    await this.select(dropdown, optionValue);
  }

  async submit(): Promise<void> {
    await this.click(this.locators.createSubmissionButton);
  }

  // -------------------------------------------------------------------
  // State getters / readers — exposed for the spec to assert on.
  // -------------------------------------------------------------------

  get submissionNumberLocator() {
    return this.locators.submissionNumberLink;
  }

 submissionStatusBadgeLocator(statusText: string) {
  return this.locators.submissionStatusBadge(statusText);
}

  get insuredCodeLocator() {
    return this.locators.insuredCodeField;
  }

  async getSubmissionNumber(): Promise<string> {
    return this.textOf(this.locators.submissionNumberLink);
  }

  insuredNameLocator(fullName: string) {
    return this.locators.insuredNameInBanner(fullName);
  }
}