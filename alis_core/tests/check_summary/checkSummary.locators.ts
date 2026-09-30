import type { Page } from '@playwright/test';

/**
 * Locator definitions for the Alis Core Accounting Check Register screen's
 * "Check Summary" popup — sourced from the "## Selectors" tables in
 * alis_core/knowledge/pages/check-register.md and
 * alis_core/knowledge/pages/check-summary-popup.md. Nothing but locators
 * belongs here; actions live in checkSummary.page.ts, assertions in
 * checkSummary.test.ts.
 */
export class CheckSummaryLocators {
  /** Check Register pane container — same duplicate-tab-pane-id pattern as
   * documented in check-register.md; scope here to avoid the Spoiled Checks
   * pane's copy of the same ids. */
  private readonly pane = this.page.locator('#pills-cashlisting');

  constructor(private readonly page: Page) {}

  get checkRegisterTab() {
    return this.page.locator('#pills-cashlisting-tab');
  }

  get firstRowCheckSummaryIcon() {
    return this.pane.locator('.ag-pinned-right-cols-container .ag-row i[title="Check Summary"]').first();
  }

  /** Several `.modal` elements are mounted in the DOM at once; only the
   * currently-open one carries Bootstrap's `.show` class — see
   * check-summary-popup.md's Edge Cases. Every locator below is scoped
   * under it. */
  get openModal() {
    return this.page.locator('.modal.show');
  }

  get modalCloseButton() {
    return this.openModal.locator('.btn-close');
  }

  get modalGridRow() {
    return this.openModal.locator('.ag-center-cols-container .ag-row');
  }

  modalGridCell(colId: string) {
    return this.openModal.locator(`.ag-center-cols-container [col-id="${colId}"]`);
  }

  /** A convenient point inside the modal grid to anchor a wheel-scroll
   * gesture at - same recipe as every other ag-Grid horizontal-
   * virtualization case in this app. Confirmed live 2026-09-30: this
   * popup renders all 20 of the PDF's listed fields, but only ~4 are
   * visible without scrolling; the rest (including the 5 Payee Address/
   * City/State/Zip fields, which use plain numeric col-ids "0"-"4", not
   * named ones) need scrolling to render. */
  get modalGridBody() {
    return this.openModal.locator('.ag-center-cols-viewport');
  }

  /** The Payee/Address1/Address2/City-State-Zip edit form below the grid -
   * confirmed live 2026-09-30: plain Angular reactive-form inputs (clean
   * ids, unlike almost everything else in this app), NOT part of the
   * ag-Grid at all. Empty until a grid row is clicked/selected (see
   * modalGridRow above); clicking Update while none is selected shows a
   * toast "Invalid - Please select a row to update." Selecting the row
   * auto-populates these fields with that row's current values - this is
   * the actual edit mechanism for the PDF's "Edit Check Summary Detail"
   * scenario, not ag-Grid inline cell editing (confirmed Payee Address1
   * etc. are NOT inline-editable via dblclick). Update fires a real
   * `POST .../Checkregister/UpdateCheckPayeeInformation` - a genuine
   * write, not exercised by this pass (see check-summary-popup.md's Edge
   * Cases). */
  get payeeField() {
    return this.openModal.locator('#txtClientPayee');
  }

  get address1Field() {
    return this.openModal.locator('#txtAddress1');
  }

  get address2Field() {
    return this.openModal.locator('#txtAddress2');
  }

  get cityStateZipField() {
    return this.openModal.locator('#txtCityStateZip');
  }
}
