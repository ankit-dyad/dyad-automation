import type { Page } from '@playwright/test';

/**
 * Locator definitions for the Alis Login page — sourced from the "## Selectors"
 * table in alis/knowledge/pages/login.md. Nothing but locators belongs here;
 * actions live in login.page.ts, assertions in login.test.ts. If the app changes,
 * update the knowledge file first, then this file to match.
 *
 * Re-captured 2026-09-24 against the current environment (customer-alis.dyadtech.com,
 * v4.1.19.5) — role/placeholder locators, per knowledge/conventions.md's priority
 * order, in place of the original sample's raw CSS ids (`#txtUserName` etc.), which
 * targeted an earlier/different environment (alisuat.novatae.com) and weren't
 * re-verified against this one.
 */
export class LoginLocators {
  constructor(private readonly page: Page) {}

  get userNameField() {
    return this.page.getByPlaceholder('User Name');
  }

  get passwordField() {
    return this.page.getByPlaceholder('Password');
  }

  get logInButton() {
    return this.page.getByRole('button', { name: 'Log In' });
  }

  get forgotPasswordLink() {
    return this.page.getByRole('link', { name: 'Forgot Password?' });
  }

  get resourceCenterButton() {
    return this.page.getByRole('button', { name: 'Open Resource Center' });
  }

  /** The old novatae.com instance opens a startup-message dialog on every
   * successful login; NOT observed on this dyad-branded instance (confirmed
   * 2026-09-24 — see login.md). Kept here so a spec/page-object can still check
   * for it defensively without assuming it will ever appear. */
  get startupMessagePopup() {
    return this.page.getByRole('dialog');
  }

  get startupMessageCloseButton() {
    return this.startupMessagePopup.getByRole('button', { name: 'Close' });
  }
}