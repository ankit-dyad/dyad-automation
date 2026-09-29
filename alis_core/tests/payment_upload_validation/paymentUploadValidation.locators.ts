import type { Page } from '@playwright/test';

/**
 * Locator definitions for the Alis Core Accounting "Payment > Upload" tab's
 * post-upload Valid/Invalid Invoice split — sourced from the
 * "## Selectors" tables in alis_core/knowledge/pages/payment-upload.md and
 * alis_core/knowledge/pages/payment-upload-file-validation.md. Nothing but
 * locators belongs here; actions live in
 * paymentUploadValidation.page.ts, assertions in
 * paymentUploadValidation.test.ts.
 */
export class PaymentUploadValidationLocators {
  constructor(private readonly page: Page) {}

  get uploadTab() {
    return this.page.locator('#pills-Upload-tab');
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

  /* No `id` attribute at all on either tab button (confirmed via live DOM) —
   * match by role/text. Badge count is part of the same accessible name
   * (e.g. "Valid Invoice 0"), so match with a regex. */
  get validInvoiceTab() {
    return this.page.getByRole('tab', { name: /Valid Invoice/ });
  }

  get invalidInvoiceTab() {
    return this.page.getByRole('tab', { name: /Invalid Invoice/ });
  }

  get validInvoiceGridHeaders() {
    return this.page.locator('#GridValidInvoice [role="columnheader"]');
  }

  get invalidInvoiceGridRows() {
    return this.page.locator('.ag-center-cols-container .ag-row');
  }

  invalidInvoiceGridCell(colId: string) {
    return this.page.locator(`.ag-center-cols-container [col-id="${colId}"]`);
  }

  get savePaymentButton() {
    return this.page.locator('button:has-text("Save Payment")');
  }
}
