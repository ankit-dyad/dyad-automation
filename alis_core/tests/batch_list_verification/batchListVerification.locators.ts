import type { Page } from '@playwright/test';

/**
 * Locator definitions for the Alis Core Accounting Payment screen's Batch
 * List tab — sourced from the "## Selectors" table in
 * alis_core/knowledge/pages/payment-batch-list.md. Nothing but locators
 * belongs here; actions live in batchListVerification.page.ts, assertions in
 * batchListVerification.test.ts.
 */
export class BatchListVerificationLocators {
  private readonly pane = this.page.locator('#pills-batch');

  constructor(private readonly page: Page) {}

  get batchListTab() {
    return this.page.getByRole('tab', { name: 'Batch List' });
  }

  get gridRows() {
    return this.pane.locator('.ag-center-cols-container .ag-row');
  }

  /** A convenient point inside the grid body to anchor a wheel-scroll
   * gesture at — see scrollGridHorizontally() below. */
  get gridBody() {
    return this.pane.locator('.ag-center-cols-viewport');
  }

  /** The grid's vertical scroll container — ag-Grid also virtualizes rows,
   * same class of quirk as the horizontal column virtualization (see
   * payment-batch-list.md's scroll-gesture note). Confirmed live 2026-09-28
   * while hunting a specific batch number: a direct `scrollTop` assignment
   * plus a dispatched `scroll` event *does* work for the vertical axis
   * (unlike horizontal, which needs a genuine wheel gesture). */
  get verticalViewport() {
    return this.pane.locator('.ag-body-viewport');
  }

  gridCell(colId: string) {
    return this.pane.locator(`.ag-center-cols-container [col-id="${colId}"]`);
  }

  firstRowCell(colId: string) {
    return this.gridCell(colId).first();
  }

  /** A specific batch's row, matched by its visible Batch No text. Batch
   * numbers sort ascending in this grid (confirmed via repeated live scans),
   * so a freshly-created batch (always the highest number) ends up at the
   * very bottom — scroll there first with scrollGridToBottom() before using
   * this, since the row won't be in the DOM otherwise.
   *
   * Uses a digit-based lookaround, not a `\b` word-boundary regex — ag-Grid's
   * flattened row `textContent` has no separators between cells (e.g.
   * `"35066MarketPOL_89$200.00$200.00$0.00"`), so a batch number's digit run
   * is immediately followed by a letter; both are "word" characters for
   * regex purposes, so `\b` never finds a boundary there and silently fails
   * to match. See `payment-batch-list.md`'s "Notable behavior" note. */
  rowForBatch(batchNo: string) {
    return this.gridRows.filter({ hasText: new RegExp(`(?<!\\d)${batchNo}(?!\\d)`) });
  }

  cellForBatch(batchNo: string, colId: string) {
    return this.rowForBatch(batchNo).locator(`[col-id="${colId}"]`);
  }
}
