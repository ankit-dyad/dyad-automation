import { test, expect } from '../../../framework/fixtures';
import { getCredential } from '../../../framework/utils/env';
import { reportedStep } from '../../../framework/utils/reportStep';
import { waitForVisible } from '../../../framework/utils/waits';
import { LoginPage } from '../login/login.page';
import { AgencyBankSetupPage } from './agencyBankSetup.page';

/**
 * From /alis_core/scenarios/alc_sc_agency_bank_setup.md, derived from the
 * "Agency Admin - Bank Setup" test scenario in "ALIS Accounting - Bulk
 * Payment Upload to Remittance - End-to-End Test Cases". See
 * alis_core/knowledge/pages/agency-bank-setup.md.
 *
 * Opens Admin Manager in a genuinely new tab/window (captured via
 * `context.waitForEvent('page')`, not something this repo's interactive
 * exploration tooling could do — see the knowledge file's Edge Cases for why
 * that distinction matters).
 *
 * Never clicks Add — real write, creates a new bank account record for the
 * agency (see payment-batch-list.md's "Create Batch performs a real write"
 * note, same caution class).
 */
test(
  'Alis Core: standard agent can view an agency\'s Bank Information records',
  {
    annotation: [
      { type: 'scenario', description: 'alc_sc_agency_bank_setup' },
      { type: 'product', description: 'alis_core' },
    ],
  },
  async ({ page }, testInfo) => {
    // Confirmed live 2026-09-28: this flow's default 30s budget isn't enough
    // — it opens a second, genuinely separate popup window (Admin Manager, a
    // classic ASP.NET WebForms app, generally slower/postback-heavy) and then
    // does several real navigations inside it (Business > Agency listing,
    // first agency's Details tab, Bank Information tab). A run timed out at
    // exactly 30000ms with no thrown error, consistent with simply running
    // out of budget partway through, not a hang.
    test.setTimeout(60_000);

    const loginPage = new LoginPage(page);

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

    const bankSetupPage = await reportedStep(
      page,
      testInfo,
      'Open Admin Manager (captures the new tab/window)',
      async () => AgencyBankSetupPage.openFromBms(page),
      'Triggered the Admin Manager launch action and captured the resulting new tab/window via context.waitForEvent("page").',
    );

    await reportedStep(
      bankSetupPage.adminPage,
      testInfo,
      'Navigate to Business > Agency and open the first agency',
      async () => {
        await bankSetupPage.openBusinessAgencyListing();
        await expect(bankSetupPage.agencyGridLocator).toBeVisible();

        await bankSetupPage.openFirstAgencyDetails();
        await expect(bankSetupPage.detailsTabLocator).toBeVisible();
      },
      'In Admin Manager, navigated to Business > Agency, confirmed the agency grid rendered, then opened the first agency row and confirmed its Details tab is visible.',
      [
        { label: 'Agency grid', locator: bankSetupPage.agencyGridLocator },
        { label: 'Details tab', locator: bankSetupPage.detailsTabLocator },
      ],
    );

    await reportedStep(
      bankSetupPage.adminPage,
      testInfo,
      'Open the Bank Information tab and confirm its form and records grid',
      async () => {
        await bankSetupPage.openBankInformationTab();
        await expect(bankSetupPage.bankInformationPanelLocator).toBeVisible();

        await expect(bankSetupPage.bankAccountTypeDropdownLocator).toBeVisible();
        await expect(bankSetupPage.statusDropdownLocator).toBeVisible();
        await expect(bankSetupPage.accountNumberFieldLocator).toBeVisible();
        await expect(bankSetupPage.addButtonLocator).toBeVisible();

        // At least the header row — this agency's number of bank records can
        // vary over time on this production-looking environment, so no
        // assumption is made about data rows beyond the grid rendering.
        await expect(bankSetupPage.recordsGridLocator).toBeVisible();
      },
      'Opened the first agency\'s Bank Information tab: confirmed the panel, the Bank Account Type dropdown, Status dropdown, Account Number field, Add button, and the records grid are all visible — Add was never clicked.',
      [
        { label: 'Bank Information panel', locator: bankSetupPage.bankInformationPanelLocator },
        { label: 'Bank records grid', locator: bankSetupPage.recordsGridLocator },
      ],
    );
  },
);
