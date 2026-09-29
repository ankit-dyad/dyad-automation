import type { Page } from '@playwright/test';

/**
 * Locator definitions for the Alis Header — sourced from the "## Selectors"
 * table in /alis/knowledge/pages/header.md. Nothing but locators belongs here;
 * actions live in header.page.ts, assertions in header.test.ts.
 */
export class HeaderLocators {
  constructor(private readonly page: Page) {}

  get headerBar() {
    return this.page.locator('app-header');
  }

  get logoLink() {
    return this.page.locator('a[routerlink="/workspace"]');
  }

  get searchTypeDropdown() {
    return this.page.locator('#inputGroupSelect01');
  }

  get searchBox() {
    return this.page.locator('input.header-search');
  }

  get userAvatar() {
    return this.page.getByAltText('Header Avatar');
  }
}
