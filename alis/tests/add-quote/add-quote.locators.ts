import type { Page } from '@playwright/test';

/**
 * Locator definitions for the Add Quote modal (reached from an existing
 * Submission's page) — sourced from the "## Selectors" table in
 * alis/knowledge/pages/add-quote.md. Nothing but locators belongs here;
 * actions live in add-quote.page.ts, assertions in add-quote.test.ts.
 */
export class AddQuoteLocators {
  constructor(private readonly page: Page) {}

  /** The "+ Add Quote" trigger on the Submission tab (or any existing Quote
   * tab) — confirmed live 2026-09-25 it's a real `<a>` (link role), which is
   * a different accessibility role than the modal's own "Add Quote" submit
   * button (a real `<button>`), so the two never collide under role+name
   * even while the modal is open. */
  get addQuoteTrigger() {
    return this.page.locator('//a[@id="lnkAddQuote"]');
  }

  /** Scope root for every field inside the Add Quote modal —
   * `<app-add-new-quote>`, a custom Angular element confirmed live. Scoping
   * every lookup to this element avoids any collision with same-named
   * controls elsewhere on the page. */
  get modal() {
    return this.page.locator('app-add-new-quote');
  }

  /** <!-- fragile --> The input itself has no id/name; `app-lookup-autocomplete`
   * is a wrapper component 4 DOM levels up exposing `formcontrolname="CVG"`
   * (confirmed live) — the one stable, unique hook. Coverage/COB/Product are
   * otherwise indistinguishable (all three inputs share
   * `typeaheadoptionfield="LkpText"`). */
  get coverageField() {
    return this.modal.locator('app-lookup-autocomplete[formcontrolname="CVG"] input');
  }

  /** Same wrapper pattern as Coverage — `formcontrolname="COB"`. */
  get cobField() {
    return this.modal.locator('app-lookup-autocomplete[formcontrolname="COB"] input');
  }

  /** Same wrapper pattern as Coverage — `formcontrolname="Product"`.
   * Mutually exclusive with Coverage/COB (visibly disabled once Coverage is
   * set, confirmed live). */
  get productField() {
    return this.modal.locator('app-lookup-autocomplete[formcontrolname="Product"] input');
  }

  /** `id="txtSuggestive"` — a real, stable id, confirmed live. */
  get operationField() {
    return this.modal.locator('#txtSuggestive');
  }

  /** <!-- fragile --> Same "Filling" (not "Filing") id typo as the New
   * Insured form — confirmed not a documentation error, it's the real DOM id
   * here too. */
  get filingStateDropdown() {
    return this.modal.locator('#ddlFillingState');
  }

  get termDropdown() {
    return this.modal.locator('#ddlTerm');
  }

  get closeButton() {
    return this.modal.getByRole('button', { name: 'Close' });
  }

  get addQuoteSubmitButton() {
    return this.modal.getByRole('button', { name: 'Add Quote' });
  }

  /** <!-- fragile --> Global overlay — confirmed live it is NOT nested inside
   * `app-add-new-quote`, so it's intentionally not scoped to `modal` above.
   * Each suggestion is a `<button class="dropdown-item">` whose full text
   * reads "(CODE) NAME" — see add-quote.page.ts's selectLookupSuggestion()
   * for why matching must be exact, never a plain substring. */
  get suggestionContainer() {
    return this.page.locator('typeahead-container');
  }

  suggestionByExactLabel(label: string) {
    return this.suggestionContainer
      .locator('button.dropdown-item')
      .filter({ hasText: new RegExp(`^\\([^)]*\\)\\s*${escapeRegExp(label)}$`) });
  }

  /** <!-- fragile --> Did NOT appear in the live pass this was captured
   * against (confirmed inconsistent on this instance — see add-quote.md's
   * own "Correction" callouts). Generic `.modal-content` markup shared with
   * other confirm dialogs on this app — always scope by this dialog's own
   * message text, never assume "the currently open confirm dialog" is this
   * one. */
  acknowledgementEmailDialogButton(label: 'Cancel' | 'Ok') {
    return this.page
      .locator('.modal-content', { hasText: 'Acknowledgement Email' })
      .getByRole('button', { name: label });
  }

  /** <!-- fragile --> New finding (from a user-supplied Playwright codegen
   * recording, 2026-09-25 — not independently live-verified by this file's
   * other getters): a "Not licensed to work in this State. Do you want to
   * proceed?" confirm can appear around opening/filling Add Quote, matching
   * the same dialog market-selection.md documents appearing at Create
   * Option time — same wording, same "check the box and click Ok" standing
   * instruction. Modeled as a switch (not a button toggle) per the
   * recording. Scoped to whichever dialog currently contains that switch,
   * since — like every other confirm dialog on this app — the markup itself
   * is generic and shared. */
  get notLicensedSwitch() {
    return this.page.getByRole('switch', { name: 'Not licensed to work in this' });
  }

  notLicensedDialogButton(label: 'Ok') {
    return this.page
      .locator('.modal-content')
      .filter({ has: this.notLicensedSwitch })
      .getByRole('button', { name: label });
  }

  /** <!-- fragile --> New finding (same codegen recording): after clicking
   * the Add Quote modal's own submit button, a "Popup Notes" dialog can
   * appear (Note / System Notes tabs, OK button) — the same dialog shape
   * observed live elsewhere in this app on a Submission's Risk page (e.g.
   * the recurring "Abhay Makadiya" Agency-level system note documented in
   * market-selection.md). Scoped by its own heading so it's never confused
   * with the duplicate-quote or acknowledgement-email dialogs. */
  get popupNotesDialogOkButton() {
    return this.page
      .locator('.modal-content', { has: this.page.getByRole('heading', { name: 'Popup Notes' }) })
      .getByRole('button', { name: 'OK' });
  }

  /** Confirmed live 2026-09-25: appears when a quote with the same
   * Coverage/COB already exists on this submission; clicking Ok proceeds to
   * actually create the duplicate quote. */
  duplicateQuoteDialogButton(label: 'Cancel' | 'Ok') {
    return this.page
      .locator('.modal-content', { hasText: 'Quote Already Available' })
      .getByRole('button', { name: label });
  }

  /** <!-- fragile --> The generated code (e.g. "CGL-BA-05") is dynamic —
   * built from the coverage's short code plus a running count on this
   * submission (confirmed live: this submission already had CGL-BA-2 /
   * CGL-BA-04, and the newly-created one became CGL-BA-05) — never assert a
   * literal code, only the pattern. `class="active"` marks whichever tab is
   * currently selected, which is this new one immediately after creation. */
  get newQuoteTab() {
    return this.page.locator('a.active', { hasText: /^[A-Z0-9]+-BA-\d+$/ });
  }

  /** Confirmed live: same badge classes as the Create Submission page's own
   * status badge — reuses that already-verified pattern. Takes the expected
   * status text as a parameter rather than hardcoding it, so this stays
   * JSON-driven (same rationale as create-submission.locators.ts's
   * submissionStatusBadge()). */
  statusBadge(statusText: string) {
    return this.page.getByText(statusText, { exact: true });
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}