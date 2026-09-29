import type { Page } from '@playwright/test';

/**
 * Locator definitions for the Alis Core Accounting "Payment > ACH / EFT &
 * Check" tab — sourced from the "## Selectors" table in
 * alis_core/knowledge/pages/ach-eft-check.md. Nothing but locators belongs
 * here; actions live in achEftCheck.page.ts, assertions in
 * achEftCheck.test.ts.
 */
export class AchEftCheckLocators {
  private readonly pane = this.page.locator('#pills-ACHEFT');

  constructor(private readonly page: Page) {}

  /* This tab button's actual `id` attribute has a trailing space
   * ("pills-ACHEFT-tab ") — same quirk as the Batch List tab button (see
   * payment-batch-list.md). Role-based locator avoids it entirely. */
  get achEftCheckTab() {
    return this.page.getByRole('tab', { name: 'ACH / EFT & Check' });
  }

  get searchByDropdown() {
    return this.pane.locator('#ddlSearchBy');
  }

  get batchNoField() {
    return this.pane.locator('#txtBatchNo');
  }

  get searchButton() {
    return this.pane.locator('button:has-text("Search")');
  }

  /** ag-Grid duplicates every row into a main-columns copy and a
   * pinned-right-column copy sharing the same row-id — see
   * check-register.md's Edge Cases for the same pattern on a different grid.
   * Scoped to the center container so this reflects actual data rows. */
  get gridRows() {
    return this.pane.locator('.ag-center-cols-container .ag-row');
  }

  gridCell(colId: string) {
    return this.pane.locator(`.ag-center-cols-container [col-id="${colId}"]`);
  }

  isAchCell() {
    return this.pane.locator('.ag-pinned-right-cols-container [col-id="Is_ACH"]');
  }

  actionIcon(title: string) {
    return this.pane.locator(`.ag-pinned-right-cols-container i[title="${title}"]`);
  }
}
