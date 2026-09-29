import { test, expect } from '../../../framework/fixtures';
import { getCredential } from '../../../framework/utils/env';
import { reportedStep } from '../../../framework/utils/reportStep';
import { waitForVisible } from '../../../framework/utils/waits';
import { LoginPage } from '../login/login.page';
import { BatchListPdfExportPage } from './batchListPdfExport.page';

/**
 * From /alis_core/scenarios/alc_sc_batch_list_pdf_export.md, derived from the
 * "PDF Generation (payment)" test scenario in "ALIS Accounting - Bulk
 * Payment Upload to Remittance - End-to-End Test Cases". See
 * alis_core/knowledge/pages/payment-batch-list-pdf-export.md.
 *
 * A read-only report-export action (confirmed: the underlying endpoint is a
 * `GetView...` report call) — verified via the network response itself
 * rather than a real downloaded file, since the app builds the download
 * client-side from an ordinary JSON response instead of serving a
 * navigable/`Content-Disposition` file.
 */
test(
  'Alis Core: standard agent can export a batch as PDF from Batch List',
  {
    annotation: [
      { type: 'scenario', description: 'alc_sc_batch_list_pdf_export' },
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
    const pdfExportPage = new BatchListPdfExportPage(page);

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
      'Open Batch List and export the first batch as PDF',
      async () => {
        await pdfExportPage.goto();
        await waitForVisible(pdfExportPage.batchListTabLocator);

        const response = await pdfExportPage.clickFirstRowPdfExport();
        expect(response.ok()).toBe(true);

        const body: unknown = await response.json();
        expect(typeof body).toBe('string');
        const base64 = body as string;
        expect(base64.length).toBeGreaterThan(0);

        const decodedHeader = Buffer.from(base64.slice(0, 12), 'base64').toString('latin1');
        expect(decodedHeader.startsWith('%PDF-')).toBe(true);
      },
      'Clicked the first batch row\'s PDF export action, got a 200 OK GetView... report response, and confirmed the decoded base64 body starts with the "%PDF-" file signature.',
      { label: 'PDF Export icon (first row)', locator: pdfExportPage.firstRowPdfIconLocator },
    );
  },
);
