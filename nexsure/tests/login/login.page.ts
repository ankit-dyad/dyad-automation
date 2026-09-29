import type { Page } from '@playwright/test';
import { BasePage } from '../../../framework/pages/BasePage';
import { LoginLocators } from './login.locators';

/**
 * Page Object for the Nexsure Sign-in page. Actions only — no assertions, no
 * test data, no hardcoded URLs (see CLAUDE.md §3 / knowledge/conventions.md).
 * Built from nexsure/knowledge/pages/login.md.
 */
export class LoginPage extends BasePage {
  /* '.' resolves to baseURL unchanged (no hash appended) — the sign-in screen
   * sits at the app's base path itself (see login.md's "## URL"), it isn't a
   * hash route like the post-login pages are. An empty string would be falsy
   * and trip BasePage's "no path set" check, so '.' is used instead. */
  protected override path = '.';

  private readonly locators: LoginLocators;

  constructor(page: Page) {
    super(page);
    this.locators = new LoginLocators(page);
  }

  async enterUsername(username: string): Promise<void> {
    await this.enter(this.locators.usernameField, username);
  }

  async enterPassword(password: string): Promise<void> {
    await this.enter(this.locators.passwordField, password);
  }

  async clickSignIn(): Promise<void> {
    await this.click(this.locators.signInButton);
  }

  /** Fills both fields and submits. */
  async login(username: string, password: string): Promise<void> {
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickSignIn();
  }

  async checkRememberMe(): Promise<void> {
    await this.check(this.locators.rememberMeCheckbox);
  }

  /** Exposed for the spec to assert on — assertions belong in the test, not here. */
  get signInButtonLocator() {
    return this.locators.signInButton;
  }

  get usernameFieldLocator() {
    return this.locators.usernameField;
  }

  get rememberMeCheckboxLocator() {
    return this.locators.rememberMeCheckbox;
  }
}
