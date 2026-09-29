import { test, expect } from '../../../framework/fixtures';
import { getCredential } from '../../../framework/utils/env';
import { reportedStep } from '../../../framework/utils/reportStep';
import { waitForVisible } from '../../../framework/utils/waits';
import { LoginPage } from '../login/login.page';
import { PaymentUploadPage } from './paymentUpload.page';

/**
 * From /alis_core/scenarios/alc_sc_payment_upload_batch_setup.md, derived from
 * the "Payment Upload - Batch Setup" test scenario in "ALIS Accounting - Bulk
 * Payment Upload to Remittance - End-to-End Test Cases". See
 * alis_core/knowledge/pages/payment-upload.md: this spec logs in via the BMS
 * app then navigates directly to the Accounting sub-app's Payment screen
 * (shared authenticated session), rather than driving the hamburger/ChocoBox
 * menu, which is not automated here.
 *
 * Stops short of actually clicking "Upload" with a real file — that would
 * create a real batch/payment record against this production-looking
 * environment (see payment-batch-list.md's "Create Batch performs a real
 * write" note).
 */
test(
  'Alis Core: standard agent can set the Payment Upload batch header fields',
  {
    annotation: [
      { type: 'scenario', description: 'alc_sc_payment_upload_batch_setup' },
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
    const paymentUploadPage = new PaymentUploadPage(page);

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
      'Open Payment > Upload and confirm every field is present',
      async () => {
        await paymentUploadPage.goto();
        await waitForVisible(paymentUploadPage.uploadTabLocator);
        await paymentUploadPage.openUploadTab();

        await expect(paymentUploadPage.clientTypeDropdownLocator).toBeVisible();
        await expect(paymentUploadPage.acctEffDateFieldLocator).toBeVisible();
        await expect(paymentUploadPage.entityDropdownLocator).toBeVisible();
        await expect(paymentUploadPage.bankGlDropdownLocator).toBeVisible();
        await expect(paymentUploadPage.chooseFilesInputLocator).toBeVisible();
        await expect(paymentUploadPage.downloadSampleLinkLocator).toBeVisible();
        await expect(paymentUploadPage.uploadButtonLocator).toBeVisible();
        await expect(paymentUploadPage.cancelButtonLocator).toBeVisible();
      },
      "On the Payment screen's Upload tab, confirmed all 8 expected controls are present: Client Type, Acct Eff Date, Entity, Bank GL, Choose Files, Download Sample link, Upload button, and Cancel button.",
    );

    await reportedStep(
      page,
      testInfo,
      'Fill in the batch header fields',
      async () => {
        // MM/DD/YYYY, computed at run time — the field defaults to "today" and a
        // fixed literal date would go stale (see knowledge/conventions.md's "no
        // hardcoded environment-specific values" rule).
        const today = new Date();
        const acctEffDate = [
          String(today.getMonth() + 1).padStart(2, '0'),
          String(today.getDate()).padStart(2, '0'),
          today.getFullYear(),
        ].join('/');

        await paymentUploadPage.setBatchHeader({
          clientType: 'AGENCY',
          acctEffDate,
          entity: '1',
          bankGl: '110201',
        });
      },
      'Filled the batch header: Client Type = "AGENCY", Acct Eff Date = today\'s date, Entity = "1", Bank GL = "110201".',
    );

    await reportedStep(
      page,
      testInfo,
      'Confirm the fields were accepted',
      async () => {
        await expect(paymentUploadPage.clientTypeDropdownLocator).toHaveValue('AGENCY');
        await expect(paymentUploadPage.entityDropdownLocator).toHaveValue('1');
        await expect(paymentUploadPage.bankGlDropdownLocator).toHaveValue('110201');
      },
      'Confirmed the Client Type ("AGENCY"), Entity ("1"), and Bank GL ("110201") dropdowns retained the values that were just set.',
      [
        { label: 'Client Type dropdown', locator: paymentUploadPage.clientTypeDropdownLocator },
        { label: 'Bank GL dropdown', locator: paymentUploadPage.bankGlDropdownLocator },
      ],
    );
  },
);
