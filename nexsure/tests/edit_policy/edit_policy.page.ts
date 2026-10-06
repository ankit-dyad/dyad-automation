import type { Page } from '@playwright/test';
import { BasePage } from '../../../framework/pages/BasePage';
import { EditPolicyLocators } from './edit_policy.locators';

/**
 * Page Object for the Nexsure "find an existing client via global search,
 * then edit one of their policies from the Policies grid row menu" flow.
 * Actions only — no assertions, no test data, no hardcoded URLs (see
 * CLAUDE.md §3 / knowledge/conventions.md). Built from
 * nexsure/knowledge/pages/header.md (global search) and live verification of
 * the Policies grid row menu + edit/message/post screens, which have no
 * knowledge-base page yet (see edit_policy.locators.ts's `<!-- fragile -->`
 * notes).
 */
export class EditPolicyPage extends BasePage {
  private readonly locators: EditPolicyLocators;

  constructor(page: Page) {
    super(page);
    this.locators = new EditPolicyLocators(page);
  }

  // --- Global search ---

  async searchForClient(clientName: string): Promise<void> {
    await this.waitForVisible(this.locators.searchInput, 30000);
    await this.enter(this.locators.searchInput, clientName);
    await this.waitForVisible(this.locators.searchButton, 30000);
    await this.click(this.locators.searchButton);
  }

  /** Waits for the highlighted-keyword result to render, then opens the
   * matching client's record. */
  async openClientFromResults(clientName: string): Promise<void> {
    await this.waitForVisible(this.locators.highlightedResult, 30000);
    const row = this.locators.searchResultRow(clientName);
    await this.waitForVisible(row, 30000);
    await this.click(row);
  }

  // --- Client record ---

  /** The client record's header can take longer than most screens to settle
   * after the search-result navigation — generous timeout confirmed live. */
  async goToPoliciesTab(): Promise<void> {
    await this.waitForVisible(this.locators.policiesTabLink, 60000);
    await this.click(this.locators.policiesTabLink);
  }

  // --- Policies grid row: open Edit from the "≡" context menu ---

  /** `{ force: true }` on the menu item: confirmed live that its sibling
   * `.nex_context_menu_section` wrapper intercepts pointer events at the
   * label's click point even once the item itself is visible/stable — the
   * same overlay-interception issue policyLifecycle.page.ts's dropdown
   * options hit, handled the same way there. */
  async openEditFromRowMenu(): Promise<void> {
    await this.waitForVisible(this.locators.rowContextMenuTrigger, 60000);
    await this.click(this.locators.rowContextMenuTrigger);
    await this.waitForVisible(this.locators.contextMenuEditItem, 60000);
    await this.page.waitForTimeout(1000);
    await this.locators.contextMenuEditItem.click({ force: true });
  }

  // --- Edit form ---

  async fillEditDescription(text: string): Promise<void> {
    await this.waitForVisible(this.locators.descriptionInput, 60000);
    await this.enter(this.locators.descriptionInput, text);
  }

  async clickGenerateEdit(): Promise<void> {
    await this.waitForVisible(this.locators.generateEditButton, 60000);
    await this.click(this.locators.generateEditButton);
  }

  // --- Messages ---

  async addMessage(message: string): Promise<void> {
    await this.waitForVisible(this.locators.addMessageButton, 90000);
    await this.click(this.locators.addMessageButton);
    await this.waitForVisible(this.locators.messageContentField, 60000);
    await this.enter(this.locators.messageContentField, message);
  }

  async clickSave(): Promise<void> {
    await this.waitForVisible(this.locators.saveButton, 60000);
    await this.click(this.locators.saveButton);
  }

  // --- Post ---

  async clickPost(): Promise<void> {
    await this.waitForVisible(this.locators.postButton, 60000);
    await this.click(this.locators.postButton);
  }

  /** Exposed for the spec to assert on and screenshot — assertions belong in
   * the test, not here. */
  get highlightedResultLocator() {
    return this.locators.highlightedResult;
  }

  get carrierCellLocator() {
    return this.locators.carrierCell;
  }

  savedMessageTextLocator(message: string) {
    return this.locators.savedMessageText(message);
  }

  get messagesPanelLocator() {
    return this.locators.messagesPanel;
  }

  get entityNameLocator() {
    return this.locators.entityName;
  }

  get policyInfoPanelLocator() {
    return this.locators.policyInfoPanel;
  }
}
