import type { Page } from '@playwright/test';
import { BasePage } from '../../../framework/pages/BasePage';
import { getRequiredEnv } from '../../../framework/utils/env';
import { BatchListVerificationLocators } from './batchListVerification.locators';

/**
 * Page Object for the Alis Core Accounting Payment screen's Batch List tab
 * grid verification. Actions only — no assertions, no test data, no
 * hardcoded URLs (see CLAUDE.md §3 / knowledge/conventions.md). Built from
 * alis_core/knowledge/pages/payment-batch-list.md.
 */
export class BatchListVerificationPage extends BasePage {
  protected override path = '#/payment';

  private readonly locators: BatchListVerificationLocators;

  constructor(page: Page) {
    super(page);
    this.locators = new BatchListVerificationLocators(page);
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

  /** Scrolls the grid horizontally via a real wheel gesture — confirmed
   * necessary in payment-batch-list.md's Edge Cases: setting `scrollLeft`
   * directly via JS does not trigger ag-Grid's column virtualization to
   * render columns past "Entry Date". */
  async scrollGridHorizontally(deltaX: number): Promise<void> {
    await this.locators.gridBody.hover();
    await this.page.mouse.wheel(deltaX, 0);
  }

  /** Scrolls the grid all the way down — unlike the horizontal axis, a
   * direct `scrollTop` assignment plus a dispatched `scroll` event works
   * here (confirmed live 2026-09-28). Needed to bring a freshly-created
   * batch (always the highest, and therefore last, batch number in this
   * ascending-sorted grid) into the DOM before it can be located. */
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

  firstRowCellLocator(colId: string) {
    return this.locators.firstRowCell(colId);
  }

  rowForBatchLocator(batchNo: string) {
    return this.locators.rowForBatch(batchNo);
  }

  cellForBatchLocator(batchNo: string, colId: string) {
    return this.locators.cellForBatch(batchNo, colId);
  }
}
