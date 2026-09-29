import { test, expect } from '../../../framework/fixtures';
import { getCredential } from '../../../framework/utils/env';
import { reportedStep } from '../../../framework/utils/reportStep';
import { waitForVisible } from '../../../framework/utils/waits';
import { LoginPage } from '../login/login.page';
import { BatchListSearchByNumberPage } from './batchListSearchByNumber.page';

/**
 * From /alis_core/scenarios/alc_sc_batch_list_search_by_number.md, derived
 * from checklist item #21, "Batch List - Search by Batch Number", in "ALIS
 * Accounting - Bulk Payment Upload to Remittance - End-to-End Test Cases".
 * See alis_core/knowledge/pages/payment-batch-list.md.
 *
 * Read-only: searches for whichever Batch No is first in the default grid
 * at run time (this environment's batch data is real and changes over
 * time), then clears the filter — no Save/Delete/Approve/Prepare/Post
 * NACHA/Create Batch click anywhere in this suite.
 */
test(
  'Alis Core: standard agent can search the Batch List grid by Batch No via the Filters panel',
  {
    annotation: [
      { type: 'scenario', description: 'alc_sc_batch_list_search_by_number' },
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
    const searchPage = new BatchListSearchByNumberPage(page);

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
      'Open the Batch List tab and read the first row\'s Batch No',
      async () => {
        await searchPage.goto();
        await waitForVisible(searchPage.batchListTabLocator);
        await searchPage.openBatchListTab();
        await expect(searchPage.gridRowsLocator.first()).toBeVisible();
      },
      'Opened the Batch List tab and confirmed at least one batch row is visible in the grid.',
    );

    const batchNo = await searchPage.readFirstBatchNo();

    await reportedStep(
      page,
      testInfo,
      'Open Filters and isolate that Batch No',
      async () => {
        expect(batchNo).toMatch(/^\d+$/);
        await searchPage.openFiltersPanel();
        await searchPage.expandBatchNoFilter();
        await searchPage.isolateBatchNo(batchNo);
      },
      `Read Batch No "${batchNo}" from the first grid row, opened the Filters panel, expanded the Batch No filter, and isolated the grid to that Batch No.`,
    );

    await reportedStep(
      page,
      testInfo,
      'Confirm the grid is filtered to only that Batch No',
      async () => {
        await expect(searchPage.gridRowsLocator).toHaveCount(1);
        await expect(searchPage.rowForBatchLocator(batchNo)).toBeVisible();
      },
      `Confirmed the grid now shows exactly 1 row, and that it's the row for Batch No "${batchNo}".`,
      { label: 'Filtered row for Batch No', locator: searchPage.rowForBatchLocator(batchNo) },
    );

    await reportedStep(
      page,
      testInfo,
      'Clear the filter and confirm the full grid is restored',
      async () => {
        await searchPage.clearBatchNoFilter();
        await expect(searchPage.gridRowsLocator).not.toHaveCount(1);
        await expect(searchPage.rowForBatchLocator(batchNo)).toBeVisible();
      },
      `Cleared the Batch No "${batchNo}" filter and confirmed the grid restored to more than 1 row, still including the row for Batch No "${batchNo}".`,
      { label: 'Restored row for Batch No', locator: searchPage.rowForBatchLocator(batchNo) },
    );
  },
);
