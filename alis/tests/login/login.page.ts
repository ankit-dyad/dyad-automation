import type { Page } from '@playwright/test';
import { BasePage } from '../../../framework/pages/BasePage';
import { LoginLocators } from './login.locators';

/**
 * Page Object for the Alis Login page. Actions only — no assertions, no test
 * data, no hardcoded URLs (see CLAUDE.md §3 / knowledge/conventions.md). Built
 * from alis/knowledge/pages/login.md.
 */
export class LoginPage extends BasePage {
  /* No leading slash: this is a hash-only reference, resolved against a baseURL
   * that must end with a trailing slash (e.g. "https://customer-alis.dyadtech.com/
   * ALIS.BMS/APP/", set via ALIS_UAT_BASE_URL) so it lands on
   * ".../ALIS.BMS/APP/#/login" — a leading slash would drop the "/ALIS.BMS/APP"
   * prefix entirely when Playwright joins it against baseURL. Confirmed live
   * 2026-09-24 that this instance uses the identical /ALIS.BMS/APP/#/login path
   * shape as the original sample's environment — only the domain differs. */
  protected override path = '#/login';

  private readonly locators: LoginLocators;

  constructor(page: Page) {
    super(page);
    this.locators = new LoginLocators(page);
  }

  async enterUsername(username: string): Promise<void> {
    await this.enter(this.locators.userNameField, username);
  }

  async enterPassword(password: string): Promise<void> {
    await this.enter(this.locators.passwordField, password);
  }

  async clickLogIn(): Promise<void> {
    await this.click(this.locators.logInButton);
  }

  /** Fills both fields and submits — the shape framework/utils/auth.ts's
   * `loginAs()` drives via env-var-only credentials. */
  async login(username: string, password: string): Promise<void> {
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickLogIn();
  }

  async clickForgotPassword(): Promise<void> {
    await this.click(this.locators.forgotPasswordLink);
  }

  async clickResourceCenter(): Promise<void> {
    await this.click(this.locators.resourceCenterButton);
  }

  /** A startup message popup opens on every successful login on the framework's
   * original (novatae.com) environment, but was NOT observed on this dyad-branded
   * instance (confirmed 2026-09-24 — see login.md). Defensive/optional: waits
   * briefly for the popup and closes it only if it actually appears, rather than
   * assuming either environment's behavior. */
  async closeStartupMessagePopupIfPresent(timeoutMs = 3000): Promise<void> {
    const popup = this.locators.startupMessagePopup;
    const appeared = await popup
      .waitFor({ state: 'visible', timeout: timeoutMs })
      .then(() => true)
      .catch(() => false);
    if (!appeared) return;

    await this.click(this.locators.startupMessageCloseButton);
    await popup.waitFor({ state: 'hidden' });
  }

  /** Exposed for the spec to assert on — assertions belong in the test, not here. */
  get logInButtonLocator() {
    return this.locators.logInButton;
  }

  get startupMessagePopupLocator() {
    return this.locators.startupMessagePopup;
  }

  get userNameFieldLocator() {
    return this.locators.userNameField;
  }
}