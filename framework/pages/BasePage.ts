import type { Locator, Page } from '@playwright/test';
import { waitForVisible } from '../utils/waits';
import { highlightElement, unhighlightElement } from '../utils/screenshot';

/**
 * Common base for every product's Page Objects (Alis, Nexsure, and any product
 * added later) — see CLAUDE.md §4. A product's `*.page.ts` extends this and gets
 * `page`, `goto()`, and the generic locator actions below for free, instead of
 * re-implementing click/fill/etc. per product.
 *
 * Page Object rules (see /knowledge/conventions.md and CLAUDE.md §3):
 *  - Locators are readonly/getter properties built only from selectors present in
 *    the corresponding <product>/knowledge/pages/<page>.md file. Never invent one.
 *  - In the three-file test layout, locators live in `*.locators.ts` — a `*.page.ts`
 *    composes them, it doesn't declare raw selectors itself.
 *  - Methods are actions or state getters named after user-visible behavior, not DOM
 *    structure.
 *  - No assertions, no test data, no hardcoded environment URLs here.
 */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  /** Subclasses set `path` to the page's URL path (from its knowledge file) and can
   * rely on this default goto(), or override it entirely. */
  protected path?: string;

  async goto(targetUrl?: string): Promise<void> {
    const destination = targetUrl ?? this.path;
    if (!destination) {
      throw new Error(
        `${this.constructor.name} has no "path" set and does not override goto().`,
      );
    }
    console.log(`[Navigation] Navigating to: ${destination}`);
    await this.page.goto(destination);
    console.log(`[Success] Navigated to: ${destination}`);
  }

  // ---------------------------------------------------------------------------
  // Element Highlighter helpers
  // ---------------------------------------------------------------------------

  /**
   * Highlights a locator in the DOM with a colored outline and glow effect
   * so it is clearly visible during execution and in captured screenshots.
   */
  async highlight(locator: Locator, color = '#000000ff'): Promise<void> {
    await highlightElement(locator, color);
  }

  /**
   * Clears highlight outline from a locator.
   */
  async unhighlight(locator: Locator): Promise<void> {
    await unhighlightElement(locator);
  }

  // ---------------------------------------------------------------------------
  // Common actions — every product's Page Object drives its locators through
  // these instead of calling Playwright locator methods directly, so wait/retry
  // behavior stays consistent in one place.
  // ---------------------------------------------------------------------------

  /** Clicks an element. */
  protected async click(locator: Locator, options?: Parameters<Locator['click']>[0]): Promise<void> {
    console.log(`Clicking on locator: ${locator}`);
    await this.highlight(locator);
    await locator.click(options);
    console.log(`Successfully clicked on locator: ${locator}`);
  }

  /** Clears and types text into a field. */
  protected async enter(locator: Locator, value: string, options?: Parameters<Locator['fill']>[1]): Promise<void> {
    console.log(`Entering "${value}" into locator: ${locator}`);
    await this.highlight(locator);
    await locator.fill(value, options);
    console.log(`Successfully entered "${value}" into locator: ${locator}`);
  }

  /** Picks an option from a `<select>` (or Playwright-compatible listbox). */
  protected async select(locator: Locator, value: string, options?: Parameters<Locator['selectOption']>[1]): Promise<void> {
    console.log(`Selecting option "${value}" in locator: ${locator}`);
    await this.highlight(locator);
    await locator.selectOption(value, options);
    console.log(`Successfully selected option "${value}" in locator: ${locator}`);
  }

  /** Ticks a checkbox/radio. */
  protected async check(locator: Locator, options?: Parameters<Locator['check']>[0]): Promise<void> {
    console.log(`Checking locator: ${locator}`);
    await this.highlight(locator);
    await locator.check(options);
    console.log(`Successfully checked locator: ${locator}`);
  }

  /** Unticks a checkbox. */
  protected async uncheck(locator: Locator, options?: Parameters<Locator['uncheck']>[0]): Promise<void> {
    console.log(`Unchecking locator: ${locator}`);
    await this.highlight(locator);
    await locator.uncheck(options);
    console.log(`Successfully unchecked locator: ${locator}`);
  }

  /** Reads an element's visible text. */
  protected async textOf(locator: Locator): Promise<string> {
    console.log(`Reading text of locator: ${locator}`);
    const text = (await locator.textContent())?.trim() ?? '';
    console.log(`Read text "${text}" from locator: ${locator}`);
    return text;
  }

  /** State getter — whether an element is currently visible. */
  protected async isVisible(locator: Locator): Promise<boolean> {
    console.log(`Checking visibility of locator: ${locator}`);
    const visible = await locator.isVisible();
    console.log(`Locator is ${visible ? 'visible' : 'not visible'}: ${locator}`);
    return visible;
  }

  /** State getter — whether a checkbox/radio is checked. */
  protected async isChecked(locator: Locator): Promise<boolean> {
    console.log(`Checking if locator is checked: ${locator}`);
    const checked = await locator.isChecked();
    console.log(`Locator is ${checked ? 'checked' : 'not checked'}: ${locator}`);
    return checked;
  }

  /** State getter — whether an element is enabled. */
  protected async isEnabled(locator: Locator): Promise<boolean> {
    console.log(`Checking if locator is enabled: ${locator}`);
    const enabled = await locator.isEnabled();
    console.log(`Locator is ${enabled ? 'enabled' : 'disabled'}: ${locator}`);
    return enabled;
  }

  /** Reads an input field's current value. */
  protected async inputValue(locator: Locator): Promise<string> {
    console.log(`Reading input value of locator: ${locator}`);
    const val = await locator.inputValue();
    console.log(`Read input value "${val}" from locator: ${locator}`);
    return val;
  }

  /** Hovers over an element. */
  protected async hover(locator: Locator, options?: Parameters<Locator['hover']>[0]): Promise<void> {
    console.log(`Hovering over locator: ${locator}`);
    await this.highlight(locator);
    await locator.hover(options);
    console.log(`Successfully hovered over locator: ${locator}`);
  }

  /** Presses a key on an element. */
  protected async press(locator: Locator, key: string, options?: Parameters<Locator['press']>[1]): Promise<void> {
    console.log(`Pressing key "${key}" on locator: ${locator}`);
    await this.highlight(locator);
    await locator.press(key, options);
    console.log(`Successfully pressed key "${key}" on locator: ${locator}`);
  }

  /** Waits for an element to become visible (default 10s, overridable) — for a
   * genuine async signal only, never as a substitute for auto-waiting. See
   * knowledge/conventions.md's wait strategy section. Same helper as
   * framework/utils/waits.ts's `waitForVisible`, exposed here so Page Object
   * subclasses don't need a separate import for it. */
  protected async waitForVisible(locator: Locator, timeoutMs?: number): Promise<void> {
    console.log(`Waiting for locator to be visible: ${locator}`);
    await waitForVisible(locator, timeoutMs);
    console.log(`Locator is visible: ${locator}`);
  }
}
