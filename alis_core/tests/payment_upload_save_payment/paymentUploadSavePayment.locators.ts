import type { Page } from '@playwright/test';

/**
 * Locator definitions for the Alis Core Accounting Payment screen's Upload
 * tab, covering the write path: Entity selection -> upload -> Valid Invoice
 * row selection -> Save Payment. Sourced from the "## Selectors" tables in
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
   * payment-upload-file-validation.md) - match by role/text. Badge count is
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
   * underlying select-all state) - 7 duplicates matched on this grid, not
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
   * (`-$10.00`-style) - confirmed live 2026-09-28 (user's manual repro):
   * Save Payment rejects any negative-amount row with an "Invalid
   * Transactions" modal and creates no batch at all while one is selected,
   * even alongside otherwise-valid rows. Matched by visible row text rather
   * than a specific col-id, since the Valid Invoice grid's per-column
   * col-ids weren't individually confirmed in this pass (see
   * payment-upload-file-validation.md's Selectors table).
   *
   * This is the **data-columns duplicate** of the row (under
   * `.ag-center-cols-container`) - its selection checkbox lives in a
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
   * batch-transaction-detail-popup.md - scope to `.modal.show`. Appears
   * instead of a created batch when any selected row fails a business
   * validation (confirmed cause: negative payment amount). */
  get invalidTransactionsModal() {
    return this.page.locator('.modal.show', { hasText: 'Invalid Transactions' });
  }

  get invalidTransactionsCloseButton() {
    return this.invalidTransactionsModal.locator('button:has-text("Close")');
  }

  /** Toast confirming a real batch was created, e.g. "Payment Created
   * Successfully. Batch# 39299" - confirmed live 2026-09-28. No narrower
   * selector captured yet (toast library/container class not inspected in
   * this pass) - matched by its distinctive text. */
  get successToast() {
    return this.page.getByText(/Payment Created Successfully/);
  }

  /** NOT `#pills-batch-tab` - confirmed in payment-batch-list.md's Selectors
   * table that this button's real `id` attribute has a trailing space
   * (`"pills-batch-tab "`), so that CSS id selector matches zero elements.
   * Root-caused live 2026-09-29 after three consecutive real-write runs each
   * hung for their entire test budget right here: with no default action
   * timeout configured (playwright.config.ts), a locator matching nothing
   * blocks forever instead of failing fast, so every run rode the outer
   * test.setTimeout() all the way out before force-closing the browser - the
   * Save Payment write itself had already succeeded every single time, this
   * locator just never let the test see it. Role-based, matching every other
   * page object in this repo (batchListVerification, batchListSearchByNumber,
   * invoiceApplication) that already worked around this same landmine. */
  get batchListTab() {
    return this.page.getByRole('tab', { name: 'Batch List' });
  }

  /** A specific batch's row, matched by its visible Batch No text. Digit-based
   * lookaround, not a `\b` word-boundary regex - ag-Grid's flattened row
   * `textContent` has no separators between cells, so a batch number's digit
   * run is immediately followed by a letter and `\b` never finds a boundary
   * there (same fix as batchListVerification.locators.ts's rowForBatch() -
   * payment-batch-list.md's "Notable behavior" note). Used only after
   * isolateBatchNo() has already narrowed the grid to this one Batch No, so
   * there's exactly one match and no row-virtualization concern (unlike an
   * unfiltered scroll-to-find approach). */
  batchListRow(batchNo: string) {
    return this.page
      .locator('#pills-batch .ag-center-cols-container .ag-row')
      .filter({ hasText: new RegExp(`(?<!\\d)${batchNo}(?!\\d)`) });
  }

  batchListCellForBatch(batchNo: string, colId: string) {
    return this.batchListRow(batchNo).locator(`[col-id="${colId}"]`);
  }

  /** Once isolateBatchNo() has narrowed the Batch List grid to exactly one
   * row, this is that row's Transaction Add/Edit icon - `.first()` correctly
   * targets it the same way invoiceApplication.locators.ts's
   * firstRowAddEditIcon does after its own isolateBatchNo() call. `title`
   * attribute confirmed to have a trailing space ("Transaction Add/Edit ") -
   * matched with a prefix selector to avoid that landmine. See
   * payment-batch-list.md's Selectors table. */
  get firstRowAddEditIcon() {
    return this.page.locator('#pills-batch .ag-pinned-right-cols-container .ag-row i[title^="Transaction Add/Edit"]').first();
  }

  get paymentTab() {
    return this.page.getByRole('tab', { name: 'Payment' });
  }

  /** Batch-level Payment tab's individual-payment-records grid - same
   * shape/col-ids as paymentTabIndividualRecords.locators.ts (that feature's
   * own copy verifies whichever batch is first; this one verifies the
   * specific batch this Save Payment run just created). */
  get paymentGridRows() {
    return this.page.locator('#pills-payment .ag-center-cols-container .ag-row');
  }

  get paymentGridBody() {
    return this.page.locator('#pills-payment .ag-center-cols-viewport');
  }

  paymentGridCell(colId: string) {
    return this.page.locator(`#pills-payment .ag-center-cols-container [col-id="${colId}"]`);
  }

  firstPaymentRowCell(colId: string) {
    return this.paymentGridCell(colId).first();
  }

  /** ag-Grid's built-in Filters tool panel on the Batch List grid - same
   * mechanism as payment-batch-list.md's Selectors table /
   * alis_core/tests/batch_list_search_by_number, reused here so this feature
   * can isolate the grid to the specific batch it just created instead of
   * scrolling to find it (a scroll-to-bottom + row-index correlation
   * approach was tried first but never actually verified live - every run
   * hit the batchListTab bug above before reaching it - and this reuses an
   * already-proven mechanism instead). Scoping under this wrapper (rather
   * than the whole pane) avoids accidentally matching the grid's own "Batch
   * No" column header, which has the same visible text. */
  get filterToolPanel() {
    return this.page.locator('#pills-batch .ag-tool-panel-wrapper');
  }

  get filtersTab() {
    return this.page.locator('#pills-batch').getByRole('tab', { name: 'Filters' });
  }

  get batchNoGroupHeader() {
    return this.filterToolPanel.getByRole('button', { name: 'Batch No' });
  }

  get batchNoSearchInput() {
    return this.filterToolPanel.getByRole('textbox', { name: 'Search filter values' });
  }

  /** `(Select All)` pseudo-item's own checkbox - the only reliable way to
   * change the applied filter (see batchListSearchByNumber.locators.ts's
   * identical note and payment-batch-list.md's Selectors table: toggling an
   * individual value's own checkbox visually reports `checked` but does not
   * reliably update the grid). */
  get selectAllFilterCheckbox() {
    return this.filterToolPanel
      .locator('.ag-set-filter-item, .ag-list-item')
      .filter({ hasText: '(Select All)' })
      .locator('input[type="checkbox"]');
  }

  /** A convenient point inside the Batch List grid body to anchor a
   * wheel-scroll gesture at - column virtualization is independent of row
   * isolation (isolateBatchNo() narrows which row renders, not which
   * columns), so this is still needed to reveal Bank GL/Bank Name/Status/ACH.
   * See payment-batch-list.md's Edge Cases. */
  get batchListGridBody() {
    return this.page.locator('#pills-batch .ag-center-cols-viewport');
  }
}
