import type { Page } from '@playwright/test';

/**
 * Locator definitions for the Alis Core Accounting Payment screen's
 * batch-level Payment tab (individual payment records grid) — sourced from
 * the "## Selectors" tables in
 * alis_core/knowledge/pages/payment-batch-list.md and
 * alis_core/knowledge/pages/payment-tab-individual-records.md. Nothing but
 * locators belongs here; actions live in
 * paymentTabIndividualRecords.page.ts, assertions in
 * paymentTabIndividualRecords.test.ts.
 */
export class PaymentTabIndividualRecordsLocators {
  private readonly batchListPane = this.page.locator('#pills-batch');
  private readonly paymentPane = this.page.locator('#pills-payment');

  constructor(private readonly page: Page) {}

  get batchListTab() {
    return this.page.getByRole('tab', { name: 'Batch List' });
  }

  /** `title` attribute confirmed to have a trailing space
   * ("Transaction Add/Edit ") — matched with a prefix selector to avoid
   * that landmine. See payment-batch-list.md's Selectors table. */
  get firstRowAddEditIcon() {
    return this.batchListPane.locator('.ag-pinned-right-cols-container .ag-row i[title^="Transaction Add/Edit"]').first();
  }

  get paymentTab() {
    return this.page.getByRole('tab', { name: 'Payment' });
  }

  get gridRows() {
    return this.paymentPane.locator('.ag-center-cols-container .ag-row');
  }

  /** A convenient point inside the grid body to anchor a wheel-scroll
   * gesture at — same pattern as batchListVerification.locators.ts's
   * gridBody. */
  get gridBody() {
    return this.paymentPane.locator('.ag-center-cols-viewport');
  }

  gridCell(colId: string) {
    return this.paymentPane.locator(`.ag-center-cols-container [col-id="${colId}"]`);
  }

  firstRowCell(colId: string) {
    return this.gridCell(colId).first();
  }
}
