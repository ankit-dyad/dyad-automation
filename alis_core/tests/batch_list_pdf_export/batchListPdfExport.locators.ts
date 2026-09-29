import type { Page } from '@playwright/test';

/**
 * Locator definitions for the Alis Core Accounting Payment screen's Batch
 * List "PDF Export" action — sourced from the "## Selectors" table in
 * alis_core/knowledge/pages/payment-batch-list-pdf-export.md. Nothing but
 * locators belongs here; actions live in batchListPdfExport.page.ts,
 * assertions in batchListPdfExport.test.ts.
 */
export class BatchListPdfExportLocators {
  private readonly pane = this.page.locator('#pills-batch');

  constructor(private readonly page: Page) {}

  get batchListTab() {
    return this.page.getByRole('tab', { name: 'Batch List' });
  }

  get firstRowPdfIcon() {
    return this.pane.locator('.ag-pinned-right-cols-container .ag-row i[title="PDF Export"]').first();
  }
}
