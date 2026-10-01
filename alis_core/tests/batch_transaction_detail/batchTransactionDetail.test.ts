import { test, expect } from '../../../framework/fixtures';
import { getCredential } from '../../../framework/utils/env';
import { reportedStep } from '../../../framework/utils/reportStep';
import { waitForVisible } from '../../../framework/utils/waits';
import { LoginPage } from '../login/login.page';
import { BatchTransactionDetailPage } from './batchTransactionDetail.page';

/**
 * From /alis_core/scenarios/alc_sc_batch_transaction_detail_popup.md, derived
 * from the "Action — Verify View Batch Data" / "Batch Transaction Detail
 * Popup" test scenario in "ALIS Accounting - Bulk Payment Upload to
 * Remittance - End-to-End Test Cases". See
 * alis_core/knowledge/pages/batch-transaction-detail-popup.md.
 *
 * Read-only: opens and closes the popup for the grid's first row, no batch
 * mutation.
 */
test(
  'Alis Core: standard agent can open and close the Batch Transaction Detail popup',
  {
    annotation: [
      { type: 'scenario', description: 'alc_sc_batch_transaction_detail_popup' },
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
    const batchDetailPage = new BatchTransactionDetailPage(page);

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

    const batchNo = await reportedStep(
      page,
      testInfo,
      'Open Batch List and note the first batch number',
      async () => {
        await batchDetailPage.goto();
        await waitForVisible(batchDetailPage.batchListTabLocator);
        await batchDetailPage.openBatchListTab();
        await expect(batchDetailPage.gridRowsLocator.first()).toBeVisible();

        return batchDetailPage.firstRowBatchNo();
      },
      (batchNo) => `Opened Batch List; the first row's Batch No is "${batchNo}".`,
      { label: 'First grid row', locator: batchDetailPage.gridRowsLocator.first() },
    );

    await reportedStep(
      page,
      testInfo,
      'Open its Batch Transaction Detail popup and check the data matches',
      async () => {
        await batchDetailPage.openFirstRowDetailPopup();
        await expect(batchDetailPage.openModalLocator).toBeVisible();
        await expect(batchDetailPage.modalTitleLocator).toContainText(`Batch Detail # ${batchNo}`);
        await expect(batchDetailPage.modalGridCellLocator('batch_no')).toHaveText(batchNo);
      },
      `Opened the Batch Transaction Detail popup for batch "${batchNo}": confirmed the modal title reads "Batch Detail # ${batchNo}" and the modal grid's batch_no cell matches.`,
      [
        { label: 'Modal title', locator: batchDetailPage.modalTitleLocator },
        { label: 'Modal batch_no cell', locator: batchDetailPage.modalGridCellLocator('batch_no') },
      ],
    );

    await reportedStep(
      page,
      testInfo,
      'Confirm the popup\'s pre-scroll fields are populated (Transaction Description, GL Account)',
      async () => {
        await expect(batchDetailPage.modalGridCellLocator('tran_desc')).toBeAttached();
        await expect(batchDetailPage.modalGridCellLocator('gl_account')).toBeAttached();
      },
      'Confirmed the Transaction Description and GL Account cells are attached before any scroll.',
    );

    await reportedStep(
      page,
      testInfo,
      'Scroll the modal grid and confirm the next field group is populated',
      async () => {
        // Confirmed live 2026-09-30: ag-Grid virtualizes columns both in AND
        // out as the modal grid scrolls - tran_desc/gl_account (checked above,
        // pre-scroll) drop out of the DOM by this point, so this step only
        // checks the fields confirmed present at exactly this scroll position.
        await batchDetailPage.scrollModalGridHorizontally(700);

        const fields = ['account_name', 'apply_dt', 'entry_dt', 'document_num', 'client_type', 'client_code', 'payee_name', 'invoice_code'];
        for (const colId of fields) {
          await expect(batchDetailPage.modalGridCellLocator(colId)).toBeAttached();
        }
      },
      'Scrolled the modal grid 700px and confirmed 8 fields are populated: Account Name, Acct Eff Date, Entry Date, Document No., Client Type, Client Code, Payer/Payee Name, and Invoice Code.',
      [
        { label: 'Client Code cell', locator: batchDetailPage.modalGridCellLocator('client_code') },
      ],
    );

    await reportedStep(
      page,
      testInfo,
      'Scroll the modal grid further and confirm the final field group is populated',
      async () => {
        await batchDetailPage.scrollModalGridHorizontally(1400);

        const fields = ['insured_name', 'policy_number', 'total_amt', 'due_amt', 'payment_amt', 'adj_amt', 'adj_account'];
        for (const colId of fields) {
          await expect(batchDetailPage.modalGridCellLocator(colId)).toBeAttached();
        }
      },
      'Scrolled the modal grid a further 1400px and confirmed 7 more fields are populated: Insured Name, Policy Number, Total Amount, Due Amount, Payment Amt, Adj Amt, and Adj Account.',
      [
        { label: 'Total Amount cell', locator: batchDetailPage.modalGridCellLocator('total_amt') },
      ],
    );

    await reportedStep(
      page,
      testInfo,
      'Close the popup',
      async () => {
        await batchDetailPage.closeDetailPopup();
        await expect(batchDetailPage.openModalLocator).toHaveCount(0);
      },
      `Closed the Batch Transaction Detail popup for batch "${batchNo}" and confirmed no modal remains open.`,
    );
  },
);
