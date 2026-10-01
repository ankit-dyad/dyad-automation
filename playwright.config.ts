import { defineConfig, devices } from '@playwright/test';

/**
 * Element highlighter on/off flag — when true, BasePage's action helpers
 * (click, enter, select, check, uncheck) draw a brief colored outline around
 * the target element right before interacting with it, so screenshots,
 * videos, and traces show exactly what was acted on. On by default; disable
 * for a run with HIGHLIGHT_ELEMENTS=false (e.g. CI, or when the extra
 * per-action DOM writes aren't wanted).
 */
export const HIGHLIGHT_ELEMENTS = process.env.HIGHLIGHT_ELEMENTS !== 'false';

/**
 * Plain Playwright config — no AI calls happen from anything under a product's
 * tests/ folder. This must run standalone in CI with zero dependency on /agents.
 *
 * Layout (see CLAUDE.md §1/§3): each product owns its own tests, one project per
 * product —
 *   alis/tests/<feature>/<feature>.test.ts
 *   nexsure/tests/<feature>/<feature>.test.ts
 *   alis_core/tests/<feature>/<feature>.test.ts
 * Run one product with `--project=alis` / `--project=nexsure` / `--project=alis_core`,
 * or everything with no --project flag. Tag a spec's title with `@smoke` and filter
 * with `--grep @smoke` for a critical-path-only run across every product.
 *
 * Sharding: Playwright doesn't expose a shard count in the config file itself — it's
 * a CLI flag, e.g.:
 *   npx playwright test --project=alis --shard=$SHARD_INDEX/$SHARD_TOTAL
 */
export default defineConfig({
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? undefined : undefined,

  /* All execution artifacts (traces, screenshots, videos, reports) go under
   * /reports — gitignored, published as CI artifacts. */
  outputDir: './reports/test-results',
  reporter: [
    ['html', { outputFolder: './reports/html', open: 'never' }],
    ['json', { outputFile: './reports/results.json' }], // consumed by agents/triage-agent.ts
    ['./framework/utils/reporting.ts'], // scenario-summary.{json,md} for traceability
    [process.env.CI ? 'github' : 'list'],
  ],

  use: {
    /* Page Objects store relative paths (from their knowledge file's "## URL"
     * section) and navigate via BasePage.goto(), which resolves against this.
     * Point it at whichever product's base URL this run targets, e.g.
     * PLAYWRIGHT_BASE_URL="$NEXSURE_BASE_URL" npx playwright test --project=smoke */
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'https://jmiqaweb01.nexsure.com/nexui/',
    /* 'on' (not 'on-first-retry') so every test — passed or failed — gets a
     * trace viewable from the HTML report, not just ones that got retried. */
    trace: 'on',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    /* Confirmed live 2026-09-29/2026-09-30 (alis_core): with no default here,
     * a single locator action (e.g. BasePage.click()) that never becomes
     * actionable rides the ENTIRE outer test.setTimeout() instead of failing
     * fast - twice now, on two different locators, each eating 5-14+ minutes
     * of a real-write test before finally erroring. This bounds every
     * locator action (click/fill/check/selectOption/etc., including
     * BasePage's own helpers) to a sane default so a genuine hang fails
     * quickly with a clear "Timeout 30000ms exceeded" message instead of
     * masquerading as the outer test timeout. Well within every spec's own
     * test.setTimeout() (60s-600s across this suite), so this should never
     * fire on a merely-slow-but-eventually-successful action. */
    actionTimeout: 30_000,
  },

  projects: [
    {
      name: 'alis',
      testDir: './alis/tests',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'nexsure',
      testDir: './nexsure/tests',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'alis_core',
      testDir: './alis_core/tests',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
