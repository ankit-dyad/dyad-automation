import { test, expect } from '../../../framework/fixtures';
import { getCredential } from '../../../framework/utils/env';
import { reportedStep } from '../../../framework/utils/reportStep';
import { waitForVisible } from '../../../framework/utils/waits';
import { LoginPage } from '../login/login.page';
import { RemittanceAdvicePage } from './remittanceAdvice.page';

/**
 * From /alis_core/scenarios/alc_sc_remittance_advice_download.md, derived
 * from the "Check Register - Remittance Advice" test scenario in "ALIS
 * Accounting - Bulk Payment Upload to Remittance - End-to-End Test Cases".
 * See alis_core/knowledge/pages/remittance-advice.md.
 *
 * Downloads a real PDF via Playwright's download-event handling — no
 * filesystem assertion, no data mutation (confirmed via network trace during
 * exploration: this is a read/generate action, not a state-changing one).
 */
test(
  'Alis Core: standard agent can download a Remittance Advice PDF from Check Register',
  {
    annotation: [
      { type: 'scenario', description: 'alc_sc_remittance_advice_download' },
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
    const remittanceAdvicePage = new RemittanceAdvicePage(page);

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
        await remittanceAdvicePage.goto();
        await waitForVisible(remittanceAdvicePage.checkRegisterTabLocator);

        // The grid can legitimately have zero rows on this production-looking,
        // ever-changing environment — skip rather than hard-fail (same rationale
        // as ach-eft-check.md and check-summary-popup.md's Edge Cases).
        hasRow = await remittanceAdvicePage.firstRowCheckboxLocator
          .waitFor({ state: 'visible', timeout: 10_000 })
          .then(() => true)
          .catch(() => false);
      },
      () => (hasRow ? 'Opened Check Register and confirmed a row appeared with its row-selection checkbox visible.' : 'Opened Check Register and no row appeared within 10s.'),
      // Passed unconditionally, not gated on `hasRow` — that variable is only
      // assigned *inside* this same call's action(), so referencing it here
      // (an argument, evaluated eagerly before the call even runs) would
      // always read its stale outer `false` default. When there's genuinely
      // no row, reportStep.ts's own try/catch records this target as "could
      // not read" rather than failing — the same graceful-degradation this
      // helper already relies on elsewhere.
      { label: 'First row checkbox', locator: remittanceAdvicePage.firstRowCheckboxLocator },
    );
    test.skip(!hasRow, 'No Check Register rows available to download a Remittance Advice for right now.');

    await reportedStep(
      page,
      testInfo,
      'Select the first row and download its Remittance Advice as a PDF',
      async () => {
        await remittanceAdvicePage.selectFirstRow();
        await remittanceAdvicePage.openRemittanceDownloadAsMenu();

        const download = await remittanceAdvicePage.downloadPdf();
        expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
        return download;
      },
      (download) => `Selected the first row, opened the Remittance Download As menu, and downloaded "${download.suggestedFilename()}" as a PDF.`,
      { label: 'Selected row checkbox', locator: remittanceAdvicePage.firstRowCheckboxLocator },
    );
  },
);
