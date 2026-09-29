import type { Page } from '@playwright/test';
import { BasePage } from '../../../framework/pages/BasePage';
import { getRequiredEnv } from '../../../framework/utils/env';
import { CheckSummaryLocators } from './checkSummary.locators';

/**
 * Page Object for the Alis Core Accounting Check Register screen's "Check
 * Summary" popup. Actions only — no assertions, no test data, no hardcoded
 * URLs (see CLAUDE.md §3 / knowledge/conventions.md). Built from
 * alis_core/knowledge/pages/check-register.md and
 * alis_core/knowledge/pages/check-summary-popup.md.
 */
export class CheckSummaryPage extends BasePage {
  protected override path = '#/checkregister';

  private readonly locators: CheckSummaryLocators;

  constructor(page: Page) {
    super(page);
    this.locators = new CheckSummaryLocators(page);
  }

  /* Same Accounting sub-app as the other Payment/Check-Register page
   * objects — not resolvable against ALIS_CORE_BASE_URL. See
   * payment-upload.md's "Reaching this page". */
  override async goto(): Promise<void> {
    const accountingBaseUrl = getRequiredEnv('ALIS_CORE_ACCOUNTING_BASE_URL');
    await this.page.goto(`${accountingBaseUrl}${this.path}`);
  }

  async openFirstRowCheckSummary(): Promise<void> {
    await this.click(this.locators.firstRowCheckSummaryIcon);
  }

  async closePopup(): Promise<void> {
    await this.click(this.locators.modalCloseButton);
  }

  // ---------------------------------------------------------------------
  // Exposed for the spec to assert on — assertions belong in the test, not
  // here.
  // ---------------------------------------------------------------------

  get checkRegisterTabLocator() {
    return this.locators.checkRegisterTab;
  }

  get firstRowCheckSummaryIconLocator() {
    return this.locators.firstRowCheckSummaryIcon;
  }

  get openModalLocator() {
    return this.locators.openModal;
  }

  get modalGridRowLocator() {
    return this.locators.modalGridRow;
  }

  modalGridCellLocator(colId: string) {
    return this.locators.modalGridCell(colId);
  }
}
