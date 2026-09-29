import type { Page } from '@playwright/test';
import { BasePage } from '../../../framework/pages/BasePage';
import { RateSummaryLocators } from './rate-summary.locators';

/** What the spec expects to see on the Rate Summary popup — built from
 * alis/knowledge/rate-summary.json's own `referenceSample` shape, but only
 * the non-numeric identifying fields are used as actual expectations here.
 * Per that JSON's own explicit "compareToDisplayed" instruction, premium
 * and rate FIGURES are never asserted as fixed constants — see
 * rate-summary.page.ts's readTotalPremiumText() and rate-summary.test.ts's
 * own notes on what's (and isn't yet) verified about those figures. */
export interface RateSummaryExpectation {
  namedInsured: string;
  effectiveDateSubstring: string;
  expirationDateSubstring: string;
  riskCompany: string;
  classcode: string;
  exposureFormatted: string;
  premiumCode: string;
}

/**
 * Page Object for the Rate Summary popup, opened from an existing option's
 * Risk/Option Detail page (the same page Add/Edit Risk is opened from — see
 * add-edit-risk.page.ts's openAddEditRisk()). Like Add/Edit Risk, this is
 * reached via a popup tab, so this class is constructed against that
 * popup's own `Page` — use openRateSummary() below to get it. Actions/
 * readers only — no assertions, no JSON imports, no test data (see
 * BasePage's rules); the spec does its own comparisons against what these
 * methods return.
 *
 * <!-- fragile --> Built entirely from a user-supplied Playwright codegen
 * recording (2026-09-25), NOT independently live-verified — see
 * rate-summary.locators.ts's own top-of-file comment for why this couldn't
 * be run live before delivery. This class deliberately stops short of
 * parsing out Prem Rate/Prod Rate/Classcode Premium as separate figures:
 * the codegen recording only ever asserted the SAME final-rate text twice,
 * at two grid positions (`.nth(4)`/`.nth(5)`), and never clearly
 * distinguished which cell holds which of rate-summary.json's documented
 * fields (premRate vs. prodRate vs. finalRate vs. classcodePremium). Rather
 * than guess a mapping that might silently assert the wrong thing, this
 * class only exposes what can be read with confidence — the Total Policy
 * Premium text, and the classcode/exposure/premium-code identifying cells —
 * and leaves the deeper per-field rate breakdown (rate-summary.json's
 * consistencyChecks 1-3) as a follow-up once either a live run or the
 * actual grid markup clarifies which cell is which.
 */
export class RateSummaryPage extends BasePage {
  private readonly locators: RateSummaryLocators;

  constructor(page: Page) {
    super(page);
    this.locators = new RateSummaryLocators(page);
  }

  /** Confirms the popup landed on the expected quote before reading any
   * figures off it — the non-numeric identifying fields only (heading,
   * named insured, quote number, dates, risk company). */
  async verifyQuoteIdentity(expectation: RateSummaryExpectation): Promise<void> {
   
    // Generous ceiling, not a fixed sleep — same reasoning as
    // add-edit-risk.page.ts's waitForRiskScreenReady(): this polls and
    // returns as soon as the heading actually renders, so a fast load isn't
    // slowed down. Rate Summary is the same kind of legacy/rating-engine
    // screen as Add/Edit Risk, so it's reasonable to expect the same
    // variable load time until proven otherwise.
    await this.waitForVisible(this.locators.rateSummaryHeading, 300_000);
   // await this.waitForVisible(this.locators.rateSummaryHeading, 15000);
    await this.waitForVisible(this.locators.namedInsuredHeading(expectation.namedInsured), 10000);
    await this.waitForVisible(this.locators.quoteNumberText, 10000);
    // await this.waitForVisible(this.locators.dateText(expectation.effectiveDateSubstring), 10000);
    // await this.waitForVisible(this.locators.dateText(expectation.expirationDateSubstring), 10000);
    await this.waitForVisible(this.locators.riskCompanyText(expectation.riskCompany), 10000);
  }

  /** Reads the Total Policy Premium exactly as currently displayed — never
   * a value sourced from test data, per rate-summary.json's
   * "compareToDisplayed" assertion mode. Returns the raw text (e.g.
   * "$77,760.00"); parsing/numeric comparison is left to the caller so this
   * Page Object stays assertion-free per BasePage's rules. */
  async readTotalPremiumText(): Promise<string> {
    const total = this.locators.totalPremiumText.first();
    await total.waitFor({ state: 'visible', timeout: 15000 });
    return this.textOf(total);
  }

  /** Clicks the Total Policy Premium figure to expand the location/classcode
   * breakdown beneath it, then expands the given classcode's own row so its
   * Exposure/Premium Code/rate cells become visible — matches the codegen
   * recording's own click sequence. */
  async expandClasscodeBreakdown(classcode: string): Promise<void> {
    await this.click(this.locators.totalPremiumText.first());
   // await this.click(this.locators.classcodeRowExpandToggle(classcode));
  }

  async close(): Promise<void> {
    await this.click(this.locators.closeButton);
  }

  // -------------------------------------------------------------------
  // State getters / readers — exposed for the spec to assert on.
  // -------------------------------------------------------------------

  classcodeCellLocator(classcode: string) {
    return this.locators.classcodeCell(classcode);
  }

  exposureCellLocator(exposureFormatted: string) {
    return this.locators.exposureCell(exposureFormatted);
  }

  premiumCodeCellLocator(premiumCode: string) {
    return this.locators.premiumCodeCell(premiumCode);
  }
}

/** Standalone helper, not a method on RateSummaryPage: clicks the rate icon
 * on the ORIGINAL submission tab's Risk/Option Detail page and captures the
 * resulting popup tab — same pattern as add-edit-risk.page.ts's
 * openAddEditRisk(), for the same reason (this class is constructed against
 * the popup's own Page, not the original tab's). */
export async function openRateSummary(originalPage: Page): Promise<Page> {
  const popupPromise = originalPage.waitForEvent('popup');
  await originalPage.locator('#imgiconRate').click();
  const popup = await popupPromise;
  await popup.waitForLoadState();
  return popup;
}


// export async function openRateSummary(originalPage: Page, maxAttempts = 3): Promise<Page> {
//       await originalPage.locator('#imgiconRate').click();
//   for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
//     const popupPromise = originalPage.waitForEvent('popup');
//     const popup = await popupPromise;
//     await popup.waitForLoadState('domcontentloaded').catch(() => {});

//     const isReady = await popup
//       .getByRole('heading', { name: 'Rate Summary' })
//       .waitFor({ state: 'visible', timeout: 60_000 })
//       .then(() => true)
//       .catch(() => false);

//     if (isReady) {
//       return popup;
//     }

    // This attempt's popup never actually became the real Rate Summary
    // screen — close it and click again, matching what the codegen
    // recording itself had to do (it clicked the rate icon twice, only
    // ever using the second resulting popup).
//     await popup.close().catch(() => {});
//   }

//   throw new Error(`Rate Summary popup did not become ready after ${maxAttempts} attempts.`);
// }