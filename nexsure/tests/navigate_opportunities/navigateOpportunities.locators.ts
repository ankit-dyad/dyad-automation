import type { Page } from '@playwright/test';

/**
 * Locator definitions for navigating the Nexsure global header's Home menu to
 * the Opportunities list — sourced from the "## Selectors" tables in
 * nexsure/knowledge/pages/header.md (Home menu / Opportunities link) and
 * nexsure/knowledge/pages/opportunities.md (list landing signal). Nothing but
 * locators belongs here; actions live in navigateOpportunities.page.ts,
 * assertions in navigateOpportunities.test.ts.
 */
export class NavigateOpportunitiesLocators {
  constructor(private readonly page: Page) {}

  /* Live DOM renders this as a `generic` element with text "Home", not an ARIA
   * button — getByRole('button', { name: 'Home' }) never matches. Using
   * header.md's documented CSS fallback instead: 1st of the 4
   * `.dropdownMenuWrapper.menuTarget` account-menu triggers. <!-- fragile --> */
  get homeMenuButton() {
    return this.page.locator('.dropdownMenuWrapper.menuTarget').first();
  }

  get opportunitiesNavLink() {
    return this.page.locator('.dropdownMenu .dropdownSection .dropdownLink a', { hasText: 'Opportunities' });
  }

  /** Landing signal for the Opportunities list — see opportunities.md's
   * "New" button (element #3). Scoped by role+name rather than the page
   * heading text, since "Opportunities" also appears as a Home-menu item. */
  get newOpportunityButton() {
    return this.page.getByRole('button', { name: 'New', exact: true }).first();
  }
}
