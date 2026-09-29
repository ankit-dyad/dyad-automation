import { test, expect } from '../../../framework/fixtures';
import { getCredential } from '../../../framework/utils/env';
import { reportedStep } from '../../../framework/utils/reportStep';
import { waitForVisible } from '../../../framework/utils/waits';
import { LoginPage } from '../login/login.page';
import { PaymentUploadPage } from '../payment_upload/paymentUpload.page';
import { AgencyBankSetupPage } from '../agency_bank_setup/agencyBankSetup.page';
import { PaymentUploadValidationPage } from '../payment_upload_validation/paymentUploadValidation.page';
import { BatchTransactionDetailPage } from '../batch_transaction_detail/batchTransactionDetail.page';
import { InvoiceApplicationPage } from '../invoice_application/invoiceApplication.page';
import { AchEftCheckPage } from '../ach_eft_check/achEftCheck.page';
import { CheckSummaryPage } from '../check_summary/checkSummary.page';
import { RemittanceAdvicePage } from '../remittance_advice/remittanceAdvice.page';

/**
 * From /alis_core/scenarios/alc_sc_e2e_bulk_payment_upload_to_remittance.md.
 * A single continuous session composing every already-automated page in the
 * PDF's "ALIS Accounting - Bulk Payment Upload to Remittance - End-to-End
 * Test Cases" flow, in one run, in the same order the PDF itself lists its
 * sub-scenarios — one login, one browser context, walking Payment Upload ->
 * Agency Bank Setup -> Payment Upload File Validation -> Batch Transaction
 * Detail -> Invoice Application -> ACH/EFT & Check -> Check Summary ->
 * Remittance Advice.
 *
 * Deliberately has no locators.ts/page.ts of its own — every locator/action
 * used here is already declared in each step's own feature folder (see the
 * scenario file for why this is a narrow, intentional exception to the
 * three-file convention).
 *
 * Not included — every one is either a real write against this
 * production-looking environment (Save Payment, Invoice Application's Save,
 * Check Summary's Update, Approve, Edit Batch Detail, Batch Prepared) or
 * still genuinely blocked (Print Check's own popup content — see
 * print-check.md). See each step's own spec/knowledge file for the specific
 * reasoning.
 */
