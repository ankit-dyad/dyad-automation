import type { Page } from '@playwright/test';

/**
 * Locator definitions for the Market Selection panel, reached from an
 * existing Quote tab (see `add-quote.md` / `add-quote.locators.ts` for how a
 * quote is created in the first place). Nothing but locators belongs here;
 * actions live in market-selection.page.ts, assertions in
 * market-selection.test.ts.
 *
 * Per the project's current convention (2026-09-25), locators are captured
 * live against the running app and defined directly here — there is no
 * "## Selectors" table to keep in sync in market-selection.md any more (see
 * knowledge/conventions.md's "Locator ownership" section). Everything below
 * was confirmed live in the browser on this same date, against two
 * independent fresh quotes on submission SUB000337.
 */
export class MarketSelectionLocators {
  constructor(private readonly page: Page) {}

  /** The "Choose from Market Assistant" trigger on a Quote tab that has no
   * market attached yet — a real `<button>` with this exact, unique
   * accessible name. This is the button actually clicked in a user-supplied
   * Playwright codegen recording (2026-09-25), and is what
   * market-selection.page.ts's open() drives — see that method's own
   * comment. Only shown before any market is attached. */
  get chooseFromMarketAssistantTrigger() {
    return this.page.getByRole('button', { name: 'Choose from Market Assistant' });
  }

  /** Alternate entry point to the exact same panel, confirmed by
   * market-selection.md's own Overview ("+ Add Markets" lands on the Markets
   * tab by default, same as "Choose from Market Assistant") — distinct from
   * "Rate with all Possible Markets", a third button shown alongside these
   * two before any market is attached (documented in market-selection.md's
   * Overview but not automated by this feature). Unlike
   * chooseFromMarketAssistantTrigger, this one stays available even after a
   * market is already attached (to attach further markets), which is useful
   * if this feature is ever extended to attach more than one market. Not
   * used by market-selection.page.ts's current open() — kept as a
   * documented alternative. */
  get addMarketsTrigger() {
    return this.page.getByRole('button', { name: 'Add Markets' });
  }

  /** Scope root for every field inside the Market Selection panel —
   * `<app-markets>`, a custom Angular element confirmed live (the panel's
   * own `<h1 id="mpMarketSelection">` title lives inside it). Scoping every
   * lookup to this element avoids any collision with same-named controls
   * elsewhere on the page (e.g. the Quote tab's own option-row markup, which
   * is still present in the DOM behind this full-screen panel). */
  get modal() {
    return this.page.locator('app-markets');
  }

  /** Selected by default when the panel opens — not clicked by this
   * feature's happy path, but exposed since `market-selection.md` documents
   * it as one of the panel's two tabs. */
  get marketsTab() {
    return this.modal.locator('#tabMarkets-tab');
  }

  /** <!-- fragile --> The alternative tab (curated, quote-scoped view).
   * Confirmed live 2026-09-22 (per market-selection.md's own bug note) that
   * "Add to Market" on this tab fails for any market with only one
   * associated risk company — the exact case this feature's JSON data uses
   * (Nautilus). Exposed here for completeness; not driven by
   * market-selection.page.ts's current fill()/create() flow, which uses the
   * Markets tab instead, per this project's explicit standing instruction to
   * prefer that flow (see market-selection.md's 2026-09-16 re-confirmation
   * note). */
  get marketAssistantTab() {
    return this.modal.locator('#btnTabMarketAssistant');
  }

  /** <!-- fragile --> Both this and riskCompanyFilter share the same `name`
   * attribute ("txtSuggestive") — confirmed live only `placeholder`
   * distinguishes them. Not used by the current fill()/create() flow (per
   * explicit user instruction: scroll the grid directly rather than using
   * these top filters — see market-selection.md's 2026-09-16 note), exposed
   * for completeness only. */
  get marketCompanyFilter() {
    return this.modal.locator('input[placeholder="Market Company"]');
  }

