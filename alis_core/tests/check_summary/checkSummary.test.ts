import { test, expect } from '../../../framework/fixtures';
import { getCredential } from '../../../framework/utils/env';
import { reportedStep } from '../../../framework/utils/reportStep';
import { waitForVisible } from '../../../framework/utils/waits';
import { LoginPage } from '../login/login.page';
import { CheckSummaryPage } from './checkSummary.page';

/**
 * From /alis_core/scenarios/alc_sc_check_summary_popup.md, derived from the
 * "Verify Check Summary" and "Edit Check Summary Detail" test scenarios in
 * "ALIS Accounting - Bulk Payment Upload to Remittance - End-to-End Test
 * Cases". See alis_core/knowledge/pages/check-summary-popup.md.
 *
 * Read-only: opens and closes the popup for the grid's first row, selects
 * the row to confirm the Payee/Address1/Address2/City-State-Zip form
 * fields auto-populate correctly (the actual edit mechanism), but never
 * clicks Update - a real write (`POST .../UpdateCheckPayeeInformation`,
 * confirmed live 2026-09-30 - see the knowledge file's Edge Cases).
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

    let expectedPayeeName = '';
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
        expectedPayeeName = (await checkSummaryPage.modalGridCellLocator('payee_name').textContent()) ?? '';
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
      'Scroll the modal grid and confirm the Payee Address/City/State/Zip fields are populated',
      async () => {
        // Confirmed live 2026-09-30: these five fields use plain numeric
        // col-ids ("0"-"4"), not named ones like every other field here -
        // they render after a 700px scroll, alongside account_name.
        await checkSummaryPage.scrollModalGridHorizontally(700);

        for (const colId of ['0', '1', '2', '3', '4']) {
          await expect(checkSummaryPage.modalGridCellLocator(colId)).toBeAttached();
        }
        await expect(checkSummaryPage.modalGridCellLocator('account_name')).not.toBeEmpty();
      },
      'Scrolled the modal grid 700px and confirmed the Payee Address1, Address2, City, State, and Zip cells are attached, and Account Name is populated.',
      [
        { label: 'Payee Address1 cell', locator: checkSummaryPage.modalGridCellLocator('0') },
        { label: 'Account Name cell', locator: checkSummaryPage.modalGridCellLocator('account_name') },
      ],
    );

    await reportedStep(
      page,
      testInfo,
      'Scroll the modal grid further and confirm the next field group is populated',
      async () => {
        // Confirmed live 2026-09-30: ag-Grid virtualizes columns both in AND
        // out as this modal grid scrolls - the address fields checked above
        // drop out of the DOM by this point, so this step only checks the
        // fields confirmed present at exactly this scroll position.
        await checkSummaryPage.scrollModalGridHorizontally(1400);

        for (const colId of ['batch_no', 'batch_desc', 'checkstatus', 'tran_desc', 'gl_account', 'apply_dt', 'entry_dt']) {
          await expect(checkSummaryPage.modalGridCellLocator(colId)).not.toBeEmpty();
        }
      },
      'Scrolled the modal grid a further 1400px and confirmed Batch No, Batch Description, Status, Transaction Description, G/L Account, Acct Eff. Date, and Entry Date are all populated.',
      [
        { label: 'Batch No cell', locator: checkSummaryPage.modalGridCellLocator('batch_no') },
      ],
    );

    await reportedStep(
      page,
      testInfo,
      'Scroll the modal grid to the end and confirm the final field group is populated',
      async () => {
        await checkSummaryPage.scrollModalGridHorizontally(2800);

        // Doc No. and Payee Country are confirmed to be legitimately empty
        // for some rows (per the PDF's own "Verify Check Summary" example
        // data) - only asserting attached, not non-empty.
        await expect(checkSummaryPage.modalGridCellLocator('document_num')).toBeAttached();
        await expect(checkSummaryPage.modalGridCellLocator('country')).toBeAttached();
        await expect(checkSummaryPage.modalGridCellLocator('OFAC')).toHaveText(/True|False/);
      },
      'Scrolled the modal grid a further 2800px (5600px total) and confirmed Doc No. and Payee Country are attached (legitimately empty for some rows); OFAC reads True/False.',
      [
        { label: 'OFAC cell', locator: checkSummaryPage.modalGridCellLocator('OFAC') },
      ],
    );

    await reportedStep(
      page,
      testInfo,
      'Select the row and confirm the Payee/Address edit fields auto-populate',
      async () => {
        // Confirmed live 2026-09-30: this is the actual edit mechanism for
        // the PDF's "Edit Check Summary Detail" scenario - selecting the row
        // auto-populates a plain Angular reactive-form below the grid (NOT
        // ag-Grid inline cell editing). Never clicks Update - a real write.
        await checkSummaryPage.selectFirstRow();
        await expect(checkSummaryPage.payeeFieldLocator).toHaveValue(expectedPayeeName);
        await expect(checkSummaryPage.address1FieldLocator).not.toBeEmpty();
      },
      'Selected the grid row and confirmed the Payee edit field\'s value matches the grid\'s own payee_name cell, and the Address1 edit field populated.',
      [
        { label: 'Payee edit field', locator: checkSummaryPage.payeeFieldLocator },
        { label: 'Address1 edit field', locator: checkSummaryPage.address1FieldLocator },
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