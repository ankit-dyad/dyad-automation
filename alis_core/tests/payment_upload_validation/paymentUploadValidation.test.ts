import { test, expect } from '../../../framework/fixtures';
import { getCredential } from '../../../framework/utils/env';
import { reportedStep } from '../../../framework/utils/reportStep';
import { waitForVisible } from '../../../framework/utils/waits';
import { LoginPage } from '../login/login.page';
import { PaymentUploadValidationPage } from './paymentUploadValidation.page';

/**
 * From /alis_core/scenarios/alc_sc_payment_upload_file_validation.md,
 * derived from the "Payment Upload - File Selection & Validation" test
 * scenario in "ALIS Accounting - Bulk Payment Upload to Remittance -
 * End-to-End Test Cases". See
 * alis_core/knowledge/pages/payment-upload-file-validation.md.
 *
 * Uploads the app's own official sample template (fetched live via its
 * "Download" link — never a committed binary fixture). That template's data
 * is fabricated placeholder data confirmed to always land in Invalid Invoice
 * on this environment, so this spec only exercises the Invalid Invoice path.
 * Never clicks Save Payment — real write against production-looking data.
 *
 * Every step below is wrapped in reportedStep() (see
 * framework/utils/reportStep.ts) instead of a bare test.step() — each one
 * logs exactly what was uploaded / confirmed (the real filename, the real
 * row counts, etc.), not just a static title, and attaches a full-page
 * screenshot, both inline in the Playwright HTML report — so the report
 * itself is readable without opening a trace.
 */
test(
  'Alis Core: standard agent can upload a payment file and review the Valid/Invalid Invoice split',
  {
    annotation: [
      { type: 'scenario', description: 'alc_sc_payment_upload_file_validation' },
      { type: 'product', description: 'alis_core' },
    ],
  },
  async ({ page }, testInfo) => {
    // clickUpload() can retry once with its own bounded wait (see
    // paymentUploadValidation.page.ts) — worst case adds ~16s on top of the
    // rest of this spec, which the default 30s test timeout doesn't leave
    // room for.
    test.setTimeout(60_000);

    const loginPage = new LoginPage(page);
    const uploadValidationPage = new PaymentUploadValidationPage(page);

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
      "Upload the app's own sample payment file",
      async () => {
        await uploadValidationPage.goto();
        await waitForVisible(uploadValidationPage.uploadTabLocator);
        await uploadValidationPage.openUploadTab();

        await uploadValidationPage.chooseOfficialSampleFile();
        await uploadValidationPage.clickUpload();
      },
      'On the Payment screen\'s Upload tab: fetched the app\'s own official sample template ("payment_upload_sample.xlsx", via its "Download" link) and clicked Upload with it.',
    );

    await reportedStep(
      page,
      testInfo,
      'Confirm the Valid/Invalid Invoice split',
      async () => {
        await expect(uploadValidationPage.invalidInvoiceTabLocator).toContainText('Invalid Invoice 2');
        await expect(uploadValidationPage.validInvoiceTabLocator).toContainText('Valid Invoice 0');
      },
      'The sample template\'s 2 placeholder rows (fabricated codes, never real invoices) landed 2/2 in Invalid Invoice, 0 in Valid Invoice — the expected, always-reproducible outcome for this specific file on this environment.',
      [
        { label: 'Invalid Invoice tab', locator: uploadValidationPage.invalidInvoiceTabLocator },
        { label: 'Valid Invoice tab', locator: uploadValidationPage.validInvoiceTabLocator },
      ],
    );

    await reportedStep(
      page,
      testInfo,
      'Review the Invalid Invoice rows and their error reasons',
      async () => {
        // Don't assume Invalid Invoice auto-activates — select it explicitly.
        await uploadValidationPage.openInvalidInvoiceTab();
        await expect(uploadValidationPage.invalidInvoiceGridRowsLocator).toHaveCount(2);
        await expect(uploadValidationPage.invalidInvoiceGridCellLocator('client_code').first()).not.toBeEmpty();
        await expect(uploadValidationPage.invalidInvoiceGridCellLocator('invoice_code').first()).not.toBeEmpty();
        await expect(uploadValidationPage.invalidInvoiceGridCellLocator('remark').first()).not.toBeEmpty();
      },
      'Opened the Invalid Invoice tab and confirmed both rejected rows show a populated Client Code, Invoice Code, and a human-readable error reason (Remark column) — not blank/broken cells.',
      [
        {
          label: 'Invoice Code cell',
          locator: uploadValidationPage.invalidInvoiceGridCellLocator('invoice_code').first(),
        },
        { label: 'Remark cell', locator: uploadValidationPage.invalidInvoiceGridCellLocator('remark').first() },
      ],
    );

    await reportedStep(
      page,
      testInfo,
      'Confirm the Valid Invoice grid columns, without saving anything',
      async () => {
        await uploadValidationPage.openValidInvoiceTab();
        // First column header is the row-selection checkbox (empty text).
        await expect(uploadValidationPage.validInvoiceGridHeadersLocator).toHaveText([
          '',
          'Client Code',
          'Invoice Code',
          'Amount',
          'Payment Type',
          'Document Number',
          'Description',
        ]);

        // Never clicked — see file header.
        await expect(uploadValidationPage.savePaymentButtonLocator).toBeVisible();
      },
      'Opened the (empty, 0-row) Valid Invoice tab and confirmed its grid header shows the full expected column set (Client Code, Invoice Code, Amount, Payment Type, Document Number, Description) and that a Save Payment button is present — but deliberately not clicked, since this specific file never produces a real row to save.',
      [
        { label: 'Valid Invoice grid headers', locator: uploadValidationPage.validInvoiceGridHeadersLocator },
        { label: 'Save Payment button', locator: uploadValidationPage.savePaymentButtonLocator },
      ],
    );
  },
);
