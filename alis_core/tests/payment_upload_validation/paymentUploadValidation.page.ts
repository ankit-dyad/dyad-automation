import type { Page } from '@playwright/test';
import { BasePage } from '../../../framework/pages/BasePage';
import { getRequiredEnv } from '../../../framework/utils/env';
import { PaymentUploadValidationLocators } from './paymentUploadValidation.locators';

/**
 * Page Object for the Alis Core Accounting Payment screen's Upload tab,
 * covering the file-selection-and-validation flow (Valid/Invalid Invoice
 * split). Actions only — no assertions, no test data, no hardcoded URLs (see
 * CLAUDE.md §3 / knowledge/conventions.md). Built from
 * alis_core/knowledge/pages/payment-upload.md and
 * alis_core/knowledge/pages/payment-upload-file-validation.md.
 */
export class PaymentUploadValidationPage extends BasePage {
  protected override path = '#/payment';

  private readonly locators: PaymentUploadValidationLocators;

  constructor(page: Page) {
    super(page);
    this.locators = new PaymentUploadValidationLocators(page);
  }

  /* Same Accounting sub-app as the other Payment-screen page objects — not
   * resolvable against ALIS_CORE_BASE_URL. See payment-upload.md's "Reaching
   * this page". */
  override async goto(): Promise<void> {
    const accountingBaseUrl = getRequiredEnv('ALIS_CORE_ACCOUNTING_BASE_URL');
    await this.page.goto(`${accountingBaseUrl}${this.path}`);
  }

  async openUploadTab(): Promise<void> {
    await this.click(this.locators.uploadTab);
  }

  /** Fetches the app's own official sample template via its "Download" link
   * (as a buffer, through the already-authenticated page context) and
   * chooses it in the file input — never written to disk or committed to
   * the repo, so this can't go stale as a binary fixture. See
   * payment-upload-file-validation.md's Overview for what this file
   * contains and why it's safe to upload (its data is fabricated placeholder
   * data that always lands in Invalid Invoice on this environment). */
  async chooseOfficialSampleFile(): Promise<void> {
    const href = await this.locators.downloadSampleLink.getAttribute('href');
    if (!href) {
      throw new Error('Download sample link has no href.');
    }
    const response = await this.page.request.get(new URL(href, this.page.url()).toString());
    const buffer = await response.body();
    await this.locators.chooseFilesInput.setInputFiles({
      name: 'payment_upload_sample.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      buffer,
    });
  }

  /** Clicks Upload and waits for the resulting Valid/Invalid Invoice split
   * to actually render before returning.
   *
   * Confirmed via a live network trace: when run as one step of a longer
   * composed flow (several prior navigations/tabs already open), the click
   * can occasionally fire **no request at all** — neither tab ever appears,
   * and nothing resembling an upload/validate call shows up in the network
   * log afterwards. This wasn't reproduced in isolation, only after several
   * prior steps, and looks like an app-side race between the file input's
   * change-detection settling and the button's own click handler attaching
   * (not confirmed further — this app's client-side validation internals
   * aren't inspectable from here). Retrying the click once if the tabs don't
   * appear promptly is the pragmatic fix, since the file selection itself
   * persists across a re-click. */
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

  async openInvalidInvoiceTab(): Promise<void> {
    await this.click(this.locators.invalidInvoiceTab);
  }

  // ---------------------------------------------------------------------
  // Exposed for the spec to assert on — assertions belong in the test, not
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

  get validInvoiceGridHeadersLocator() {
    return this.locators.validInvoiceGridHeaders;
  }

  get invalidInvoiceGridRowsLocator() {
    return this.locators.invalidInvoiceGridRows;
  }

  invalidInvoiceGridCellLocator(colId: string) {
    return this.locators.invalidInvoiceGridCell(colId);
  }

  get savePaymentButtonLocator() {
    return this.locators.savePaymentButton;
  }
}
