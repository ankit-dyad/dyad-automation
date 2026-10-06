import type { Locator, Page } from '@playwright/test';
import { BasePage } from '../../../framework/pages/BasePage';
import { CreateClientLocators } from './createClient.locators';

/**
 * Page Object for the Nexsure "Create Client" flow. Built from
 * nexsure/knowledge/pages/create-client.md — see that file for the full flow this
 * drives: Opportunities list -> "New" -> Select Client's Find Client search (no
 * match) -> New Client -> the 3-step "Clients: New" wizard (Client Info, Client
 * Contacts, Assignment).
 */
export class CreateClientPage extends BasePage {
  private readonly locators: CreateClientLocators;

  constructor(page: Page) {
    super(page);
    this.locators = new CreateClientLocators(page);
  }

  /** Reaches the Opportunities list via the header's Home menu (see
   * nexsure/knowledge/pages/header.md) — a bare `page.goto('#/opportunities')`
   * doesn't drive the Vue Router the same way an in-app navigation click does
   * (confirmed: it leaves the SPA showing whatever page it was already on), so
   * BasePage's default path-based goto() isn't used here. Requires a page that's
   * already authenticated (the header only renders post-login). */
  override async goto(): Promise<void> {
    await this.click(this.locators.homeMenuButton);
    await this.click(this.locators.opportunitiesNavLink);
    await this.waitForVisible(this.locators.opportunitiesNewButton);
  }

  async startNewOpportunity(): Promise<void> {
    await this.click(this.locators.opportunitiesNewButton);
  }

  /** Types a client-name keyword into the Find-a-Client search — results appear
   * live/near-live as you type, no separate search button to click. */
  async searchForClient(keyword: string): Promise<void> {
    await this.enter(this.locators.findClientKeywordsField, keyword);
  }

  /** Only available in the popover's "No Results Found" state. */
  async clickNewClient(): Promise<void> {
    await this.click(this.locators.newClientButton);
  }

  async selectClientType(clientType: 'Commercial' | 'Personal'): Promise<void> {
    const button =
      clientType === 'Commercial'
        ? this.locators.clientTypeCommercialButton
        : this.locators.clientTypePersonalButton;
    await this.click(button);
  }

  /** Client Name pre-fills from the Find-a-Client search keyword — only call this
   * to override it. */
  async fillClientName(name: string): Promise<void> {
    await this.enter(this.locators.clientNameField, name);
  }

  /** Location Type's option list depends on Client Type — select Client Type
   * first (see create-client.md's Edge Cases). */
  async selectLocationType(locationType: string): Promise<void> {
    await this.selectDropdownOption(this.locators.locationTypeToggle, locationType);
  }

  async fillStreetAddress(streetAddress: string): Promise<void> {
    await this.enter(this.locators.streetAddressField, streetAddress);
  }

  async fillCity(city: string): Promise<void> {
    await this.enter(this.locators.cityField, city);
  }

  /** Types into the State/Province search box and waits for the filtered option
   * before clicking — clicking immediately can select a stale, pre-filter option
   * (see create-client.md's Edge Cases). */
  async selectState(state: string): Promise<void> {
    await this.click(this.locators.stateToggle);
    await this.enter(this.locators.stateSearchInput, state);
    const option = this.locators.dropdownOption(state);
    await this.waitForVisible(option);
    await this.click(option);
  }

  async fillZipCode(zip: string): Promise<void> {
    await this.enter(this.locators.zipField, zip);
  }

  async clickNext(): Promise<void> {
    await this.click(this.locators.nextButton);
  }

  /** A synthetic/unverifiable street address triggers a confirmation dialog —
   * this does not always appear (see create-client.md's Edge Cases), so it's
   * dismissed conditionally rather than assumed. */
  async dismissAddressVerificationDialogIfPresent(): Promise<void> {
    try {
      await this.waitForVisible(this.locators.addressUnverifiableOkButton, 3000);
    } catch {
      return;
    }
    await this.click(this.locators.addressUnverifiableOkButton);
  }

  /** The Add Contact modal auto-opens the first time step 2 is reached — First
   * Name arrives pre-filled from the client name, only Last Name needs typing. */
  async fillContactLastName(lastName: string): Promise<void> {
    await this.waitForVisible(this.locators.addContactModal);
    await this.enter(this.locators.contactLastNameField, lastName);
  }

  async clickSaveContact(): Promise<void> {
    await this.click(this.locators.saveContactButton);
    await this.locators.addContactModal.waitFor({ state: 'hidden' });
  }

  async selectBranch(branch: string): Promise<void> {
    await this.selectDropdownOption(this.locators.branchToggle, branch);
  }

  async selectDepartment(department: string): Promise<void> {
    await this.selectDropdownOption(this.locators.departmentToggle, department);
  }

  async clickDone(): Promise<void> {
    await this.click(this.locators.doneButton);
  }

  /** Opens a vue-select dropdown and clicks the option matching `optionText` —
   * shared shape behind Location Type, Branch, and Department. State/Province
   * additionally needs a type-ahead filter step, handled in selectState(). */
  private async selectDropdownOption(toggle: Locator, optionText: string): Promise<void> {
    await this.click(toggle);
    const option = this.locators.dropdownOption(optionText);
    await this.waitForVisible(option);
    await this.click(option);
  }

  /** Exposed for the spec to assert on — assertions belong in the test, not here. */
  get opportunitiesNewButtonLocator() {
    return this.locators.opportunitiesNewButton;
  }

  get findClientPopoverLocator() {
    return this.locators.findClientPopover;
  }

  get newClientButtonLocator() {
    return this.locators.newClientButton;
  }

  get clientNameFieldLocator() {
    return this.locators.clientNameField;
  }

  get addContactModalLocator() {
    return this.locators.addContactModal;
  }

  clientSummaryLocator(clientName: string, clientType: 'Commercial' | 'Personal') {
    return this.locators.clientSummary(clientName, clientType);
  }
}
