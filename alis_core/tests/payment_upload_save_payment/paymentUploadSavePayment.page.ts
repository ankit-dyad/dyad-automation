import path from 'node:path';
import type { Page } from '@playwright/test';
import { BasePage } from '../../../framework/pages/BasePage';
import { getRequiredEnv } from '../../../framework/utils/env';
import { PaymentUploadSavePaymentLocators } from './paymentUploadSavePayment.locators';

/** Committed test fixture - the real-AGT003 file confirmed (2026-09-28) to
 * land 12/12 rows in Valid Invoice on this environment when Entity is set to
 * "Dyad Tech DC". See payment-upload-file-validation.md's Overview. */
const AGT003_VALID_FIXTURE = path.join(__dirname, '..', 'fixtures', 'payment_upload_agt003_valid.xlsx');

/**
 * Page Object for the Alis Core Accounting Payment screen's Upload tab,
 * covering the write path: Entity selection -> upload -> Valid Invoice row
 * selection -> Save Payment. Actions only - no assertions, no hardcoded URLs
 * (see CLAUDE.md §3 / knowledge/conventions.md). Built from
 * alis_core/knowledge/pages/payment-upload.md and
 * alis_core/knowledge/pages/payment-upload-file-validation.md.
 */
export class PaymentUploadSavePaymentPage extends BasePage {
  protected override path = '#/payment';

  private readonly locators: PaymentUploadSavePaymentLocators;

  constructor(page: Page) {
    super(page);
    this.locators = new PaymentUploadSavePaymentLocators(page);
  }

  /* Same Accounting sub-app as the other Payment-screen page objects - not
   * resolvable against ALIS_CORE_BASE_URL. See payment-upload.md's "Reaching
   * this page". */
  override async goto(): Promise<void> {
    const accountingBaseUrl = getRequiredEnv('ALIS_CORE_ACCOUNTING_BASE_URL');
    await this.page.goto(`${accountingBaseUrl}${this.path}`);
  }

  async openUploadTab(): Promise<void> {
    await this.click(this.locators.uploadTab);
  }

  /** Selects Entity = "Dyad Tech DC" (the AGT003 reference entity - see
   * data.json), avoiding the default "Dyad Inc" mismatch documented in
   * payment-upload-file-validation.md. Per payment-upload.md's Edge Cases,
   * changing Entity fires an async GetBankList reload that resets Bank GL -
   * irrelevant to this flow (Bank GL isn't touched here), but still worth
   * letting settle before uploading so the reload doesn't race the file
   * input's own change-detection. */
  async selectAgt003Entity(): Promise<void> {
    const currentValue = await this.locators.entityDropdown.inputValue();
    if (currentValue === '23') {
      // Already "Dyad Tech DC" - selecting it again would fire no change
      // event and no reload (confirmed in payment-upload.md).
      return;
    }
    const reload = this.page.waitForResponse((res) => res.url().includes('/AcctCommon/GetBankList'));
    await this.select(this.locators.entityDropdown, '23');
    await reload;
  }

  async chooseAgt003ValidFile(): Promise<void> {
    await this.locators.chooseFilesInput.setInputFiles(AGT003_VALID_FIXTURE);
  }

  /** Same retry-once defense as paymentUploadValidation.page.ts's
   * clickUpload() - see that file's docstring for the root-cause trace. */
  async clickUpload(): Promise<void> {
    const waitForSplit = () =>
      Promise.race([
        this.locators.validInvoiceTab.waitFor({ state: 'visible', timeout: 8_000 }),
        this.locators.invalidInvoiceTab.waitFor({ state: 'visible', timeout: 8_000 }),
      ]);

    await this.click(this.locators.uploadButton);
    try {
      await waitForSplit();
      return;
    } catch {
      // Fall through to a retry below.
    }

    await this.click(this.locators.uploadButton);
    await waitForSplit();
  }

  async openValidInvoiceTab(): Promise<void> {
    await this.click(this.locators.validInvoiceTab);
  }

  async selectAllValidInvoiceRows(): Promise<void> {
    await this.check(this.locators.selectAllCheckbox);
  }

