import type { Page } from '@playwright/test';

/**
 * Locator definitions for the Alis Login page — sourced from the "## Selectors"
 * table in alis/knowledge/pages/login.md. Nothing but locators belongs here;
 * actions live in login.page.ts, assertions in login.test.ts. If the app changes,
 * update the knowledge file first, then this file to match.
 */
export class LoginLocators {
  constructor(private readonly page: Page) {}

  get userNameField() {
    return this.page.locator('#txtUserName');
  }

  get passwordField() {
    return this.page.locator('#txtPassword');
  }

  get logInButton() {
    return this.page.locator('button[type=submit]:has-text("Log In")');
  }

  get forgotPasswordLink() {
    return this.page.locator('a[href="#/forgotpassword"]');
  }

  get resourceCenterButton() {
    return this.page.locator('button[aria-label="Open Resource Center"]');
  }

  get startupMessagePopup() {
    return this.page.getByRole('dialog');
  }

  get startupMessageCloseButton() {
    return this.startupMessagePopup.getByRole('button', { name: 'Close' });
  }
}
