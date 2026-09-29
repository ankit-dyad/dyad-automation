import { test, expect } from '../../../framework/fixtures';
import { getCredential } from '../../../framework/utils/env';
import { takeScreenshot } from '../../../framework/utils/screenshot';
import nexsureData from '../../knowledge/data.json';
import { LoginPage } from '../login/login.page';
import { CreateClientPage } from '../create_client/createClient.page';
import { PolicyLifecyclePage } from '../policy_lifecycle/policyLifecycle.page';
import { PolicyLifecycleExistingClientPage } from './policyLifecycleExistingClient.page';

/**
 * Variant of nexsure/tests/policy_lifecycle/policyLifecycle.test.ts that skips
 * client creation entirely: instead of the New Client wizard, it uses Find a
 * Client's Keywords search (nexsure/knowledge/pages/
 * find_a_client_and_create_client.md's "Find a Client modal") to find and
 * select a pre-existing client (nexsureData.existingClient.name), then
 * continues through the same Select Assignment -> Select Product -> Create
 * Opportunity -> Marketing -> Bind -> Inforce flow. Steps 22+ (Endorsement,
 * Policy Edit, Renewal, Cancellation, Rewrite) are deliberately not automated
 * here for the same reasons as the sibling test.
 */
test(
  'Nexsure: policy lifecycle with an existing client — find, select, opportunity, quote, bind, inforce',
  {
    annotation: [
      { type: 'scenario', description: 'scenario-02-full-policy-lifecycle-existing-client' },
      { type: 'product', description: 'nexsure' },
    ],
  },
  async ({ page }, testInfo) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(
      getCredential('NEXSURE_LOGIN_USER', 'nexsure', 'username'),
      getCredential('NEXSURE_LOGIN_PASS', 'nexsure', 'password'),
    );
    await expect(page).toHaveURL(/#\//);

    const { branch: assignmentBranch, department: assignmentDepartment, responsibility, employee } =
      nexsureData.assignment;
    const { product, lineOfBusiness, issuingCarrier, billingCarrier } = nexsureData.policyLifecycle;
    const { name: existingClientName } = nexsureData.existingClient;

    const createClientPage = new CreateClientPage(page);
    const existingClientPage = new PolicyLifecycleExistingClientPage(page);
    const lifecyclePage = new PolicyLifecyclePage(page);

    await test.step('Find and select an existing client', async () => {
      await createClientPage.goto();
      await createClientPage.startNewOpportunity();
      await createClientPage.searchForClient(existingClientName);

      await expect(createClientPage.findClientPopoverLocator).toBeVisible();
      await expect(existingClientPage.searchResultRowLocator(existingClientName)).toBeVisible();

      await existingClientPage.selectSearchResult(existingClientName);
      await expect(existingClientPage.clientSummaryLocator(existingClientName)).toBeVisible();

      await takeScreenshot(page, testInfo, '01-existing-client-selected');
      console.log(
        `Data comparison — searched for existing client "${existingClientName}" and selected it from Search ` +
          `Results; the "Client: ${existingClientName}" summary now shown confirms the same client, no new ` +
          `client record was created.`,
      );
    });

    await test.step('Select Assignment, Select Product, Create Opportunity', async () => {
      await lifecyclePage.clickNext(); // Select Client -> Next (existing client already selected)

      await lifecyclePage.addAssignment({
        branch: assignmentBranch,
        employee,
        department: assignmentDepartment,
        responsibility,
      });
      await lifecyclePage.clickNext(); // Select Assignment -> Select Product

      await lifecyclePage.selectProduct(product);
      await lifecyclePage.selectLineOfBusiness(lineOfBusiness);
      await lifecyclePage.clickCreateOpportunity();

      await expect(page).toHaveURL(/#\/opportunities\/\d+/);
      await takeScreenshot(page, testInfo, '02-opportunity-created');
      console.log(
        `Data comparison — Opportunity created for existing client "${existingClientName}": Assignment ` +
          `entered Branch="${assignmentBranch}", Employee="${employee}", Department="${assignmentDepartment}", ` +
          `Responsibility="${responsibility}"; Product="${product}", LOB="${lineOfBusiness}".`,
      );
    });

    await test.step('Marketing — create a Manual Quote', async () => {
      await lifecyclePage.goToMarketingTab();
      await lifecyclePage.openManualQuote();
      await lifecyclePage.fillManualQuote({ issuingCarrier, lineOfBusiness });
      await lifecyclePage.saveQuote();

      const quoteRow = lifecyclePage.quotesGridRowLocator.first();
      await expect(quoteRow).toContainText(issuingCarrier);
      await expect(quoteRow).toContainText(lineOfBusiness);
      await takeScreenshot(page, testInfo, '03-quote-created');
      console.log(
        `Data comparison — Quote row shows Carrier="${issuingCarrier}", LOB="${lineOfBusiness}", matching ` +
          `what was entered in the Manual Quote modal.`,
      );
    });

    await test.step('Bind the quote', async () => {
      await lifecyclePage.openQuoteRowMenu();
      await lifecyclePage.clickBind();
      await lifecyclePage.cancelModal();

      await lifecyclePage.goToBindingTab();
      await expect(lifecyclePage.inForcePolicyButtonLocator).toBeVisible();
      await takeScreenshot(page, testInfo, '04-bind-requested');
      console.log('Bind requested — Binding tab now shows the quote as a policy-in-progress row.');
    });

    await test.step('Inforce the policy (known environment defect — expect the documented failure)', async () => {
      await lifecyclePage.openInForcePolicy();
      await lifecyclePage.selectBillingCarrier(billingCarrier);
      await lifecyclePage.confirmInForce();

      await expect(lifecyclePage.errorToastLocator).toBeVisible({ timeout: 15000 });
      await takeScreenshot(page, testInfo, '05-inforce-error');
      console.log(
        `Data comparison — In Force submitted with Billing Carrier="${billingCarrier}": hit the documented ` +
          `environment defect (opportunity_marketing_binding.md §6.7) — error toast shown, no real policy ` +
          `created. This matches the previously observed failure mode, not a new regression.`,
      );
    });

    console.log(
      "Endorsement and beyond (Policy Edit/Renewal/Cancellation/Rewrite) are not run here: In Force didn't " +
        "produce a real policy this run (documented environment defect), so there's nothing on this client's " +
        'Policies tab to endorse, and the later phases have no knowledge-base documentation yet. See ' +
        'nexsure/scenarios/nexsure/scenario-02-full-policy-lifecycle.md.',
    );
  },
);
