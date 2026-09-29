import { test, expect } from '../../../framework/fixtures';
import { getCredential } from '../../../framework/utils/env';
import { reportedStep } from '../../../framework/utils/reportStep';
import { waitForVisible } from '../../../framework/utils/waits';
import { LoginPage } from '../login/login.page';
import { CheckSummaryPage } from './checkSummary.page';

/**
 * From /alis_core/scenarios/alc_sc_check_summary_popup.md, derived from the
 * "Verify Check Summary" test scenario in "ALIS Accounting - Bulk Payment
 * Upload to Remittance - End-to-End Test Cases". See
 * alis_core/knowledge/pages/check-summary-popup.md.
 *
 * Read-only: opens and closes the popup for the grid's first row, no Update
 * click (that's a real write — see the knowledge file's Edge Cases).
 */
test(
  'Alis Core: standard agent can open and close the Check Summary popup',
  {
    annotation: [
      { type: 'scenario', description: 'alc_sc_check_summary_popup' },
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
    const checkSummaryPage = new CheckSummaryPage(page);

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

    let hasRow = false;
    await reportedStep(
      page,
      testInfo,
      'Open Check Register and wait for a row to appear',
      async () => {
        await checkSummaryPage.goto();
        await waitForVisible(checkSummaryPage.checkRegisterTabLocator);

        // The default-filtered grid can legitimately have zero rows on this
        // production-looking, ever-changing environment (same rationale as
        // ach-eft-check.md's Edge Cases) — skip rather than let the row-icon
        // click hard-timeout when that happens.
        hasRow = await checkSummaryPage.firstRowCheckSummaryIconLocator
          .waitFor({ state: 'visible', timeout: 10_000 })
          .then(() => true)
          .catch(() => false);
      },
      () => (hasRow ? 'Opened Check Register and confirmed a row with a Check Summary icon appeared.' : 'Opened Check Register and no row appeared within 10s.'),
    );
    test.skip(!hasRow, 'No Check Register rows available to open a Check Summary for right now.');

    await reportedStep(
      page,
      testInfo,
      'Open the first row\'s Check Summary popup and check its data',
      async () => {
        await checkSummaryPage.openFirstRowCheckSummary();
        await expect(checkSummaryPage.openModalLocator).toBeVisible();

        await expect(checkSummaryPage.modalGridCellLocator('client_code')).not.toBeEmpty();
        await expect(checkSummaryPage.modalGridCellLocator('client_name')).not.toBeEmpty();
        await expect(checkSummaryPage.modalGridCellLocator('payee_name')).not.toBeEmpty();
        await expect(checkSummaryPage.modalGridCellLocator('payment_amt')).toHaveText(/^\$[\d,]+\.\d{2}$/);
      },
      'Opened the first row\'s Check Summary popup and confirmed Client Code, Client Name, Payee Name, and Payment Amount (formatted as currency) are all populated.',
      [
        { label: 'Payee Name cell', locator: checkSummaryPage.modalGridCellLocator('payee_name') },
        { label: 'Payment Amt cell', locator: checkSummaryPage.modalGridCellLocator('payment_amt') },
      ],
    );

    await reportedStep(
      page,
      testInfo,
      'Close the popup',
      async () => {
        await checkSummaryPage.closePopup();
        await expect(checkSummaryPage.openModalLocator).toHaveCount(0);
      },
      'Closed the Check Summary popup and confirmed it is no longer present on the page.',
    );
  },
);
