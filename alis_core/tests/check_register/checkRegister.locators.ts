import type { Page } from '@playwright/test';

/**
 * Locator definitions for the Alis Core Accounting "Check Register" screen —
 * sourced from the "## Selectors" table in
 * alis_core/knowledge/pages/check-register.md. Nothing but locators belongs
 * here; actions live in checkRegister.page.ts, assertions in
 * checkRegister.test.ts.
 *
 * The "Check Register" and "Spoiled Checks" tab-panes are both kept mounted
 * in the DOM at once (Bootstrap tabs, not conditionally rendered) and reuse
 * the same element ids in each pane — confirmed via a strict-mode violation
 * the first time this was automated (`#ddlClientType` resolved to 2
 * elements). Every locator below is scoped under `#pills-cashlisting` (the
 * Check Register pane's container, confirmed via its tab button's
 * `data-bs-target`) to avoid matching the Spoiled Checks pane's copy.
 */
export class CheckRegisterLocators {
  private readonly pane = this.page.locator('#pills-cashlisting');

  constructor(private readonly page: Page) {}

  get checkRegisterTab() {
    return this.page.locator('#pills-cashlisting-tab');
  }

  get spoiledChecksTab() {
    return this.page.locator('#pills-spoilcheck-tab');
  }

  get checkStatusDropdown() {
    return this.pane.locator('#ddlCheckStatus');
  }

  /** Confirmed live 2026-09-30: a plain `.fill()` works here, same as
   * payment-upload.md's Acct Eff Date field - despite the `app-date-picker`
   * component having no `id`/`formcontrolname` on its own inner `<input>`
   * (same caveat noted in check-register.md's Edge Cases), filling it and
   * clicking Search does change the grid's returned row count. Not
   * actually fragile for this purpose. */
  get fromAcctEffDateField() {
    return this.pane.locator('#dateFromAcctEff input');
  }

  get toAcctEffDateField() {
    return this.pane.locator('#dateToAcctEff input');
  }

  /** View icon (eye glyph, `title="View Batch Data"`, col-id 0 of the
   * pinned-right action group, alongside PDF Export (col-id 1) and Check
   * Summary (col-id 2)) - confirmed live 2026-09-30: opens the exact same
   * Batch Transaction Detail popup as Batch List's own View icon
   * (`data-bs-target="#modalBatchdetail"`, same dead-reference quirk - see
   * batch-transaction-detail-popup.md). Reuse that page object's modal
   * locators for assertions once open. */
  get firstRowViewIcon() {
    return this.pane.locator('.ag-pinned-right-cols-container i[title="View Batch Data"]').first();
  }

  get clientTypeMultiselect() {
    return this.pane.locator('#ddlClientType');
  }

  get clientTypeMultiselectToggle() {
    return this.pane.locator('#ddlClientType .dropdown-btn');
  }

  /** One checkbox inside an open ng-multiselect-dropdown panel, matched by its
   * `aria-label` (which equals the option's exact display text). Its own
   * label `<div>` visually covers it (custom checkbox styling), so it can be
   * read (`isChecked()`) but not reliably clicked directly — see
   * clientTypeOptionRow() for the clickable target. */
  clientTypeOption(label: string) {
    return this.pane.locator(`#ddlClientType input[aria-label="${label}"]`);
  }

  /** The `<li>` row wrapping a Client Type checkbox — click this (not the
   * checkbox input itself) to toggle it; see conventions.md and
   * check-register.md's Edge Cases for why. */
  clientTypeOptionRow(label: string) {
    return this.clientTypeOption(label).locator('xpath=ancestor::li[1]');
  }

  get banksMultiselect() {
    return this.pane.locator('#ddlBankGL');
  }

  get banksMultiselectToggle() {
    return this.pane.locator('#ddlBankGL .dropdown-btn');
  }

  /** Same `ng-multiselect-dropdown` shape/quirks as Client Type — see
   * clientTypeOption()/clientTypeOptionRow() for why option rows (not the
   * checkbox inputs) are the clickable target. */
  banksOption(label: string) {
    return this.pane.locator(`#ddlBankGL input[aria-label="${label}"]`);
  }

