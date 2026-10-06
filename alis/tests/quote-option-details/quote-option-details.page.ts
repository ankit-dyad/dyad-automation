import { BasePage } from '../../../framework/pages/BasePage';
import { QuoteOptionDetailLocators } from './quote-option-details.locators';
import { expect, type Page } from '@playwright/test';

/** Plain input shape for the Premium tab's "apply premium" changes — the
 * spec builds this from alis/knowledge/terms-forms.json / whatever the user
 * supplied. Kept independent of any JSON shape so this Page Object has no
 * test-data knowledge of its own (see BasePage's rules). */
export interface PremiumAdjustmentInput {
  /** Raw `<select>` option value for TRIA Type (e.g. "3"), not a visible
   * label — same convention as Add/Edit Risk's deductibleBasisValue. */
  triaTypeValue: string;
  /** Visible option text clicked in Gross Comm %'s custom dropdown overlay
   * (e.g. "GLOBAL DEFAULT"). */
  grossCommOption: string;
  /** Visible option text clicked in Agent Comm %'s custom dropdown overlay
   * (e.g. "Special Agency Commission"). */
  agentCommOption: string;
}

/**
 * Page Object for the Quote Option Detail screen (Risk / Premium / Terms &
 * Forms tabs) — see knowledge/pages/quote-option-details.md's Overview.
 * Unlike Add/Edit Risk and Rate Summary, this screen opens in the SAME tab
 * as the rest of the flow (no popup), so this class is constructed with the
 * same `page` those earlier steps already used — no separate open-helper
 * function is needed the way openAddEditRisk()/openRateSummary() are.
 *
 * <!-- fragile --> Built from a user-supplied Playwright codegen recording
 * (2026-09-25), NOT independently live-verified — see
 * quote-option-detail.locators.ts's own top-of-file comment. The Terms &
 * Forms deletion methods below generalize a single codegen example (one
 * form ticked and deleted, one ticked and then cancelled instead) into a
 * bulk multi-form delete, per explicit instruction — treat a first real run
 * of deleteForms() as genuinely exploratory, especially the virtualized-grid
 * scrolling logic, which testing-process-notes.md documents as a recurring
 * source of real bugs (under-counting, stray checkbox toggles) even for a
 * human tester, let alone a first automated pass.
 */
export class QuoteOptionDetailPage extends BasePage {
  private readonly locators: QuoteOptionDetailLocators;

  constructor(page: import('@playwright/test').Page) {
    super(page);
    this.locators = new QuoteOptionDetailLocators(page);
  }

  /** Clicks the option's premium amount link on the Quote tab and waits for
   * this screen to render. */
  async open(): Promise<void> {
    await this.click(this.locators.optionPremiumLink.first());
    await this.waitForVisible(this.locators.tabStripText, 15000);
  }

  // ---------------------------------------------------------------------
  // Risk tab — state getters only; this project's own verification, not
  // sourced from the codegen recording (which never visited this tab).
  // ---------------------------------------------------------------------

  coverageHeadingLocator(coverageName: string) {
    return this.locators.coverageHeading(coverageName);
  }

  limitDeductibleCellLocator(text: string) {
    return this.locators.limitDeductibleCell(text);
  }

  // ---------------------------------------------------------------------
  // Premium tab
  // ---------------------------------------------------------------------

  async goToPremiumTab(): Promise<void> {
    await this.click(this.locators.premiumTab);
    await this.waitForVisible(this.locators.ratedPremiumHeading, 15000);
  }

  get ratedPremiumHeadingLocator() {
    return this.locators.ratedPremiumHeading;
  }

  async readRatedPremiumText(): Promise<string> {
    return this.textOf(this.locators.ratedPremiumHeading);
  }

  /** Applies the given TRIA Type / Gross Comm % / Agent Comm % changes and
   * saves — matches the codegen recording's own click sequence exactly,
   * including that Gross Comm %'s field is clicked before its toggle
   * button (the codegen recording did this; unclear if strictly necessary,
   * kept for fidelity). See quote-option-detail.locators.ts's
   * toggleDropdownButtons comment on why `.nth()` position, not a
   * distinguishing name, is what separates the Gross Comm % and Agent
   * Comm % toggles. */
  async applyPremiumAdjustment(input: PremiumAdjustmentInput): Promise<void> {
    await this.page.waitForTimeout(3000);
    await this.select(this.locators.triaTypeDropdown, input.triaTypeValue);
    await this.page.waitForTimeout(3000);
    await this.click(this.locators.toggleDropdownButtons.nth(1));
    await this.click(this.locators.dropdownOverlayOption(input.grossCommOption));
    await this.page.waitForTimeout(3000);
    await this.click(this.locators.toggleDropdownButtons.nth(2));
    await this.click(this.locators.dropdownOverlayOption(input.agentCommOption));
    await this.page.waitForTimeout(3000);
    await this.click(this.locators.saveButton);
  }

