import { test, expect } from '../../../framework/fixtures';
import { getCredential } from '../../../framework/utils/env';
import { takeScreenshot } from '../../../framework/utils/screenshot';
import { LoginPage } from '../login/login.page';
import { EditPolicyPage } from './edit_policy.page';

/**
 * Nexsure: find an existing client via global header search, open one of
 * their policies' "≡" row menu, run Edit through to a posted Policy Edit
 * transaction (description -> Generate Edit -> Add Message -> Save -> Post),
 * and confirm the client record and policy panel are back on screen.
 *
 * Client name/carrier/edit text/message text are this test's own fixed
 * scenario data (a specific pre-existing QA-tenant client and policy, not a
 * fresh-per-run factory value) — kept as local constants rather than
 * factories.ts synthetic data, matching how
 * policy_lifecycle_existing_client.test.ts treats `nexsureData.existingClient`.
 */
test(
  'Nexsure: edit an existing policy via search — client search, Policies tab, row Edit, message, Save, Post',
  {
    annotation: [
      { type: 'scenario', description: 'edit-existing-policy-via-search' },
      { type: 'product', description: 'nexsure' },
    ],
  },
  async ({ page }, testInfo) => {
    test.setTimeout(180000);

    const clientName = 'Automation Client 95dafb24';
    const carrierName = 'AAA Carrier';
    const editDescription = 'Edited';
    const messageText = 'Testing';

    let screenshotNumber = 0;
    const capture = async (name: string) => {
      screenshotNumber += 1;
      await takeScreenshot(page, testInfo, `${String(screenshotNumber).padStart(2, '0')}-${name}`);
    };

    const loginPage = new LoginPage(page);
    const editPolicyPage = new EditPolicyPage(page);

    await test.step('Login', async () => {
      await loginPage.goto();
      await loginPage.login(
        getCredential('NEXSURE_LOGIN_USER', 'nexsure', 'username'),
        getCredential('NEXSURE_LOGIN_PASS', 'nexsure', 'password'),
      );
      await expect(page).toHaveURL(/#\//, { timeout: 30000 });
      await capture('logged-in');
    });

    await test.step('Search for the client', async () => {
      await editPolicyPage.searchForClient(clientName);
      await capture('search-clicked');
      await expect(editPolicyPage.highlightedResultLocator).toBeVisible({ timeout: 30000 });
      await capture('search-results-highlighted');
    });

    await test.step('Open the client record', async () => {
      await editPolicyPage.openClientFromResults(clientName);
      await capture('client-opened');
    });

    await test.step('Open the Policies tab', async () => {
      await editPolicyPage.goToPoliciesTab();
      await capture('policies-tab-opened');
      await expect(editPolicyPage.carrierCellLocator).toHaveText(carrierName, { timeout: 60000 });
    });

    await test.step('Open Edit from the policy row\'s "≡" menu', async () => {
      await editPolicyPage.openEditFromRowMenu();
    });

    await test.step('Fill the edit description and generate the edit', async () => {
      await editPolicyPage.fillEditDescription(editDescription);
      await editPolicyPage.clickGenerateEdit();
    });

    await test.step('Add a message and save', async () => {
      await editPolicyPage.addMessage(messageText);
      await editPolicyPage.clickSave();
      await expect(editPolicyPage.savedMessageTextLocator(messageText)).toHaveText(messageText);
      await expect(editPolicyPage.messagesPanelLocator).toBeVisible();
      await test.info().attach('messages-panel', {
        body: await editPolicyPage.messagesPanelLocator.screenshot(),
        contentType: 'image/png',
      });
    });

    await test.step('Post the edit', async () => {
      await editPolicyPage.clickPost();
      await expect(editPolicyPage.entityNameLocator).toHaveText(clientName, { timeout: 60000 });
      await expect(editPolicyPage.policyInfoPanelLocator).toBeVisible({ timeout: 60000 });
      await test.info().attach('policy-info', {
        body: await editPolicyPage.policyInfoPanelLocator.screenshot(),
        contentType: 'image/png',
      });
    });
  },
);
