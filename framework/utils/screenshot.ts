import type { Locator, Page, TestInfo } from '@playwright/test';

/**
 * Highlights a locator in the DOM with a visible colored outline and glow effect
 * so it is clearly visible in headed execution and screenshots.
 */
export async function highlightElement(locator: Locator, color = '#ff0000'): Promise<void> {
  try {
    await locator.evaluate((el, c) => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.outline = `3px solid ${c}`;
      htmlEl.style.boxShadow = `0 0 10px ${c}`;
      htmlEl.style.transition = 'outline 0.15s ease-in-out, box-shadow 0.15s ease-in-out';
    }, color);
  } catch {
    // Element might be detached or in an unscriptable cross-origin iframe
  }
}

/**
 * Removes highlight styles from a locator.
 */
export async function unhighlightElement(locator: Locator): Promise<void> {
  try {
    await locator.evaluate((el) => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.outline = '';
      htmlEl.style.boxShadow = '';
    });
  } catch {
    // Ignored
  }
}

/**
 * Takes a screenshot and attaches it to the current test's result, so it shows
 * up inline in the Playwright HTML report regardless of whether the test passes
 * or fails. Pass `testInfo` — the second argument every Playwright test callback
 * receives: `async ({ page }, testInfo) => { ... }`.
 */
export async function takeScreenshot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  try {
    if (page.isClosed()) return;
    console.log(`[Screenshot] Taking screenshot: "${name}"`);
    const body = await page.screenshot({ fullPage: true });
    await testInfo.attach(name, { body, contentType: 'image/png' });
    console.log(`[Screenshot] Successfully attached screenshot: "${name}"`);
  } catch (err) {
    console.warn(`[Screenshot] Could not capture screenshot "${name}":`, err);
  }
}
