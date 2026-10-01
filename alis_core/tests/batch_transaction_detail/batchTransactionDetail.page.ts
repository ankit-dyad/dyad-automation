import type { Page } from '@playwright/test';
import { BasePage } from '../../../framework/pages/BasePage';
import { getRequiredEnv } from '../../../framework/utils/env';
import { BatchTransactionDetailLocators } from './batchTransactionDetail.locators';

/**
 * Page Object for the Alis Core Accounting Payment screen's Batch List tab
 * and its "Batch Transaction Detail" popup. Actions only — no assertions, no
 * test data, no hardcoded URLs (see CLAUDE.md §3 / knowledge/conventions.md).
 * Built from alis_core/knowledge/pages/payment-batch-list.md and
 * alis_core/knowledge/pages/batch-transaction-detail-popup.md.
 */
export class BatchTransactionDetailPage extends BasePage {
  protected override path = '#/payment';

  private readonly locators: BatchTransactionDetailLocators;

  constructor(page: Page) {
    super(page);
    this.locators = new BatchTransactionDetailLocators(page);
  }

  /* Same Accounting sub-app as PaymentUploadPage/CheckRegisterPage — not
   * resolvable against ALIS_CORE_BASE_URL. See payment-upload.md's "Reaching
   * this page". */
  override async goto(): Promise<void> {
    const accountingBaseUrl = getRequiredEnv('ALIS_CORE_ACCOUNTING_BASE_URL');
    await this.page.goto(`${accountingBaseUrl}${this.path}`);
  }

  async openBatchListTab(): Promise<void> {
    await this.click(this.locators.batchListTab);
  }

  /** Reads the first grid row's Batch No — used to assert the popup's
   * content matches the row that was clicked, without hardcoding a batch
   * number from this ever-changing production-looking environment (see
   * payment-batch-list.md's "Notable behavior" note). */
  async firstRowBatchNo(): Promise<string> {
    return this.textOf(this.locators.firstRowBatchNoCell);
  }

  async openFirstRowDetailPopup(): Promise<void> {
    await this.click(this.locators.firstRowViewIcon);
  }

  async closeDetailPopup(): Promise<void> {
    await this.click(this.locators.modalCloseButton);
  }

  /** Scrolls the modal grid horizontally via a real wheel gesture -
   * confirmed necessary live 2026-09-30: this popup only renders its
   * first 5 columns until scrolled (ag-Grid column virtualization, same
   * quirk as payment-batch-list.md's Edge Cases; setting `scrollLeft`
   * directly via JS does not trigger it here either). */
  async scrollModalGridHorizontally(deltaX: number): Promise<void> {
    await this.locators.modalGridBody.hover();
    await this.page.mouse.wheel(deltaX, 0);
  }

  // ---------------------------------------------------------------------
  // Exposed for the spec to assert on — assertions belong in the test, not
  // here.
  // ---------------------------------------------------------------------

  get batchListTabLocator() {
    return this.locators.batchListTab;
  }

  get gridRowsLocator() {
    return this.locators.gridRows;
  }

  get openModalLocator() {
    return this.locators.openModal;
  }

  get modalTitleLocator() {
    return this.locators.modalTitle;
  }

  modalGridCellLocator(colId: string) {
    return this.locators.modalGridCell(colId);
  }
}
