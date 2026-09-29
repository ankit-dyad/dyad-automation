import type { Page } from '@playwright/test';

/**
 * Locator definitions for the Nexsure "Create Client" flow (Opportunities list ->
 * "New" -> Select Client's Find Client search -> New Client -> the 3-step
 * "Clients: New" wizard) — sourced from the "## Selectors" table in
 * nexsure/knowledge/pages/create-client.md. Nothing but locators belongs here;
 * actions live in createClient.page.ts, assertions in createClient.test.ts.
 */
export class CreateClientLocators {
  constructor(private readonly page: Page) {}

  // --- Header navigation (nexsure/knowledge/pages/header.md) -> Opportunities list ---

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

  // --- Opportunities list -> New Opportunity's Select Client step ---

  get opportunitiesNewButton() {
    return this.page.getByRole('button', { name: 'New', exact: true }).first();
  }

  get findClientKeywordsField() {
    return this.page.locator('.form_group.keywords input');
  }

  get findClientPopover() {
    return this.page.locator('#findClientPopover');
  }

  get newClientButton() {
    return this.findClientPopover.getByRole('button', { name: 'New Client' });
  }

  // --- "Clients: New" wizard — step 1: Client Info ---

  get clientTypeGroup() {
    return this.page.locator(".form_group:has-text('Client type')");
  }

  get clientTypeCommercialButton() {
    return this.clientTypeGroup.getByRole('button', { name: 'Commercial' });
  }

  get clientTypePersonalButton() {
    return this.clientTypeGroup.getByRole('button', { name: 'Personal' });
  }

  get clientNameField() {
    return this.page.locator(".form_group.nex_required_input:has-text('Client Name') input");
  }

  get locationTypeToggle() {
    return this.page.locator(".form_group:has-text('Location Type') .vs__dropdown-toggle");
  }

  get streetAddressField() {
    return this.page.locator(".form_group:has-text('Street Address') input");
  }

  get cityField() {
    return this.page.locator(".form_group.nex_required_input:has-text('City') input");
  }

  get stateToggle() {
    return this.page.locator(".form_group:has-text('State/Province') .vs__dropdown-toggle");
  }

  /* Scoped to the State/Province form_group — `input.vs__search` alone matches
   * every vue-select widget on the page (Location Type, Country, etc.), since
   * vue-select always renders its search input, not just while open.
   * <!-- fragile: create-client.md's table lists this unscoped, live DOM needs
   * scoping --> */
  get stateSearchInput() {
    return this.page.locator(".form_group:has-text('State/Province') input.vs__search");
  }

  get zipField() {
    return this.page.locator(".form_group:has-text('Zip/Postal') input");
  }

  get nextButton() {
    return this.page.getByRole('button', { name: 'Next', exact: true });
  }

  get addressUnverifiableOkButton() {
    return this.page.getByRole('button', { name: 'OK' });
  }

  /** Shared markup behind Location Type, State/Province, Branch, and Department —
   * all are vue-select dropdowns using the same `.vs__dropdown-menu li` option
   * list, just a different option's text. */
  dropdownOption(optionText: string) {
    return this.page.locator('.vs__dropdown-menu li', { hasText: optionText });
  }

  // --- Step 2: Client Contacts ---

  get addContactModal() {
    return this.page.locator('.contact_modal');
  }

  get contactLastNameField() {
    return this.addContactModal.locator(".form_group:has-text('Last Name') input");
  }

  get saveContactButton() {
    return this.page.getByRole('button', { name: 'Save', exact: true });
  }

  // --- Step 3: Assignment ---

  get branchToggle() {
    return this.page.locator(".form_group:has-text('Branch') .vs__dropdown-toggle");
  }

  get departmentToggle() {
    return this.page.locator(".form_group:has-text('Department') .vs__dropdown-toggle");
  }

  get responsibilityToggle() {
    return this.page.locator(".form_group:has-text('Responsibility') .vs__dropdown-toggle");
  }

  get employeeToggle() {
    return this.page.locator(".form_group:has-text('Employee') .vs__dropdown-toggle");
  }

  get doneButton() {
    return this.page.getByRole('button', { name: 'Done', exact: true });
  }

  // --- Back on the opportunity's Select Client step, post-creation ---

  clientSummary(clientName: string, clientType: 'Commercial' | 'Personal') {
    const marker = clientType === 'Commercial' ? '(C)' : '(P)';
    return this.page.getByText(`Client: ${clientName}${marker}`);
  }
}
