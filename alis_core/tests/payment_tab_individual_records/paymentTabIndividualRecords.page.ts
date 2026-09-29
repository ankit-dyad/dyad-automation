import type { Page } from '@playwright/test';
import { BasePage } from '../../../framework/pages/BasePage';
import { getRequiredEnv } from '../../../framework/utils/env';
import { PaymentTabIndividualRecordsLocators } from './paymentTabIndividualRecords.locators';

/**
 * Page Object for the Alis Core Accounting Payment screen's batch-level
 * Payment tab — the grid of individual payment records within a batch.
 * Actions only — no assertions, no test data, no hardcoded URLs (see
 * CLAUDE.md §3 / knowledge/conventions.md). Built from
 * alis_core/knowledge/pages/payment-batch-list.md and
 * alis_core/knowledge/pages/payment-tab-individual-records.md.
 */
export class PaymentTabIndividualRecordsPage extends BasePage {
  protected override path = '#/payment';

  private readonly locators: PaymentTabIndividualRecordsLocators;

  constructor(page: Page) {
    super(page);
    this.locators = new PaymentTabIndividualRecordsLocators(page);
  }

  /* Same Accounting sub-app as the other Payment-screen page objects — not
   * resolvable against ALIS_CORE_BASE_URL. See payment-upload.md's "Reaching
   * this page". */
  override async goto(): Promise<void> {
    const accountingBaseUrl = getRequiredEnv('ALIS_CORE_ACCOUNTING_BASE_URL');
    await this.page.goto(`${accountingBaseUrl}${this.path}`);
  }

  async openBatchListTab(): Promise<void> {
    await this.click(this.locators.batchListTab);
  }

  /** Opens the first batch's Payment tab via its Transaction Add/Edit
   * icon — same navigation approach as invoiceApplication.page.ts's
   * openFirstBatchPaymentTab-equivalent step. */
  async openFirstBatchPaymentTab(): Promise<void> {
    await this.click(this.locators.firstRowAddEditIcon);
  }

  /** Scrolls the grid horizontally via a real wheel gesture — confirmed
   * necessary in payment-tab-individual-records.md's Edge Cases: setting
   * `scrollLeft` directly via JS does not trigger ag-Grid's column
   * virtualization to render columns past "Status". */
  async scrollGridHorizontally(deltaX: number): Promise<void> {
    await this.locators.gridBody.hover();
    await this.page.mouse.wheel(deltaX, 0);
  }

  // ---------------------------------------------------------------------
  // Exposed for the spec to assert on — assertions belong in the test, not
  // here.
  // ---------------------------------------------------------------------

  get batchListTabLocator() {
    return this.locators.batchListTab;
  }

  get paymentTabLocator() {
    return this.locators.paymentTab;
  }

  get gridRowsLocator() {
    return this.locators.gridRows;
  }

  firstRowCellLocator(colId: string) {
    return this.locators.firstRowCell(colId);
  }
}
