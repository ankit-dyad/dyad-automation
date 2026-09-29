import { test, expect } from '../../../framework/fixtures';
import { getCredential } from '../../../framework/utils/env';
import { waitForVisible } from '../../../framework/utils/waits';
import { LoginPage } from './login.page';

/**
 * From /alis/scenarios/al_sc_login.md. See alis/knowledge/pages/login.md: a
 * successful login on this environment (customer-alis.dyadtech.com) lands
 * directly on `#/followup`, with no post-login startup popup observed (unlike
 * the framework's original novatae.com environment) — closing the popup is
 * handled defensively (only if present), not assumed.
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

    await expect(page).toHaveURL(/#\/followup/);

    await test.step('Close the post-login startup message popup, if this environment shows one', async () => {
      await loginPage.closeStartupMessagePopupIfPresent();
      await expect(loginPage.startupMessagePopupLocator).not.toBeVisible();
      console.log(
        'Post-login startup message popup check complete (present-and-closed, or never appeared).',
      );
    });
  },
);