import type { Page } from '@playwright/test';
import { BasePage } from '../../../framework/pages/BasePage';
import { getRequiredEnv } from '../../../framework/utils/env';
import { CheckRegisterLocators } from './checkRegister.locators';

/**
 * Page Object for the Alis Core Accounting "Check Register" screen. Actions
 * only — no assertions, no test data, no hardcoded URLs (see CLAUDE.md §3 /
 * knowledge/conventions.md). Built from
 * alis_core/knowledge/pages/check-register.md.
 */
export class CheckRegisterPage extends BasePage {
  protected override path = '#/checkregister';

  private readonly locators: CheckRegisterLocators;

  constructor(page: Page) {
    super(page);
    this.locators = new CheckRegisterLocators(page);
  }

  /* Same Accounting sub-app as PaymentUploadPage — not resolvable against
   * ALIS_CORE_BASE_URL. See payment-upload.md's "Reaching this page". */
  override async goto(): Promise<void> {
    const accountingBaseUrl = getRequiredEnv('ALIS_CORE_ACCOUNTING_BASE_URL');
    await this.page.goto(`${accountingBaseUrl}${this.path}`);
  }

  async openCheckRegisterTab(): Promise<void> {
    await this.click(this.locators.checkRegisterTab);
  }

  async openSpoiledChecksTab(): Promise<void> {
    await this.click(this.locators.spoiledChecksTab);
  }

  async selectCheckStatus(status: string): Promise<void> {
    await this.select(this.locators.checkStatusDropdown, status);
  }

  /** Opens the Client Type multiselect panel (if not already open). */
  async openClientTypeFilter(): Promise<void> {
    await this.click(this.locators.clientTypeMultiselectToggle);
  }

  /** Unchecks one Client Type option — the panel must already be open (see
   * openClientTypeFilter()). Clicks the checkbox's row rather than the
   * checkbox input itself, since the input's own label `<div>` visually
   * covers it (a custom-checkbox styling quirk — see check-register.md's
   * Edge Cases); no-ops if already unchecked. */
  async uncheckClientType(label: string): Promise<void> {
    const checkbox = this.locators.clientTypeOption(label);
    if (await checkbox.isChecked()) {
      await this.click(this.locators.clientTypeOptionRow(label));
    }
  }

  /** Opens the Banks multiselect panel (if not already open). */
  async openBanksFilter(): Promise<void> {
    await this.click(this.locators.banksMultiselectToggle);
  }

  /** Unchecks one Banks option — same shape/caveats as uncheckClientType(). */
  async uncheckBank(label: string): Promise<void> {
    const checkbox = this.locators.banksOption(label);
    if (await checkbox.isChecked()) {
      await this.click(this.locators.banksOptionRow(label));
    }
  }

  /** Opens the Payment Type multiselect panel (if not already open). */
  async openPaymentTypeFilter(): Promise<void> {
    await this.click(this.locators.paymentTypeMultiselectToggle);
  }

  /** Unchecks one Payment Type option — same shape/caveats as
   * uncheckClientType(). */
  async uncheckPaymentType(label: string): Promise<void> {
    const checkbox = this.locators.paymentTypeOption(label);
    if (await checkbox.isChecked()) {
      await this.click(this.locators.paymentTypeOptionRow(label));
    }
  }

  /** Closes an open multiselect panel by clicking the page's own heading —
   * neutral, always-present, and outside any dropdown/menu that a stray
   * top-corner click could otherwise land on. */
  async closeOpenFilterPanel(): Promise<void> {
    await this.page.getByRole('heading', { name: 'Check Register', exact: true }).click();
  }

  /** Opens ag-Grid's Columns side panel (if not already open). */
  async openColumnsPanel(): Promise<void> {
    await this.click(this.locators.columnsSideTab);
  }

  async setSearchBy(option: string): Promise<void> {
    await this.select(this.locators.searchByDropdown, option);
  }

  async enterSearchValue(value: string): Promise<void> {
    await this.enter(this.locators.searchValueField, value);
  }

  async clickSearch(): Promise<void> {
    await this.click(this.locators.searchButton);
  }

  async setFromAcctEffDate(date: string): Promise<void> {
    await this.enter(this.locators.fromAcctEffDateField, date);
  }

