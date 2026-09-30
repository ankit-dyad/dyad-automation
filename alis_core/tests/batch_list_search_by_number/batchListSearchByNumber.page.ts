import type { Page } from '@playwright/test';
import { BasePage } from '../../../framework/pages/BasePage';
import { getRequiredEnv } from '../../../framework/utils/env';
import { BatchListSearchByNumberLocators } from './batchListSearchByNumber.locators';

/**
 * Page Object for the Alis Core Accounting Payment screen's Batch List tab
 * "Filters" side panel — searching/isolating a row by its Batch No, then
 * clearing that filter. Actions only — no assertions, no test data, no
 * hardcoded URLs (see CLAUDE.md §3 / knowledge/conventions.md). Built from
 * alis_core/knowledge/pages/payment-batch-list.md.
 */
export class BatchListSearchByNumberPage extends BasePage {
  protected override path = '#/payment';

  private readonly locators: BatchListSearchByNumberLocators;

  constructor(page: Page) {
    super(page);
    this.locators = new BatchListSearchByNumberLocators(page);
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

  /** Reads the first (unfiltered) row's Batch No so the spec can search for
   * a batch number that actually exists right now, instead of a hardcoded
   * value — this environment's batch data is real and changes over time
   * (see payment-batch-list.md's "Notable behavior"). */
  async readFirstBatchNo(): Promise<string> {
    return this.textOf(this.locators.firstRowBatchNoCell);
  }

  async openFiltersPanel(): Promise<void> {
    await this.click(this.locators.filtersTab);
  }

  async expandBatchNoFilter(): Promise<void> {
    await this.click(this.locators.batchNoGroupHeader);
  }

  /** Isolates the grid to just one Batch No, using only the `(Select All)`
   * toggle — confirmed live 2026-09-28 to be the reliable mechanism here;
   * toggling an individual value's own checkbox visually reports `checked`
   * but does **not** reliably update the grid's applied filter (see
   * payment-batch-list.md's Selectors table note). The sequence:
   * 1. With the value-search box still empty, click `(Select All)` once —
   *    this deselects every value in the entire column.
   * 2. Type the target Batch No into the search box, narrowing the value
   *    list down to just that one value (still unchecked from step 1).
   * 3. Click `(Select All)` again — now scoped to the narrowed
   *    single-value list, so this checks just that one value, isolating
   *    the grid to it. */
  async isolateBatchNo(batchNo: string): Promise<void> {
    await this.click(this.locators.selectAllCheckbox);
    await this.enter(this.locators.batchNoSearchInput, batchNo);
    await this.click(this.locators.selectAllCheckbox);
  }

  /** Clears the value-search box, then re-checks `(Select All)` — since the
   * search box is now empty, `(Select All)` reflects the *entire* column's
   * value set again, so checking it re-selects every value and restores the
   * unfiltered grid. */
  async clearBatchNoFilter(): Promise<void> {
    await this.enter(this.locators.batchNoSearchInput, '');
    await this.click(this.locators.selectAllCheckbox);
  }

  /** Scrolls the grid all the way down - same recipe as
   * batchListVerification.page.ts's scrollGridToBottom(): a direct
   * scrollTop assignment plus a dispatched scroll event works for this
   * grid's vertical axis. Needed after clearBatchNoFilter() restores the
   * full, unfiltered, ascending-sorted grid, since a freshly-created batch
   * (always the highest, and therefore last, batch number) isn't in the DOM
   * (ag-Grid row virtualization) until scrolled into view. */
  async scrollGridToBottom(): Promise<void> {
    await this.locators.verticalViewport.evaluate((viewport) => {
      viewport.scrollTop = viewport.scrollHeight;
      viewport.dispatchEvent(new Event('scroll'));
    });
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

  rowForBatchLocator(batchNo: string) {
    return this.locators.rowForBatch(batchNo);
  }
}
