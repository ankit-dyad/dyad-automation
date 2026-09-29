import { test, expect } from '../../../framework/fixtures';
import { getCredential } from '../../../framework/utils/env';
import { reportedStep } from '../../../framework/utils/reportStep';
import { waitForVisible } from '../../../framework/utils/waits';
import { LoginPage } from './login.page';

/**
 * From /alis_core/scenarios/alc_sc_login.md. See alis_core/knowledge/pages/login.md:
 * unlike alis/'s UAT login (which lands on #/followup and opens a startup message
 * popup), this environment's post-login landing route and popup behavior have not
 * yet been confirmed with real credentials — so this spec only asserts the generic
 * "navigated away from #/login" outcome. Tighten this assertion (and update the
 * knowledge file + scenario together) once a credentialed run confirms the exact
 * landing route.
 */
test(
  'Alis Core: standard agent can log in with valid credentials',
  {
    annotation: [
      { type: 'scenario', description: 'alc_sc_login' },
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

    const username = getCredential('ALIS_CORE_LOGIN_USER', 'alis_core', 'username');

    await reportedStep(
      page,
      testInfo,
      'Open the login page',
      async () => {
        await loginPage.goto();
        await expect(loginPage.logInButtonLocator).toBeVisible();

        // Wait until the username field is visible before entering credentials —
        // defaults to 10s, pass a second argument (ms) to override, e.g.
        // waitForVisible(loginPage.userNameFieldLocator, 20000).
        await waitForVisible(loginPage.userNameFieldLocator);
      },
      'Navigated to the login page and confirmed the Log In button and username field are both visible.',
      { label: 'Log In button', locator: loginPage.logInButtonLocator },
    );

    await reportedStep(
      page,
      testInfo,
      'Log in with valid credentials',
      async () => {
        await loginPage.login(username, getCredential('ALIS_CORE_LOGIN_PASS', 'alis_core', 'password'));

        await expect(page).not.toHaveURL(/#\/login/);
      },
      `Logged in as "${username}" and confirmed the app navigated away from #/login.`,
    );
  },
);
