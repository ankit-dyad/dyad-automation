import type { Page } from '@playwright/test';

/**
 * Locator definitions for the Alis Core Accounting Payment screen's Batch
 * List tab and its "Batch Transaction Detail" popup — sourced from the
 * "## Selectors" tables in alis_core/knowledge/pages/payment-batch-list.md
 * and alis_core/knowledge/pages/batch-transaction-detail-popup.md. Nothing
 * but locators belongs here; actions live in batchTransactionDetail.page.ts,
 * assertions in batchTransactionDetail.test.ts.
 */
export class BatchTransactionDetailLocators {
  constructor(private readonly page: Page) {}

  /* This tab button's actual `id` attribute is "pills-batch-tab " — with a
   * trailing space (confirmed via live DOM inspection: `#pills-batch-tab`
   * matches nothing, `getElementById` too). Using a role-based locator
   * instead avoids that landmine entirely; see check-register.md-style pages
   * for where the same app otherwise uses clean ids on tab buttons. */
  get batchListTab() {
    return this.page.getByRole('tab', { name: 'Batch List' });
  }

  /** ag-Grid duplicates every row into a main-columns copy and a
   * pinned-right-column copy sharing the same row-id — see
   * check-register.md's Edge Cases for the same pattern on a different grid.
   * Scoped to the center container so this reflects actual data rows. */
  get gridRows() {
    return this.page.locator('#pills-batch .ag-center-cols-container .ag-row');
  }

  get firstRowBatchNoCell() {
    return this.page.locator('#pills-batch .ag-center-cols-container [col-id="batch_no"]').first();
  }

  get firstRowViewIcon() {
    return this.page.locator('#pills-batch .ag-pinned-right-cols-container .ag-row i[title="View Batch Data"]').first();
  }

  /** Several `.modal` elements are mounted in the DOM at once; only the
   * currently-open one carries Bootstrap's `.show` class — see
   * batch-transaction-detail-popup.md's Edge Cases. Every locator below is
   * scoped under it. */
  get openModal() {
    return this.page.locator('.modal.show');
  }

  get modalTitle() {
    return this.openModal.locator('.modal-title');
  }

  get modalCloseButton() {
    return this.openModal.locator('.btn-close');
  }

  get modalGridRow() {
    return this.openModal.locator('.ag-center-cols-container .ag-row');
  }

  /** This popup's own grid renders its one data row twice within
   * `.ag-center-cols-container` itself (confirmed by direct observation —
   * not the usual center/pinned-right duplication seen elsewhere in this
   * app, both copies are in the center container here) — `.first()` picks
   * the first copy. See batch-transaction-detail-popup.md's Edge Cases. */
  modalGridCell(colId: string) {
    return this.openModal.locator(`.ag-center-cols-container [col-id="${colId}"]`).first();
  }
}
