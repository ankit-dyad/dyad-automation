import type { Locator, Page } from '@playwright/test';

/**
 * Shared wait helpers. Per /knowledge/conventions.md, lean on Playwright's built-in
 * auto-waiting and web-first assertions first — reach for these only when a page has
 * a genuine async signal (spinner, toast, polling) that auto-waiting can't express.
 * Never add a bare `page.waitForTimeout(...)` in a Page Object or spec; if you think
 * you need one, add a named helper here instead so the reason is documented and
 * reusable.
 */

/** Waits for an element to become visible. Defaults to 10s — pass `timeoutMs` to
 * override for a specific call, in a Page Object or directly in a test. */
export async function waitForVisible(locator: Locator, timeoutMs = 10000): Promise<void> {
  await locator.waitFor({ state: 'visible', timeout: timeoutMs });
}

/** Waits until the document has finished its initial DOM loading phase. */
export async function waitForDomReady(page: Page, timeoutMs = 30000): Promise<void> {
  await page.waitForFunction(
    () => document.readyState === 'interactive' || document.readyState === 'complete',
    undefined,
    { timeout: timeoutMs },
  );
}

/** Waits for a loading/spinner element to appear (briefly) and then disappear. */
export async function waitForSpinnerToClear(
  spinner: Locator,
  opts: { appearTimeoutMs?: number; clearTimeoutMs?: number } = {},
): Promise<void> {
  const { appearTimeoutMs = 1000, clearTimeoutMs = 15000 } = opts;
  try {
    await spinner.waitFor({ state: 'visible', timeout: appearTimeoutMs });
  } catch {
    // Spinner may never have appeared (fast response) — that's fine.
  }
  await spinner.waitFor({ state: 'hidden', timeout: clearTimeoutMs });
}

/** Waits for a specific response matching a URL/predicate, then returns it. */
export function waitForApiResponse(
  page: Page,
  urlOrPredicate: Parameters<Page['waitForResponse']>[0],
  timeoutMs = 15000,
) {
  return page.waitForResponse(urlOrPredicate, { timeout: timeoutMs });
}

/** Waits until the URL settles on the expected path/pattern after a navigation action. */
export function waitForRoute(page: Page, urlOrPredicate: Parameters<Page['waitForURL']>[0], timeoutMs = 15000) {
  return page.waitForURL(urlOrPredicate, { timeout: timeoutMs });
}
