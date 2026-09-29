import type { Page } from '@playwright/test';
import { BasePage } from '../../../framework/pages/BasePage';
import { AgencyBankSetupLocators } from './agencyBankSetup.locators';

/**
 * Page Object for the Alis Core Admin Manager's Agency > Bank Information
 * tab. Actions only — no assertions, no test data, no hardcoded URLs (see
 * CLAUDE.md §3 / knowledge/conventions.md). Built from
 * alis_core/knowledge/pages/agency-bank-setup.md.
 *
 * Unlike every other Page Object in this product, this one can't simply
 * `goto()` a URL: the Admin Manager only opens via a genuine click on the
 * BMS module switcher's "Admin" item, which fires `window.open()` into a
 * brand new browser tab/window (see the knowledge file's "Reaching this
 * page"). Construct it via the static `openFromBms()` factory instead of
 * `new AgencyBankSetupPage(page)` directly — it drives the click-and-capture
 * dance on an already-logged-in BMS page and hands back a Page Object
 * wrapping the new tab. `goto()` is overridden to fail loudly if called
 * directly, so a caller doesn't silently no-op.
 */
export class AgencyBankSetupPage extends BasePage {
  private readonly locators: AgencyBankSetupLocators;

  constructor(page: Page) {
    super(page);
    this.locators = new AgencyBankSetupLocators(page);
  }

  override async goto(): Promise<void> {
    throw new Error(
      'AgencyBankSetupPage has no direct URL — use AgencyBankSetupPage.openFromBms(bmsPage) instead, ' +
        'which captures the new tab/window the BMS module switcher\'s "Admin" item opens.',
    );
  }

  /** Opens Admin Manager from an already-logged-in BMS page (e.g. right
   * after `LoginPage.login()`), capturing the resulting new tab/window, and
   * returns a Page Object wrapping it.
   *
   * Waits on the new page's own "Business" top-nav item becoming visible,
   * rather than `page.waitForLoadState()` — confirmed the default ('load')
   * hangs to its own 30s timeout on this Admin Manager app, the same
   * continuous-background-polling behavior documented for
   * `openFirstAgencyDetails()` below. A targeted element wait is the
   * reliable signal throughout this app, not a page-wide load/network
   * heuristic. */
  static async openFromBms(bmsPage: Page): Promise<AgencyBankSetupPage> {
    const bmsLocators = new AgencyBankSetupLocators(bmsPage);
    await bmsLocators.moduleSwitcherToggle.click();
    // Wait for the dropdown's own open animation/render to finish and the
    // Admin item to actually be there before racing the click against the
    // new-page event below — confirmed necessary: an intermittent failure
    // was traced to this step, not to the popup-capture itself.
    await bmsLocators.adminMenuItem.waitFor({ state: 'visible', timeout: 10_000 });

    const [adminPage] = await Promise.all([
      bmsPage.context().waitForEvent('page'),
      bmsLocators.adminMenuItem.click(),
    ]);
    const adminLocators = new AgencyBankSetupLocators(adminPage);
    await adminLocators.businessTopNavMenu.waitFor({ state: 'visible', timeout: 15_000 });

    return new AgencyBankSetupPage(adminPage);
  }

  /** The Admin Manager tab/window this Page Object wraps — genuinely a
   * different `Page` than the BMS tab that opened it. Exposed so a caller
   * (e.g. a test taking its own screenshots for reporting) can target the
   * tab actually showing the relevant content, not the backgrounded
   * original. */
  get adminPage(): Page {
    return this.page;
  }

  async openBusinessAgencyListing(): Promise<void> {
    await this.click(this.locators.businessTopNavMenu);
    await this.click(this.locators.agencySidebarLink);
  }

  /** Opens the first agency row's Details (via its Edit icon).
   *
   * This is a classic ASP.NET WebForms full-page postback, not an SPA
   * transition — confirmed slower than this repo's default 5s assertion
   * timeout under parallel load (two instances of this test running at
   * once both timed out waiting for the Details tab to appear).
   * `page.waitForLoadState('networkidle')` looked like the right fix but
   * never resolved (30s timeout) — this Admin Manager app has some
   * continuous background polling, so "zero network activity for 500ms"
   * never actually happens. Waiting on the Details tab locator itself
   * (a bounded, targeted signal) is the reliable fix instead. */
  async openFirstAgencyDetails(): Promise<void> {
    await this.click(this.locators.firstRowEditIcon);
    await this.locators.detailsTab.waitFor({ state: 'visible', timeout: 15_000 });
  }

  async openBankInformationTab(): Promise<void> {
    await this.click(this.locators.bankInformationTab);
  }

  async setFilter(filter: 'all' | 'active' | 'inactive'): Promise<void> {
    const radio =
      filter === 'all'
        ? this.locators.filterAllRadio
        : filter === 'active'
          ? this.locators.filterActiveRadio
          : this.locators.filterInactiveRadio;
    await this.check(radio);
  }

  async clickSearch(): Promise<void> {
    await this.click(this.locators.searchButton);
  }

  /** Closes the Admin Manager tab/window this Page Object wraps. Callers
   * that opened this via `openFromBms()` should close it once done, rather
   * than leaving it open alongside the original BMS/Accounting tab — see
   * the e2e composition test for a case where leaving it open disturbed the
   * original tab's session state. */
  async close(): Promise<void> {
    await this.page.close();
  }

  // ---------------------------------------------------------------------
  // Exposed for the spec to assert on — assertions belong in the test, not
  // here.
  // ---------------------------------------------------------------------

  get agencyGridLocator() {
    return this.locators.agencyGrid;
  }

  get detailsTabLocator() {
    return this.locators.detailsTab;
  }

  get bankInformationPanelLocator() {
    return this.locators.bankInformationPanel;
  }

  get bankAccountTypeDropdownLocator() {
    return this.locators.bankAccountTypeDropdown;
  }

  get statusDropdownLocator() {
    return this.locators.statusDropdown;
  }

  get accountNumberFieldLocator() {
    return this.locators.accountNumberField;
  }

  get addButtonLocator() {
    return this.locators.addButton;
  }

  get recordsGridLocator() {
    return this.locators.recordsGrid;
  }

  get recordsGridRowsLocator() {
    return this.locators.recordsGridRows;
  }
}
