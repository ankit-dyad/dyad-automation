import { test, expect } from '../../../framework/fixtures';
import { getCredential } from '../../../framework/utils/env';
import { reportedStep } from '../../../framework/utils/reportStep';
import { waitForVisible } from '../../../framework/utils/waits';
import { LoginPage } from '../login/login.page';
import { AchEftCheckPage } from './achEftCheck.page';

/**
 * From /alis_core/scenarios/alc_sc_ach_eft_check_search.md, derived from the
 * "ACH/EFT & Check Tab" test scenario in "ALIS Accounting - Bulk Payment
 * Upload to Remittance - End-to-End Test Cases". See
 * alis_core/knowledge/pages/ach-eft-check.md.
 *
 * Read-only: does not click any row action icon (NACHA download, Send Email,
 * Export To PDF, etc.) — several trigger downloads/emails/other side effects
 * against this production-looking environment.
 */
test(
  'Alis Core: standard agent can view the ACH/EFT & Check grid and search by Batch No',
  {
    annotation: [
      { type: 'scenario', description: 'alc_sc_ach_eft_check_search' },
      { type: 'product', description: 'alis_core' },
    ],
  },
  async ({ page }, testInfo) => {
    // Confirmed live 2026-09-28: the "wait up to N ms, then fall back to
    // test.skip() if nothing shows up" pattern below needs its own bounded
    // wait *smaller* than the test's own overall timeout. `locator.waitFor()`
    // with no explicit `timeout` defaults to the test's remaining budget, so
    // it silently consumed this whole test's default 30s on its own before
    // the `.catch()` could even resolve — by the time `hasRows` came back
    // `false`, the outer test timeout had already fired too, so Playwright
    // reported "Test timeout of 30000ms exceeded" instead of a clean skip.
    test.setTimeout(45_000);

    const loginPage = new LoginPage(page);
    const achEftCheckPage = new AchEftCheckPage(page);

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

    const hasRows = await reportedStep(
      page,
      testInfo,
      'Open the ACH/EFT & Check tab and wait for the grid to load',
      async () => {
        await achEftCheckPage.goto();
        await waitForVisible(achEftCheckPage.achEftCheckTabLocator);
        await achEftCheckPage.openAchEftCheckTab();

        await expect(achEftCheckPage.searchByDropdownLocator).toBeVisible();

        // The grid populates asynchronously after the tab becomes active — wait
        // for at least one row (bounded by the default assertion timeout) rather
        // than reading the row count immediately.
        return achEftCheckPage.gridRowsLocator
          .first()
          .waitFor({ state: 'visible', timeout: 15_000 })
          .then(() => true)
          .catch(() => false);
      },
      (rows) =>
        rows
          ? 'Opened the ACH/EFT & Check tab; at least one grid row appeared within 15s.'
          : 'Opened the ACH/EFT & Check tab; no grid rows appeared within 15s — grid is currently empty.',
      { label: 'Search By dropdown', locator: achEftCheckPage.searchByDropdownLocator },
    );
    test.skip(!hasRows, 'No batches available in the ACH/EFT & Check grid right now.');

    await reportedStep(
      page,
      testInfo,
      'Confirm every row action icon is present',
      async () => {
        for (const title of [
          'Download NACHA',
          'Save Doc to DMS',
          'Doc Status info',
          'Send Email',
          'Export To PDF',
          'Validate Email Address',
          'View Email Log',
        ]) {
          await expect(achEftCheckPage.actionIconLocator(title).first()).toBeVisible();
        }
      },
      'Confirmed all 7 row action icons (Download NACHA, Save Doc to DMS, Doc Status info, Send Email, Export To PDF, Validate Email Address, View Email Log) are visible on the first grid row.',
      [
        { label: 'Download NACHA icon', locator: achEftCheckPage.actionIconLocator('Download NACHA').first() },
        { label: 'Export To PDF icon', locator: achEftCheckPage.actionIconLocator('Export To PDF').first() },
      ],
    );

    await reportedStep(
      page,
      testInfo,
      'Search for the first batch by its Batch No',
      async () => {
        const batchNo = await achEftCheckPage.firstRowBatchNo();
        await achEftCheckPage.setSearchBy('1');
        await achEftCheckPage.enterBatchNo(batchNo);
        await achEftCheckPage.clickSearch();

        await expect(achEftCheckPage.gridRowsLocator).toHaveCount(1);
        await expect(achEftCheckPage.gridCellLocator('Batch_No').first()).toHaveText(batchNo);
        await expect(achEftCheckPage.isAchCellLocator()).toHaveText(/Yes|No/);

        return batchNo;
      },
      (batchNo) => `Searched by Batch No = "${batchNo}" and confirmed exactly 1 matching row, with its Batch_No cell matching and its "Is ACH" cell showing Yes/No.`,
      [
        { label: 'Matched Batch_No cell', locator: achEftCheckPage.gridCellLocator('Batch_No').first() },
        { label: 'Is ACH cell', locator: achEftCheckPage.isAchCellLocator() },
      ],
    );
  },
);
