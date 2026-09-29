import path from 'node:path';
import { test, expect } from '../../../framework/fixtures';
import { getCredential } from '../../../framework/utils/env';
import { reportedStep } from '../../../framework/utils/reportStep';
import { waitForVisible } from '../../../framework/utils/waits';
import { LoginPage } from '../login/login.page';
import { PaymentUploadSavePaymentPage } from './paymentUploadSavePayment.page';

const AGT003_FIXTURE_NAME = path.basename(
  path.join(__dirname, '..', 'fixtures', 'payment_upload_agt003_valid.xlsx'),
);

/**
 * From /alis_core/scenarios/alc_sc_payment_upload_save_payment.md, derived
 * from the "Payment Upload - File Selection & Validation" test scenario in
 * "ALIS Accounting - Bulk Payment Upload to Remittance - End-to-End Test
 * Cases" - the Valid Invoice / Save Payment half that
 * paymentUploadValidation.test.ts deliberately doesn't exercise. See
 * alis_core/knowledge/pages/payment-upload-file-validation.md.
 *
 * Uploads the committed AGT003 fixture (real invoices, confirmed 2026-09-28
 * to land 12/12 in Valid Invoice once Entity is set to "Dyad Tech DC"). One
 * of those 12 rows (INV115580) has a negative amount, which Save Payment
 * rejects with an "Invalid Transactions" modal and creates no batch at all
 * while it's selected - confirmed live via the user's own manual repro. This
 * spec reproduces that rejection deliberately, then deselects the row and
 * saves the remaining 11 for real - a genuine, consequential write that
 * creates a real payment batch. Not idempotent across re-runs: once this
 * succeeds, those same invoices are frozen in the new batch until it's
 * posted or deleted (see business-rules.md), so a re-run against unmodified
 * state is expected to stop at the Valid Invoice count assertion below
 * rather than reach Save Payment again.
 *
 * Every step below is wrapped in reportedStep() (see
 * framework/utils/reportStep.ts) instead of a bare test.step() - each one
 * logs exactly what was searched for / uploaded / confirmed (the real
 * filename, the real batch number, etc.), not just a static title, and
 * attaches a full-page screenshot, both inline in the Playwright HTML
 * report - so the report itself is readable without opening a trace.
 */
