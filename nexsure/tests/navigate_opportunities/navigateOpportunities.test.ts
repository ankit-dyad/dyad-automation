import { test, expect } from '../../../framework/fixtures';
import { getCredential } from '../../../framework/utils/env';
import { LoginPage } from '../login/login.page';
import { NavigateOpportunitiesPage } from './navigateOpportunities.page';

/**
 * From /nexsure/scenarios/nexsure_sc_navigate_opportunities.md. See
 * nexsure/knowledge/pages/opportunities.md: document.title updates to
 * "Opportunities" here (unlike Sign-in/Dashboard, which stay "Nexsure"), but the
 * URL hash and the "New" button are the reliable "arrived" signals used below.
 */
test(
  'Nexsure: standard agent can navigate Home > Opportunities',
  {
    annotation: [
      { type: 'scenario', description: 'nexsure_sc_navigate_opportunities' },
      { type: 'product', description: 'nexsure' },
    ],
  },
  async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(
      getCredential('NEXSURE_LOGIN_USER', 'nexsure', 'username'),
      getCredential('NEXSURE_LOGIN_PASS', 'nexsure', 'password'),
    );
    await expect(page).toHaveURL(/#\//);

    const opportunitiesPage = new NavigateOpportunitiesPage(page);
    await opportunitiesPage.goto();

    await test.step('Confirm the Opportunities list loaded', async () => {
      await expect(page).toHaveURL(/#\/opportunities/);
      await expect(opportunitiesPage.newOpportunityButtonLocator).toBeVisible();
    });
  },
);
