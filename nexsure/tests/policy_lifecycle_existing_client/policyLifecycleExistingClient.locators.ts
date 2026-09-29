import type { Page } from '@playwright/test';

/**
 * Locator definitions for the "Find a Client" *match* path on the
 * Opportunities: New wizard's Select Client step — sourced from the "Find a
 * Client modal — element inventory" and "## Selectors" tables in
 * nexsure/knowledge/pages/find_a_client_and_create_client.md (`Search result
 * row` -> `.searchResults .nex_flexible_grid.clickableRow .grid_row`). The
 * no-match ("New Client") branch of this same screen already has its own
 * locators in nexsure/tests/create_client/createClient.locators.ts; this file
 * only covers picking an existing client from the results list. Nothing but
 * locators belongs here — actions live in policyLifecycleExistingClient.page.ts,
 * assertions in policyLifecycleExistingClient.test.ts.
 */
export class PolicyLifecycleExistingClientLocators {
  constructor(private readonly page: Page) {}

  searchResultRow(clientName: string) {
    return this.page.locator('.searchResults .nex_flexible_grid.clickableRow .grid_row', {
      hasText: clientName,
    });
  }

  /** The populated Select Client card's `Client: {name} ({type})` summary text —
   * matched on name only since the type marker, (C) or (P), isn't known ahead
   * of time for an existing client picked by name alone. Case-insensitive:
   * confirmed live that the app renders this with its own capitalization
   * (e.g. searching "automation_001" renders "Automation_001(P)"), which need
   * not match the search keyword's casing. */
  clientSummary(clientName: string) {
    return this.page.getByText(new RegExp(`Client:\\s*${clientName}`, 'i'));
  }
}
