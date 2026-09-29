import type { Page } from '@playwright/test';

/**
 * Locator definitions for the Nexsure Sign-in page — sourced from the
 * "## Selectors" table in nexsure/knowledge/pages/login.md. Nothing but locators
 * belongs here; actions live in login.page.ts, assertions in login.test.ts.
 */
export class LoginLocators {
  constructor(private readonly page: Page) {}

  get usernameField() {
    return this.page.locator(".form_group:has-text('username') input");
  }

  get passwordField() {
    return this.page.locator(".form_group:has-text('password') input");
  }

  get rememberMeCheckbox() {
    return this.page.locator('label.checkbox input[type="checkbox"]');
  }

  get signInButton() {
    return this.page.getByRole('button', { name: 'Sign in' });
  }

  get forgotPasswordButton() {
    return this.page.getByRole('button', { name: 'Forgot Password' });
  }

  get changePasswordLink() {
    return this.page.getByRole('link', { name: 'Change Password' });
  }
}
