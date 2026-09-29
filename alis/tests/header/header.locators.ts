import type { Page } from '@playwright/test';

/**
 * Locator definitions for the Alis Header — sourced from the "## Selectors"
 * table in /alis/knowledge/pages/header.md. Nothing but locators belongs here;
 * actions live in header.page.ts, assertions in header.test.ts.
 *
 * Re-captured 2026-09-24 against the current environment (customer-alis.dyadtech.com).
 */
export class HeaderLocators {
  constructor(private readonly page: Page) {}

  /** The header's own `role="banner"` landmark — confirmed live 2026-09-24
   * (two nested banner elements exist; `.first()` is the outer wrapper). Prefer
   * this over the original sample's `app-header` tag selector, which wasn't
   * re-verified against this instance and isn't a semantic locator anyway. */
  get headerBar() {
    return this.page.getByRole('banner').first();
  }

  get workspaceLink() {
    return this.page.locator('a[href="#/workspace"]');
  }

  get searchTypeDropdown() {
    return this.page.getByRole('combobox').first();
  }

  /** <!-- fragile --> Accessible name is "Last name" — an apparent mismatched
   * aria-label carried over from a reused component — even though the visible
   * placeholder reads "Type here". Locate by placeholder (what a user actually
   * sees), not by that accessible name. See header.md's Selectors table. */
  get searchBox() {
    return this.page.getByPlaceholder('Type here');
  }

  get userAvatar() {
    return this.page.getByAltText('Header Avatar');
  }

  get avatarDropdownProfileLink() {
    return this.page.getByRole('link', { name: 'Profile' });
  }

  get avatarDropdownChangePasswordLink() {
    return this.page.getByRole('link', { name: 'Change Password' });
  }

  get avatarDropdownLogoutLink() {
    return this.page.getByRole('link', { name: 'Logout' });
  }
}