import type { Page } from '@playwright/test';
import { BasePage } from '../../../framework/pages/BasePage';
import { MarketSelectionLocators } from './market-selection.locators';

/** Plain input shape for the Market Selection panel — the spec builds this
 * from alis/knowledge/market-selection.json. Kept independent of the JSON's
 * own shape so this Page Object has no test-data knowledge of its own (see
 * BasePage's rules). */
export interface MarketSelectionInput {
  /** Exact "Name (CODE)" grid label, e.g.
   * "Nautilus Insurance Market Group (CMP008)". Must be a market with only
   * one associated risk company — see this class's attachMarket() for why. */
  marketCompany: string;
}

/**
 * Page Object for the Market Selection panel — attaches a market to an
 * existing Quote, producing a rateable option. Reached from a Quote tab (see
 * add-quote.page.ts for how a quote is created in the first place). Actions
 * only — no assertions, no JSON imports, no test data (see BasePage's
 * rules).
 *
 * This only drives the Markets tab's grid-checkbox + "Create Option" flow —
 * confirmed live 2026-09-25 as the reliable path, and the one explicitly
 * called out in market-selection.md as preferred over the top toolbar
 * filters. The panel itself is opened via "Choose from Market Assistant"
 * (see open()'s own comment on why), but it still lands on and drives the
 * Markets tab, not the Market Assistant tab — that tab is a separate,
 * documented-but-not-driven alternative (see market-selection.locators.ts's
 * own note on why: it's confirmed broken on this instance for a market with
 * only one risk company, which is the case this feature's JSON data uses).
 */
export class MarketSelectionPage extends BasePage {
  private readonly locators: MarketSelectionLocators;

  constructor(page: Page) {
    super(page);
    this.locators = new MarketSelectionLocators(page);
  }

  /** Clicks the Quote tab's "Choose from Market Assistant" trigger and waits
   * for the panel to render (the Markets tab's grid table becoming visible).
   *
   * Uses this trigger — not the also-available "+ Add Markets" button —
   * because it's the one actually clicked in the user-supplied Playwright
   * codegen recording this feature was built from (2026-09-25). Both buttons
   * land on the same panel, defaulting to the same Markets tab (confirmed by
   * market-selection.md's own Overview), so this is a same-behavior swap:
   * only which button gets clicked changes, not the grid/checkbox/Create
   * Option flow below it. */
  async chooseFromMarketAssistant(): Promise<void> {
    await this.click(this.locators.chooseFromMarketAssistantTrigger);
    await this.waitForVisible(this.locators.modal, 15000);
  }

  /** Ticks the given market's row checkbox in the Markets tab's master
   * grid. Finds the row by its own Market Company cell text rather than
   * scrolling/filtering via the top toolbar — per explicit standing
   * instruction confirmed in market-selection.md ("no need to click on that
   * searches... you can just directly scroll down and look for [it] and
   * select it"), and because the row-checkbox's own `id` attribute is
   * confirmed live to repeat identically across every row (see
   * marketRowCheckbox()'s own comment), so it can only be found this way. */
  async selectMarket(marketCompany: string): Promise<void> {
    const checkbox = this.locators.marketRowCheckbox(marketCompany);
    await checkbox.waitFor({ state: 'visible', timeout: 15000 });
    await this.check(checkbox);
  }

  /** Clicks "Create Option" and confirms the resulting "Are you sure you
   * want to create options for the selected markets?" dialog with Ok —
   * confirmed live 2026-09-25 (twice, on two independent fresh quotes) this
   * proceeds to actually create the option and return focus to the Quote
   * tab, where the new option row becomes visible. */
  async createOption(): Promise<void> {
    await this.click(this.locators.createOptionButton);
    await this.waitForVisible(this.locators.confirmCreateOptionDialogButton('Ok'), 10000);
    await this.click(this.locators.confirmCreateOptionDialogButton('Ok'));
  }

  /** Convenience wrapper: open the panel, select the market, and create the
   * option — the full happy-path flow this feature currently automates. */
  async attachMarket(input: MarketSelectionInput): Promise<void> {
    await this.chooseFromMarketAssistant();
    await this.selectMarket(input.marketCompany);
    await this.createOption();
  }

  // -------------------------------------------------------------------
  // State getters / readers — exposed for the spec to assert on.
  // -------------------------------------------------------------------

  optionRowLocator(marketCompany: string) {
    return this.locators.optionRowByMarketCompany(marketCompany);
  }
}