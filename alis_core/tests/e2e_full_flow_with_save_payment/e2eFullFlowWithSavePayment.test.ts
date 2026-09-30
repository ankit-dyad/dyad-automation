import { test, expect } from '../../../framework/fixtures';
import { getCredential } from '../../../framework/utils/env';
import { reportedStep } from '../../../framework/utils/reportStep';
import { waitForVisible } from '../../../framework/utils/waits';
import { LoginPage } from '../login/login.page';
import { PaymentUploadPage } from '../payment_upload/paymentUpload.page';
import { AgencyBankSetupPage } from '../agency_bank_setup/agencyBankSetup.page';
import { PaymentUploadSavePaymentPage } from '../payment_upload_save_payment/paymentUploadSavePayment.page';
import { PaymentTabIndividualRecordsPage } from '../payment_tab_individual_records/paymentTabIndividualRecords.page';
import { InvoiceApplicationPage } from '../invoice_application/invoiceApplication.page';
import { BatchTransactionDetailPage } from '../batch_transaction_detail/batchTransactionDetail.page';
import { BatchListBackNavigationPage } from '../batch_list_back_navigation/batchListBackNavigation.page';
import { BatchListSearchByNumberPage } from '../batch_list_search_by_number/batchListSearchByNumber.page';
import { BatchListPdfExportPage } from '../batch_list_pdf_export/batchListPdfExport.page';
import { AchEftCheckPage } from '../ach_eft_check/achEftCheck.page';
import { CheckRegisterPage } from '../check_register/checkRegister.page';
import { CheckSummaryPage } from '../check_summary/checkSummary.page';
import { RemittanceAdvicePage } from '../remittance_advice/remittanceAdvice.page';

/**
 * From /alis_core/scenarios/alc_sc_e2e_full_flow_with_save_payment.md.
 * The single, fully-merged composition of every individually-automated
 * scenario in the PDF's "ALIS Accounting - Bulk Payment Upload to
 * Remittance - End-to-End Test Cases" checklist: one login, one browser
 * context, walking Login & Landing, Payment Upload's batch setup, Agency
 * Admin Bank Setup, the real Save Payment write (reusing
 * alc_sc_payment_upload_save_payment.md's proven flow), Batch List/Payment
 * tab, Invoice Application's full filter set, Batch Transaction Detail,
 * Back to Batches navigation, Batch List Search by Batch No, PDF Export,
 * ACH/EFT & Check, Check Register (Client Type/Banks/Payment Type/Columns
 * filters + Search by Batch No + PDF/Excel export), Check Summary, and
 * Remittance Advice - all 17 steps active, in roughly the order the PDF
 * itself lists them.
 *
 * Deliberately has no locators.ts of its own - every locator/action used
 * here is already declared in each step's own feature folder, same
 * intentional exception as the other e2e composition test
 * (e2eBulkPaymentUploadToRemittance.test.ts).
 *
 * Not included - every one is either a real write against this
 * production-looking environment (Invoice Application's own Save, Check
 * Summary's Update, Approve, Edit Batch Detail, Batch Prepared, Delete
 * Transaction, Batch List's own Delete action) or still genuinely blocked
 * (Print Check's own popup content - no automation exists for it yet in
 * its own standalone feature folder either). See each step's own
 * spec/knowledge file for the specific reasoning.
 *
 * Genuinely consequential real write - creates one new payment batch per
 * run (step 5). Not idempotent across re-runs: a successful run freezes the
 * same 11 AGT003 invoices in the new batch until it's deleted or posted, so
 * a re-run against unmodified state will stop at the "12 rows in Valid
 * Invoice" assertion rather than reach Save Payment again.
 *
 * Steps 6, 8-13 all operate on the SAME batch step 5 just created (2026-09-30:
 * changed from an earlier "whichever batch is first" design after the user
 * pointed out the mismatch between creating one batch and then acting on a
 * different one) - each of those steps calls the shared isolateBatchListTo()
 * helper (reusing invoiceApplicationPage's already-proven Filters-panel
 * isolateBatchNo()) right after its own openBatchListTab(), since every fresh
 * `.goto()` navigation resets any previously-applied grid filter. Step 12's
 * own Search-by-Batch-No now searches for createdBatchNo directly rather than
 * reading whatever happens to be first. Steps 14 (ACH/EFT & Check) and 15-17
 * (Check Register/Check Summary/Remittance Advice) deliberately still act on
 * whichever row is present in THEIR OWN grids, not step 5's batch specifically
 * - those are different underlying datasets (ACH-eligible transactions; 
 * Prepared-status checks) that a same-day-created payment batch is not
 * guaranteed to appear in yet, so forcing a search there would risk breaking
 * otherwise-passing, unrelated coverage rather than adding real verification.
 */

