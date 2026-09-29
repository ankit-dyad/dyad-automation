import type { Page } from '@playwright/test';

/**
 * Locator definitions for the Alis Core Accounting Check Register screen's
 * "Remittance Download As" dropdown — sourced from the "## Selectors" table
 * in alis_core/knowledge/pages/remittance-advice.md. Nothing but locators
 * belongs here; actions live in remittanceAdvice.page.ts, assertions in
 * remittanceAdvice.test.ts.
 */
export class RemittanceAdviceLocators {
  /** Check Register pane container — same duplicate-tab-pane-id pattern as
   * documented in check-register.md; scope here to avoid the Spoiled Checks
   * pane's copy of the same ids. */
  private readonly pane = this.page.locator('#pills-cashlisting');

  constructor(private readonly page: Page) {}

  get checkRegisterTab() {
    return this.page.locator('#pills-cashlisting-tab');
  }

  get firstRowCheckbox() {
    return this.pane
      .locator('.ag-center-cols-container .ag-row .ag-selection-checkbox input[type="checkbox"]')
      .first();
  }

  get remittanceDownloadAsToggle() {
    return this.pane.locator('button:has-text("Remittance Download As")');
  }

  get pdfOption() {
    return this.page.locator('.dropdown-menu a:has-text("PDF")');
  }

  get excelDataOnlyOption() {
    return this.page.locator('.dropdown-menu a:has-text("Excel Data Only")');
  }

  get excelFormatOption() {
    return this.page.locator('.dropdown-menu a:has-text("Excel Format")');
  }
}
