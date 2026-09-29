import type { Page } from '@playwright/test';
import { BasePage } from '../../../framework/pages/BasePage';
import { getRequiredEnv } from '../../../framework/utils/env';
import { BatchListBackNavigationLocators } from './batchListBackNavigation.locators';

/**
 * Page Object for the Alis Core Accounting Payment screen's "Back to
 * Batches" navigation round-trip: Batch List -> a batch's own Payment tab
 * -> back to Batch List. Actions only — no assertions, no test data, no
 * hardcoded URLs (see CLAUDE.md §3 / knowledge/conventions.md). Built from
 * alis_core/knowledge/pages/payment-batch-list.md and
 * alis_core/knowledge/pages/payment-tab-individual-records.md.
 */
export class BatchListBackNavigationPage extends BasePage {
  protected override path = '#/payment';

  private readonly locators: BatchListBackNavigationLocators;

  constructor(page: Page) {
    super(page);
    this.locators = new BatchListBackNavigationLocators(page);
  }

  /* Same Accounting sub-app as the other Payment-screen page objects — not
   * resolvable against ALIS_CORE_BASE_URL. See payment-upload.md's "Reaching
   * this page". */
  override async goto(): Promise<void> {
    const accountingBaseUrl = getRequiredEnv('ALIS_CORE_ACCOUNTING_BASE_URL');
    await this.page.goto(`${accountingBaseUrl}${this.path}`);
  }

  async openBatchListTab(): Promise<void> {
    await this.click(this.locators.batchListTab);
  }

  /** Opens the first batch's own Payment tab via its Transaction Add/Edit
   * icon — same navigation approach as paymentTabIndividualRecords.page.ts's
   * openFirstBatchPaymentTab(). */
  async openFirstBatchPaymentTab(): Promise<void> {
    await this.click(this.locators.firstRowAddEditIcon);
  }

  /** Returns from a batch's own Payment tab to the Batch List tab via the
   * footer bar's "Back to Batches" button. */
  async clickBackToBatches(): Promise<void> {
    await this.click(this.locators.backToBatchesButton);
  }

  // ---------------------------------------------------------------------
  // Exposed for the spec to assert on — assertions belong in the test, not
  // here.
  // ---------------------------------------------------------------------

  get batchListTabLocator() {
    return this.locators.batchListTab;
  }

  get paymentTabLocator() {
    return this.locators.paymentTab;
  }

  get gridRowsLocator() {
    return this.locators.gridRows;
  }

  get paymentTabGridRowsLocator() {
    return this.locators.paymentTabGridRows;
  }

  get backToBatchesButtonLocator() {
    return this.locators.backToBatchesButton;
  }
}
