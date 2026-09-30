import type { Page } from '@playwright/test';

/**
 * Locator definitions for the Alis Core Accounting Payment screen's path
 * into the "Invoice Application" modal — sourced from the "## Selectors"
 * tables in alis_core/knowledge/pages/payment-batch-list.md and
 * alis_core/knowledge/pages/invoice-application.md. Nothing but locators
 * belongs here; actions live in invoiceApplication.page.ts, assertions in
 * invoiceApplication.test.ts.
 */
export class InvoiceApplicationLocators {
  private readonly batchListPane = this.page.locator('#pills-batch');

  constructor(private readonly page: Page) {}

  get batchListTab() {
    return this.page.getByRole('tab', { name: 'Batch List' });
  }

  get batchListGridRows() {
    return this.batchListPane.locator('.ag-center-cols-container .ag-row');
  }

  get firstRowBatchNoCell() {
    return this.batchListPane.locator('.ag-center-cols-container [col-id="batch_no"]').first();
  }

  /** ag-Grid's built-in Filters tool panel on the Batch List grid — same
   * mechanism as payment-batch-list.md's Selectors table /
   * alis_core/tests/batch_list_search_by_number, reused here so this
   * feature's tests can open a specific batch instead of "whichever is
   * first" (this environment's data changes over time — see
   * payment-batch-list.md's "Notable behavior"). Scoping under this wrapper
   * (rather than the whole pane) avoids accidentally matching the grid's own
   * "Batch No" column header, which has the same visible text.
   *
   * `:visible`-scoped - confirmed live 2026-09-30: this grid mounts **two**
   * `.ag-tool-panel-wrapper` elements at once (one for Columns, one for
   * Filters - same "both tabs mounted at once" pattern documented elsewhere
   * in this app), only one of which is actually visible depending on which
   * side-tab is active. Without `:visible`, which of the two a bare
   * unscoped match resolves to isn't guaranteed, and scoping every
   * downstream locator (batchNoGroupHeader, batchNoSearchInput,
   * selectAllCheckbox) under the wrong one silently finds nothing - the root
   * cause of a bug reproduced 5 times in e2eFullFlowWithSavePayment.test.ts
   * before being isolated with a dedicated read-only exploration script. */
  get filterToolPanel() {
    return this.batchListPane.locator('.ag-tool-panel-wrapper:visible');
  }

  get filtersTab() {
    return this.batchListPane.getByRole('tab', { name: 'Filters' });
  }

  get batchNoGroupHeader() {
    return this.filterToolPanel.getByRole('button', { name: 'Batch No' });
  }

  get batchNoSearchInput() {
    return this.filterToolPanel.getByRole('textbox', { name: 'Search filter values' });
  }

  /** `(Select All)` pseudo-item's own checkbox — the only reliable way to
   * change the applied filter (see batchListSearchByNumber.locators.ts's
   * identical note and payment-batch-list.md's Selectors table). */
  get selectAllCheckbox() {
    return this.filterToolPanel
      .locator('.ag-set-filter-item, .ag-list-item')
      .filter({ hasText: '(Select All)' })
      .locator('input[type="checkbox"]');
  }

  /** `title` attribute confirmed to have a trailing space
   * ("Transaction Add/Edit ") — matched with a prefix selector to avoid
   * that landmine. See payment-batch-list.md's Selectors table. Once the
   * grid has been isolated to a single Batch No (see isolateBatchNo()),
   * `.first()` correctly targets that one row. */
  get firstRowAddEditIcon() {
    return this.page.locator('#pills-batch .ag-pinned-right-cols-container .ag-row i[title^="Transaction Add/Edit"]').first();
  }

  /** The batch's own Payment tab (reached via firstRowAddEditIcon), listing
   * individual payment records — not yet its own knowledge page; selectors
   * here are scoped narrowly to what this feature needs. */
  get firstPaymentRecordAddInvoiceIcon() {
    return this.page.locator('.ag-pinned-right-cols-container .ag-row i[title="Add Invoice"]').first();
  }

  /** The Payment tab's own first record's Payment Amt cell - read this
   * BEFORE opening Invoice Application, so a test can later correlate it
   * against the outstanding invoice grid's `current_payment` column (see
   * invoiceGridCell() below) to find which specific invoice this record
   * was auto-applied against by Save Payment. */
  get paymentTabFirstRecordAmount() {
    return this.page.locator('#pills-payment .ag-center-cols-container [col-id="payment_amt"]').first();
  }