  /** Unchecks any row(s) whose Amount renders negative. Confirmed live
   * 2026-09-28 (user's manual repro): the AGT003 fixture's last row
   * (INV115580) is -$10.00, and Save Payment rejects the *entire* selection
   * with an "Invalid Transactions" modal and creates no batch at all while
   * it's included - even though the other 11 rows are individually valid.
   * Returns how many rows were deselected, so the caller can assert on it.
   *
   * This grid vertically virtualizes its rows (ag-Grid row model) - the
   * target row (last of 12) isn't necessarily rendered into the DOM at all
   * until the grid is scrolled, so a first attempt that didn't scroll first
   * timed out waiting for a checkbox that didn't exist yet. Same class of
   * quirk as payment-batch-list.md's scroll-gesture note, just vertical
   * instead of horizontal, and same JS-scrollTop-plus-dispatch fix (a plain
   * `scrollIntoViewIfNeeded()` can't help when the element isn't in the DOM
   * to begin with). */
  async deselectNegativeAmountRows(): Promise<number> {
    await this.page.evaluate(() => {
      const viewport = document.querySelector('#GridValidInvoice .ag-body-viewport');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
        viewport.dispatchEvent(new Event('scroll'));
      }
    });

    // The negative-amount row's checkbox isn't inside the row itself - see
    // negativeAmountRows()'s docstring: the data-columns duplicate (which
    // `hasText` can match) and the pinned-left checkbox duplicate are two
    // separate DOM elements sharing a `row-index`. Read that index off the
    // matched row(s), then uncheck their pinned-left counterpart.
    const rowIndexes = await this.locators.negativeAmountRows.evaluateAll((rows) =>
      rows.map((row) => row.getAttribute('row-index')).filter((value): value is string => value !== null),
    );
    for (const rowIndex of rowIndexes) {
      await this.uncheck(this.locators.pinnedCheckboxForRow(rowIndex));
    }
    return rowIndexes.length;
  }

  /** Real write - creates a real payment batch against real AGT003 invoices.
   * See payment-upload-file-validation.md's Edge Cases.
   *
   * Confirmed live 2026-09-28: Save Payment POSTs to the same
   * `payment/UploadPaymentBatch` endpoint the initial file upload used, and
   * returns `HTTP 200` in **both** the success case and the
   * business-validation-failure case (negative-amount row rejected) - so the
   * response status alone can't distinguish them. The two runs before this
   * fix returned 200 with an empty body and created no batch, which looked
   * like exactly this failure mode until the user's manual repro isolated
   * the actual cause. The real signal is which UI element appears
   * afterward: the "Invalid Transactions" modal, or the success toast (see
   * waitForSaveOutcome()). This method itself only clicks - awaiting the
   * *response* is not enough (see the two-attempt history above); the
   * caller must additionally await one of those UI signals before treating
   * the write as settled. */
  async clickSavePayment(): Promise<void> {
    await this.click(this.locators.savePaymentButton);
  }

  /** Waits for whichever of the two possible outcomes appears after
   * clickSavePayment(): the "Invalid Transactions" modal (a row failed
   * business validation, no batch created) or the success toast (a real
   * batch was created). */
  async waitForSaveOutcome(): Promise<'invalid' | 'success'> {
    return Promise.race([
      this.locators.invalidTransactionsModal
        .waitFor({ state: 'visible', timeout: 10_000 })
        .then((): 'invalid' => 'invalid'),
      this.locators.successToast.waitFor({ state: 'visible', timeout: 10_000 }).then((): 'success' => 'success'),
    ]);
  }

  async closeInvalidTransactionsModal(): Promise<void> {
    await this.click(this.locators.invalidTransactionsCloseButton);
  }

  /** Parses "Payment Created Successfully. Batch# <N>" for the batch number,
   * so the caller can independently verify it in Batch List. */
  async getCreatedBatchNumber(): Promise<string> {
    const text = await this.textOf(this.locators.successToast);
    const match = text.match(/Batch#\s*(\d+)/);
    if (!match) {
      throw new Error(`Could not parse a batch number out of success toast text: "${text}"`);
    }
    return match[1];
  }

  /** Confirmed live 2026-09-28: a successful Save Payment auto-navigates
   * back to the Batch List tab by itself, so this is a no-op in the common
   * case - only clicks if some other tab is still active.
   *
   * Root-caused live 2026-09-29 after three consecutive real-write runs each
   * hung for their entire test budget right here (initially misattributed to
   * pure environment slowness, a theory this replaces): `batchListTab` was built
   * against `#pills-batch-tab`, but payment-batch-list.md's Selectors table
   * already documents that this button's real `id` has a trailing space
   * (`"pills-batch-tab "`), so that CSS id selector matched zero elements -
   * every single time, not just when this click was "actually needed". Fixed
   * by switching that locator to the same role-based selector every other
   * page object in this repo already uses for this exact landmine. Network
   * activity in the failing traces also went fully silent for minutes before
   * the outer timeout fired, which the locator fix alone may not fully
   * explain - re-verify this is genuinely resolved on the next live run
   * rather than assuming the fix is complete. */
  async openBatchListTab(): Promise<void> {
    const alreadyOnBatchList = await this.locators.batchListTab
      .evaluate((el) => el.classList.contains('active'))
      .catch(() => false);
    if (!alreadyOnBatchList) {
      await this.locators.batchListTab.click({ timeout: 15_000 });
    }
  }

  /** Scrolls the batch-level Payment tab's grid horizontally - same
   * real-wheel-gesture requirement as check-register.md/payment-batch-list.md's
   * scroll-gesture note. */
  async scrollPaymentGridHorizontally(deltaX: number): Promise<void> {
    await this.locators.paymentGridBody.hover();
    await this.page.mouse.wheel(deltaX, 0);
  }

  /** Scrolls the Batch List grid horizontally via a real wheel gesture -
   * confirmed necessary in payment-batch-list.md's Edge Cases: setting
   * `scrollLeft` directly via JS does not trigger ag-Grid's column
   * virtualization to render columns past "Entry Date". Independent of
   * isolateBatchNo() - that narrows which row renders, not which columns. */
  async scrollBatchListGridHorizontally(deltaX: number): Promise<void> {
    await this.locators.batchListGridBody.hover();
    await this.page.mouse.wheel(deltaX, 0);
  }

  async openFiltersPanel(): Promise<void> {
    await this.click(this.locators.filtersTab);
  }

  async expandBatchNoFilter(): Promise<void> {
    await this.click(this.locators.batchNoGroupHeader);
  }

  /** Isolates the Batch List grid to just the batch this Save Payment run
   * just created, using only the `(Select All)` toggle - same recipe as
   * batchListSearchByNumber.page.ts's isolateBatchNo() and
   * invoiceApplication.page.ts's identical method, reused here instead of
   * the scroll-to-bottom + row-index correlation approach tried first (that
   * approach was never actually verified live - every prior run hit the
   * openBatchListTab bug above before reaching it - so this reuses an
   * already-proven mechanism instead of trusting an unverified one). */
  async isolateBatchNo(batchNo: string): Promise<void> {
    await this.click(this.locators.selectAllFilterCheckbox);
    await this.enter(this.locators.batchNoSearchInput, batchNo);
    await this.click(this.locators.selectAllFilterCheckbox);
  }

  /** Opens the isolated batch's Payment tab - after isolateBatchNo() narrows
   * the grid to exactly one row, firstRowAddEditIcon correctly targets it
   * (same pattern as invoiceApplication.page.ts's openFirstBatchPaymentTab()
   * after its own isolateBatchNo() call). */
  async openIsolatedBatchPaymentTab(): Promise<void> {
    await this.click(this.locators.firstRowAddEditIcon);
  }

  // ---------------------------------------------------------------------
  // Exposed for the spec to assert on - assertions belong in the test, not
  // here.
  // ---------------------------------------------------------------------

  get uploadTabLocator() {
    return this.locators.uploadTab;
  }

  get validInvoiceTabLocator() {
    return this.locators.validInvoiceTab;
  }

  get invalidInvoiceTabLocator() {
    return this.locators.invalidInvoiceTab;
  }

  get validInvoiceGridRowsLocator() {
    return this.locators.validInvoiceGridRows;
  }

  get totalPaymentAmountTextLocator() {
    return this.locators.totalPaymentAmountText;
  }

  get savePaymentButtonLocator() {
    return this.locators.savePaymentButton;
  }

  get invalidTransactionsModalLocator() {
    return this.locators.invalidTransactionsModal;
  }

  get negativeAmountRowsLocator() {
    return this.locators.negativeAmountRows;
  }

  get successToastLocator() {
    return this.locators.successToast;
  }

  batchListRowLocator(batchNo: string) {
    return this.locators.batchListRow(batchNo);
  }

  batchListCellForBatchLocator(batchNo: string, colId: string) {
    return this.locators.batchListCellForBatch(batchNo, colId);
  }

  firstPaymentRowCellLocator(colId: string) {
    return this.locators.firstPaymentRowCell(colId);
  }
}
