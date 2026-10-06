import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig, devices } from '@playwright/test';
import { parse as parseYaml } from 'yaml';

/**
 * Per-product run settings, loaded from a yaml file at the repo root — one
 * per Playwright project so browser/headless/baseURL/retries/etc. can be
 * tuned per product without touching this file:
 *   config.alis-custom.yaml -> the "alis" project
 *   config.alis-core.yaml   -> the "alis_core" project
 *   config.nexsure.yaml     -> the "nexsure" project
 */
interface ProductConfig {
  /** Empty string means "no override" — falls back to PLAYWRIGHT_BASE_URL /
   * this file's own default baseURL below (and, per product, whatever that
   * product's Page Objects/data.json already resolve). */
  baseURL: string;
  browser: 'chrome' | 'chromium' | 'firefox' | 'webkit';
  headless: boolean;
  /** Worker count. NOTE: Playwright's `workers` is a single global number,
   * not a per-project setting — there is no API to run two projects side by
   * side with different worker counts in one invocation. This value is only
   * honored when that product is run on its own via `--project=<name>` (see
   * getRequestedProjectName() below); a mixed/no-filter run falls back to
   * Playwright's own default. Run products in separate CI jobs/invocations
   * (as this file's sharding note already suggests) to get distinct worker
   * counts per product. */
  parallel: number;
  retries: number;
  screenshot: 'on' | 'off' | 'only-on-failure';
  video: 'on' | 'off' | 'retain-on-failure' | 'on-first-retry';
  /** Maps to `use.trace` — this repo's catch-all for "capture run artifacts"
   * (screenshot/video have their own dedicated fields above). */
  Artifacts: 'on' | 'off';
  /** Maps to the HIGHLIGHT_ELEMENTS flag BasePage's action helpers read.
   * Same global-vs-per-project caveat as `parallel` above: BasePage reads
   * this once at module load, so it only reflects a specific product's
   * setting when that product is run alone via `--project=<name>`. */
  elementHighlight: boolean;
}

function loadProductConfig(fileName: string): ProductConfig {
  const raw = readFileSync(join(__dirname, fileName), 'utf-8');
  return parseYaml(raw) as ProductConfig;
}

const alisConfig = loadProductConfig('config.alis-custom.yaml');
const nexsureConfig = loadProductConfig('config.nexsure.yaml');
const alisCoreConfig = loadProductConfig('config.alis-core.yaml');
const PRODUCT_CONFIGS: Record<string, ProductConfig> = {
  alis: alisConfig,
  nexsure: nexsureConfig,
  alis_core: alisCoreConfig,
};

/** Reads `--project=<name>` / `--project <name>` off argv so the two
 * genuinely-global settings above (workers, HIGHLIGHT_ELEMENTS) can still
 * reflect a single product's config.<product>.yaml when that product is run
 * on its own — the common case (`npx playwright test --project=nexsure ...`). */
function getRequestedProjectName(): string | undefined {
  const eq = process.argv.find((arg) => arg.startsWith('--project='));
  if (eq) return eq.slice('--project='.length);
  const idx = process.argv.indexOf('--project');
  return idx !== -1 ? process.argv[idx + 1] : undefined;
}

const activeProductConfig = PRODUCT_CONFIGS[getRequestedProjectName() ?? ''];

/** Chooses the Playwright device + (for real Chrome) browser channel for a
 * config.<product>.yaml `browser` value. 'chrome' launches the actual
 * installed Google Chrome via `channel: 'chrome'`; 'chromium' uses
 * Playwright's own bundled Chromium (no channel override) — both render with
 * the same Desktop Chrome viewport/UA. */
function deviceForBrowser(browser: ProductConfig['browser']) {
  switch (browser) {
    case 'chrome':
      return { ...devices['Desktop Chrome'], channel: 'chrome' as const };
    case 'firefox':
      return { ...devices['Desktop Firefox'] };
    case 'webkit':
      return { ...devices['Desktop Safari'] };
    case 'chromium':
    default:
      return { ...devices['Desktop Chrome'] };
  }
}

function useFromConfig(cfg: ProductConfig) {
  return {
    ...deviceForBrowser(cfg.browser),
    ...(cfg.baseURL ? { baseURL: cfg.baseURL } : {}),
    headless: cfg.headless,
    screenshot: cfg.screenshot,
    video: cfg.video,
    trace: cfg.Artifacts === 'off' ? ('off' as const) : ('on' as const),
  };
}

/**
 * Element highlighter on/off flag — when true, BasePage's action helpers
 * (click, enter, select, check, uncheck) draw a brief colored outline around
 * the target element right before interacting with it, so screenshots,
 * videos, and traces show exactly what was acted on. Resolution order: an
 * explicit HIGHLIGHT_ELEMENTS env var always wins; otherwise the active
 * product's config.<product>.yaml `elementHighlight` (see
 * getRequestedProjectName()); otherwise on by default.
 */
export const HIGHLIGHT_ELEMENTS = (() => {
  const envValue = process.env.HIGHLIGHT_ELEMENTS;
  if (envValue !== undefined) return envValue !== 'false';
  return activeProductConfig?.elementHighlight ?? true;
})();

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
  // See ProductConfig.parallel's note — only reflects a single product's
  // config.<product>.yaml when run via `--project=<name>`.
  workers: process.env.CI ? undefined : activeProductConfig?.parallel,

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
     * PLAYWRIGHT_BASE_URL="$NEXSURE_BASE_URL" npx playwright test --project=smoke.
     * Per-project `use` below (from config.<product>.yaml) overrides this
     * when that product's yaml sets a non-empty baseURL. */
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'https://jmiqaweb01.nexsure.com/nexui/',
    /* 'on' (not 'on-first-retry') so every test — passed or failed — gets a
     * trace viewable from the HTML report, not just ones that got retried.
     * Per-project `trace` below (from config.<product>.yaml's `Artifacts`)
     * overrides this. */
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
      retries: alisConfig.retries,
      use: useFromConfig(alisConfig),
    },
    {
      name: 'nexsure',
      testDir: './nexsure/tests',
      retries: nexsureConfig.retries,
      use: useFromConfig(nexsureConfig),
    },
    {
      name: 'alis_core',
      testDir: './alis_core/tests',
      retries: alisCoreConfig.retries,
      use: useFromConfig(alisCoreConfig),
    },
  ],
});
