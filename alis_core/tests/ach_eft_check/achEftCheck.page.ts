import type { Page } from '@playwright/test';
import { BasePage } from '../../../framework/pages/BasePage';
import { getRequiredEnv } from '../../../framework/utils/env';
import { AchEftCheckLocators } from './achEftCheck.locators';

/**
 * Page Object for the Alis Core Accounting Payment screen's "ACH / EFT &
 * Check" tab. Actions only — no assertions, no test data, no hardcoded URLs
 * (see CLAUDE.md §3 / knowledge/conventions.md). Built from
 * alis_core/knowledge/pages/ach-eft-check.md.
 */
export class AchEftCheckPage extends BasePage {
  protected override path = '#/payment';

  private readonly locators: AchEftCheckLocators;

  constructor(page: Page) {
    super(page);
    this.locators = new AchEftCheckLocators(page);
  }

  /* Same Accounting sub-app as the other Payment-screen page objects — not
   * resolvable against ALIS_CORE_BASE_URL. See payment-upload.md's "Reaching
   * this page". */
  override async goto(): Promise<void> {
    const accountingBaseUrl = getRequiredEnv('ALIS_CORE_ACCOUNTING_BASE_URL');
    await this.page.goto(`${accountingBaseUrl}${this.path}`);
  }

  async openAchEftCheckTab(): Promise<void> {
    await this.click(this.locators.achEftCheckTab);
  }

  async setSearchBy(option: string): Promise<void> {
    await this.select(this.locators.searchByDropdown, option);
  }

  async enterBatchNo(batchNo: string): Promise<void> {
    await this.enter(this.locators.batchNoField, batchNo);
  }

  async clickSearch(): Promise<void> {
    await this.click(this.locators.searchButton);
  }

  async firstRowBatchNo(): Promise<string> {
    return this.textOf(this.locators.gridCell('Batch_No').first());
  }

  async rowCount(): Promise<number> {
    return this.locators.gridRows.count();
  }

  // ---------------------------------------------------------------------
  // Exposed for the spec to assert on — assertions belong in the test, not
  // here.
  // ---------------------------------------------------------------------

  get achEftCheckTabLocator() {
    return this.locators.achEftCheckTab;
  }

  get searchByDropdownLocator() {
    return this.locators.searchByDropdown;
  }

  get gridRowsLocator() {
    return this.locators.gridRows;
  }

  gridCellLocator(colId: string) {
    return this.locators.gridCell(colId);
  }

  isAchCellLocator() {
    return this.locators.isAchCell();
  }

  actionIconLocator(title: string) {
    return this.locators.actionIcon(title);
  }
}
