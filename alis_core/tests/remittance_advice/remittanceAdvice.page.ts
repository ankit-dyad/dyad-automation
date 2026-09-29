import type { Page } from '@playwright/test';
import { BasePage } from '../../../framework/pages/BasePage';
import { getRequiredEnv } from '../../../framework/utils/env';
import { RemittanceAdviceLocators } from './remittanceAdvice.locators';

/**
 * Page Object for the Alis Core Accounting Check Register screen's
 * "Remittance Download As" flow. Actions only — no assertions, no test data,
 * no hardcoded URLs (see CLAUDE.md §3 / knowledge/conventions.md). Built
 * from alis_core/knowledge/pages/check-register.md and
 * alis_core/knowledge/pages/remittance-advice.md.
 */
export class RemittanceAdvicePage extends BasePage {
  protected override path = '#/checkregister';

  private readonly locators: RemittanceAdviceLocators;

  constructor(page: Page) {
    super(page);
    this.locators = new RemittanceAdviceLocators(page);
  }

  /* Same Accounting sub-app as the other Payment/Check-Register page
   * objects — not resolvable against ALIS_CORE_BASE_URL. See
   * payment-upload.md's "Reaching this page". */
  override async goto(): Promise<void> {
    const accountingBaseUrl = getRequiredEnv('ALIS_CORE_ACCOUNTING_BASE_URL');
    await this.page.goto(`${accountingBaseUrl}${this.path}`);
  }

  async selectFirstRow(): Promise<void> {
    await this.check(this.locators.firstRowCheckbox);
  }

  async openRemittanceDownloadAsMenu(): Promise<void> {
    await this.click(this.locators.remittanceDownloadAsToggle);
  }

  /** Triggers the PDF download and returns the resulting Download object —
   * a filesystem side effect is never asserted, only the download event
   * itself (see remittance-advice.md's Edge Cases). */
  async downloadPdf() {
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.click(this.locators.pdfOption),
    ]);
    return download;
  }

  // ---------------------------------------------------------------------
  // Exposed for the spec to assert on — assertions belong in the test, not
  // here.
  // ---------------------------------------------------------------------

  get checkRegisterTabLocator() {
    return this.locators.checkRegisterTab;
  }

  get firstRowCheckboxLocator() {
    return this.locators.firstRowCheckbox;
  }

  get remittanceDownloadAsToggleLocator() {
    return this.locators.remittanceDownloadAsToggle;
  }
}
