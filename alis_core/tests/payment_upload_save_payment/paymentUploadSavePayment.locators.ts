import type { Page } from '@playwright/test';

/**
 * Locator definitions for the Alis Core Accounting Payment screen's Upload
 * tab, covering the write path: Entity selection → upload → Valid Invoice
 * row selection → Save Payment. Sourced from the "## Selectors" tables in
 * alis_core/knowledge/pages/payment-upload.md and
 * alis_core/knowledge/pages/payment-upload-file-validation.md. Nothing but
 * locators belongs here; actions live in
 * paymentUploadSavePayment.page.ts, assertions in
 * paymentUploadSavePayment.test.ts.
 */
export class PaymentUploadSavePaymentLocators {
  constructor(private readonly page: Page) {}

  get uploadTab() {
    return this.page.locator('#pills-Upload-tab');
  }

  get entityDropdown() {
    return this.page.locator('#ddlEntityUpload');
  }

  get chooseFilesInput() {
    return this.page.locator('#fileuploadtab');
  }

  get uploadButton() {
    return this.page.locator('#pills-Upload button:has-text("Upload")');
  }

  /* No `id` attribute at all on either tab button (confirmed via live DOM in
   * payment-upload-file-validation.md) — match by role/text. Badge count is
   * part of the same accessible name (e.g. "Valid Invoice 12"), so match
   * with a regex. */
  get validInvoiceTab() {
    return this.page.getByRole('tab', { name: /Valid Invoice/ });
  }

  get invalidInvoiceTab() {
    return this.page.getByRole('tab', { name: /Invalid Invoice/ });
  }

  get validInvoiceGrid() {
    return this.page.locator('#GridValidInvoice');
  }

  get validInvoiceGridRows() {
    return this.validInvoiceGrid.locator('.ag-center-cols-container .ag-row');
  }

  /** Standard ag-Grid class for a headerCheckboxSelection-enabled column.
   * Confirmed live (2026-09-28): ag-Grid renders one such checkbox per
   * column header (an accessibility-copy pattern, all controlling the same
   * underlying select-all state) — 7 duplicates matched on this grid, not
   * just 1. `.first()` selects the same logical control any of them would. */
  get selectAllCheckbox() {
    return this.validInvoiceGrid.locator('.ag-header-select-all input[type="checkbox"]').first();
  }

  get rowCheckboxes() {
    return this.validInvoiceGrid.locator('.ag-selection-checkbox input[type="checkbox"]');
  }

  get totalPaymentAmountText() {
    return this.page.locator('#pills-Upload').getByText(/Total Payment Amount/);
  }

  get savePaymentButton() {
    return this.page.locator('button:has-text("Save Payment")');
  }

  /** ag-Grid row whose Amount cell renders a negative dollar value
   * (`-$10.00`-style) — confirmed live 2026-09-28 (user's manual repro):
   * Save Payment rejects any negative-amount row with an "Invalid
   * Transactions" modal and creates no batch at all while one is selected,
   * even alongside otherwise-valid rows. Matched by visible row text rather
   * than a specific col-id, since the Valid Invoice grid's per-column
   * col-ids weren't individually confirmed in this pass (see
   * payment-upload-file-validation.md's Selectors table).
   *
   * This is the **data-columns duplicate** of the row (under
   * `.ag-center-cols-container`) — its selection checkbox lives in a
   * separate, same-`row-index` duplicate under `.ag-pinned-left-cols-container`
   * instead (confirmed live: the accessibility tree shows two parallel
   * rowgroups, one with checkboxes and no data, one with data and no
   * checkboxes). Same row-duplication quirk as `check-register.md`'s
   * pinned-right action-icon column, just pinned left here for the leading
   * checkbox column instead. Use `pinnedCheckboxForRow()` with this row's
   * `row-index` attribute to reach its actual checkbox. */
  get negativeAmountRows() {
    return this.validInvoiceGridRows.filter({ hasText: /-\$[\d,]+\.\d{2}/ });
  }

  pinnedCheckboxForRow(rowIndex: string) {
    return this.validInvoiceGrid.locator(
      `.ag-pinned-left-cols-container [row-index="${rowIndex}"] input[type="checkbox"]`,
    );
  }

  /** Multi-modal-mounted pattern, same as invoice-application.md/
   * batch-transaction-detail-popup.md — scope to `.modal.show`. Appears
   * instead of a created batch when any selected row fails a business
   * validation (confirmed cause: negative payment amount). */
  get invalidTransactionsModal() {
    return this.page.locator('.modal.show', { hasText: 'Invalid Transactions' });
  }

  get invalidTransactionsCloseButton() {
    return this.invalidTransactionsModal.locator('button:has-text("Close")');
  }

  /** Toast confirming a real batch was created, e.g. "Payment Created
   * Successfully. Batch# 39299" — confirmed live 2026-09-28. No narrower
   * selector captured yet (toast library/container class not inspected in
   * this pass) — matched by its distinctive text. */
  get successToast() {
    return this.page.getByText(/Payment Created Successfully/);
  }

  get batchListTab() {
    return this.page.locator('#pills-batch-tab');
  }

  batchListRow(batchNo: string) {
    return this.page.locator('#pills-batch .ag-center-cols-container .ag-row').filter({ hasText: batchNo });
  }
}