  /** <!-- fragile --> Same shared `name` attribute as marketCompanyFilter —
   * see that getter's own note. */
  get riskCompanyFilter() {
    return this.modal.locator('input[placeholder="Risk Company"]');
  }

  /** `id="CMDExistingMarket"` — a real, stable id, confirmed live. Not used
   * by the current flow (attaching an *existing* market via the grid
   * checkbox never needs this), exposed for completeness. */
  get addMarketButton() {
    return this.modal.locator('#CMDExistingMarket');
  }

  /** <!-- fragile --> The master grid's row-checkbox `id` attribute
   * ("checkboxNoLabel") is confirmed live to repeat identically across every
   * row — never a unique per-row hook. `getByRole('row', { name: label })`
   * (confirmed against a user-supplied Playwright codegen recording,
   * 2026-09-25 — the row's accessible name includes its Market Company
   * text) scopes to the one row, then this row-scoped checkbox. `label`
   * should be the exact "Name (CODE)" grid text (e.g.
   * "Nautilus Insurance Market Group (CMP008)"), matching
   * market-selection.json's `marketCompany` field — a plain substring like
   * "Nautilus Insurance Market" (as the codegen recording used) also
   * matches, since getByRole's name option is a substring match by
   * default, but the full label is preferred here for the same
   * near-duplicate-safety reasoning as add-quote.page.ts's
   * selectLookupSuggestion(). */
  marketRowByCompany(label: string) {
    return this.modal.getByRole('row', { name: label });
  }

  marketRowCheckbox(label: string) {
    return this.marketRowByCompany(label).locator('#checkboxNoLabel');
  }

  /** Bottom bar's primary action — a real `<button>` with this exact,
   * unique accessible name within the modal. */
  get createOptionButton() {
    return this.modal.getByRole('button', { name: 'Create Option' });
  }

  /** Bottom bar buttons alongside Create Option — not used by
   * market-selection.page.ts's current attachMarket() flow, exposed for
   * completeness per a user-supplied Playwright codegen recording
   * (2026-09-25) that asserted their presence. market-selection.md leaves
   * what each of these does as an open item. */
  get submitMarketButton() {
    return this.modal.getByRole('button', { name: 'Submit Market' });
  }
  get marketFollowUpButton() {
    return this.modal.getByRole('button', { name: 'Market Follow Up' });
  }
  get marketingButton() {
    return this.modal.getByRole('button', { name: 'Marketing' });
  }

  /** <!-- fragile --> Generic `.modal-content` markup shared with other
   * confirm dialogs on this app (same pattern as Add Quote's duplicate-quote
   * dialog) — always scope by this dialog's own heading, never assume "the
   * currently open confirm dialog" is this one. */
  confirmCreateOptionDialogButton(label: 'Cancel' | 'Ok') {
    return this.page
      .locator('.modal-content', { has: this.page.getByRole('heading', { name: 'Please Confirm' }) })
      .getByRole('button', { name: label });
  }

  /** `aria-label="Close"` on the panel's own × control, confirmed live —
   * same pattern as the New Insured form's Clearance Search close button. */
  get closeButton() {
    return this.modal.getByRole('button', { name: 'Close' });
  }

  /** <!-- fragile --> The resulting option row lives in a
   * `table.quote-list` back on the Quote tab (confirmed live — this class is
   * shared with the top-level quote-tab list elsewhere on the page, so this
   * getter is deliberately scoped to a row containing the market's own
   * label rather than matching the table alone). The option's own generated
   * label (e.g. "NBS-1") is dynamic per market-selection.md — never assert a
   * literal option label, only that a row for this market exists and shows
   * "Unbound". `label` should be the same exact "Name (CODE)" grid text
   * passed to marketRowByCompany(). */
  optionRowByMarketCompany(label: string) {
    return this.page.locator('table.quote-list tbody tr', { hasText: label });
  }
}