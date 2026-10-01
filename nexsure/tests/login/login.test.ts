import { test, expect } from '../../../framework/fixtures';
import { waitForVisible } from '../../../framework/utils/waits';
import { LoginPage } from './login.page';
import nexsureData from '../../knowledge/data.json';

/**
 * From /nexsure/scenarios/nexsure_sc_login.md. See nexsure/knowledge/pages/
 * login.md: document.title stays "Nexsure" on both the sign-in and dashboard
 * screens, so the URL hash and the greeting heading are the reliable "logged in"
 * signals, not the title or a navigation event.
 *
 * Reads credentials directly from nexsure/knowledge/data.json's
 * `credentials[0]` — intentionally ignores NEXSURE_LOGIN_USER/PASS env vars
 * (unlike getCredential(), which would prefer them if set) so this test
 * always runs against whatever's documented in data.json, not whatever a
 * shell/CI happens to have exported. Same reasoning for navigation: goes
 * straight to data.json's `baseUrl` instead of LoginPage.goto() (which would
 * resolve against playwright.config.ts's own baseURL/PLAYWRIGHT_BASE_URL).
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

    await page.goto(nexsureData.baseUrl);
    await expect(loginPage.signInButtonLocator).toBeVisible();

    await waitForVisible(loginPage.usernameFieldLocator);

    const { username, password } = nexsureData.credentials[0];
    await loginPage.login(username, password);

    await test.step('Confirm the dashboard loaded', async () => {
      await expect(page).toHaveURL(/#\//);
      await expect(page.getByText(/Good (Morning|Afternoon|Evening),/)).toBeVisible();
      console.log('Logged in successfully — dashboard greeting visible.');
    });
  },
);
