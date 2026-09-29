import { test, expect } from '../../../framework/fixtures';
import { getCredential } from '../../../framework/utils/env';
import { waitForVisible } from '../../../framework/utils/waits';
import { LoginPage } from './login.page';

/**
 * From /alis/scenarios/al_sc_login.md. See alis/knowledge/pages/login.md: a
 * successful login lands on `#/followup` and opens a startup message popup —
 * closing it is part of the standard login flow, not an edge case.
 */
test(
  'Alis: standard agent can log in with valid credentials',
  {
    annotation: [
      { type: 'scenario', description: 'al_sc_login' },
      { type: 'product', description: 'alis' },
    ],
  },
  async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await expect(loginPage.logInButtonLocator).toBeVisible();

    // Wait until the username field is visible before entering credentials —
    // defaults to 10s, pass a second argument (ms) to override, e.g.
    // waitForVisible(loginPage.userNameFieldLocator, 20000).
    await waitForVisible(loginPage.userNameFieldLocator);

    await loginPage.login(
      getCredential('ALIS_UAT_USERNAME', 'alis', 'username'),
      getCredential('ALIS_UAT_PASSWORD', 'alis', 'password'),
    );

    await expect(page).not.toHaveURL(/#\/login/);

    await test.step('Close the post-login startup message popup', async () => {
      await expect(loginPage.startupMessagePopupLocator).toBeVisible();
      await loginPage.closeStartupMessagePopup();
      await expect(loginPage.startupMessagePopupLocator).not.toBeVisible();
      console.log('Post-login startup message popup closed successfully.');
    });
  },
);