test(
  'Alis Core: standard agent can upload a valid payment file and Save Payment',
  {
    annotation: [
      { type: 'scenario', description: 'alc_sc_payment_upload_save_payment' },
      { type: 'product', description: 'alis_core' },
    ],
  },
  async ({ page }, testInfo) => {
    // clickUpload() can retry once with its own bounded wait; the two Save
    // Payment round trips (reject, then succeed) each have their own bounded
    // wait too - this environment has also shown occasional slow post-login
    // redirects and other timing variance run to run (confirmed 2026-09-28
    // across four consecutive live runs, each of which *did* complete the
    // real write correctly: total duration ranged from ~20s to over 3
    // minutes for otherwise-identical runs. Confirmed again 2026-09-29: one run
    // consumed nearly the full 300s just on the write itself (Save Payment +
    // getCreatedBatchNumber()), leaving no room for the follow-up Batch List
    // verification steps before the outer timeout force-closed the browser mid-
    // navigation (batch #39326 was still created for real that run). Bumped to
    // 480s accordingly.
    // Set generously rather than tight - this is a real-write spec run
    // deliberately and individually, not part of a tight CI budget.
    test.setTimeout(480_000);

    const loginPage = new LoginPage(page);
    const savePaymentPage = new PaymentUploadSavePaymentPage(page);

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
      'Set Entity to Dyad Tech DC and upload the AGT003 fixture',
      async () => {
        await savePaymentPage.goto();
        await waitForVisible(savePaymentPage.uploadTabLocator);
        await savePaymentPage.openUploadTab();

        await savePaymentPage.selectAgt003Entity();
        await savePaymentPage.chooseAgt003ValidFile();
        await savePaymentPage.clickUpload();
      },
      `On the Payment screen's Upload tab: set Entity = "Dyad Tech DC", chose the file "${AGT003_FIXTURE_NAME}" (the committed real-AGT003 fixture, 12 invoice rows), and clicked Upload.`,
    );

    await reportedStep(
      page,
      testInfo,
      'Confirm all 12 rows landed in Valid Invoice',
      async () => {
        // If invoices are locked in another batch at run time, this won't
        // hold - see business-rules.md's frozen-invoice rule. That's an
        // environment/data-state condition, not a code regression; this
        // assertion is meant to fail loudly rather than silently proceed.
        await expect(savePaymentPage.invalidInvoiceTabLocator).toContainText('Invalid Invoice 0');
        await expect(savePaymentPage.validInvoiceTabLocator).toContainText('Valid Invoice 12');

        await savePaymentPage.openValidInvoiceTab();
        await expect(savePaymentPage.validInvoiceGridRowsLocator).toHaveCount(12);
      },
      'After Upload, the file split into 2 tabs: "Valid Invoice 12" and "Invalid Invoice 0" - confirmed all 12 uploaded rows resolved to real, unlocked, entity-matching invoices with none rejected.',
      [
        { label: 'Valid Invoice tab', locator: savePaymentPage.validInvoiceTabLocator },
        { label: 'Invalid Invoice tab', locator: savePaymentPage.invalidInvoiceTabLocator },
      ],
    );

    await reportedStep(
      page,
      testInfo,
      'Select all rows and confirm the negative-amount row is rejected',
      async () => {
        await savePaymentPage.selectAllValidInvoiceRows();
        await expect(savePaymentPage.totalPaymentAmountTextLocator).not.toContainText('$0.00');

        await savePaymentPage.clickSavePayment();
        const outcome = await savePaymentPage.waitForSaveOutcome();
        expect(outcome).toBe('invalid');
        await expect(savePaymentPage.invalidTransactionsModalLocator).toContainText('No payment batch was created');
        await savePaymentPage.closeInvalidTransactionsModal();
      },
      'Selected all 12 Valid Invoice rows (via the header "select all" checkbox) and clicked Save Payment. As expected, row INV115580 (-$10.00, a negative amount) made the whole save attempt fail: an "Invalid Transactions" modal reported "No payment batch was created". Closed the modal without saving.',
      { label: 'Total Payment Amount', locator: savePaymentPage.totalPaymentAmountTextLocator },
    );

    await reportedStep(
      page,
      testInfo,
      'Deselect the negative-amount row and Save Payment for real',
      async () => {
        const deselected = await savePaymentPage.deselectNegativeAmountRows();
        expect(deselected).toBe(1);
        await testInfo.attach('Deselect the negative-amount row and Save Payment for real - log', {
          body: `Deselected ${deselected} row (INV115580, the -$10.00 row) from the selection, leaving 11 valid rows selected. Clicking Save Payment again.`,
          contentType: 'text/plain',
        });

        await savePaymentPage.clickSavePayment();
        const outcome = await savePaymentPage.waitForSaveOutcome();
        expect(outcome).toBe('success');

        const batchNo = await savePaymentPage.getCreatedBatchNumber();
        expect(batchNo).toMatch(/^\d+$/);

        await reportedStep(
          page,
          testInfo,
          `Confirm batch #${batchNo} exists in Batch List and isolate its row`,
          async () => {
            // Isolates the grid to exactly this batch via the Filters panel's
            // (Select All) recipe (same mechanism already proven in
            // alis_core/tests/batch_list_search_by_number and reused by
            // invoiceApplication.page.ts) instead of scrolling to find it -
            // this also sidesteps ag-Grid's row virtualization entirely,
            // since the isolated grid has exactly one row, always rendered.
            await savePaymentPage.openBatchListTab();
            await savePaymentPage.openFiltersPanel();
            await savePaymentPage.expandBatchNoFilter();
            await savePaymentPage.isolateBatchNo(batchNo);
            await expect(savePaymentPage.batchListRowLocator(batchNo)).toBeVisible();
          },
          `Save Payment succeeded - the app's own success toast reported "Payment Created Successfully. Batch# ${batchNo}". Navigated to Batch List, isolated the grid to Batch No "${batchNo}" via the Filters panel, and confirmed its row is now visible, proving the write actually persisted server-side (not just a client-side success message).`,
          { label: `Batch #${batchNo} row`, locator: savePaymentPage.batchListRowLocator(batchNo) },
        );

        await reportedStep(
          page,
          testInfo,
          `Verify batch #${batchNo}'s own row columns (New Batch Verification)`,
          async () => {
            // This is the "New Batch Verification" PDF scenario's
            // genuinely-new-batch half that batchListVerification.test.ts
            // deliberately doesn't cover (that spec verifies an arbitrary
            // existing row instead, since it never performs a real write).
            await expect(savePaymentPage.batchListCellForBatchLocator(batchNo, 'batch_no')).toHaveText(batchNo);
            await expect(savePaymentPage.batchListCellForBatchLocator(batchNo, 'client_type_text')).toHaveText('Agency');
            await expect(savePaymentPage.batchListCellForBatchLocator(batchNo, 'batch_desc')).not.toBeEmpty();
            await expect(savePaymentPage.batchListCellForBatchLocator(batchNo, 'paid_amt')).toHaveText(/^\$[\d,]+\.\d{2}$/);
            await expect(savePaymentPage.batchListCellForBatchLocator(batchNo, 'batch_amt')).toHaveText(/^\$[\d,]+\.\d{2}$/);
            await expect(savePaymentPage.batchListCellForBatchLocator(batchNo, 'batch_adj_amt')).toHaveText(/^\$[\d,]+\.\d{2}$/);

            await savePaymentPage.scrollBatchListGridHorizontally(700);
            await expect(savePaymentPage.batchListCellForBatchLocator(batchNo, 'bank_gl')).not.toBeEmpty();
            await expect(savePaymentPage.batchListCellForBatchLocator(batchNo, 'bank_name')).not.toBeEmpty();
            await expect(savePaymentPage.batchListCellForBatchLocator(batchNo, 'status_text')).not.toBeEmpty();
            await expect(savePaymentPage.batchListCellForBatchLocator(batchNo, 'is_ach')).toHaveText(/Yes|No/);
          },
          `Confirmed batch #${batchNo}'s own row (isolated via the Filters panel, not just any row) has Client Type = "Agency", a non-empty Batch Description, Paid/Batch/Adj Amounts formatted as currency, and, after scrolling right, non-empty Bank GL/Bank Name/Status with Is ACH reading "Yes" or "No" - the newly-created batch's data, not an arbitrary pre-existing one.`,
          [
            { label: `Batch #${batchNo} - Client Type cell`, locator: savePaymentPage.batchListCellForBatchLocator(batchNo, 'client_type_text') },
            { label: `Batch #${batchNo} - Paid Amt cell`, locator: savePaymentPage.batchListCellForBatchLocator(batchNo, 'paid_amt') },
          ],
        );

        await reportedStep(
          page,
          testInfo,
          `Verify batch #${batchNo}'s own Payment tab individual records`,
          async () => {
            // Opens the SPECIFIC batch this run just created (not "whichever is
            // first" - see paymentTabIndividualRecords.test.ts, which verifies an
            // arbitrary existing batch instead, since it never performs a real
            // write). Same column set/verification as that spec, applied here to
            // the genuinely-new batch - this is the "New Batch Verification" PDF
            // scenario's Payment-tab half. The grid is still isolated to this one
            // batch from the previous step, so its Add/Edit icon is simply the
            // first (and only) one.
            await savePaymentPage.openIsolatedBatchPaymentTab();
            await expect(savePaymentPage.firstPaymentRowCellLocator('1')).not.toBeEmpty();
            await expect(savePaymentPage.firstPaymentRowCellLocator('payment_mode')).not.toBeEmpty();
            await expect(savePaymentPage.firstPaymentRowCellLocator('apply_dt')).toHaveText(/^\d{2}\/\d{2}\/\d{4}$/);
            await expect(savePaymentPage.firstPaymentRowCellLocator('payment_amt')).toHaveText(/^\$[\d,]+\.\d{2}$/);
            await expect(savePaymentPage.firstPaymentRowCellLocator('bank_gl')).not.toBeEmpty();

            await savePaymentPage.scrollPaymentGridHorizontally(700);
            await expect(savePaymentPage.firstPaymentRowCellLocator('2')).not.toBeEmpty();
            await expect(savePaymentPage.firstPaymentRowCellLocator('createdby')).not.toBeEmpty();
            await expect(savePaymentPage.firstPaymentRowCellLocator('last_updated_dt')).toHaveText(/^\d{2}\/\d{2}\/\d{4}$/);
          },
          `Opened batch #${batchNo}'s own Payment tab (not an arbitrary existing batch) and confirmed its individual payment record columns are populated: record number, Payment Mode, Apply Date, Payment Amount, Bank GL, second record-number field, Created By, and Last Updated Date.`,
          [
            { label: 'Apply Date cell', locator: savePaymentPage.firstPaymentRowCellLocator('apply_dt') },
            { label: 'Payment Amt cell', locator: savePaymentPage.firstPaymentRowCellLocator('payment_amt') },
          ],
        );
      },
    );
  },
);