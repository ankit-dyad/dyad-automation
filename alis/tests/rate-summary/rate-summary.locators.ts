import type { Page } from '@playwright/test';

/**
 * Locator definitions for the Rate Summary popup, opened from an existing
 * option's Risk/Option Detail page (the same page Add/Edit Risk is opened
 * from — see add-edit-risk.page.ts's openAddEditRisk()) via the rate icon.
 *
 * <!-- fragile --> Built entirely from a user-supplied Playwright codegen
 * recording (2026-09-25) that has NOT been independently live-verified by
 * this project, and could not be run live tonight either — entering login
 * credentials on the user's behalf isn't something this project's assistant
 * does, permission or not (see rate-summary.test.ts's own note). Treat
 * every locator below as more exploratory than usual for a fresh feature in
 * this project — there is also no rate-summary.md to cross-reference,
 * unlike every other feature so far; alis/knowledge/rate-summary.json is
 * the only documentation this file has to go on.
 *
 * The codegen recording clicked the rate icon twice in a row, opening two
 * separate popups, and only ever used the second one — the first was dead,
 * unused noise and is not reproduced here; this file drives the rate icon
 * once and uses the one resulting popup.
 */
export class RateSummaryLocators {
  constructor(private readonly page: Page) {}

  /** The rate icon on the option's Risk/Option Detail page that opens Rate
   * Summary in a new tab — a real, stable id, confirmed identical across
   * both (redundant) clicks in the codegen recording. Lives on the
   * ORIGINAL submission page, not the popup — see openRateSummary() in
   * rate-summary.page.ts. */
  get rateIcon() {
    return this.page.locator('#imgiconRate');
  }

  // -----------------------------------------------------------------------
  // Rate Summary popup content — this class is constructed against the
  // POPUP's own Page (same pattern as AddEditRiskLocators), so everything
  // below is scoped to `this.page` meaning that popup, not the original tab.
  // -----------------------------------------------------------------------

  get rateSummaryHeading() {
    return this.page.getByRole('heading', { name: 'Rate Summary' });
  }

  namedInsuredHeading(name: string) {
    return this.page.getByRole('heading', { name });
  }

  /** <!-- fragile --> The codegen recording asserted a literal, full
   * submission/quote number (a "SUB######-##" style code) — submission
   * numbers are assigned per run and change every time (confirmed
   * elsewhere in this project — market-selection.test.ts and
   * add-edit-risk.test.ts were built against two different runs that
   * produced two different numbers). Matched here as a pattern instead of a
   * literal value; confirm on a real run this regex actually matches the
   * visible text's exact formatting. */
  get quoteNumberText() {
    return this.page.getByText(/SUB\d+-?\d*/);
  }

  dateText(dateSubstring: string) {
    return this.page.getByText(dateSubstring);
  }

  riskCompanyText(riskCompany: string) {
    return this.page.getByText(riskCompany);
  }

  /** <!-- fragile --> Matches ANY dollar-formatted amount on the page
   * (`$12,345.67`-style) rather than a hardcoded literal — per
   * rate-summary.json's own explicit instruction, premium figures vary run
   * to run and must never be asserted as fixed constants. This is the
   * least-confirmed locator in this file: the codegen recording only ever
   * showed one literal example ("$77,760.00" — the Total Policy Premium),
   * so there's no confirmed stable id/class to anchor to instead. If more
   * than one dollar amount renders on this view, `.first()` (used by
   * rate-summary.page.ts's readTotalPremiumText()) may not resolve to the
   * right one — confirm on a real run and replace with a proper id/class
   * locator once one is known. */
  get totalPremiumText() {
    return this.page.getByText(/^\$[\d,]+\.\d{2}$/);
  }

  /** <!-- fragile --> The codegen recording's own expand-icon id
   * (`#imgplus_NT1249`) is clearly a per-record, per-run token — not safe to
   * hardcode (same category of issue as Add/Edit Risk's iframe session
   * query string). Scoped instead to the table row containing the classcode
   * text, then its own first `<img>` (assumed to be the expand toggle) —
   * unverified, since the actual row/toggle markup was never independently
   * inspected. Confirm this actually resolves to the expand toggle (and not
   * some other icon in the row) on a real run. */
  classcodeRowExpandToggle(classcode: string) {
    return this.page.locator('tr', { hasText: classcode }).locator('img').first();
  }

  classcodeCell(classcode: string) {
    return this.page.getByRole('cell', { name: classcode, exact: true });
  }

  exposureCell(exposureFormatted: string) {
    return this.page.getByRole('cell', { name: exposureFormatted, exact: true });
  }

  premiumCodeCell(premiumCode: string) {
    return this.page.getByRole('cell', { name: premiumCode, exact: true });
  }

  get closeButton() {
    return this.page.getByRole('button', { name: 'Close & Apply', exact: true });
  }
}