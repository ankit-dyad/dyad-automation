import type { Page } from '@playwright/test';
import { BasePage } from '../../../framework/pages/BasePage';
import { PolicyLifecycleExistingClientLocators } from './policyLifecycleExistingClient.locators';

/**
 * Page Object for the "Find a Client" *match* path — picks an already-created
 * client from the Search Results list instead of falling through to New
 * Client (see nexsure/tests/create_client/createClient.page.ts for that other
 * branch of the same screen, reused as-is here for goto()/startNewOpportunity()/
 * searchForClient()).
 */
export class PolicyLifecycleExistingClientPage extends BasePage {
  private readonly locators: PolicyLifecycleExistingClientLocators;

  constructor(page: Page) {
    super(page);
    this.locators = new PolicyLifecycleExistingClientLocators(page);
  }

  async selectSearchResult(clientName: string): Promise<void> {
    await this.click(this.locators.searchResultRow(clientName));
  }

  searchResultRowLocator(clientName: string) {
    return this.locators.searchResultRow(clientName);
  }

  clientSummaryLocator(clientName: string) {
    return this.locators.clientSummary(clientName);
  }
}