  /** Several `.modal` elements are mounted in the DOM at once; only the
   * currently-open one carries Bootstrap's `.show` class — see
   * invoice-application.md's Edge Cases. Every locator below is scoped
   * under it. */
  get openModal() {
    return this.page.locator('.modal.show');
  }

  get clientField() {
    return this.openModal.locator('#txtClient');
  }

  get quickSearchField() {
    return this.openModal.locator('#FilterText');
  }

  get basedOnDropdown() {
    return this.openModal.locator('#ddlBasedon');
  }

  /** Fragile: no `id`/`formcontrolname` on the inner `<input>` of this
   * `<app-date-picker>` component — same caveat as check-register.md's and
   * payment-upload.md's date fields. Not exercised by this pass's actions
   * (see invoice-application.md's Edge Cases for why); kept here for future
   * use rather than invented on demand. */
  get fromDateField() {
    return this.openModal.locator('#FromDt input');
  }

  /** Fragile — see fromDateField. */
  get toDateField() {
    return this.openModal.locator('#ToDt input');
  }

  get billingMethodMultiselect() {
    return this.openModal.locator('#ddlBillingMethod');
  }

  get billingMethodMultiselectToggle() {
    return this.openModal.locator('#ddlBillingMethod .dropdown-btn');
  }

  /** One checkbox inside an open ng-multiselect-dropdown panel, matched by
   * its `aria-label` (equals the option's exact display text) — same
   * component/pattern as check-register.md's Client Type filter. Its own
   * label `<div>` visually covers it, so it can be read (`isChecked()`) but
   * not reliably clicked directly — see billingMethodOptionRow(). */
  billingMethodOption(label: string) {
    return this.openModal.locator(`#ddlBillingMethod input[aria-label="${label}"]`);
  }

  /** The `<li>` row wrapping a Billing Method checkbox — click this (not the
   * checkbox input itself) to toggle it; see check-register.md's Edge Cases
   * for why. */
  billingMethodOptionRow(label: string) {
    return this.billingMethodOption(label).locator('xpath=ancestor::li[1]');
  }

  get billingMethodSelectAll() {
    return this.openModal.locator('#ddlBillingMethod input[aria-label="multiselect-select-all"]');
  }

  /** The `<li>` row wrapping the Select All / UnSelect All checkbox — click
   * this (not the checkbox input itself), same label-covers-input quirk as
   * billingMethodOptionRow(). Confirmed live: clicking the raw input directly
   * fails Playwright's actionability check ("<div>Select All</div> intercepts
   * pointer events"). */
  get billingMethodSelectAllRow() {
    return this.billingMethodSelectAll.locator('xpath=ancestor::li[1]');
  }

  get bindingCheckbox() {
    return this.openModal.locator('#chkBinding');
  }

  get brokerageCheckbox() {
    return this.openModal.locator('#chkBrokerage');
  }

  get paidCheckbox() {
    return this.openModal.locator('#chkPaid');
  }

  get receivableVouchersCheckbox() {
    return this.openModal.locator('#chkAcctInv');
  }

  get payableVouchersCheckbox() {
    return this.openModal.locator('#chkPayableVoucher');
  }

  get financedCheckbox() {
    return this.openModal.locator('#chkIsFinanced');
  }

  get searchButton() {
    return this.openModal.locator('button:has-text("Search")');
  }

  get closeButton() {
    return this.openModal.locator('button:has-text("Close")');
  }

  get saveButton() {
    return this.openModal.locator('button:has-text("Save")');
  }

  get invoiceGridRows() {
    return this.openModal.locator('.ag-center-cols-container .ag-row');
  }

  /** A specific column across every row of the outstanding invoice grid -
   * confirmed live 2026-09-30: `col-id`s include `invoice_code`,
   * `total_amt`, `due_amt`, `current_payment`, `writeoff_amt`,
   * `revise_due`, `unposted_amt`. Save Payment auto-applies a payment
   * record against its matching invoice code immediately on batch
   * creation - this grid already reflects that applied state (Current
   * Payment / Revise Due) without ever needing to click Save here. Use
   * `.nth(i)` to align with a specific row found via another column.
   */
  invoiceGridCell(colId: string) {
    return this.invoiceGridRows.locator(`[col-id="${colId}"]`);
  }
}
