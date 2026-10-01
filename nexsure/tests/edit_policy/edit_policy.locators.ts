import type { Page } from '@playwright/test';

/**
 * Locator definitions for the Nexsure "find an existing client via global
 * search, then edit one of their policies from the Policies grid row menu"
 * flow. The header search box is sourced from the "## Selectors" table in
 * nexsure/knowledge/pages/header.md (`.searchBox input` / accessible name
 * "Search" on the button). The Policies tab link reuses the same
 * role/text/css fallback chain as policyLifecycle.locators.ts's
 * `policiesTabLink`. Everything from the row's "≡" context menu onward
 * (Edit action, edit-description form, Add Message, Save, Post, and the
 * resulting confirmation panel) has no selector table yet in
 * client_record_policies.md — those are first-pass/live-verified against the
 * running app and marked `<!-- fragile -->`, same convention as
 * policyLifecycle.locators.ts uses for its own undocumented screens. Nothing
 * but locators belongs here — actions live in edit_policy.page.ts, assertions
 * in edit_policy.test.ts.
 */
export class EditPolicyLocators {
  constructor(private readonly page: Page) {}

  // --- Global header search (nexsure/knowledge/pages/header.md "## Selectors") ---

  get searchInput() {
    return this.page.getByPlaceholder('Enter search keywords');
  }

  get searchButton() {
    return this.page.getByRole('button', { name: 'Search', exact: true });
  }

  // --- Search results ---

  /** The matched keyword rendered with a highlight span — confirms the search
   * actually ran before a result row is clicked. */
  get highlightedResult() {
    return this.page.locator(`xpath=//span[contains(@class,'highlighted')]`);
  }

  /** `.last()`: a client recently opened in this session can also appear as a
   * "recent_entity" suggestion above the actual results grid, matching the
   * same client-name text — confirmed live, the real results-grid row is the
   * later match in document order. <!-- fragile --> */
  searchResultRow(clientName: string) {
    return this.page.locator(`xpath=//div[normalize-space()='${clientName}']`).last();
  }

  // --- Client record ---

  /** The client record's top-level "POLICIES (n)" tab — confirmed live that
   * this main tab renders its label in caps ("POLICIES"), distinct from its
   * own sub-tabs underneath ("Policies", "Summary of Insurance", etc., title
   * case) which also match `a[href*='/policies']` and would otherwise cause a
   * strict-mode multi-match. No dedicated selector table for the client
   * record's tab bar yet. <!-- fragile --> */
  get policiesTabLink() {
    return this.page.getByRole('link', { name: /^POLICIES/ });
  }

  /** The client-record header's name heading. <!-- fragile: no selector table
   * for the entity-console header yet --> */
  get entityName() {
    return this.page.locator(`xpath=//div[contains(@class,'entity_name')]/h1/span`);
  }

  // --- Policies grid ---

  /** The first policy row's Issuing Carrier name — confirmed live to render
   * as `span.entityName` inside `.grid_cell.issuingCarrierBlock`.
   * <!-- fragile --> */
  get carrierCell() {
    return this.page.locator('.grid_cell.issuingCarrierBlock .entityName').first();
  }

  /** The row's "≡" context-menu trigger (`.context_icons`, wrapping the
   * clickable `.action_context` icon) — confirmed live via DOM dump; not yet
   * in client_record_policies.md §1.3's selector-less description of the row
   * menu. <!-- fragile --> */
  get rowContextMenuTrigger() {
    return this.page.locator(`xpath=//div[@class="context_icons"]`);
  }

  /** Confirmed live: the menu item's label text is "Edit" (title case), not
   * "EDIT" — case-sensitive `normalize-space(.)` match. <!-- fragile --> */
  get contextMenuEditItem() {
    return this.page.locator(`xpath=//span[contains(@class,"nex_context_menu_item_label") and normalize-space(.)="Edit"]`);
  }

  // --- Edit form ---

  get descriptionInput() {
    return this.page.locator(`xpath=//div[contains(@class,'form_group')]/input`);
  }

  get generateEditButton() {
    return this.page.getByRole('button', { name: 'Generate Edit', exact: true });
  }

  // --- Messages ---

  get addMessageButton() {
    return this.page.getByRole('button', { name: 'Add Message', exact: true });
  }

  get messageContentField() {
    return this.page.getByPlaceholder('Enter message content here...');
  }

  get saveButton() {
    return this.page.getByRole('button', { name: 'Save', exact: true });
  }

  /** The saved message's own rendered text, for confirming Save persisted it.
   * `.first()`: this is a real, persistent QA-tenant record — repeated test
   * runs using the same message text accumulate multiple matching spans in
   * the message thread over time, confirmed live. */
  savedMessageText(message: string) {
    return this.page.locator(`xpath=//span[normalize-space(.)="${message}"]`).first();
  }

  /** The Messages panel — screenshotted for the report both before and after
   * Post, matching the original captured flow. <!-- fragile --> */
  get messagesPanel() {
    return this.page.locator(`xpath=//div[contains(@class,'panels')]/div[2]/div[1]/div`);
  }

  // --- Post ---

  get postButton() {
    return this.page.getByRole('button', { name: 'Post', exact: true });
  }

  /** <!-- fragile: no selector table for the policy detail's info panel yet --> */
  get policyInfoPanel() {
    return this.page.locator(`xpath=//div[contains(@class,'policy_info')]`);
  }
}
