import type { Page } from '@playwright/test';

/**
 * Locator definitions for the Alis Core Accounting "Payment > Upload" tab —
 * sourced from the "## Selectors" table in
 * alis_core/knowledge/pages/payment-upload.md. Nothing but locators belongs
 * here; actions live in paymentUpload.page.ts, assertions in
 * paymentUpload.test.ts.
 */
export class PaymentUploadLocators {
  constructor(private readonly page: Page) {}

  get uploadTab() {
    return this.page.locator('#pills-Upload-tab');
  }

  get batchListTab() {
    return this.page.locator('#pills-batch-tab');
  }

  get clientTypeDropdown() {
    return this.page.locator('#ddlClientTypeUpload');
  }

  /* No id/formcontrolname in the rendered DOM — identified via the
   * `bsdatepicker` directive attribute; only one such field on this tab. See
   * payment-upload.md's Selectors table (flagged fragile). */
  get acctEffDateField() {
    return this.page.locator('input[bsdatepicker]');
  }

  get entityDropdown() {
    return this.page.locator('#ddlEntityUpload');
  }

  get bankGlDropdown() {
    return this.page.locator('#ddlBankGLUpload');
  }

  get chooseFilesInput() {
    return this.page.locator('#fileuploadtab');
  }

  get downloadSampleLink() {
    return this.page.locator('a[href*="DownloadExcel/payment_upload_sample.xlsx"]');
  }

  get uploadButton() {
    return this.page.locator('#pills-Upload button:has-text("Upload")');
  }

  get cancelButton() {
    return this.page.locator('#pills-Upload button:has-text("Cancel")');
  }
}