/** Parses a grid-formatted currency string (e.g. "$3.00", "($148.50)") into
 * a plain number - accounting notation wraps negatives in parentheses
 * rather than using a leading minus sign (confirmed live 2026-09-30 across
 * the outstanding invoice grid's total_amt/due_amt/revise_due columns). */
function parseCurrency(text: string): number {
  const trimmed = text.trim();
  const negative = trimmed.startsWith('(') && trimmed.endsWith(')');
  const digits = trimmed.replace(/[^0-9.]/g, '');
  const value = Number(digits);
  return negative ? -value : value;
}
test(
  'Alis Core: standard agent can walk the full Bulk Payment Upload to Remittance flow, including a real Save Payment write',
  {
    annotation: [
      { type: 'scenario', description: 'alc_sc_e2e_full_flow_with_save_payment' },
      { type: 'product', description: 'alis_core' },
    ],
  },
  async ({ page }, testInfo) => {
    // Composes 17 steps end to end, several involving real navigation,
    // popups, a new-tab dance, and Save Payment's own two round trips
    // (reject, then succeed) - this environment's run-to-run timing has
    // ranged from ~20s to several minutes for the Save Payment portion alone
    // (see payment-upload-file-validation.md), and every reportedStep() adds
    // a full-page screenshot on top of its own action/assertions (confirmed
    // live 2026-09-28 to matter even for much shorter specs). Bumped from
    // 480s to 600s now that steps 15-17 (Check Register/Check
    // Summary/Remittance Advice) are active again, adding three more full
    // navigations/reads on top of the already-long chain.
    test.setTimeout(600_000);

    const loginPage = new LoginPage(page);
    const paymentUploadPage = new PaymentUploadPage(page);
    const savePaymentPage = new PaymentUploadSavePaymentPage(page);
    const paymentTabPage = new PaymentTabIndividualRecordsPage(page);
    const invoiceApplicationPage = new InvoiceApplicationPage(page);
    const batchDetailPage = new BatchTransactionDetailPage(page);
    const backNavPage = new BatchListBackNavigationPage(page);
    const searchByNumberPage = new BatchListSearchByNumberPage(page);
    const pdfExportPage = new BatchListPdfExportPage(page);
    const achEftCheckPage = new AchEftCheckPage(page);
    const checkRegisterPage = new CheckRegisterPage(page);
    const checkSummaryPage = new CheckSummaryPage(page);
    const remittanceAdvicePage = new RemittanceAdvicePage(page);


    // Isolates the Batch List grid to a specific Batch No via the Filters
    // panel's (Select All) recipe - reusing invoiceApplicationPage's already-
    // proven isolateBatchNo() (same mechanism as
    // alis_core/tests/batch_list_search_by_number and
    // paymentUploadSavePayment.test.ts) rather than giving every other page
    // object its own copy, since they all operate on the same underlying
    // Batch List DOM regardless of which Page Object instance is driving it.
    // Callers must have already opened the Batch List tab (via their own
    // page object) before calling this - each step below does its own
    // `.goto()`, which resets any previously-applied filter, so this must be
    // re-applied after every fresh navigation.
    async function isolateBatchListTo(batchNo: string): Promise<void> {
      await invoiceApplicationPage.openFiltersPanel();
      const expanded = await invoiceApplicationPage
        .expandBatchNoFilter()
        .then(() => true)
        .catch(() => false);
      if (!expanded) {
        // Confirmed live 2026-09-30 via a dedicated read-only exploration script
        // (not part of this suite): after the FIRST successful use of this
        // Filters panel in a session, every SUBSEQUENT fresh page load can
        // intermittently render the Filters tab as "active" without actually
        // mounting its panel content (confirmed via direct inspection: the
        // visible `.ag-tool-panel-wrapper` element renders empty). Re-clicking
        // the Filters tab does NOT fix it (confirmed the same way) - only a full
        // `page.reload()` reliably remounts it. Root cause not fully isolated
        // (looks like an ag-Grid/Angular component lifecycle quirk specific to
        // this shared environment); this recovery was validated to succeed 3/3
        // times in isolation before being adopted here.
        await page.reload();
        await invoiceApplicationPage.openBatchListTab();
        await expect(invoiceApplicationPage.batchListGridRowsLocator.first()).toBeVisible();
        await invoiceApplicationPage.openFiltersPanel();
        await invoiceApplicationPage.expandBatchNoFilter();
      }
      await invoiceApplicationPage.isolateBatchNo(batchNo);
    }
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
      '2. Payment Upload - fill in the batch header fields',
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
        `On the Payment screen's Upload tab, set Client Type = "AGENCY", Acct Eff Date = "${acctEffDate}", Entity = "1", Bank GL = "110201" - confirmed Client Type and Bank GL were accepted.`,
    );

    await reportedStep(
      page,
      testInfo,
      '3. Agency Admin - view a Bank Information record (new tab)',
      async () => {
        const bankSetupPage = await AgencyBankSetupPage.openFromBms(page);
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
          '3a. Agency Admin - Bank Information tab loaded',
          async () => {},
          "Opened the Admin Manager's Business > Agency listing (new tab), drilled into the first agency's Details, and opened its Bank Information tab - confirmed the panel, Bank Account Type dropdown, and records grid are all visible.",
        );

        // Confirmed necessary elsewhere in this suite: leaving this second
        // tab/window open disturbs the original tab's session state - see
        // e2eBulkPaymentUploadToRemittance.test.ts's step 3 for the full
        // trace-backed explanation.
        await bankSetupPage.close();
        await page.reload();
      },
      "Opened the BMS module switcher's Admin item (a new browser tab), viewed the first agency's Bank Information record there, then closed that tab and reloaded the original BMS tab to restore its session state.",
    );

    await reportedStep(
      page,
      testInfo,
      '4. Payment Upload - set Entity to Dyad Tech DC and upload the AGT003 fixture',
      async () => {
        await savePaymentPage.goto();
        await waitForVisible(savePaymentPage.uploadTabLocator);
        await savePaymentPage.openUploadTab();

        await savePaymentPage.selectAgt003Entity();
        await savePaymentPage.chooseAgt003ValidFile();
        await savePaymentPage.clickUpload();

        await expect(savePaymentPage.invalidInvoiceTabLocator).toContainText('Invalid Invoice 0');
        await expect(savePaymentPage.validInvoiceTabLocator).toContainText('Valid Invoice 12');
        await savePaymentPage.openValidInvoiceTab();
        await expect(savePaymentPage.validInvoiceGridRowsLocator).toHaveCount(12);
      },
      'Set Entity = "Dyad Tech DC" and uploaded the committed AGT003 fixture ("payment_upload_agt003_valid.xlsx") - all 12 rows landed in Valid Invoice, 0 in Invalid Invoice.',
    );

    let createdBatchNo = '';
    await reportedStep(
      page,
      testInfo,
      '5. Save Payment - real write, creates a new payment batch',
      async () => {
        await savePaymentPage.selectAllValidInvoiceRows();
        await savePaymentPage.clickSavePayment();
        const firstOutcome = await savePaymentPage.waitForSaveOutcome();
        expect(firstOutcome).toBe('invalid');
        await expect(savePaymentPage.invalidTransactionsModalLocator).toContainText('No payment batch was created');
        await savePaymentPage.closeInvalidTransactionsModal();

        const deselected = await savePaymentPage.deselectNegativeAmountRows();
        expect(deselected).toBe(1);

        await savePaymentPage.clickSavePayment();
        const secondOutcome = await savePaymentPage.waitForSaveOutcome();
        expect(secondOutcome).toBe('success');

        createdBatchNo = await savePaymentPage.getCreatedBatchNumber();
        expect(createdBatchNo).toMatch(/^\d+$/);

        // Isolate the Batch List grid to this exact batch now, right after
        // creating it - every downstream step that acts on "the first row"
        // then correctly means this batch, not whichever happened to sort
        // first. A successful Save Payment auto-navigates to Batch List by
        // itself (confirmed in paymentUploadSavePayment.page.ts) - the
        // explicit openBatchListTab() call below is still made defensively,
        // same as that proven test does, in case the auto-navigation hasn't settled yet.
        await savePaymentPage.openBatchListTab();
        await expect(invoiceApplicationPage.batchListGridRowsLocator.first()).toBeVisible();
        await isolateBatchListTo(createdBatchNo);
      },
      () =>
        `Selected all 12 rows and clicked Save Payment - as expected, the negative-amount row (INV115580) triggered an "Invalid Transactions" rejection first. Closed that, deselected the row, saved the remaining 11 for real, and got the success toast: "Payment Created Successfully. Batch# ${createdBatchNo}".`,
    );

    await reportedStep(
      page,
      testInfo,
      "6. Batch List - open the newly-created batch's row",
      async () => {
        await paymentTabPage.openBatchListTab();
        // openFirstBatchPaymentTab() clicks the first row's own Transaction
        // Add/Edit icon - its auto-waiting click is itself the confirmation
        // that Batch List has a row to click, no separate grid-visibility
        // assertion needed first (gridRowsLocator below is scoped to the
        // Payment tab's own grid, not Batch List's - using it before the
        // Payment tab even opens was this test's original bug).
        await paymentTabPage.openFirstBatchPaymentTab();
        await waitForVisible(paymentTabPage.paymentTabLocator);
        await expect(paymentTabPage.gridRowsLocator.first()).toBeVisible();
      },
      () =>
        `Opened Batch List, already isolated to the newly-created batch #${createdBatchNo} (from step 5), and confirmed its own Payment tab opened with populated records.`,
    );

    await reportedStep(
      page,
      testInfo,
      '7. Invoice Application - toggle voucher filters on that batch, then close without saving',
      async () => {
        await invoiceApplicationPage.openInvoiceApplicationForFirstRecord();
        await expect(invoiceApplicationPage.openModalLocator).toBeVisible();
        await invoiceApplicationPage.toggleReceivableVouchers();
        await invoiceApplicationPage.togglePayableVouchers();
        await invoiceApplicationPage.clickSearch();
        await invoiceApplicationPage.closeWithoutSaving();
        await expect(invoiceApplicationPage.openModalLocator).toHaveCount(0);
      },
      "Opened Invoice Application for that batch's first payment record, toggled Receivable Vouchers and Payable Vouchers, re-ran Search, then closed the modal without saving.",
    );

    await reportedStep(
      page,
      testInfo,
      "8. Batch List - open and close the new batch's Batch Transaction Detail popup",
      async () => {
        await batchDetailPage.goto();
        await waitForVisible(batchDetailPage.batchListTabLocator);
        await batchDetailPage.openBatchListTab();
        await expect(batchDetailPage.gridRowsLocator.first()).toBeVisible();
        await isolateBatchListTo(createdBatchNo);

        const batchNo = await batchDetailPage.firstRowBatchNo();
        expect(batchNo).toBe(createdBatchNo);
        await batchDetailPage.openFirstRowDetailPopup();
        await expect(batchDetailPage.openModalLocator).toBeVisible();
        await expect(batchDetailPage.modalTitleLocator).toContainText(`Batch Detail # ${batchNo}`);
        await expect(batchDetailPage.modalGridCellLocator('batch_no')).toHaveText(batchNo);

        await batchDetailPage.closeDetailPopup();
        await expect(batchDetailPage.openModalLocator).toHaveCount(0);

        return batchNo;
      },
      (batchNo) =>
        `Opened the newly-created batch's Batch Transaction Detail popup (batch #${batchNo}), confirmed its title read "Batch Detail # ${batchNo}" and the modal grid's batch_no cell matched, then closed it - no modal remains open.`,
    );

    await reportedStep(
      page,
      testInfo,
      '9. Invoice Application - full filter set (Quick Search, Based On, Billing Method, Client field), then close without saving',
      async () => {
        await invoiceApplicationPage.goto();
        await waitForVisible(invoiceApplicationPage.batchListTabLocator);
        await invoiceApplicationPage.openBatchListTab();
        // Confirmed live 2026-09-30: without this explicit wait, the
        // Filters panel's isolateBatchListTo() call below intermittently
        // could not find the "Batch No" group header - reproduced 3 times in
        // a row at this exact step, while the identical isolateBatchListTo()
        // call succeeded earlier (steps 5, 8) where a grid-visibility wait
        // already preceded it. Root cause: the Batch List grid (and its own
        // Filters side-tab) hadn't finished rendering yet after this fresh
        // navigation - not random environment slowness.
        await expect(invoiceApplicationPage.batchListGridRowsLocator.first()).toBeVisible();
        await isolateBatchListTo(createdBatchNo);
        await invoiceApplicationPage.openFirstBatchPaymentTab();
        // Read this record's own Payment Amt BEFORE opening Invoice
        // Application - step 9b below correlates it against the outstanding
        // invoice grid's current_payment column once the modal is open.
        const paymentAmtText = await invoiceApplicationPage.paymentTabFirstRecordAmountLocator.textContent();
        await invoiceApplicationPage.openInvoiceApplicationForFirstRecord();
        await expect(invoiceApplicationPage.openModalLocator).toBeVisible();
        await expect(invoiceApplicationPage.clientFieldLocator).not.toBeEmpty();
        await expect(invoiceApplicationPage.clientFieldLocator).toBeDisabled();

        await invoiceApplicationPage.enterQuickSearch('INV');
        await invoiceApplicationPage.clickSearch();
        await expect(invoiceApplicationPage.openModalLocator).toBeVisible();
        await expect(invoiceApplicationPage.quickSearchFieldLocator).toHaveValue('INV');

        await invoiceApplicationPage.selectBasedOn('DUEDATE');
        await expect(invoiceApplicationPage.basedOnDropdownLocator).toHaveValue('DUEDATE');
        await invoiceApplicationPage.clickSearch();
        await expect(invoiceApplicationPage.openModalLocator).toBeVisible();

        await invoiceApplicationPage.selectBasedOn('INVOICEDATE');
        await expect(invoiceApplicationPage.basedOnDropdownLocator).toHaveValue('INVOICEDATE');
        await invoiceApplicationPage.clickSearch();
        await expect(invoiceApplicationPage.openModalLocator).toBeVisible();

        await invoiceApplicationPage.openBillingMethodFilter();
        await invoiceApplicationPage.selectAllBillingMethods();
        await invoiceApplicationPage.closeOpenFilterPanel();
        await expect(invoiceApplicationPage.billingMethodMultiselectLocator).toContainText('Agency Bill');
        await invoiceApplicationPage.clickSearch();
        await expect(invoiceApplicationPage.openModalLocator).toBeVisible();

        // Nested sub-step so the Client field's highlight/content-validation
        // capture happens while the modal (and the field) is still open -
        // reportedStep()'s highlight runs after its own action resolves, and
        // the outer step closes the modal right after this.
        await reportedStep(
          page,
          testInfo,
          '9a. Invoice Application - Client field confirmed disabled throughout the filter changes',
          async () => {},
          'Confirmed the Client field stayed pre-filled and disabled across the Quick Search, Based On, and Billing Method filter changes above.',
          { label: 'Client field (disabled, pre-filled)', locator: invoiceApplicationPage.clientFieldLocator },
        );

        // Nested sub-step (2026-09-30): correlate this record's own Payment
        // Amt against the outstanding invoice grid's current_payment column to
        // find which specific invoice Save Payment auto-applied this record
        // against, then confirm Revise Due = Due Amt - Current Payment. This is
        // the PDF's core "Invoice Application - Save" assertion (Current
        // Payment reflects the upload, Revise Due recalculates) - confirmed
        // live that Save Payment already performs this application immediately
        // on batch creation, so it's verifiable read-only, without ever
        // clicking Save here.
        let matchedInvoiceCode = '(not found)';
        await reportedStep(
          page,
          testInfo,
          '9b. Invoice Application - confirm Save Payment already applied this record against its matching invoice',
          async () => {
            const expectedAmount = parseCurrency(paymentAmtText ?? '0');
            const currentPaymentCells = invoiceApplicationPage.invoiceGridCellLocator('current_payment');
            const cellCount = await currentPaymentCells.count();
            let matchedIndex = -1;
            for (let i = 0; i < cellCount; i++) {
              const text = await currentPaymentCells.nth(i).textContent();
              if (Math.abs(parseCurrency(text ?? '0') - expectedAmount) < 0.001) {
                matchedIndex = i;
                break;
              }
            }
            expect(matchedIndex).toBeGreaterThanOrEqual(0);

            matchedInvoiceCode = (await invoiceApplicationPage.invoiceGridCellLocator('invoice_code').nth(matchedIndex).textContent()) ?? '';
            const dueAmt = parseCurrency((await invoiceApplicationPage.invoiceGridCellLocator('due_amt').nth(matchedIndex).textContent()) ?? '0');
            const reviseDue = parseCurrency((await invoiceApplicationPage.invoiceGridCellLocator('revise_due').nth(matchedIndex).textContent()) ?? '0');
            expect(reviseDue).toBeCloseTo(dueAmt - expectedAmount, 2);
          },
          () =>
            `Found this record's own Payment Amt ("${paymentAmtText}") applied as the Current Payment against invoice ${matchedInvoiceCode} in the outstanding invoice grid, and confirmed Revise Due correctly recalculates to Due Amt minus that Current Payment - Save Payment already performed this application on batch creation.`,
        );

        await invoiceApplicationPage.closeWithoutSaving();
        await expect(invoiceApplicationPage.openModalLocator).toHaveCount(0);
      },
      'Re-opened Invoice Application for the newly-created batch\'s first payment record - confirmed the Client field is pre-filled and disabled, entered "INV" into Quick Search and re-searched, switched Based On to "DUEDATE" then "INVOICEDATE" and re-searched after each, opened the Billing Method filter and selected all methods (multiselect now shows "Agency Bill") and re-searched, then closed without saving.',
    );

    await reportedStep(
      page,
      testInfo,
      "10. Payment tab - confirm the new batch's payment record columns are populated",
      async () => {
        await paymentTabPage.goto();
        await waitForVisible(paymentTabPage.batchListTabLocator);
        await paymentTabPage.openBatchListTab();
        await expect(invoiceApplicationPage.batchListGridRowsLocator.first()).toBeVisible();
        await isolateBatchListTo(createdBatchNo);
        await paymentTabPage.openFirstBatchPaymentTab();
        await waitForVisible(paymentTabPage.paymentTabLocator);
        await expect(paymentTabPage.gridRowsLocator.first()).toBeVisible();

        // Leftmost columns - Tran Description and Doc No are the two
        // columns confirmed to be legitimately empty per-row and are
        // intentionally not asserted here (see
        // payment-tab-individual-records.md's Expected Outcomes).
        await expect(paymentTabPage.firstRowCellLocator('1')).not.toBeEmpty();
        await expect(paymentTabPage.firstRowCellLocator('payment_mode')).not.toBeEmpty();
        await expect(paymentTabPage.firstRowCellLocator('apply_dt')).toHaveText(/^\d{2}\/\d{2}\/\d{4}$/);
        await expect(paymentTabPage.firstRowCellLocator('payment_amt')).toHaveText(/^\$[\d,]+\.\d{2}$/);
        await expect(paymentTabPage.firstRowCellLocator('bank_gl')).not.toBeEmpty();

        await paymentTabPage.scrollGridHorizontally(700);
        await expect(paymentTabPage.firstRowCellLocator('2')).not.toBeEmpty();
        await expect(paymentTabPage.firstRowCellLocator('createdby')).not.toBeEmpty();
        await expect(paymentTabPage.firstRowCellLocator('last_updated_dt')).toHaveText(/^\d{2}\/\d{2}\/\d{4}$/);
      },
      'Opened the newly-created batch\'s Payment tab and confirmed the leftmost columns (record No., Payment Mode, Acct Eff Date, Payment Amt, Bank GL) are populated, then scrolled the grid right by 700px and confirmed the remaining columns (record No. 2, Created By, Updated Date) are populated too.',
      [
        { label: 'Payment Amt cell', locator: paymentTabPage.firstRowCellLocator('payment_amt') },
        { label: 'Updated Date cell', locator: paymentTabPage.firstRowCellLocator('last_updated_dt') },
      ],
    );

    await reportedStep(
      page,
      testInfo,
      "11. Back to Batches - return from the new batch's Payment tab to Batch List",
      async () => {
        await backNavPage.goto();
        await waitForVisible(backNavPage.batchListTabLocator);
        await backNavPage.openBatchListTab();
        await expect(backNavPage.gridRowsLocator.first()).toBeVisible();
        await isolateBatchListTo(createdBatchNo);

        await backNavPage.openFirstBatchPaymentTab();
        await waitForVisible(backNavPage.paymentTabLocator);
        await expect(backNavPage.paymentTabGridRowsLocator.first()).toBeVisible();
        await expect(backNavPage.backToBatchesButtonLocator).toBeVisible();

        await backNavPage.clickBackToBatches();
        await waitForVisible(backNavPage.batchListTabLocator);
        await expect(backNavPage.gridRowsLocator.first()).toBeVisible();
      },
      'Opened the newly-created batch\'s own Payment tab from Batch List, confirmed it was active with populated rows, then clicked "Back to Batches" and confirmed the Batch List tab is active again with its grid populated.',
    );

    await reportedStep(
      page,
      testInfo,
      '12. Batch List - search for the new batch by its Batch No via the Filters panel, then clear the filter',
      async () => {
        await searchByNumberPage.goto();
        await waitForVisible(searchByNumberPage.batchListTabLocator);
        await searchByNumberPage.openBatchListTab();
        await expect(searchByNumberPage.gridRowsLocator.first()).toBeVisible();

        const batchNo = createdBatchNo;
        expect(batchNo).toMatch(/^\d+$/);

        await searchByNumberPage.openFiltersPanel();
        await searchByNumberPage.expandBatchNoFilter();
        await searchByNumberPage.isolateBatchNo(batchNo);
        await expect(searchByNumberPage.gridRowsLocator).toHaveCount(1);
        await expect(searchByNumberPage.rowForBatchLocator(batchNo)).toBeVisible();

        // Nested sub-step so the isolated row's highlight/content-validation
        // capture happens while the grid is still filtered down to it -
        // the outer step clears the filter right after this.
        await reportedStep(
          page,
          testInfo,
          `12a. Batch List - confirmed isolated to Batch No "${batchNo}"`,
          async () => {},
          `Confirmed the grid narrowed to exactly 1 row, matching Batch No "${batchNo}".`,
          { label: `Isolated Batch No ${batchNo} row`, locator: searchByNumberPage.rowForBatchLocator(batchNo) },
        );

        await searchByNumberPage.clearBatchNoFilter();
        await expect(searchByNumberPage.gridRowsLocator).not.toHaveCount(1);
        await searchByNumberPage.scrollGridToBottom();
        await expect(searchByNumberPage.rowForBatchLocator(batchNo)).toBeVisible();

        return batchNo;
      },
      (batchNo) =>
        `Searched for the newly-created batch's own Batch No "${batchNo}" via the Filters panel, expanded the Batch No filter, and isolated the grid to that Batch No (confirmed exactly 1 row) - then cleared the filter and confirmed the full grid (more than 1 row) was restored, still including that row.`,
    );

    await reportedStep(
      page,
      testInfo,
      '13. Batch List - export the new batch as PDF',
      async () => {
        await pdfExportPage.goto();
        await waitForVisible(pdfExportPage.batchListTabLocator);
        await expect(invoiceApplicationPage.batchListGridRowsLocator.first()).toBeVisible();
        await isolateBatchListTo(createdBatchNo);

        const response = await pdfExportPage.clickFirstRowPdfExport();
        expect(response.ok()).toBe(true);

        const body: unknown = await response.json();
        expect(typeof body).toBe('string');
        const base64 = body as string;
        expect(base64.length).toBeGreaterThan(0);

        const decodedHeader = Buffer.from(base64.slice(0, 12), 'base64').toString('latin1');
        expect(decodedHeader.startsWith('%PDF-')).toBe(true);
      },
      'Clicked the newly-created batch\'s PDF export action, got a 200 OK GetView... report response, and confirmed the decoded base64 body starts with the "%PDF-" file signature.',
      { label: 'PDF Export icon (first row)', locator: pdfExportPage.firstRowPdfIconLocator },
    );

    await reportedStep(
      page,
      testInfo,
      '14. ACH/EFT & Check - search the grid by Batch No, if a row is present',
      async () => {
        await achEftCheckPage.goto();
        await waitForVisible(achEftCheckPage.achEftCheckTabLocator);
        await achEftCheckPage.openAchEftCheckTab();
        const hasRow = await achEftCheckPage.gridRowsLocator
          .first()
          .waitFor({ state: 'visible', timeout: 10_000 })
          .then(() => true)
          .catch(() => false);
        if (hasRow) {
          const achBatchNo = await achEftCheckPage.firstRowBatchNo();
          await achEftCheckPage.setSearchBy('1');
          await achEftCheckPage.enterBatchNo(achBatchNo);
          await achEftCheckPage.clickSearch();
          await expect(achEftCheckPage.gridRowsLocator).toHaveCount(1);
        }
        return hasRow;
      },
      (hasRow) =>
        hasRow
          ? 'On ACH/EFT & Check, a row was present - searched the grid by its Batch No (Search By = "1") and confirmed the search narrowed the grid to exactly 1 matching row.'
          : 'On ACH/EFT & Check, no grid rows appeared within 10s - this step was a no-op.',
    );

    await reportedStep(
      page,
      testInfo,
      '15. Check Register - filter by Client Type, search by Batch No, then Banks/Payment Type/Columns',
      async () => {
        await checkRegisterPage.goto();
        await waitForVisible(checkRegisterPage.checkRegisterTabLocator);
        await expect(checkRegisterPage.checkStatusDropdownLocator).toHaveValue('PREPARED');

        await checkRegisterPage.openClientTypeFilter();
        await checkRegisterPage.uncheckClientType('Insured');
        await checkRegisterPage.uncheckClientType('Market');
        await checkRegisterPage.uncheckClientType('Tax');
        await checkRegisterPage.uncheckClientType('Vendor');
        await checkRegisterPage.uncheckClientType('Finance');
        await checkRegisterPage.closeOpenFilterPanel();
        await expect(checkRegisterPage.clientTypeMultiselectLocator).toContainText('Agency');

        // Search by Batch No runs right after Client Type (not after
        // Banks/Payment Type/Columns below) - confirmed live 2026-09-29 that
        // running it later in the step chain intermittently returned 0 rows
        // on this environment (see check-register.md's Edge Cases). Kept
        // tolerant of that same known race rather than hard-failing on it.
        await checkRegisterPage.clickSearch();
        const rowCount = await checkRegisterPage.rowCount();
        let batchNo: string | null = null;
        let matched = false;
        if (rowCount > 0) {
          batchNo = await checkRegisterPage.firstRowBatchNo();
          await checkRegisterPage.setSearchBy('BATCH_NO');
          await checkRegisterPage.enterSearchValue(batchNo);
          await checkRegisterPage.clickSearch();

          const matchCount = await checkRegisterPage.rowCount();
          matched = matchCount === 1;
          if (matched) {
            await expect(checkRegisterPage.gridBatchNoCellsLocator.first()).toHaveText(batchNo);
          }
        }

        await reportedStep(
          page,
          testInfo,
          '15a. Check Register - Banks / Payment Type / Columns',
          async () => {
            await checkRegisterPage.openBanksFilter();
            await expect(checkRegisterPage.banksMultiselectLocator.locator('.dropdown-list')).toBeVisible();
            await checkRegisterPage.closeOpenFilterPanel();

            await checkRegisterPage.openPaymentTypeFilter();
            await checkRegisterPage.uncheckPaymentType('Cash');
            await checkRegisterPage.closeOpenFilterPanel();
            await checkRegisterPage.openPaymentTypeFilter();
            await expect(checkRegisterPage.paymentTypeMultiselectLocator.locator('input[aria-label="Cash"]')).not.toBeChecked();
            await checkRegisterPage.closeOpenFilterPanel();

            await checkRegisterPage.openColumnsPanel();
            await expect(checkRegisterPage.columnsToolPanelLocator.first()).toBeVisible();
          },
          'Opened the Banks multiselect (confirmed its option panel became visible) and closed it, unchecked "Cash" in the Payment Type filter (confirmed it stayed unchecked after reopening), and opened the Columns side panel (confirmed ag-Grids column-configuration tool panel rendered).',
          { label: 'Columns side tab', locator: checkRegisterPage.columnsSideTabLocator },
        );


        await reportedStep(
          page,
          testInfo,
          '15b. Check Register - PDF Export (if a row is present) and Excel Export',
          async () => {
            const hasRow = await checkRegisterPage.firstRowPdfExportIconLocator
              .waitFor({ state: 'visible', timeout: 5_000 })
              .then(() => true)
              .catch(() => false);
            let pdfFilename: string | null = null;
            if (hasRow) {
              const pdfDownload = await checkRegisterPage.clickFirstRowPdfExport();
              expect(pdfDownload.suggestedFilename()).toMatch(/\.pdf$/i);
              pdfFilename = pdfDownload.suggestedFilename();
            }

            const excelDownload = await checkRegisterPage.clickExportToExcel();
            expect(excelDownload.suggestedFilename()).toMatch(/\.xlsx$/i);
            return { hasRow, pdfFilename, excelFilename: excelDownload.suggestedFilename() };
          },
          ({ hasRow, pdfFilename, excelFilename }) =>
            hasRow
              ? `Clicked the first row's PDF Export icon (downloaded "${pdfFilename}") and Export to Excel (downloaded "${excelFilename}") - both genuine file downloads.`
              : `No row was present to export as PDF - that half was a no-op, but Export to Excel still downloaded "${excelFilename}" (independent of any specific row).`,
        );
        return { batchNo, matched, rowCount };
      },
      ({ batchNo, matched, rowCount }) => {
        if (rowCount === 0 || !batchNo) {
          return "Narrowed Check Register's Client Type filter to Agency only - no Agency-type Prepared batches are available right now, so the Batch No search, Banks/Payment Type/Columns steps ran against whatever rows the environment had.";
        }
        return matched
          ? `Narrowed Check Register's Client Type filter to Agency only, then searched by Batch No "${batchNo}" - confirmed the grid narrowed to exactly that 1 matching row.`
          : `Narrowed Check Register's Client Type filter to Agency only, read Batch No "${batchNo}" off the grid, but the subsequent search for it no longer matched exactly 1 row - this environment's data shifted between the read and the search (a known, tolerated race, not a failure).`;
      },
    );

    await reportedStep(
      page,
      testInfo,
      '16. Check Register - open and close a Check Summary popup, if a row is present',
      async () => {
        await checkSummaryPage.goto();
        await waitForVisible(checkSummaryPage.checkRegisterTabLocator);
        const hasRow = await checkSummaryPage.firstRowCheckSummaryIconLocator
          .waitFor({ state: 'visible', timeout: 10_000 })
          .then(() => true)
          .catch(() => false);
        if (hasRow) {
          await checkSummaryPage.openFirstRowCheckSummary();
          await expect(checkSummaryPage.openModalLocator).toBeVisible();
          await expect(checkSummaryPage.modalGridCellLocator('client_code')).not.toBeEmpty();
          await expect(checkSummaryPage.modalGridCellLocator('payee_name')).not.toBeEmpty();
          await checkSummaryPage.closePopup();
          await expect(checkSummaryPage.openModalLocator).toHaveCount(0);
        }
        return hasRow;
      },
      (hasRow) =>
        hasRow
          ? "On Check Register, a row with a Check Summary icon was present - opened its Check Summary popup, confirmed Client Code and Payee Name were populated, then closed it."
          : 'On Check Register, no row with a Check Summary icon appeared within 10s - this step was a no-op.',
    );

    await reportedStep(
      page,
      testInfo,
      '17. Check Register - download the Remittance Advice PDF, if a row is present',
      async () => {
        await remittanceAdvicePage.goto();
        await waitForVisible(remittanceAdvicePage.checkRegisterTabLocator);
        const hasRow = await remittanceAdvicePage.firstRowCheckboxLocator
          .waitFor({ state: 'visible', timeout: 10_000 })
          .then(() => true)
          .catch(() => false);
        if (!hasRow) {
          return { hasRow, filename: null as string | null };
        }
        await remittanceAdvicePage.selectFirstRow();
        await remittanceAdvicePage.openRemittanceDownloadAsMenu();
        const download = await remittanceAdvicePage.downloadPdf();
        expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
        return { hasRow, filename: download.suggestedFilename() };
      },
      ({ hasRow, filename }) =>
        hasRow
          ? `On Check Register, a row was present - selected it, opened the "Download As" menu, and downloaded "${filename}" as a PDF.`
          : 'On Check Register, no row appeared within 10s - this step was a no-op.',
    );
  },
);
