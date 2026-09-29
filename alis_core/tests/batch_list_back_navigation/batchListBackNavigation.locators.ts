import type { Page } from '@playwright/test';

/**
 * Locator definitions for the "Back to Batches" navigation round-trip —
 * sourced from the "## Selectors" tables in
 * alis_core/knowledge/pages/payment-batch-list.md and
 * alis_core/knowledge/pages/payment-tab-individual-records.md. Nothing but
 * locators belongs here; actions live in batchListBackNavigation.page.ts,
 * assertions in batchListBackNavigation.test.ts.
 */
export class BatchListBackNavigationLocators {
  private readonly batchListPane = this.page.locator('#pills-batch');
  private readonly paymentPane = this.page.locator('#pills-payment');

  constructor(private readonly page: Page) {}

  get batchListTab() {
    return this.page.getByRole('tab', { name: 'Batch List' });
  }

  get gridRows() {
    return this.batchListPane.locator('.ag-center-cols-container .ag-row');
  }

  /** `title` attribute confirmed to have a trailing space
   * ("Transaction Add/Edit ") — matched with a prefix selector, same quirk
   * as invoice-application.md / payment-tab-individual-records.md. */
  get firstRowAddEditIcon() {
    return this.batchListPane.locator('.ag-pinned-right-cols-container .ag-row i[title^="Transaction Add/Edit"]').first();
  }

  get paymentTab() {
    return this.page.getByRole('tab', { name: 'Payment' });
  }

  get paymentTabGridRows() {
    return this.paymentPane.locator('.ag-center-cols-container .ag-row');
  }

  /** Footer bar control that returns from a batch's own Payment tab to the
   * Batch List tab — see payment-tab-individual-records.md's Selectors
   * table. */
  get backToBatchesButton() {
    return this.page.getByRole('button', { name: 'Back to Batches' });
  }
}