  async setToAcctEffDate(date: string): Promise<void> {
    await this.enter(this.locators.toAcctEffDateField, date);
  }

  async clickFirstRowViewIcon(): Promise<void> {
    await this.click(this.locators.firstRowViewIcon);
  }

  /** Selects the first grid row's checkbox - needed before Approve, per
   * the PDF checklist's "Check Register - Approve" scenario. Confirmed
   * live 2026-09-30: NOT exercised together with clickApprove() for real
   * in this pass - see checkRegister.test.ts's commented-out Approve
   * step. Defined here (and safe to call on its own, real write pending)
   * so the mechanism is ready once a live Approve run is authorized. */
  async selectFirstRow(): Promise<void> {
    await this.check(this.locators.firstRowCheckbox);
  }

  /** Clicks Approve - a real write per check-register.md's Edge Cases
   * (changes the selected batch(es)' Check Status from Prepared to
   * Approved; expected to show a success toast "Batch Approved
   * successfully" per the PDF). Defined for completeness/documentation -
   * deliberately never called from checkRegister.test.ts's committed
   * step, which keeps this call commented out. */
  async clickApprove(): Promise<void> {
    await this.click(this.locators.approveButton);
  }

  /** Reads the first grid row's Batch No — used to drive a Search By Batch No
   * assertion without hardcoding a batch number from this production-looking
   * environment's ever-changing data (see check-register.md's Edge Cases). */
  async firstRowBatchNo(): Promise<string> {
    return this.textOf(this.locators.firstRowBatchNo);
  }

  async rowCount(): Promise<number> {
    return this.locators.gridRows.count();
  }

  /** Clicks Export to Excel and returns the resulting Download - a genuine
   * file (blob URL), not a response-inspection trick (confirmed live
   * 2026-09-29). */
  async clickExportToExcel(): Promise<import('@playwright/test').Download> {
    const download = this.page.waitForEvent('download');
    await this.click(this.locators.exportToExcelButton);
    return download;
  }

  /** Clicks the first row's PDF Export icon and returns the resulting
   * Download - a genuine file (blob URL, "BatchDetail.pdf"), unlike Batch
   * List's own PDF Export icon (confirmed live 2026-09-29). */
  async clickFirstRowPdfExport(): Promise<import('@playwright/test').Download> {
    const download = this.page.waitForEvent('download');
    await this.click(this.locators.firstRowPdfExportIcon);
    return download;
  }

  // ---------------------------------------------------------------------
  // Exposed for the spec to assert on — assertions belong in the test, not
  // here.
  // ---------------------------------------------------------------------

  get checkRegisterTabLocator() {
    return this.locators.checkRegisterTab;
  }

  get checkStatusDropdownLocator() {
    return this.locators.checkStatusDropdown;
  }

  get clientTypeMultiselectLocator() {
    return this.locators.clientTypeMultiselect;
  }

  get banksMultiselectLocator() {
    return this.locators.banksMultiselect;
  }

  get paymentTypeMultiselectLocator() {
    return this.locators.paymentTypeMultiselect;
  }

  get columnsSideTabLocator() {
    return this.locators.columnsSideTab;
  }

  get columnsToolPanelLocator() {
    return this.locators.columnsToolPanel;
  }

  get searchByDropdownLocator() {
    return this.locators.searchByDropdown;
  }

  get searchValueFieldLocator() {
    return this.locators.searchValueField;
  }

  get exportToExcelButtonLocator() {
    return this.locators.exportToExcelButton;
  }

  get firstRowPdfExportIconLocator() {
    return this.locators.firstRowPdfExportIcon;
  }

  get fromAcctEffDateFieldLocator() {
    return this.locators.fromAcctEffDateField;
  }

  get toAcctEffDateFieldLocator() {
    return this.locators.toAcctEffDateField;
  }

  get firstRowViewIconLocator() {
    return this.locators.firstRowViewIcon;
  }

  get approveButtonLocator() {
    return this.locators.approveButton;
  }

  get firstRowCheckboxLocator() {
    return this.locators.firstRowCheckbox;
  }

  get remittanceDownloadAsButtonLocator() {
    return this.locators.remittanceDownloadAsButton;
  }

  get gridRowsLocator() {
    return this.locators.gridRows;
  }

  get gridBatchNoCellsLocator() {
    return this.locators.gridBatchNoCells;
  }
}