test(
  'Alis Core: standard agent can walk the full Bulk Payment Upload to Remittance flow',
  {
    annotation: [
      { type: 'scenario', description: 'alc_sc_e2e_bulk_payment_upload_to_remittance' },
      { type: 'product', description: 'alis_core' },
    ],
  },
  async ({ page }, testInfo) => {
    // This composes 9 sequential steps, each comparable in cost to its own
    // standalone spec (15-30s individually, Agency Bank Setup's new-tab dance
    // included) — the default 30s test timeout is far too short for the full
    // chain. 4 minutes gives headroom without masking a genuine hang.
    test.setTimeout(240_000);

    const loginPage = new LoginPage(page);
    const paymentUploadPage = new PaymentUploadPage(page);
    const uploadValidationPage = new PaymentUploadValidationPage(page);
    const batchDetailPage = new BatchTransactionDetailPage(page);
    const invoiceApplicationPage = new InvoiceApplicationPage(page);
    const achEftCheckPage = new AchEftCheckPage(page);
    const checkSummaryPage = new CheckSummaryPage(page);
    const remittanceAdvicePage = new RemittanceAdvicePage(page);

    const username = getCredential('ALIS_CORE_LOGIN_USER', 'alis_core', 'username');

    await reportedStep(
      page,
      testInfo,
      '1. Log in & switch to Accounting',
      async () => {
        await loginPage.goto();
        await waitForVisible(loginPage.userNameFieldLocator);
        await loginPage.login(username, getCredential('ALIS_CORE_LOGIN_PASS', 'alis_core', 'password'));
        await expect(page).not.toHaveURL(/#\/login/);
      },
      `Logged in to Alis Core BMS as "${username}" and confirmed the session left the login screen.`,
    );

    let acctEffDate = '';
    await reportedStep(
      page,
      testInfo,
      '2. Payment Upload — fill in the batch header fields',
      async () => {
        await paymentUploadPage.goto();
        await waitForVisible(paymentUploadPage.uploadTabLocator);
        await paymentUploadPage.openUploadTab();

        const today = new Date();
        acctEffDate = [
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
        await expect(paymentUploadPage.clientTypeDropdownLocator).toHaveValue('AGENCY');
        await expect(paymentUploadPage.bankGlDropdownLocator).toHaveValue('110201');
      },
      () =>
        `On the Payment screen's Upload tab, set Client Type = "AGENCY", Acct Eff Date = "${acctEffDate}", Entity = "1", Bank GL = "110201" — confirmed Client Type and Bank GL were accepted.`,
      [
        { label: 'Client Type dropdown', locator: paymentUploadPage.clientTypeDropdownLocator },
        { label: 'Bank GL dropdown', locator: paymentUploadPage.bankGlDropdownLocator },
      ],
    );

    await reportedStep(
      page,
      testInfo,
      '3. Agency Admin — view a Bank Information record (new tab)',
      async () => {
        const bankSetupPage = await AgencyBankSetupPage.openFromBms(page);
        // openFromBms() captures the new tab/window internally but doesn't
        // expose it (BasePage's `page` is protected) — grab it back off the
        // shared browser context (it's the most-recently-opened page) so
        // this step's own screenshot/log below reflects what's actually on
        // screen in the popup, not the original `page`, which still shows
        // whatever it had before the popup opened.
        const adminPage = page.context().pages().at(-1) ?? page;

        await bankSetupPage.openBusinessAgencyListing();
        await expect(bankSetupPage.agencyGridLocator).toBeVisible();

        await bankSetupPage.openFirstAgencyDetails();
        await expect(bankSetupPage.detailsTabLocator).toBeVisible();

        await bankSetupPage.openBankInformationTab();
        await expect(bankSetupPage.bankInformationPanelLocator).toBeVisible();
        await expect(bankSetupPage.bankAccountTypeDropdownLocator).toBeVisible();
        await expect(bankSetupPage.recordsGridLocator).toBeVisible();

        await reportedStep(
          adminPage,
          testInfo,
          '3a. Agency Admin — Bank Information tab loaded',
          async () => {
            // No-op check step, purely so the report captures a screenshot
            // of the popup tab itself (Admin Manager, not BMS) while it's
            // still open and showing the Bank Information panel.
          },
          "Opened the Admin Manager's Business > Agency listing (new tab), drilled into the first agency's Details, and opened its Bank Information tab — confirmed the panel, Bank Account Type dropdown, and records grid are all visible.",
        );

        // Confirmed necessary: leaving this second tab/window open (it shares
        // the same browser context/session as the original `page`) was traced
        // to the next step's Upload click silently firing no request at all —
        // the Admin Manager tab's own re-authentication handshake
        // (`AuthBridge.aspx`, seen twice in a network trace) appears to
        // disturb the original tab's in-memory session state. Closing it and
        // reloading `page` before continuing is the fix; the exact mechanism
        // wasn't confirmed further (this app's session internals aren't
        // inspectable from outside).
        await bankSetupPage.close();
        await page.reload();
      },
      "Opened the BMS module switcher's Admin item (a new browser tab), viewed the first agency's Bank Information record there, then closed that tab and reloaded the original BMS tab to restore its session state.",
    );

    await reportedStep(
      page,
      testInfo,
      '4. Payment Upload — upload a file and review the Valid/Invalid Invoice split',
      async () => {
        await uploadValidationPage.goto();
        await waitForVisible(uploadValidationPage.uploadTabLocator);
        await uploadValidationPage.openUploadTab();

        await uploadValidationPage.chooseOfficialSampleFile();
        await uploadValidationPage.clickUpload();

        await expect(uploadValidationPage.invalidInvoiceTabLocator).toContainText('Invalid Invoice 2');
        await expect(uploadValidationPage.validInvoiceTabLocator).toContainText('Valid Invoice 0');

        // Never clicks Save Payment — see file header.
        await expect(uploadValidationPage.savePaymentButtonLocator).toBeVisible();
      },
      'Uploaded the app\'s own official sample template ("payment_upload_sample.xlsx") on the Upload tab — its 2 placeholder rows landed 2/2 in Invalid Invoice, 0 in Valid Invoice as expected; Save Payment button is visible but was never clicked.',
      [
        { label: 'Invalid Invoice tab', locator: uploadValidationPage.invalidInvoiceTabLocator },
        { label: 'Valid Invoice tab', locator: uploadValidationPage.validInvoiceTabLocator },
      ],
    );

    let batchNo = '';
    await reportedStep(
      page,
      testInfo,
      '5. Batch List — open and close a Batch Transaction Detail popup',
      async () => {
        await batchDetailPage.goto();
        await waitForVisible(batchDetailPage.batchListTabLocator);
        await batchDetailPage.openBatchListTab();
        await expect(batchDetailPage.gridRowsLocator.first()).toBeVisible();

        batchNo = await batchDetailPage.firstRowBatchNo();
        await batchDetailPage.openFirstRowDetailPopup();
        await expect(batchDetailPage.openModalLocator).toBeVisible();
        await expect(batchDetailPage.modalTitleLocator).toContainText(`Batch Detail # ${batchNo}`);
        await batchDetailPage.closeDetailPopup();
        await expect(batchDetailPage.openModalLocator).toHaveCount(0);
      },
      () =>
        `On Batch List, opened the first row's Batch Transaction Detail popup (batch #${batchNo}), confirmed its title read "Batch Detail # ${batchNo}", then closed it.`,
      { label: 'First batch row', locator: batchDetailPage.gridRowsLocator.first() },
    );

    await reportedStep(
      page,
      testInfo,
      '6. Invoice Application — toggle voucher filters, then close without saving',
      async () => {
        await invoiceApplicationPage.goto();
        await waitForVisible(invoiceApplicationPage.batchListTabLocator);
        await invoiceApplicationPage.openBatchListTab();
        await invoiceApplicationPage.openFirstBatchPaymentTab();
        await invoiceApplicationPage.openInvoiceApplicationForFirstRecord();
        await expect(invoiceApplicationPage.openModalLocator).toBeVisible();
        await invoiceApplicationPage.toggleReceivableVouchers();
        await invoiceApplicationPage.togglePayableVouchers();
        await invoiceApplicationPage.clickSearch();
        await invoiceApplicationPage.closeWithoutSaving();
        await expect(invoiceApplicationPage.openModalLocator).toHaveCount(0);
      },
      'Opened Invoice Application for the first batch\'s first payment record, toggled Receivable Vouchers and Payable Vouchers, re-ran Search, then closed the modal without saving.',
    );

    await reportedStep(
      page,
      testInfo,
      '7. ACH/EFT & Check — search the grid by Batch No',
      async () => {
        await achEftCheckPage.goto();
        await waitForVisible(achEftCheckPage.achEftCheckTabLocator);
        await achEftCheckPage.openAchEftCheckTab();
        const hasAchRow = await achEftCheckPage.gridRowsLocator
          .first()
          .waitFor({ state: 'visible', timeout: 10_000 })
          .then(() => true)
          .catch(() => false);
        if (hasAchRow) {
          const achBatchNo = await achEftCheckPage.firstRowBatchNo();
          await achEftCheckPage.setSearchBy('1');
          await achEftCheckPage.enterBatchNo(achBatchNo);
          await achEftCheckPage.clickSearch();
          await expect(achEftCheckPage.gridRowsLocator).toHaveCount(1);
        }
      },
      'On ACH/EFT & Check: if a row was present, searched the grid by its Batch No (Search By = "1") and confirmed the search narrowed the grid to exactly 1 matching row; if the grid was empty, this step was a no-op.',
      { label: 'Matching ACH/EFT & Check row', locator: achEftCheckPage.gridRowsLocator },
    );

    await reportedStep(
      page,
      testInfo,
      '8. Check Register — open and close a Check Summary popup',
      async () => {
        await checkSummaryPage.goto();
        await waitForVisible(checkSummaryPage.checkRegisterTabLocator);
        const hasCheckSummaryRow = await checkSummaryPage.firstRowCheckSummaryIconLocator
          .waitFor({ state: 'visible', timeout: 10_000 })
          .then(() => true)
          .catch(() => false);
        if (hasCheckSummaryRow) {
          await checkSummaryPage.openFirstRowCheckSummary();
          await expect(checkSummaryPage.openModalLocator).toBeVisible();
          await checkSummaryPage.closePopup();
          await expect(checkSummaryPage.openModalLocator).toHaveCount(0);
        }
      },
      'On Check Register: if a row with a Check Summary icon was present, opened its Check Summary popup and closed it again; if none was present, this step was a no-op.',
    );

    await reportedStep(
      page,
      testInfo,
      '9. Check Register — download the Remittance Advice PDF',
      async () => {
        await remittanceAdvicePage.goto();
        await waitForVisible(remittanceAdvicePage.checkRegisterTabLocator);
        const hasRemittanceRow = await remittanceAdvicePage.firstRowCheckboxLocator
          .waitFor({ state: 'visible', timeout: 10_000 })
          .then(() => true)
          .catch(() => false);
        if (hasRemittanceRow) {
          await remittanceAdvicePage.selectFirstRow();
          await remittanceAdvicePage.openRemittanceDownloadAsMenu();
          const download = await remittanceAdvicePage.downloadPdf();
          expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
        }
      },
      'On Check Register: if a row was present, selected it, opened the "Download As" menu, and downloaded the Remittance Advice — confirmed the downloaded file\'s suggested name ends in ".pdf"; if no row was present, this step was a no-op.',
    );
  },
);