  // ---------------------------------------------------------------------
  // Terms & Forms tab
  // ---------------------------------------------------------------------

  async goToTermsAndFormsTab(): Promise<void> {
    await this.click(this.locators.termsAndFormsTab);
    await this.waitForVisible(this.locators.formsCountHeading, 15000);
  }

  /** Reads "Forms [Count: N]" and returns N — the only trustworthy row
   * count per testing-process-notes.md Rule 10 (the grid itself is
   * virtualized and easy to visually under/over-count). */
  async readFormsCount(): Promise<number> {
    const text = await this.textOf(this.locators.formsCountHeading);
    const match = text.match(/Count:\s*(\d+)/);
    if (!match) {
      throw new Error(`Could not parse a Forms count out of "${text}".`);
    }
    return Number(match[1]);
  }

  /** Scrolls the Forms grid's own viewport in small increments until the
   * given Form No.'s row actually renders (or gives up after maxAttempts) —
   * per testing-process-notes.md Rule 10's explicit warning that a single
   * large scroll (mouse-wheel or otherwise) can jump clean over a
   * screenful of virtualized rows without ever rendering them. Small,
   * repeated increments (rather than one big jump) are the documented,
   * confirmed-working fix. */
  private async scrollGridUntilVisible(formNo: string, maxAttempts = 35): Promise<void> {
    const target = this.locators.formNoCell(formNo);

    // If target is already visible in viewport, return instantly
    if (await target.isVisible().catch(() => false)) {
      return;
    }

    // Reset scroll to top of viewport
    await this.page
      .locator('.ag-body-viewport, .ag-center-cols-viewport, [class*="ag-body-viewport"]')
      .evaluateAll((elements) => {
        elements.forEach((el) => {
          el.scrollTop = 0;
        });
      })
      .catch(() => { });
    await this.page.waitForTimeout(30);

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      if (await target.isVisible().catch(() => false)) {
        return;
      }
      await this.page
        .locator('.ag-body-viewport, .ag-center-cols-viewport, [class*="ag-body-viewport"]')
        .evaluateAll((elements) => {
          elements.forEach((el) => {
            el.scrollTop += 140;
          });
        })
        .catch(() => { });
      await this.page.waitForTimeout(30);
    }
    await target.waitFor({ state: 'visible', timeout: 2000 });
  }

  /** Ticks the given form's Delete checkbox */
  async tickFormForDeletion(formNo: string): Promise<void> {
    await this.scrollGridUntilVisible(formNo);
    const row = this.locators.formRow(formNo);
    await row.scrollIntoViewIfNeeded().catch(() => { });

    const checkbox = this.locators.formDeleteCheckbox(formNo);
    await checkbox.scrollIntoViewIfNeeded().catch(() => { });

    const isAlreadyChecked = await checkbox.isChecked().catch(() => false);
    if (!isAlreadyChecked) {
      await this.click(checkbox, { force: true }).catch(async () => {
        await this.page.waitForTimeout(1000);
        await this.check(checkbox);
      });
    }

    const isChecked = await checkbox.isChecked().catch(() => false);
    if (!isChecked) {
      await this.click(row.locator('input[type="checkbox"], .ag-checkbox-input'), { force: true }).catch(() => { });
    }
  }

  /** Whether the given Form No. is actually present in the grid — scrolls
   * to look for it (same as tickFormForDeletion) but never throws, so the
   * spec can check presence for a whole reference list without one missing
   * form aborting the rest (some "should be removed" forms are only
   * present for certain filing states — see terms-forms.json's own
   * per-form `expectedThisPass` notes). */
  async isFormPresent(formNo: string, timeoutMs = 8000): Promise<boolean> {
    try {
      await this.scrollGridUntilVisible(formNo, Math.ceil(timeoutMs / 150));
      return true;
    } catch {
      return false;
    }
  }

  /** Ticks every given form for deletion, clicks "Delete Form", and
   * confirms the "Please Confirm" dialog with Ok. Does NOT re-verify the
   * resulting count against 28 — that's the spec's job (see
   * quote-option-detail.test.ts), since this Page Object stays
   * assertion-free per BasePage's rules. */
  async deleteForms(formNos: string[]): Promise<void> {
    if (formNos.length === 0) return;
    for (const formNo of formNos) {
      await this.tickFormForDeletion(formNo);
    }
    await this.click(this.locators.deleteFormButton);
    await this.waitForVisible(this.locators.confirmDialogButton('Ok'), 10000);
    await this.click(this.locators.confirmDialogButton('Ok'));
  }

  formRowLocator(formNo: string) {
    return this.locators.formRow(formNo);
  }

  // ---------------------------------------------------------------------
  // Shared bottom action bar — per quote-option-details.md, one single
  // page-level "Save" button lives in the bottom action bar regardless of
  // which tab is active (Risk/Premium/Terms & Forms/Additional Interest/
  // Other Details), alongside Generate Quote/Generate Indication/Proceed
  // to Bind/Bind & Invoice. Reused here for both applyPremiumAdjustment()
  // above and Terms & Forms cleanup (see quote-option-detail.test.ts).
  // ---------------------------------------------------------------------

  get saveButtonLocator() {
    return this.locators.saveButton;
  }

  /** Clicks the shared page-level Save button — per terms-forms.json's own
   * deletionWorkflow, this is expected as the final step after a Terms &
   * Forms bulk delete once the count reads the target value, even though
   * testing-process-notes.md separately notes the delete itself already
   * persists without a Save (kept here for fidelity to the more explicit
   * source; harmless if it turns out to be a no-op on a real run). */
  async save(): Promise<void> {
    await this.click(this.locators.saveButton);
  }

  async openReorderFormsModal(): Promise<void> {
    await this.click(this.locators.reorderFormsButton);
    await this.waitForVisible(this.locators.reorderFormsHeader, 15000);
  }

  async isReorderFormsModalOpen(): Promise<boolean> {
    return this.locators.reorderFormsHeader.isVisible().catch(() => false);
  }

  private async scrollReorderModalUntilVisible(formNo: string, maxAttempts = 40): Promise<void> {
    const target = this.locators.reorderFormRow(formNo);
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      if (await target.isVisible().catch(() => false)) {
        return;
      }
      await this.locators.reorderFormsViewport.evaluate((el) => {
        el.scrollTop += 120;
      });
      await this.page.waitForTimeout(100);
    }
    await target.waitFor({ state: 'visible', timeout: 5000 });
  }

  async isFormPresentInReorderModal(formNo: string, timeoutMs = 8000): Promise<boolean> {
    try {
      await this.scrollReorderModalUntilVisible(formNo, Math.ceil(timeoutMs / 150));
      return true;
    } catch {
      return false;
    }
  }

  async deleteFormViaReorderModal(formNo: string): Promise<void> {
    await this.scrollReorderModalUntilVisible(formNo);
    await this.click(this.locators.reorderFormDeleteIcon(formNo));
    await this.click(this.locators.reorderFormsSaveButton);
  }

  // ---------------------------------------------------------------------
  // Bind & Invoice
  // ---------------------------------------------------------------------

  async bindAndInvoice(policyNumber: string): Promise<void> {
    await this.click(this.locators.bindAndInvoiceButton);
    await this.check(this.locators.policyNumberRadio);
    await this.check(this.locators.manualRadio);
    await this.enter(this.locators.policyNumberInput, policyNumber);
    await this.click(this.locators.proceedModalButton);
    await this.click(this.locators.policyLink);
  }

  async openReviewPolicy(): Promise<Page> {
    const page1Promise = this.page.waitForEvent('popup');
    await this.click(this.locators.reviewPolicyButton);
    const page1 = await page1Promise;
    return page1;
  }

  async clickContinueOnReviewPolicy(reviewPage: Page): Promise<void> {
    const continueBtn = reviewPage.getByRole('button', { name: 'Continue' });
    console.log(`Clicking on locator: ${continueBtn}`);
    await continueBtn.click();
    console.log(`Successfully clicked on locator: ${continueBtn}`);
  }

  async fillMissingValues(reviewPage: Page, mepDollar: string, mepPercentage: string): Promise<void> {
    const dollarInput = reviewPage.locator('#tcPolicyMissingValues_tpMissingValues_xxMEPInDolWSign');
    const percentInput = reviewPage.locator('#tcPolicyMissingValues_tpMissingValues_xxMEPInPerWSign');

    console.log(`Waiting for locator to be visible: ${dollarInput}`);
    await dollarInput.waitFor({ state: 'visible', timeout: 15000 });
    console.log(`Clicking on locator: ${dollarInput}`);
    await dollarInput.click();
    console.log(`Entering "${mepDollar}" into locator: ${dollarInput}`);
    await dollarInput.fill(mepDollar);
    console.log(`Clicking on locator: ${percentInput}`);
    await percentInput.click();
    console.log(`Entering "${mepPercentage}" into locator: ${percentInput}`);
    await percentInput.fill(mepPercentage);
  }

  async openRecipientCopyPdf(reviewPage: Page, recipientName = 'Insured'): Promise<Page> {
    const link = reviewPage.getByRole('link', { name: recipientName });
    console.log(`Waiting for locator to be visible: ${link}`);
    await link.waitFor({ state: 'visible', timeout: 15000 });
    const page2Promise = reviewPage.waitForEvent('popup');
    console.log(`Clicking on locator: ${link}`);
    await link.click();
    const page2 = await page2Promise;
    await page2.waitForLoadState('domcontentloaded');
    return page2;
  }

  async jumpToPdfPage(pdfPage: Page, pageNumber: string): Promise<void> {
    await pdfPage.waitForLoadState('domcontentloaded');

    // In Chromium, Chrome's built-in PDF viewer runs inside an extension frame
    // (chrome-extension://.../index.html), not an HTML iframe[name].
    let pdfFrame: import('@playwright/test').Frame | null = null;
    const startTime = Date.now();
    const timeoutMs = 20000;

    while (Date.now() - startTime < timeoutMs) {
      pdfFrame = pdfPage.frames().find((f) => f.url().includes('chrome-extension')) ?? null;
      if (pdfFrame) {
        const input = pdfFrame.locator('#pageSelector, input[aria-label="Page number"]');
        if (await input.isVisible().catch(() => false)) {
          break;
        }
      }
      const fallbackInput = pdfPage.locator('iframe[name]').contentFrame().locator('#pageSelector, input[aria-label="Page number"]');
      if (await fallbackInput.isVisible().catch(() => false)) {
        break;
      }
      await pdfPage.waitForTimeout(200);
    }

    let pageNumberInput: import('@playwright/test').Locator;
    if (pdfFrame) {
      pageNumberInput = pdfFrame
        .getByRole('textbox', { name: 'Page number' })
        .or(pdfFrame.locator('#pageSelector'))
        .or(pdfFrame.locator('input[aria-label="Page number"]'))
        .first();
    } else {
      pageNumberInput = pdfPage
        .locator('iframe[name]')
        .contentFrame()
        .getByRole('textbox', { name: 'Page number' })
        .or(pdfPage.getByRole('textbox', { name: 'Page number' }))
        .or(pdfPage.locator('#pageSelector'))
        .first();
    }

    console.log(`Waiting for locator to be visible: ${pageNumberInput}`);
    await pageNumberInput.waitFor({ state: 'visible', timeout: 15000 });
    console.log(`Clicking on locator: ${pageNumberInput}`);
    await pageNumberInput.click();
    console.log(`Entering "${pageNumber}" into locator: ${pageNumberInput}`);
    await pageNumberInput.fill(pageNumber);
    console.log(`Pressing Enter on locator: ${pageNumberInput}`);
    await pageNumberInput.press('Enter');
    await pdfPage.waitForTimeout(2000);
  }

  async getPdfCurrentPageNumber(pdfPage: Page): Promise<string> {
    const pdfFrame = pdfPage.frames().find((f) => f.url().includes('chrome-extension'));
    let input: import('@playwright/test').Locator;
    if (pdfFrame) {
      input = pdfFrame
        .getByRole('textbox', { name: 'Page number' })
        .or(pdfFrame.locator('#pageSelector'))
        .or(pdfFrame.locator('input[aria-label="Page number"]'))
        .first();
    } else {
      input = pdfPage
        .locator('iframe[name]')
        .contentFrame()
        .getByRole('textbox', { name: 'Page number' })
        .or(pdfPage.getByRole('textbox', { name: 'Page number' }))
        .or(pdfPage.locator('#pageSelector'))
        .first();
    }
    return (await input.inputValue().catch(() => '')).trim();
  }
}