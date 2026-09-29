import type { Page } from '@playwright/test';
import { BasePage } from '../../../framework/pages/BasePage';
import { NavigateOpportunitiesLocators } from './navigateOpportunities.locators';

/**
 * Page Object for reaching the Nexsure Opportunities list via the global
 * header's Home menu. Built from nexsure/knowledge/pages/header.md and
 * nexsure/knowledge/pages/opportunities.md.
 */
export class NavigateOpportunitiesPage extends BasePage {
  private readonly locators: NavigateOpportunitiesLocators;

  constructor(page: Page) {
    super(page);
    this.locators = new NavigateOpportunitiesLocators(page);
  }

  /** Opens the header's Home menu and selects Opportunities. Requires a page
   * that's already authenticated (the header only renders post-login) — a bare
   * `page.goto('#/opportunities')` doesn't drive the Vue Router the same way an
   * in-app navigation click does (see createClient.page.ts's goto() note). */
  override async goto(): Promise<void> {
    await this.click(this.locators.homeMenuButton);
    await this.click(this.locators.opportunitiesNavLink);
    await this.waitForVisible(this.locators.newOpportunityButton);
  }

  /** Exposed for the spec to assert on — assertions belong in the test, not here. */
  get newOpportunityButtonLocator() {
    return this.locators.newOpportunityButton;
  }
}
