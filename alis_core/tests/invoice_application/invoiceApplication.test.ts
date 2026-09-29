import { test, expect } from '../../../framework/fixtures';
import { getCredential } from '../../../framework/utils/env';
import { reportedStep } from '../../../framework/utils/reportStep';
import { waitForVisible } from '../../../framework/utils/waits';
import { LoginPage } from '../login/login.page';
import { InvoiceApplicationPage } from './invoiceApplication.page';

/**
 * From /alis_core/scenarios/alc_sc_invoice_application_filters.md, derived
 * from the "Invoice Application - Save & Select (+) Icon at grid" and
 * "Invoice Application Screen - Filters" test scenarios in "ALIS Accounting -
 * Bulk Payment Upload to Remittance - End-to-End Test Cases". See
 * alis_core/knowledge/pages/invoice-application.md.
 *
 * Does not click Save — that applies the payment to real outstanding
 * invoices against production-looking data (see payment-batch-list.md's
 * "Create Batch performs a real write" note, same caution applies here).
 *
 * Does not drive the From/To Date pickers (fragile `app-date-picker` popup,
 * not yet characterized in this app) — only the Based On dropdown switch is
 * exercised. See invoice-application.md's Edge Cases.
 */
test(
  'Alis Core: standard agent can filter Invoice Application by Quick Search, Based On, Billing Method, and voucher checkboxes',
  {
    annotation: [
      { type: 'scenario', description: 'alc_sc_invoice_application_filters' },
      { type: 'product', description: 'alis_core' },
    ],
  },
  async ({ page }, testInfo) => {
    // Each reportedStep() takes a full-page screenshot on top of its own
    // action/assertions — confirmed live 2026-09-28: that overhead alone
    // pushed a 9-step spec (invoiceApplication.test.ts) over its unset
    // default 30s test timeout. Bumped defensively across every retrofitted
    // spec, not just that one.
    test.setTimeout(60_000);

    const loginPage = new LoginPage(page);
    const invoiceApplicationPage = new InvoiceApplicationPage(page);

    const username = getCredential('ALIS_CORE_LOGIN_USER', 'alis_core', 'username');

    await reportedStep(
      page,
      testInfo,
      'Log in as a standard agent',
      async () => {
        await loginPage.goto();
        await waitForVisible(loginPage.userNameFieldLocator);
        await loginPage.login(username, getCredential('ALIS_CORE_LOGIN_PASS', 'alis_core', 'password'));
        await expect(page).not.toHaveURL(/#\/login/);
      },
      `Logged in to Alis Core Accounting as "${username}".`,
    );

    await reportedStep(
      page,
      testInfo,
      'Open the first batch, then Invoice Application for its first payment',
      async () => {
        await invoiceApplicationPage.goto();
        await waitForVisible(invoiceApplicationPage.batchListTabLocator);
        await invoiceApplicationPage.openBatchListTab();

        await invoiceApplicationPage.openFirstBatchPaymentTab();
        await invoiceApplicationPage.openInvoiceApplicationForFirstRecord();

        await expect(invoiceApplicationPage.openModalLocator).toBeVisible();
        await expect(invoiceApplicationPage.clientFieldLocator).not.toBeEmpty();
      },
      'Opened Batch List, drilled into the first batch\'s Payment tab, and opened the Invoice Application (+) icon for its first record — the modal opened with the Client field pre-populated.',
      [
        { label: 'Invoice Application modal', locator: invoiceApplicationPage.openModalLocator },
        { label: 'Client field', locator: invoiceApplicationPage.clientFieldLocator },
      ],
    );

    await reportedStep(
      page,
      testInfo,
      'Client field is pre-filled and disabled',
      async () => {
        // Confirmed by direct observation 2026-09-28: pre-filled with the
        // payment record's client code, and both disabled and readonly (an
        // agent cannot change which client this application is scoped to).
        await expect(invoiceApplicationPage.clientFieldLocator).toBeDisabled();
      },
      'Confirmed the Client field is disabled — an agent cannot change which client this Invoice Application is scoped to.',
      { label: 'Client field', locator: invoiceApplicationPage.clientFieldLocator },
    );

    await reportedStep(
      page,
      testInfo,
      'Quick Search does not break the grid',
      async () => {
        // Not asserting a specific result set — this is a production-looking
        // environment whose data changes over time (see invoice-application.md's
        // Edge Cases). Only confirms the field accepts input and re-running
        // Search still renders without error.
        await invoiceApplicationPage.enterQuickSearch('INV');
        await invoiceApplicationPage.clickSearch();
        await expect(invoiceApplicationPage.openModalLocator).toBeVisible();
        await expect(invoiceApplicationPage.quickSearchFieldLocator).toHaveValue('INV');
      },
      'Entered "INV" into Quick Search and clicked Search — the field retained "INV" and the modal/grid stayed rendered without error.',
      { label: 'Quick Search field', locator: invoiceApplicationPage.quickSearchFieldLocator },
    );

    await reportedStep(
      page,
      testInfo,
      'Based On can be switched from Acct Eff Date to Due Date',
      async () => {
        // Does not exercise the From/To Date pickers themselves — see
        // invoice-application.md's Edge Cases for why (same fragile
        // `app-date-picker` component as check-register.md/payment-upload.md,
        // and this pass found no reliable way to drive it live).
        await invoiceApplicationPage.selectBasedOn('DUEDATE');
        await expect(invoiceApplicationPage.basedOnDropdownLocator).toHaveValue('DUEDATE');

        await invoiceApplicationPage.clickSearch();
        await expect(invoiceApplicationPage.openModalLocator).toBeVisible();
      },
      'Switched the "Based On" dropdown from Acct Eff Date to "DUEDATE" and re-ran Search — the modal remained open and the dropdown kept the new value.',
      { label: 'Based On dropdown', locator: invoiceApplicationPage.basedOnDropdownLocator },
    );

    await reportedStep(
      page,
      testInfo,
      'Billing Method multiselect can be changed and re-searched',
      async () => {
        await invoiceApplicationPage.openBillingMethodFilter();
        await invoiceApplicationPage.selectAllBillingMethods();
        await invoiceApplicationPage.closeOpenFilterPanel();
        await expect(invoiceApplicationPage.billingMethodMultiselectLocator).toContainText('Agency Bill');

        await invoiceApplicationPage.clickSearch();
        await expect(invoiceApplicationPage.openModalLocator).toBeVisible();
      },
      'Opened the Billing Method filter, selected all billing methods, and closed the panel — the multiselect now shows "Agency Bill" among its selections; re-ran Search and the modal stayed open.',
      { label: 'Billing Method multiselect', locator: invoiceApplicationPage.billingMethodMultiselectLocator },
    );

    await reportedStep(
      page,
      testInfo,
      'Confirm the default filter checkbox states',
      async () => {
        // Default checked states, confirmed by direct observation.
        await expect(invoiceApplicationPage.bindingCheckboxLocator).toBeChecked();
        await expect(invoiceApplicationPage.brokerageCheckboxLocator).toBeChecked();
        await expect(invoiceApplicationPage.paidCheckboxLocator).not.toBeChecked();
        await expect(invoiceApplicationPage.receivableVouchersCheckboxLocator).not.toBeChecked();
        await expect(invoiceApplicationPage.payableVouchersCheckboxLocator).toBeChecked();
        await expect(invoiceApplicationPage.financedCheckboxLocator).not.toBeChecked();
      },
      'Confirmed the default checkbox states: Binding checked, Brokerage checked, Paid unchecked, Receivable Vouchers unchecked, Payable Vouchers checked, Financed unchecked.',
      [
        { label: 'Receivable Vouchers checkbox', locator: invoiceApplicationPage.receivableVouchersCheckboxLocator },
        { label: 'Payable Vouchers checkbox', locator: invoiceApplicationPage.payableVouchersCheckboxLocator },
      ],
    );

    await reportedStep(
      page,
      testInfo,
      'Toggle Receivable and Payable Vouchers independently',
      async () => {
        await invoiceApplicationPage.toggleReceivableVouchers();
        await expect(invoiceApplicationPage.receivableVouchersCheckboxLocator).toBeChecked();
        await expect(invoiceApplicationPage.payableVouchersCheckboxLocator).toBeChecked();

        await invoiceApplicationPage.togglePayableVouchers();
        await expect(invoiceApplicationPage.receivableVouchersCheckboxLocator).toBeChecked();
        await expect(invoiceApplicationPage.payableVouchersCheckboxLocator).not.toBeChecked();
      },
      'Toggled Receivable Vouchers on (Payable Vouchers stayed checked), then toggled Payable Vouchers off — leaving Receivable Vouchers checked and Payable Vouchers unchecked.',
      [
        { label: 'Receivable Vouchers checkbox', locator: invoiceApplicationPage.receivableVouchersCheckboxLocator },
        { label: 'Payable Vouchers checkbox', locator: invoiceApplicationPage.payableVouchersCheckboxLocator },
      ],
    );

    await reportedStep(
      page,
      testInfo,
      'Re-run the search, then close without saving',
      async () => {
        await invoiceApplicationPage.clickSearch();
        await expect(invoiceApplicationPage.openModalLocator).toBeVisible();

        await invoiceApplicationPage.closeWithoutSaving();
        await expect(invoiceApplicationPage.openModalLocator).toHaveCount(0);
      },
      'Re-ran Search with the final filter combination, then closed the Invoice Application modal without clicking Save — the modal is no longer present.',
    );
  },
);
