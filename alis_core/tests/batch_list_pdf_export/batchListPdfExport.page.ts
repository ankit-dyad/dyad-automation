import type { Page, Response } from '@playwright/test';
import { BasePage } from '../../../framework/pages/BasePage';
import { getRequiredEnv } from '../../../framework/utils/env';
import { BatchListPdfExportLocators } from './batchListPdfExport.locators';

/**
 * Page Object for the Alis Core Accounting Payment screen's Batch List "PDF
 * Export" action. Actions only — no assertions, no hardcoded URLs (see
 * CLAUDE.md §3 / knowledge/conventions.md). Built from
 * alis_core/knowledge/pages/payment-batch-list-pdf-export.md.
 */
export class BatchListPdfExportPage extends BasePage {
  protected override path = '#/payment';

  private readonly locators: BatchListPdfExportLocators;

  constructor(page: Page) {
    super(page);
    this.locators = new BatchListPdfExportLocators(page);
  }

  override async goto(): Promise<void> {
    const accountingBaseUrl = getRequiredEnv('ALIS_CORE_ACCOUNTING_BASE_URL');
    await this.page.goto(`${accountingBaseUrl}${this.path}`);
  }

  /** Clicks the first batch row's PDF Export icon and returns the report
   * network response — this is how the export is verified, not a real
   * downloaded file, since the app builds the download client-side from an
   * ordinary JSON response rather than serving a navigable file (see the
   * knowledge file's Edge Cases). */
  async clickFirstRowPdfExport(): Promise<Response> {
    const exported = this.page.waitForResponse((res) => res.url().includes('/Report/GetViewBatchTranPDF'));
    await this.click(this.locators.firstRowPdfIcon);
    return exported;
  }

  get batchListTabLocator() {
    return this.locators.batchListTab;
  }

  /** Exposed for the spec to highlight/screenshot — same icon
   * clickFirstRowPdfExport() clicks, just surfaced as a locator so a
   * composed test can visually confirm it without re-declaring the
   * selector. */
  get firstRowPdfIconLocator() {
    return this.locators.firstRowPdfIcon;
  }
}
