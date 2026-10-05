import { defineConfig, devices } from '@playwright/test';

/**
 * Plain Playwright config — no AI calls happen from anything under a product's
 * tests/ folder. This must run standalone in CI with zero dependency on /agents.
 *
 * Layout (see CLAUDE.md §1/§3): each product owns its own tests, one project per
 * product —
 *   alis/tests/<feature>/<feature>.test.ts
 *   nexsure/tests/<feature>/<feature>.test.ts
 * Run one product with `--project=alis` / `--project=nexsure`, or everything with
 * no --project flag. Tag a spec's title with `@smoke` and filter with
 * `--grep @smoke` for a critical-path-only run across every product.
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
  timeout: 60 * 1000,

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
    actionTimeout: 1000 * 1000,
    navigationTimeout: 800 * 1000,
    /* Page Objects store relative paths (from their knowledge file's "## URL"
     * section) and navigate via BasePage.goto(), which resolves against this.
     * Point it at whichever product's base URL this run targets, e.g.
     * PLAYWRIGHT_BASE_URL="$NEXSURE_BASE_URL" npx playwright test --project=smoke */
    baseURL: process.env.PLAYWRIGHT_BASE_URL,
    /* 'on' (not 'on-first-retry') so every test — passed or failed — gets a
     * trace viewable from the HTML report, not just ones that got retried. */
    trace: 'on',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Wait for stable page state
    waitUntil: 'domcontentloaded',
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
  ],
});
