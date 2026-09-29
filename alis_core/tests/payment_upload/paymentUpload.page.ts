import type { Locator, Page } from '@playwright/test';
import { BasePage } from '../../../framework/pages/BasePage';
import { getRequiredEnv } from '../../../framework/utils/env';
import { PaymentUploadLocators } from './paymentUpload.locators';

/**
 * Page Object for the Alis Core Accounting "Payment" screen's "Upload" tab.
 * Actions only — no assertions, no test data, no hardcoded URLs (see
 * CLAUDE.md §3 / knowledge/conventions.md). Built from
 * alis_core/knowledge/pages/payment-upload.md.
 */
export class PaymentUploadPage extends BasePage {
  /* Hash-only reference — but NOT resolved against the shared
   * PLAYWRIGHT_BASE_URL/ALIS_CORE_BASE_URL: the Accounting sub-app lives at a
   * different base path (".../ALIS.Accounting/APP/") than the BMS app used for
   * login (".../ALIS.BMS/APP/"), so goto() is overridden below to resolve
   * against ALIS_CORE_ACCOUNTING_BASE_URL instead. See payment-upload.md's
   * "Reaching this page" section. */
  protected override path = '#/payment';

  private readonly locators: PaymentUploadLocators;

  constructor(page: Page) {
    super(page);
    this.locators = new PaymentUploadLocators(page);
  }

  override async goto(): Promise<void> {
    const accountingBaseUrl = getRequiredEnv('ALIS_CORE_ACCOUNTING_BASE_URL');
    await this.page.goto(`${accountingBaseUrl}${this.path}`);
  }

  async openUploadTab(): Promise<void> {
    await this.click(this.locators.uploadTab);
  }

  async openBatchListTab(): Promise<void> {
    await this.click(this.locators.batchListTab);
  }

  /** Selects Client Type, waiting out its `GetBankList` reload if the value
   * actually changes — see setBatchHeader()'s doc comment. */
  async selectClientType(clientType: string): Promise<void> {
    await this.selectAndAwaitBankListReload(this.locators.clientTypeDropdown, clientType);
  }

  async setAcctEffDate(date: string): Promise<void> {
    await this.enter(this.locators.acctEffDateField, date);
  }

  /** Selects Entity, waiting out its `GetBankList` reload if the value
   * actually changes — see setBatchHeader()'s doc comment. */
  async selectEntity(entity: string): Promise<void> {
    await this.selectAndAwaitBankListReload(this.locators.entityDropdown, entity);
  }

  async selectBankGl(bankGl: string): Promise<void> {
    await this.select(this.locators.bankGlDropdown, bankGl);
  }

  /** Selects a value on a `<select>` that (when its value actually changes)
   * triggers an async `GetBankList` call resetting the Bank GL dropdown to
   * that list's first option once the response lands. Confirmed via a live
   * network-request trace 2026-09-21: **both** Client Type and Entity trigger
   * this on this Upload tab (not just Entity, as an earlier pass of this file
   * assumed) — `POST .../AcctCommon/GetBankList`. Skips the wait entirely
   * when the field is already at the desired value, since no change event (and
   * so no reload) fires in that case — confirmed by the same trace. */
  private async selectAndAwaitBankListReload(dropdown: Locator, value: string): Promise<void> {
    const currentValue = await dropdown.inputValue();
    if (currentValue === value) {
      return;
    }
    const bankListReloaded = this.page.waitForResponse((response) =>
      response.url().includes('/AcctCommon/GetBankList'),
    );
    await this.select(dropdown, value);
    await bankListReloaded;
  }

  /** Sets every batch-header field on the Upload tab in one call.
   *
   * Order matters: Client Type and Entity must both be set — and their
   * `GetBankList` reloads (see selectAndAwaitBankListReload()) awaited —
   * *before* Bank GL is touched, or the app silently overwrites whatever was
   * just picked once a late-arriving reload response lands. This is what
   * caused the original flake this file's history documents: Client Type was
   * being selected first (correct order) but without awaiting its reload, so
   * a slow `GetBankList` response could still land *after* Bank GL had
   * already been selected. See payment-upload.md's Edge Cases section. */
  async setBatchHeader(fields: {
    clientType: string;
    acctEffDate: string;
    entity: string;
    bankGl: string;
  }): Promise<void> {
    await this.selectClientType(fields.clientType);
    await this.setAcctEffDate(fields.acctEffDate);
    await this.selectEntity(fields.entity);
    await this.selectBankGl(fields.bankGl);
  }

  /** Not exercised by any spec yet — would perform a real write against this
   * production-looking environment. Exposed for future coverage once a
   * safe-to-upload sample file and teardown strategy are in place. */
  async chooseFile(filePath: string): Promise<void> {
    await this.locators.chooseFilesInput.setInputFiles(filePath);
  }

  async clickUpload(): Promise<void> {
    await this.click(this.locators.uploadButton);
  }

  async clickCancel(): Promise<void> {
    await this.click(this.locators.cancelButton);
  }

  // ---------------------------------------------------------------------
  // Exposed for the spec to assert on — assertions belong in the test, not
  // here.
  // ---------------------------------------------------------------------

  get uploadTabLocator() {
    return this.locators.uploadTab;
  }

  get clientTypeDropdownLocator() {
    return this.locators.clientTypeDropdown;
  }

  get acctEffDateFieldLocator() {
    return this.locators.acctEffDateField;
  }

  get entityDropdownLocator() {
    return this.locators.entityDropdown;
  }

  get bankGlDropdownLocator() {
    return this.locators.bankGlDropdown;
  }

  get chooseFilesInputLocator() {
    return this.locators.chooseFilesInput;
  }

  get downloadSampleLinkLocator() {
    return this.locators.downloadSampleLink;
  }

  get uploadButtonLocator() {
    return this.locators.uploadButton;
  }

  get cancelButtonLocator() {
    return this.locators.cancelButton;
  }
}
