import { test, expect } from '../../../framework/fixtures';
import { getCredential } from '../../../framework/utils/env';
import { reportedStep } from '../../../framework/utils/reportStep';
import { waitForVisible } from '../../../framework/utils/waits';
import { LoginPage } from '../login/login.page';
import { BatchListBackNavigationPage } from './batchListBackNavigation.page';

/**
 * From /alis_core/scenarios/alc_sc_batch_list_back_navigation.md, derived
 * from checklist item #20, "Payment - Back to Batches", in "ALIS Accounting
 * - Bulk Payment Upload to Remittance - End-to-End Test Cases". See
 * alis_core/knowledge/pages/payment-tab-individual-records.md.
 *
 * Read-only: opens whichever batch is first in the default Batch List grid,
 * confirms its own Payment tab, then navigates back — no Save/Delete/
 * Approve/Prepare/Post NACHA/Create Batch click anywhere in this suite.
 */
test(
  'Alis Core: standard agent can navigate from a batch\'s Payment tab back to Batch List',
  {
    annotation: [
      { type: 'scenario', description: 'alc_sc_batch_list_back_navigation' },
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
    const backNavPage = new BatchListBackNavigationPage(page);

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
      'Open the Batch List tab and confirm the grid is populated',
      async () => {
        await backNavPage.goto();
        await waitForVisible(backNavPage.batchListTabLocator);
        await backNavPage.openBatchListTab();
        await expect(backNavPage.gridRowsLocator.first()).toBeVisible();
      },
      'Opened the Batch List tab on the Payment screen and confirmed at least one batch row is visible in the grid.',
      { label: 'First batch list row', locator: backNavPage.gridRowsLocator.first() },
    );

    await reportedStep(
      page,
      testInfo,
      'Open the first batch\'s own Payment tab and confirm it\'s active',
      async () => {
        await backNavPage.openFirstBatchPaymentTab();
        await waitForVisible(backNavPage.paymentTabLocator);
        // The tab buttons' `aria-selected` attribute is not kept in sync by
        // this app (confirmed live 2026-09-28 — it stays "false" on the
        // actually-active "Payment" tab), so active-tab state is asserted via
        // its pane's own content instead, same as batchListVerification.test.ts
        // / paymentTabIndividualRecords.test.ts.
        await expect(backNavPage.paymentTabGridRowsLocator.first()).toBeVisible();
        await expect(backNavPage.backToBatchesButtonLocator).toBeVisible();
      },
      'Clicked the first batch row\'s Transaction Add/Edit icon, landed on that batch\'s own Payment tab, and confirmed its grid has rows and a "Back to Batches" button is visible.',
      [
        { label: 'First Payment tab grid row', locator: backNavPage.paymentTabGridRowsLocator.first() },
        { label: 'Back to Batches button', locator: backNavPage.backToBatchesButtonLocator },
      ],
    );

    await reportedStep(
      page,
      testInfo,
      'Click "Back to Batches" and confirm Batch List is active again',
      async () => {
        await backNavPage.clickBackToBatches();
        await waitForVisible(backNavPage.batchListTabLocator);
        await expect(backNavPage.gridRowsLocator.first()).toBeVisible();
      },
      'Clicked "Back to Batches" and confirmed the Batch List tab is active again with its grid populated.',
      { label: 'First batch list row', locator: backNavPage.gridRowsLocator.first() },
    );
  },
);
