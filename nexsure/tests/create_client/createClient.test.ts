import { test, expect } from '../../../framework/fixtures';
import { getCredential } from '../../../framework/utils/env';
import nexsureData from '../../knowledge/data.json';
import { LoginPage } from '../login/login.page';
import { CreateClientPage } from './createClient.page';

/**
 * From /nexsure/scenarios/nexsure_sc_create_client.md. See nexsure/knowledge/
 * pages/create-client.md: this is the only documented entry point into client
 * creation, and live-verified 2026-09-17 to persist a real client record in the
 * jmiqaweb01 QA tenant — the client name must be unique per run (from
 * testData.clientProfile()) or the search would find a stale match instead of
 * "No Results Found". Branch/Department/Location Type/State come from
 * nexsure/knowledge/data.json's "createClient" section — real tenant
 * configuration data, not per-run synthetic values.
 */
test(
  'Nexsure: create a new client from the New Opportunity wizard',
  {
    annotation: [
      { type: 'scenario', description: 'nexsure_sc_create_client' },
      { type: 'product', description: 'nexsure' },
    ],
  },
  async ({ page, testData }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(
      getCredential('NEXSURE_LOGIN_USER', 'nexsure', 'username'),
      getCredential('NEXSURE_LOGIN_PASS', 'nexsure', 'password'),
    );
    // Sign-in is JS/XHR-driven with no native form submit (see login.md) — wait
    // for the post-login URL before navigating on, or a same-document hash
    // navigation to #/opportunities can race ahead of auth and get bounced back
    // to the sign-in state by the app's router guard.
    await expect(page).toHaveURL(/#\//);

    const client = testData.clientProfile();
    const { branch, department, personalLocationType, state } = nexsureData.createClient;

    const createClientPage = new CreateClientPage(page);

    await test.step('Start a new opportunity and search for a client that does not exist', async () => {
      await createClientPage.goto();
      await expect(createClientPage.opportunitiesNewButtonLocator).toBeVisible();

      await createClientPage.startNewOpportunity();
      await createClientPage.searchForClient(client.clientName);

      await expect(createClientPage.findClientPopoverLocator).toBeVisible();
      await expect(createClientPage.newClientButtonLocator).toBeVisible();
    });

    await test.step('Open the New Client wizard and fill in Client Info (step 1)', async () => {
      await createClientPage.clickNewClient();
      await expect(createClientPage.clientNameFieldLocator).toHaveValue(client.clientName);

      await createClientPage.selectClientType('Personal');
      await createClientPage.selectLocationType(personalLocationType);
      await createClientPage.fillStreetAddress(client.streetAddress);
      await createClientPage.fillCity(client.city);
      await createClientPage.selectState(state);
      await createClientPage.fillZipCode(client.zip);

      await createClientPage.clickNext();
      await createClientPage.dismissAddressVerificationDialogIfPresent();
    });

    await test.step('Fill in Client Contacts (step 2)', async () => {
      await expect(createClientPage.addContactModalLocator).toBeVisible();
      await createClientPage.fillContactLastName(client.contactLastName);
      await createClientPage.clickSaveContact();
      await createClientPage.clickNext();
    });

    await test.step('Fill in Assignment (step 3) and finish', async () => {
      await createClientPage.selectBranch(branch);
      await createClientPage.selectDepartment(department);
      await createClientPage.clickDone();
    });

    await test.step('Confirm the client was created', async () => {
      await expect(createClientPage.clientSummaryLocator(client.clientName, 'Personal')).toBeVisible();
      console.log(`Client "${client.clientName}" created successfully.`);
    });
  },
);
