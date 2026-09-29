import { test, expect } from '../../../framework/fixtures';
import { getCredential } from '../../../framework/utils/env';
import { reportedStep } from '../../../framework/utils/reportStep';
import { waitForVisible } from '../../../framework/utils/waits';
import { LoginPage } from '../login/login.page';
import { CheckRegisterPage } from './checkRegister.page';

/**
 * From /alis_core/scenarios/alc_sc_check_register_search.md, derived from the
 * "Check register", "Check Register - Filters" (Client Type), and "Search By"
 * (Batch No) test scenarios in "ALIS Accounting - Bulk Payment Upload to
 * Remittance - End-to-End Test Cases". See
 * alis_core/knowledge/pages/check-register.md.
 *
 * Does not exercise Approve, Print Check, or Remittance Download As — all
 * real writes/downloads against this production-looking environment.
 */
test(
  'Alis Core: standard agent can filter Check Register by Client Type and search by Batch No',
  {
    annotation: [
      { type: 'scenario', description: 'alc_sc_check_register_search' },
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
    const checkRegisterPage = new CheckRegisterPage(page);

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
      'Open Check Register and confirm its default state',
      async () => {
        await checkRegisterPage.goto();
        await waitForVisible(checkRegisterPage.checkRegisterTabLocator);

        // Default state: Check Status = Prepared, and both real-write actions are
        // present (not clicked — see file header).
        await expect(checkRegisterPage.checkStatusDropdownLocator).toHaveValue('PREPARED');
        await expect(checkRegisterPage.approveButtonLocator).toBeVisible();
        await expect(checkRegisterPage.remittanceDownloadAsButtonLocator).toBeVisible();
      },
      'Opened Check Register and confirmed the default Check Status filter is "PREPARED", with the Approve and Remittance Download As buttons both visible (neither clicked).',
      { label: 'Check Status dropdown', locator: checkRegisterPage.checkStatusDropdownLocator },
    );

    await reportedStep(
      page,
      testInfo,
      'Narrow the Client Type filter to Agency only',
      async () => {
        await checkRegisterPage.openClientTypeFilter();
        await checkRegisterPage.uncheckClientType('Insured');
        await checkRegisterPage.uncheckClientType('Market');
        await checkRegisterPage.uncheckClientType('Tax');
        await checkRegisterPage.uncheckClientType('Vendor');
        await checkRegisterPage.uncheckClientType('Finance');
        await checkRegisterPage.closeOpenFilterPanel();
        await expect(checkRegisterPage.clientTypeMultiselectLocator).toContainText('Agency');
      },
      'Unchecked Insured, Market, Tax, Vendor, and Finance in the Client Type filter, leaving only Agency selected.',
      { label: 'Client Type multiselect', locator: checkRegisterPage.clientTypeMultiselectLocator },
    );

    await reportedStep(
      page,
      testInfo,
      'Search for the first matching batch by its Batch No',
      async () => {
        // Search by Batch No, using whatever batch is already on the (filtered)
        // grid rather than a hardcoded batch number from this ever-changing
        // production-looking environment.
        await checkRegisterPage.clickSearch();
        const rowCountBeforeBatchSearch = await checkRegisterPage.rowCount();
        test.skip(rowCountBeforeBatchSearch === 0, 'No Agency-type Prepared batches available to search for right now.');

        const batchNo = await checkRegisterPage.firstRowBatchNo();
        await checkRegisterPage.setSearchBy('BATCH_NO');
        await checkRegisterPage.enterSearchValue(batchNo);
        await checkRegisterPage.clickSearch();

        await expect(checkRegisterPage.gridRowsLocator).toHaveCount(1);
        await expect(checkRegisterPage.gridBatchNoCellsLocator.first()).toHaveText(batchNo);
        return batchNo;
      },
      (batchNo) => `Searched Check Register by Batch No "${batchNo}" (the first Agency/Prepared batch found on the filtered grid) and confirmed the grid narrowed to exactly that 1 matching row.`,
      { label: 'Matched Batch No cell', locator: checkRegisterPage.gridBatchNoCellsLocator.first() },
    );
  },
);
