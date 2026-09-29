import type { Page } from '@playwright/test';
import { BasePage } from '../../../framework/pages/BasePage';
import { getRequiredEnv } from '../../../framework/utils/env';
import { InvoiceApplicationLocators } from './invoiceApplication.locators';

/**
 * Page Object for reaching and driving the Alis Core Accounting Payment
 * screen's "Invoice Application" modal. Actions only — no assertions, no
 * test data, no hardcoded URLs (see CLAUDE.md §3 / knowledge/conventions.md).
 * Built from alis_core/knowledge/pages/payment-batch-list.md and
 * alis_core/knowledge/pages/invoice-application.md.
 */
export class InvoiceApplicationPage extends BasePage {
  protected override path = '#/payment';

  private readonly locators: InvoiceApplicationLocators;

  constructor(page: Page) {
    super(page);
    this.locators = new InvoiceApplicationLocators(page);
  }

  /* Same Accounting sub-app as the other Payment-screen page objects — not
   * resolvable against ALIS_CORE_BASE_URL. See payment-upload.md's "Reaching
   * this page". */
  override async goto(): Promise<void> {
    const accountingBaseUrl = getRequiredEnv('ALIS_CORE_ACCOUNTING_BASE_URL');
    await this.page.goto(`${accountingBaseUrl}${this.path}`);
  }

  async openBatchListTab(): Promise<void> {
    await this.click(this.locators.batchListTab);
  }

  /** Opens the first batch's Payment tab. */
  async openFirstBatchPaymentTab(): Promise<void> {
    await this.click(this.locators.firstRowAddEditIcon);
  }

  /** Opens the Invoice Application modal for the first payment record on the
   * batch's Payment tab. */
  async openInvoiceApplicationForFirstRecord(): Promise<void> {
    await this.click(this.locators.firstPaymentRecordAddInvoiceIcon);
  }

  async enterQuickSearch(text: string): Promise<void> {
    await this.enter(this.locators.quickSearchField, text);
  }

  async selectBasedOn(option: string): Promise<void> {
    await this.select(this.locators.basedOnDropdown, option);
  }

  /** Opens the Billing Method multiselect panel (if not already open). */
  async openBillingMethodFilter(): Promise<void> {
    await this.click(this.locators.billingMethodMultiselectToggle);
  }

  /** Checks one Billing Method option — the panel must already be open (see
   * openBillingMethodFilter()). Clicks the checkbox's row rather than the
   * checkbox input itself, since the input's own label `<div>` visually
   * covers it (same custom-checkbox quirk as check-register.md's Client Type
   * filter); no-ops if already checked. */
  async checkBillingMethod(label: string): Promise<void> {
    const checkbox = this.locators.billingMethodOption(label);
    if (!(await checkbox.isChecked())) {
      await this.click(this.locators.billingMethodOptionRow(label));
    }
  }

  /** "Select All" inside the Billing Method panel — the panel must already
   * be open. Clicks the checkbox's row rather than the checkbox input
   * itself, since the input's own label `<div>` visually covers it (same
   * quirk as checkBillingMethod()/check-register.md's Client Type filter). */
  async selectAllBillingMethods(): Promise<void> {
    await this.click(this.locators.billingMethodSelectAllRow);
  }

  /** Closes an open multiselect panel by clicking the modal's own header —
   * neutral, always-present, and outside any dropdown/menu that a stray
   * click could otherwise land on. */
  async closeOpenFilterPanel(): Promise<void> {
    await this.click(this.locators.openModal.getByRole('tab', { name: 'Invoices' }));
  }

  async toggleReceivableVouchers(): Promise<void> {
    await this.locators.receivableVouchersCheckbox.click();
  }

  async togglePayableVouchers(): Promise<void> {
    await this.locators.payableVouchersCheckbox.click();
  }

  async clickSearch(): Promise<void> {
    await this.click(this.locators.searchButton);
  }

  /** Dismisses the modal without saving — Save performs a real write against
   * production-looking data and is not exercised by this Page Object. See
   * invoice-application.md's Edge Cases. */
  async closeWithoutSaving(): Promise<void> {
    await this.click(this.locators.closeButton);
  }

  // ---------------------------------------------------------------------
  // Exposed for the spec to assert on — assertions belong in the test, not
  // here.
  // ---------------------------------------------------------------------

  get batchListTabLocator() {
    return this.locators.batchListTab;
  }

  get openModalLocator() {
    return this.locators.openModal;
  }

  get clientFieldLocator() {
    return this.locators.clientField;
  }

  get quickSearchFieldLocator() {
    return this.locators.quickSearchField;
  }

  get basedOnDropdownLocator() {
    return this.locators.basedOnDropdown;
  }

  get billingMethodMultiselectLocator() {
    return this.locators.billingMethodMultiselect;
  }

  get bindingCheckboxLocator() {
    return this.locators.bindingCheckbox;
  }

  get brokerageCheckboxLocator() {
    return this.locators.brokerageCheckbox;
  }

  get paidCheckboxLocator() {
    return this.locators.paidCheckbox;
  }

  get receivableVouchersCheckboxLocator() {
    return this.locators.receivableVouchersCheckbox;
  }

  get payableVouchersCheckboxLocator() {
    return this.locators.payableVouchersCheckbox;
  }

  get financedCheckboxLocator() {
    return this.locators.financedCheckbox;
  }

  get invoiceGridRowsLocator() {
    return this.locators.invoiceGridRows;
  }
}
