import type { Page } from '@playwright/test';
import { BasePage } from '../../../framework/pages/BasePage';
import { HeaderLocators } from './header.locators';

/**
 * Page Object for the Alis Header — a persistent component on every
 * authenticated page, not a route of its own, so it has no `path`/`goto()`.
 * Built from /alis/knowledge/pages/header.md.
 */
export class HeaderPage extends BasePage {
  private readonly locators: HeaderLocators;

  constructor(page: Page) {
    super(page);
    this.locators = new HeaderLocators(page);
  }

  async clickLogo(): Promise<void> {
    await this.click(this.locators.logoLink);
  }

  async selectSearchType(value: string): Promise<void> {
    await this.select(this.locators.searchTypeDropdown, value);
  }

  async searchFor(value: string): Promise<void> {
    await this.enter(this.locators.searchBox, value);
  }

  /** Exposed for the spec to assert on — assertions belong in the test, not here. */
  get headerBarLocator() {
    return this.locators.headerBar;
  }

  get logoLinkLocator() {
    return this.locators.logoLink;
  }

  get searchTypeDropdownLocator() {
    return this.locators.searchTypeDropdown;
  }

  get searchBoxLocator() {
    return this.locators.searchBox;
  }

  get userAvatarLocator() {
    return this.locators.userAvatar;
  }
}
