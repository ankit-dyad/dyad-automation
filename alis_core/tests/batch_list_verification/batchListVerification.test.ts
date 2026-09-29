import { test, expect } from '../../../framework/fixtures';
import { getCredential } from '../../../framework/utils/env';
import { reportedStep } from '../../../framework/utils/reportStep';
import { waitForVisible } from '../../../framework/utils/waits';
import { LoginPage } from '../login/login.page';
import { BatchListVerificationPage } from './batchListVerification.page';

/**
 * From /alis_core/scenarios/alc_sc_batch_list_new_batch_verification.md,
 * derived from the "Batch List - New Batch Verification" test scenario in
 * "ALIS Accounting - Bulk Payment Upload to Remittance - End-to-End Test
 * Cases". See alis_core/knowledge/pages/payment-batch-list.md.
 *
 * Read-only: verifies whichever batch is first in the default grid, rather
 * than one created by this pass (Save Payment is never clicked anywhere in
 * this suite).
 */
test(
  'Alis Core: standard agent can verify a Batch List row\'s columns are populated',
  {
    annotation: [
      { type: 'scenario', description: 'alc_sc_batch_list_new_batch_verification' },
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
    const batchListPage = new BatchListVerificationPage(page);

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
      'Open the Batch List tab',
      async () => {
        await batchListPage.goto();
        await waitForVisible(batchListPage.batchListTabLocator);
        await batchListPage.openBatchListTab();
        await expect(batchListPage.gridRowsLocator.first()).toBeVisible();
      },
      'Opened the Batch List tab and confirmed at least one batch row is visible in the grid.',
    );

    await reportedStep(
      page,
      testInfo,
      'Confirm the leftmost columns are populated',
      async () => {
        await expect(batchListPage.firstRowCellLocator('batch_no')).not.toBeEmpty();
        await expect(batchListPage.firstRowCellLocator('client_type_text')).not.toBeEmpty();
        await expect(batchListPage.firstRowCellLocator('batch_desc')).not.toBeEmpty();
        await expect(batchListPage.firstRowCellLocator('paid_amt')).toHaveText(/^\$[\d,]+\.\d{2}$/);
        await expect(batchListPage.firstRowCellLocator('batch_amt')).toHaveText(/^\$[\d,]+\.\d{2}$/);
        await expect(batchListPage.firstRowCellLocator('batch_adj_amt')).toHaveText(/^\$[\d,]+\.\d{2}$/);
      },
      'Confirmed the first grid row\'s Batch No, Client Type, and Batch Description cells are non-empty, and Paid Amount, Batch Amount, and Batch Adj. Amount are all formatted as "$#,###.##".',
      [
        { label: 'Batch No cell', locator: batchListPage.firstRowCellLocator('batch_no') },
        { label: 'Paid Amt cell', locator: batchListPage.firstRowCellLocator('paid_amt') },
      ],
    );

    await reportedStep(
      page,
      testInfo,
      'Scroll right and confirm the remaining columns are populated',
      async () => {
        await batchListPage.scrollGridHorizontally(700);
        await expect(batchListPage.firstRowCellLocator('bank_gl')).not.toBeEmpty();
        await expect(batchListPage.firstRowCellLocator('bank_name')).not.toBeEmpty();
        await expect(batchListPage.firstRowCellLocator('status_text')).not.toBeEmpty();
        await expect(batchListPage.firstRowCellLocator('is_ach')).toHaveText(/Yes|No/);
      },
      'Scrolled the grid 700px to the right and confirmed the first row\'s Bank GL, Bank Name, and Status cells are non-empty, and the Is ACH cell reads "Yes" or "No".',
      [
        { label: 'Status cell', locator: batchListPage.firstRowCellLocator('status_text') },
        { label: 'Is ACH cell', locator: batchListPage.firstRowCellLocator('is_ach') },
      ],
    );
  },
);
