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

  /** Reads the first grid row's Batch No — used to drive a Search By Batch No
   * assertion without hardcoding a batch number from this production-looking
   * environment's ever-changing data (see check-register.md's Edge Cases). */
  async firstRowBatchNo(): Promise<string> {
    return this.textOf(this.locators.firstRowBatchNo);
  }

  async rowCount(): Promise<number> {
    return this.locators.gridRows.count();
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

  get approveButtonLocator() {
    return this.locators.approveButton;
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