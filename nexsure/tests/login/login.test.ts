import { test, expect } from '../../../framework/fixtures';
import { getCredential } from '../../../framework/utils/env';
import { waitForVisible } from '../../../framework/utils/waits';
import { LoginPage } from './login.page';

/**
 * From /nexsure/scenarios/nexsure_sc_login.md. See nexsure/knowledge/pages/
 * login.md: document.title stays "Nexsure" on both the sign-in and dashboard
 * screens, so the URL hash and the greeting heading are the reliable "logged in"
 * signals, not the title or a navigation event.
 */
test(
  'Nexsure: standard agent can log in with valid credentials',
  {
    annotation: [
      { type: 'scenario', description: 'nexsure_sc_login' },
      { type: 'product', description: 'nexsure' },
    ],
  },
  async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await expect(loginPage.signInButtonLocator).toBeVisible();

    await waitForVisible(loginPage.usernameFieldLocator);

    await loginPage.login(
      getCredential('NEXSURE_LOGIN_USER', 'nexsure', 'username'),
      getCredential('NEXSURE_LOGIN_PASS', 'nexsure', 'password'),
    );

    await test.step('Confirm the dashboard loaded', async () => {
      await expect(page).toHaveURL(/#\//);
      await expect(page.getByText(/Good (Morning|Afternoon|Evening),/)).toBeVisible();
      console.log('Logged in successfully — dashboard greeting visible.');
    });
  },
);
