import type { Locator, Page } from '@playwright/test';
import { waitForVisible } from '../utils/waits';
import { HIGHLIGHT_ELEMENTS } from '../../playwright.config';

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

  async goto(): Promise<void> {
    if (!this.path) {
      throw new Error(
        `${this.constructor.name} has no "path" set and does not override goto().`,
      );
    }
    await this.page.goto(this.path);
  }

  // ---------------------------------------------------------------------------
  // Common actions — every product's Page Object drives its locators through
  // these instead of calling Playwright locator methods directly, so wait/retry
  // behavior stays consistent in one place.
  // ---------------------------------------------------------------------------

  private static readonly HIGHLIGHT_MARKER_ATTR = 'data-basepage-highlight';

  /** Draws a colored outline box over the element's current position, gated
   * by the HIGHLIGHT_ELEMENTS flag in playwright.config.ts. Best-effort only
   * (`.catch(() => {})`) — a highlight failing (e.g. element detached by the
   * time it runs) must never fail the action it's decorating. Clears any
   * previous marker first so boxes don't stack up across actions. */
  private async highlightElement(locator: Locator): Promise<void> {
    if (!HIGHLIGHT_ELEMENTS) return;
    await locator
      .evaluate((el, attr) => {
        const doc = el.ownerDocument;
        doc.querySelectorAll(`[${attr}]`).forEach((node) => node.remove());
        const rect = el.getBoundingClientRect();
        const box = doc.createElement('div');
        box.setAttribute(attr, 'true');
        Object.assign(box.style, {
          position: 'fixed',
          left: `${rect.left}px`,
          top: `${rect.top}px`,
          width: `${rect.width}px`,
          height: `${rect.height}px`,
          border: '3px solid #ff3366',
          boxShadow: '0 0 0 2px rgba(255, 51, 102, 0.35)',
          zIndex: '2147483647',
          pointerEvents: 'none',
          boxSizing: 'border-box',
        });
        doc.body.appendChild(box);
      }, BasePage.HIGHLIGHT_MARKER_ATTR)
      .catch(() => {});
  }

  /** Clicks an element with 1s pre-wait. */
  protected async click(locator: Locator): Promise<void> {
    await this.highlightElement(locator);
    await this.page.waitForTimeout(1000);
    await locator.click();
  }

  /** Clears and types text into a field with 1s pre-wait. */
  protected async enter(locator: Locator, value: string): Promise<void> {
    await this.highlightElement(locator);
    await this.page.waitForTimeout(1000);
    await locator.fill(value);
  }

  /** Picks an option from a `<select>` with 1s pre-wait. */
  protected async select(locator: Locator, value: string): Promise<void> {
    await this.highlightElement(locator);
    await this.page.waitForTimeout(1000);
    await locator.selectOption(value);
  }

  /** Ticks a checkbox/radio with 1s pre-wait. */
  protected async check(locator: Locator): Promise<void> {
    await this.highlightElement(locator);
    await this.page.waitForTimeout(1000);
    await locator.check();
  }

  /** Unticks a checkbox with 1s pre-wait. */
  protected async uncheck(locator: Locator): Promise<void> {
    await this.highlightElement(locator);
    await this.page.waitForTimeout(1000);
    await locator.uncheck();
  }

  /** Reads an element's visible text. */
  protected async textOf(locator: Locator): Promise<string> {
    return (await locator.textContent())?.trim() ?? '';
  }

  /** State getter — whether an element is currently visible. */
  protected async isVisible(locator: Locator): Promise<boolean> {
    return locator.isVisible();
  }

  /** Waits for an element to become visible (default 10s, overridable) — for a
   * genuine async signal only, never as a substitute for auto-waiting. See
   * knowledge/conventions.md's wait strategy section. Same helper as
   * framework/utils/waits.ts's `waitForVisible`, exposed here so Page Object
   * subclasses don't need a separate import for it. */
  protected async waitForVisible(locator: Locator, timeoutMs?: number): Promise<void> {
    await waitForVisible(locator, timeoutMs);
  }
}
