import type { Page } from '@playwright/test';

/**
 * Locator definitions for reaching and driving the Alis Core Admin
 * Manager's Agency > Bank Information tab — sourced from the
 * "## Selectors" table in alis_core/knowledge/pages/agency-bank-setup.md.
 * Nothing but locators belongs here; actions live in
 * agencyBankSetup.page.ts, assertions in agencyBankSetup.test.ts.
 *
 * This is a different application (classic ASP.NET WebForms) from every
 * other product's Angular SPA — expect `input[type=submit]` buttons,
 * auto-numbered GridView row ids, and `__tab_...` TabContainer anchors
 * instead of this repo's usual conventions. See the knowledge file's Edge
 * Cases.
 */
export class AgencyBankSetupLocators {
  constructor(private readonly page: Page) {}

  // -- BMS module switcher (on the page passed in, before the new tab opens) --

  /* Scoped by the presence of the "Admin" menu item inside the same
   * `.dropdown`, not by the toggle's own current label — that label reflects
   * whichever module is currently active ("Business Manager" right after
   * login, but "Accounting" once a caller has navigated to the Accounting
   * sub-app first). Confirmed via a composed multi-page flow: a
   * label-specific selector silently stopped matching once Payment Upload
   * had already switched the page to Accounting before this ran. `has:`
   * only requires the inner element to exist in the DOM, not be visible, so
   * this matches whether or not the dropdown is currently open. */
  get moduleSwitcherToggle() {
    return this.page
      .locator('.dropdown', { has: this.page.locator('a.dropdown-item', { hasText: 'Admin' }) })
      .locator('[data-bs-toggle="dropdown"]');
  }

  get adminMenuItem() {
    return this.page.locator('a.dropdown-item:has-text("Admin")');
  }

  // -- Admin Manager (on the new tab/page this opens) --

  /* Not individually confirmed via DOM inspection beyond visual/coordinate
   * clicking during exploration — exact-text match narrows risk, but flag
   * as fragile until confirmed against a fresh DOM read. */
  get businessTopNavMenu() {
    return this.page.getByText('Business', { exact: true }).first();
  }

  /** Confirmed via live DOM: a real `<a>` with a static `href` to
   * `Agency.aspx?data=...` (see agency-bank-setup.md's URL section). */
  get agencySidebarLink() {
    return this.page.getByRole('link', { name: 'Agency', exact: true });
  }

  get listingTab() {
    return this.page.locator('#__tab_ctl01_ContentPlaceHolder2_tcAgencies_tbpnlListing');
  }

  get detailsTab() {
    return this.page.locator('#__tab_ctl01_ContentPlaceHolder2_tcAgencies_tbpnlDetail');
  }

  get agencyGrid() {
    return this.page.locator('#ctl01_ContentPlaceHolder2_tcAgencies_tbpnlListing_gvAgencyData');
  }

  get firstRowEditIcon() {
    return this.agencyGrid.locator('[id$="_imgEditAD"]').first();
  }

  get bankInformationTab() {
    return this.page.locator(
      '#__tab_ctl01_ContentPlaceHolder2_tcAgencies_tbpnlDetail_tcChildPanels_tpBankInformation',
    );
  }

  private readonly bankInfoPrefix =
    '#ctl01_ContentPlaceHolder2_tcAgencies_tbpnlDetail_tcChildPanels_tpBankInformation';

  get bankInformationPanel() {
    return this.page.locator(this.bankInfoPrefix);
  }

  get bankAccountTypeDropdown() {
    return this.page.locator(`${this.bankInfoPrefix}_ddlBankAccountType`);
  }

  get bankNumberField() {
    return this.page.locator(`${this.bankInfoPrefix}_txtBankNumber`);
  }

  /** Labeled "Minimum Payment Amount" in the UI — the id itself says
   * "Limit", not "MinPayment"; confirmed via live DOM, not guessed. */
  get minimumPaymentAmountField() {
    return this.page.locator(`${this.bankInfoPrefix}_txtLimitAmount`);
  }

  get statusDropdown() {
    return this.page.locator(`${this.bankInfoPrefix}_ddlBankStatus`);
  }

  get checkingRadio() {
    return this.page.locator(`${this.bankInfoPrefix}_rdbtnlstAcctType_0`);
  }

  get savingRadio() {
    return this.page.locator(`${this.bankInfoPrefix}_rdbtnlstAcctType_1`);
  }

  get accountNumberField() {
    return this.page.locator(`${this.bankInfoPrefix}_txtAccountNumber`);
  }

  /** Note the misspelling ("Deposite") — confirmed via live DOM. */
  get directDepositCheckbox() {
    return this.page.locator(`${this.bankInfoPrefix}_chkDirectDeposite`);
  }

  get accountValidatedCheckbox() {
    return this.page.locator(`${this.bankInfoPrefix}_chkAccountValidate`);
  }

  get addButton() {
    return this.page.locator(`${this.bankInfoPrefix}_btnAddBankInformation`);
  }

  get cancelButton() {
    return this.page.locator(`${this.bankInfoPrefix}_btnCancelBankInformation`);
  }

  get filterAllRadio() {
    return this.page.locator(`${this.bankInfoPrefix}_rbtnall`);
  }

  get filterActiveRadio() {
    return this.page.locator(`${this.bankInfoPrefix}_rbtnactive`);
  }

  get filterInactiveRadio() {
    return this.page.locator(`${this.bankInfoPrefix}_rbtninactive`);
  }

  get searchButton() {
    return this.page.locator(`${this.bankInfoPrefix}_btnBankSearch`);
  }

  get recordsGrid() {
    return this.page.locator(`${this.bankInfoPrefix}_gvBankInformation`);
  }

  /** All rows including the header row (row 0) — confirmed via live DOM the
   * header is a plain `<tr>`, not necessarily `<th>` cells (ASP.NET
   * `GridView` header styling varies), so callers should skip index 0
   * themselves (e.g. `.nth(1)` for the first data row) rather than this
   * class guessing a header-detection strategy. */
  get recordsGridRows() {
    return this.recordsGrid.locator('tr');
  }
}
