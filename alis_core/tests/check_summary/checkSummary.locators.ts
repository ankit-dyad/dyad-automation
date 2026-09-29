import type { Page } from '@playwright/test';

/**
 * Locator definitions for the Alis Core Accounting Check Register screen's
 * "Check Summary" popup — sourced from the "## Selectors" tables in
 * alis_core/knowledge/pages/check-register.md and
 * alis_core/knowledge/pages/check-summary-popup.md. Nothing but locators
 * belongs here; actions live in checkSummary.page.ts, assertions in
 * checkSummary.test.ts.
 */
export class CheckSummaryLocators {
  /** Check Register pane container — same duplicate-tab-pane-id pattern as
   * documented in check-register.md; scope here to avoid the Spoiled Checks
   * pane's copy of the same ids. */
  private readonly pane = this.page.locator('#pills-cashlisting');

  constructor(private readonly page: Page) {}

  get checkRegisterTab() {
    return this.page.locator('#pills-cashlisting-tab');
  }

  get firstRowCheckSummaryIcon() {
    return this.pane.locator('.ag-pinned-right-cols-container .ag-row i[title="Check Summary"]').first();
  }

  /** Several `.modal` elements are mounted in the DOM at once; only the
   * currently-open one carries Bootstrap's `.show` class — see
   * check-summary-popup.md's Edge Cases. Every locator below is scoped
   * under it. */
  get openModal() {
    return this.page.locator('.modal.show');
  }

  get modalCloseButton() {
    return this.openModal.locator('.btn-close');
  }

  get modalGridRow() {
    return this.openModal.locator('.ag-center-cols-container .ag-row');
  }

  modalGridCell(colId: string) {
    return this.openModal.locator(`.ag-center-cols-container [col-id="${colId}"]`);
  }
}
