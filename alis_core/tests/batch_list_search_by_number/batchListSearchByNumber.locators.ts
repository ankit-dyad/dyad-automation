import type { Page } from '@playwright/test';

/**
 * Locator definitions for the Batch List tab's "Filters" side panel /
 * "Batch No" column search — sourced from the "## Selectors" table in
 * alis_core/knowledge/pages/payment-batch-list.md. Nothing but locators
 * belongs here; actions live in batchListSearchByNumber.page.ts, assertions
 * in batchListSearchByNumber.test.ts.
 */
export class BatchListSearchByNumberLocators {
  private readonly pane = this.page.locator('#pills-batch');

  constructor(private readonly page: Page) {}

  get batchListTab() {
    return this.page.getByRole('tab', { name: 'Batch List' });
  }

  get gridRows() {
    return this.pane.locator('.ag-center-cols-container .ag-row');
  }

  get firstRowBatchNoCell() {
    return this.pane.locator('.ag-center-cols-container [col-id="batch_no"]').first();
  }

  /** ag-Grid's built-in Filters tool panel — see payment-batch-list.md's
   * Selectors table. Scoping every filter-panel locator under this wrapper
   * (rather than the whole pane) avoids accidentally matching the grid's own
   * "Batch No" column header, which has the same visible text. */
  get filterToolPanel() {
    return this.pane.locator('.ag-tool-panel-wrapper');
  }

  get filtersTab() {
    return this.pane.getByRole('tab', { name: 'Filters' });
  }

  get batchNoGroupHeader() {
    return this.filterToolPanel.getByRole('button', { name: 'Batch No' });
  }

  get batchNoSearchInput() {
    return this.filterToolPanel.getByRole('textbox', { name: 'Search filter values' });
  }

  /** `(Select All)` pseudo-item's own checkbox at the top of the Batch No
   * value list. Confirmed live 2026-09-28: toggling *this* checkbox is the
   * only reliable way to change the applied filter in this grid — toggling
   * an individual value's own checkbox (e.g. one specific Batch No) visually
   * reports `checked` afterwards but does **not** reliably update the grid.
   * See payment-batch-list.md's Selectors table note and
   * batchListSearchByNumber.page.ts's `isolateBatchNo()` for the exact
   * "select-all only" sequence this drives. <!-- fragile: no accessible
   * name/role exposed on this checkbox, see payment-batch-list.md --> */
  get selectAllCheckbox() {
    return this.filterToolPanel
      .locator('.ag-set-filter-item, .ag-list-item')
      .filter({ hasText: '(Select All)' })
      .locator('input[type="checkbox"]');
  }

  /** Matches a row containing this exact Batch No. Deliberately not a `\b`
   * word-boundary regex: ag-Grid's flattened row `textContent` concatenates
   * cells with no separator (e.g. "35066MarketPOL_89..."), so the digit run
   * is immediately followed by a letter — still a word character, so `\b`
   * finds no boundary there and never matches. Digit-based lookaround avoids
   * that. */
  rowForBatch(batchNo: string) {
    return this.gridRows.filter({ hasText: new RegExp(`(?<!\\d)${batchNo}(?!\\d)`) });
  }
}
