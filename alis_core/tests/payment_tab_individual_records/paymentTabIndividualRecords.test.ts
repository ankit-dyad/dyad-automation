import { test, expect } from '../../../framework/fixtures';
import { getCredential } from '../../../framework/utils/env';
import { reportedStep } from '../../../framework/utils/reportStep';
import { waitForVisible } from '../../../framework/utils/waits';
import { LoginPage } from '../login/login.page';
import { PaymentTabIndividualRecordsPage } from './paymentTabIndividualRecords.page';

/**
 * From /alis_core/scenarios/alc_sc_payment_tab_individual_records.md,
 * derived from the batch-level Payment tab's use as a stepping-stone toward
 * "Invoice Application - Save & Select (+) Icon at grid" in "ALIS
 * Accounting - Bulk Payment Upload to Remittance - End-to-End Test Cases".
 * See alis_core/knowledge/pages/payment-tab-individual-records.md.
 *
 * Read-only: verifies whichever batch is first in the default Batch List
 * grid and whichever payment records it already has, rather than one
 * created/entered by this pass. Save Payment, Add Invoice, Edit
 * Transaction, and Delete Transaction are never clicked in this suite.
 */
test(
  'Alis Core: standard agent can verify a batch Payment tab\'s individual payment records are populated',
  {
    annotation: [
      { type: 'scenario', description: 'alc_sc_payment_tab_individual_records' },
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
    const paymentTabPage = new PaymentTabIndividualRecordsPage(page);

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
      'Open the first batch\'s Payment tab',
      async () => {
        await paymentTabPage.goto();
        await waitForVisible(paymentTabPage.batchListTabLocator);
        await paymentTabPage.openBatchListTab();
        await paymentTabPage.openFirstBatchPaymentTab();
        await waitForVisible(paymentTabPage.paymentTabLocator);
        await expect(paymentTabPage.gridRowsLocator.first()).toBeVisible();
      },
      'Opened the Batch List tab, opened the first batch\'s Payment tab, and confirmed at least one payment record row is visible on the grid.',
    );

    await reportedStep(
      page,
      testInfo,
      'Confirm the leftmost record columns are populated',
      async () => {
        await expect(paymentTabPage.firstRowCellLocator('1')).not.toBeEmpty();
        await expect(paymentTabPage.firstRowCellLocator('payment_mode')).not.toBeEmpty();
        await expect(paymentTabPage.firstRowCellLocator('apply_dt')).toHaveText(/^\d{2}\/\d{2}\/\d{4}$/);
        await expect(paymentTabPage.firstRowCellLocator('payment_amt')).toHaveText(/^\$[\d,]+\.\d{2}$/);
        await expect(paymentTabPage.firstRowCellLocator('bank_gl')).not.toBeEmpty();
      },
      'Confirmed the first payment record\'s leftmost columns are populated: record number, Payment Mode, Apply Date (MM/DD/YYYY), Payment Amount (currency-formatted), and Bank GL.',
      [
        { label: 'Apply Date cell', locator: paymentTabPage.firstRowCellLocator('apply_dt') },
        { label: 'Payment Amt cell', locator: paymentTabPage.firstRowCellLocator('payment_amt') },
      ],
    );

    await reportedStep(
      page,
      testInfo,
      'Scroll right and confirm the remaining record columns are populated',
      async () => {
        await paymentTabPage.scrollGridHorizontally(700);
        await expect(paymentTabPage.firstRowCellLocator('2')).not.toBeEmpty();
        await expect(paymentTabPage.firstRowCellLocator('createdby')).not.toBeEmpty();
        await expect(paymentTabPage.firstRowCellLocator('last_updated_dt')).toHaveText(/^\d{2}\/\d{2}\/\d{4}$/);
      },
      'Scrolled the grid right by 700px and confirmed the remaining columns are populated: second record number field, Created By, and Last Updated Date (MM/DD/YYYY).',
      [
        { label: 'Created By cell', locator: paymentTabPage.firstRowCellLocator('createdby') },
        { label: 'Last Updated Date cell', locator: paymentTabPage.firstRowCellLocator('last_updated_dt') },
      ],
    );
  },
);