  banksOptionRow(label: string) {
    return this.banksOption(label).locator('xpath=ancestor::li[1]');
  }

  get paymentTypeMultiselect() {
    return this.pane.locator('#ddlpaymenttype');
  }

  get paymentTypeMultiselectToggle() {
    return this.pane.locator('#ddlpaymenttype .dropdown-btn');
  }

  /** Same `ng-multiselect-dropdown` shape/quirks as Client Type — see
   * clientTypeOption()/clientTypeOptionRow() for why option rows (not the
   * checkbox inputs) are the clickable target. */
  paymentTypeOption(label: string) {
    return this.pane.locator(`#ddlpaymenttype input[aria-label="${label}"]`);
  }

  paymentTypeOptionRow(label: string) {
    return this.paymentTypeOption(label).locator('xpath=ancestor::li[1]');
  }

  /** ag-Grid's generated id is fragile (see check-register.md's Edge Cases) —
   * matched by role/name instead, scoped to the active pane. */
  get columnsSideTab() {
    return this.pane.getByRole('tab', { name: 'Columns' });
  }

  get filtersSideTab() {
    return this.pane.getByRole('tab', { name: 'Filters' });
  }

  /** ag-Grid's own tool-panel wrapper, opened by columnsSideTab/filtersSideTab
   * — same `.ag-tool-panel-wrapper` class as payment-batch-list.md's Filters
   * panel (confirmed there via live DOM inspection; this is ag-Grid's own
   * standard tool-panel markup, not app-specific, so the same class applies
   * to this grid's Columns tab too). */
  get columnsToolPanel() {
    return this.pane.locator('.ag-tool-panel-wrapper');
  }

  get searchByDropdown() {
    return this.pane.locator('#search');
  }

  get searchValueField() {
    return this.pane.locator('#txtBatch_Payee_Checkno');
  }

  get searchButton() {
    return this.pane.locator('button[type=submit]:has-text("Search")');
  }

  /** Confirmed live 2026-09-29: a genuine file download (blob URL), not a
   * response-inspection trick - filename observed as
   * "CheckRegister_<fromDate>_To_<toDate>.xlsx". */
  get exportToExcelButton() {
    return this.pane.locator('button:has-text("Excel")');
  }

  /** Per-row PDF export icon, pinned-right action column - sits alongside
   * View Batch Data (col-id 0) and Check Summary (col-id 2) at col-id 1, per
   * check-summary-popup.md's Selectors table. Confirmed live 2026-09-29: a
   * genuine file download (blob URL, filename "BatchDetail.pdf"), unlike
   * Batch List's own PDF Export icon (a JSON-response trick, no real
   * download) - don't assume the two behave the same way. */
  get firstRowPdfExportIcon() {
    return this.pane.locator('.ag-pinned-right-cols-container i[title="PDF Export"]').first();
  }

  get approveButton() {
    return this.pane.locator('#btnApprove');
  }

  get remittanceDownloadAsButton() {
    return this.pane.locator('button:has-text("Remittance Download As")');
  }

  /** ag-Grid renders each data row twice — once in `.ag-center-cols-container`
   * (the main scrollable columns) and once more in
   * `.ag-pinned-right-cols-container` (the pinned action-icon column), both
   * sharing the same `row-id` — confirmed via live DOM inspection after a
   * `toHaveCount()` assertion unexpectedly returned double the real row
   * count. Scoped to the center container only, so this reflects actual data
   * rows. */
  get gridRows() {
    return this.pane.locator('.ag-center-cols-container .ag-row');
  }

  /** Batch No column cell, any row — `col-id="batch_no"` confirmed via live
   * DOM inspection (ag-Grid's generated column id, not a guess). Scoped to
   * the center container for the same reason as gridRows. */
  get gridBatchNoCells() {
    return this.pane.locator('.ag-center-cols-container [col-id="batch_no"]');
  }

  /** First grid row's Batch No cell. */
  get firstRowBatchNo() {
    return this.gridBatchNoCells.first();
  }
}
