import type { Page } from '@playwright/test';
import { BasePage } from '../../../framework/pages/BasePage';
import { getRequiredEnv } from '../../../framework/utils/env';
import { CheckSummaryLocators } from './checkSummary.locators';

/**
 * Page Object for the Alis Core Accounting Check Register screen's "Check
 * Summary" popup. Actions only — no assertions, no test data, no hardcoded
 * URLs (see CLAUDE.md §3 / knowledge/conventions.md). Built from
 * alis_core/knowledge/pages/check-register.md and
 * alis_core/knowledge/pages/check-summary-popup.md.
 */
export class CheckSummaryPage extends BasePage {
  protected override path = '#/checkregister';

  private readonly locators: CheckSummaryLocators;

  constructor(page: Page) {
    super(page);
    this.locators = new CheckSummaryLocators(page);
  }

  /* Same Accounting sub-app as the other Payment/Check-Register page
   * objects — not resolvable against ALIS_CORE_BASE_URL. See
   * payment-upload.md's "Reaching this page". */
  override async goto(): Promise<void> {
    const accountingBaseUrl = getRequiredEnv('ALIS_CORE_ACCOUNTING_BASE_URL');
    await this.page.goto(`${accountingBaseUrl}${this.path}`);
  }

  async openFirstRowCheckSummary(): Promise<void> {
    await this.click(this.locators.firstRowCheckSummaryIcon);
  }

  async closePopup(): Promise<void> {
    await this.click(this.locators.modalCloseButton);
  }

  /** Scrolls the modal grid horizontally via a real wheel gesture -
   * confirmed necessary live 2026-09-30: this popup only renders ~4 of
   * its 20 columns until scrolled (ag-Grid column virtualization, same
   * quirk as check-register.md's Edge Cases). */
  async scrollModalGridHorizontally(deltaX: number): Promise<void> {
    await this.locators.modalGridBody.hover();
    await this.page.mouse.wheel(deltaX, 0);
  }

  /** Selects the modal grid's first row - confirmed live 2026-09-30: this
   * auto-populates the Payee/Address1/Address2/City-State-Zip form fields
   * below the grid with that row's current values (the actual edit
   * mechanism for "Edit Check Summary Detail" - see
   * check-summary-popup.md). Does not click Update - that's a real write,
   * left to the caller/not exercised by this pass.*/
  async selectFirstRow(): Promise<void> {
    await this.click(this.locators.modalGridRow.first());
  }

  // ---------------------------------------------------------------------
  // Exposed for the spec to assert on — assertions belong in the test, not
  // here.
  // ---------------------------------------------------------------------

  get checkRegisterTabLocator() {
    return this.locators.checkRegisterTab;
  }

  get firstRowCheckSummaryIconLocator() {
    return this.locators.firstRowCheckSummaryIcon;
  }

  get openModalLocator() {
    return this.locators.openModal;
  }

  get modalGridRowLocator() {
    return this.locators.modalGridRow;
  }

  modalGridCellLocator(colId: string) {
    return this.locators.modalGridCell(colId);
  }

  get payeeFieldLocator() {
    return this.locators.payeeField;
  }

  get address1FieldLocator() {
    return this.locators.address1Field;
  }
}
