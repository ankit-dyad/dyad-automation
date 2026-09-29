import type { Page, TestInfo } from '@playwright/test';

/**
 * Takes a screenshot and attaches it to the current test's result, so it shows
 * up inline in the Playwright HTML report regardless of whether the test passes
 * or fails. Pass `testInfo` — the second argument every Playwright test callback
 * receives: `async ({ page }, testInfo) => { ... }`.
 */
export async function takeScreenshot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  const body = await page.screenshot({ fullPage: true });
  await testInfo.attach(name, { body, contentType: 'image/png' });
}
