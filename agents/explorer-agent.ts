#!/usr/bin/env -S npx tsx
/**
 * Explorer agent
 * ==============
 * Walks a product's primary navigation and (re)populates its knowledge base under
 * <product>/knowledge/. This is the only agent that touches a product's knowledge/ folder — never
 * /framework or /tests.
 *
 * Usage:
 *   npx tsx agents/explorer-agent.ts --product nexsure [--start-url <url>] [--max-pages 10] [--headed]
 *
 * If --start-url is omitted, it's read from the product's base-URL env var (see
 * PRODUCT_ENV below / <product>/knowledge/app.md).
 *
 * Credential handling: login is performed by THIS SCRIPT using the `playwright`
 * package directly, reading credentials straight from process.env. The resulting
 * authenticated storage state is handed to the Playwright MCP server via
 * `--storage-state`; the LLM never sees a raw credential value, in the prompt or
 * otherwise — it only ever drives an already-authenticated browser session.
 *
 * Guardrails enforced in code (not just prompted):
 *   - A page file with front matter `reviewed: true` is never overwritten — new
 *     findings are only ever appended under "Auto-discovered (needs review)".
 *   - registry.yaml entries always get today's date on write.
 *   - Nothing outside a product's knowledge/ folder is ever touched by this agent's tools.
 */

import { chromium } from 'playwright';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import matter from 'gray-matter';
import { z } from 'zod';
import { query, tool, createSdkMcpServer } from '@anthropic-ai/claude-agent-sdk';
import { getRequiredEnv } from '../framework/utils/env';
import { knowledgeDir, pagesDir } from '../framework/utils/registry';

const PRODUCTS = ['nexsure', 'alis-core', 'alis-custom'] as const;
type Product = (typeof PRODUCTS)[number];

const PRODUCT_ENV: Record<Product, { baseUrl: string; user: string; pass: string }> = {
  nexsure: { baseUrl: 'NEXSURE_BASE_URL', user: 'NEXSURE_LOGIN_USER', pass: 'NEXSURE_LOGIN_PASS' },
  'alis-core': { baseUrl: 'ALIS_CORE_BASE_URL', user: 'ALIS_CORE_LOGIN_USER', pass: 'ALIS_CORE_LOGIN_PASS' },
  'alis-custom': {
    baseUrl: 'ALIS_CUSTOM_BASE_URL',
    user: 'ALIS_CUSTOM_LOGIN_USER',
    pass: 'ALIS_CUSTOM_LOGIN_PASS',
  },
};

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function isProduct(value: string): value is Product {
  return (PRODUCTS as readonly string[]).includes(value);
}

interface Args {
  product: Product;
  startUrl?: string;
  maxPages: number;
  headed: boolean;
}

function parseArgs(argv: string[]): Args {
  const get = (flag: string) => {
    const i = argv.indexOf(flag);
    return i === -1 ? undefined : argv[i + 1];
  };
  const productArg = get('--product');
  if (!productArg || !isProduct(productArg)) {
    throw new Error(`--product is required and must be one of: ${PRODUCTS.join(', ')}`);
  }
  return {
    product: productArg,
    startUrl: get('--start-url'),
    maxPages: Number(get('--max-pages') ?? 10),
    headed: argv.includes('--headed'),
  };
}

// ---------------------------------------------------------------------------
// Login (in-process, credentials never reach the model)
// ---------------------------------------------------------------------------

/** Best-effort parse of already-documented login selectors, so we prefer the real
 * ones once login.md has been filled in, and only fall back to heuristics on the
 * very first run against a product. */
function tryReadDocumentedLoginSelectors(product: Product): { user?: string; pass?: string; submit?: string } {
  const loginFile = join(pagesDir(product), 'login.md');
  if (!existsSync(loginFile)) return {};
  const { content } = matter(readFileSync(loginFile, 'utf-8'));
  const rows = [...content.matchAll(/\|\s*([^|]+?)\s*\|\s*`([^`]+)`\s*\|[^|]*\|/g)];
  const find = (pattern: RegExp) => rows.find((r) => pattern.test(r[1]))?.[2];
  return {
    user: find(/user(name)?|email/i),
    pass: find(/password/i),
    submit: find(/log ?in|sign ?in|submit/i),
  };
}

async function loginAndSaveStorageState(product: Product, baseUrl: string, storageStatePath: string, headed: boolean) {
  const env = PRODUCT_ENV[product];
  const username = getRequiredEnv(env.user);
  const password = getRequiredEnv(env.pass);
  const documented = tryReadDocumentedLoginSelectors(product);

  const browser = await chromium.launch({ headless: !headed });
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await page.goto(baseUrl);

    if (documented.user) {
      await page.locator(documented.user).fill(username);
    } else {
      await page.getByLabel(/user(name)?|email/i).first().fill(username);
    }

    if (documented.pass) {
      await page.locator(documented.pass).fill(password);
    } else {
      await page.getByLabel(/password/i).first().fill(password);
    }

    if (documented.submit) {
      await page.locator(documented.submit).click();
    } else {
      await page.getByRole('button', { name: /log ?in|sign ?in/i }).first().click();
    }

    // Best-effort settle: either the URL changes away from the login page, or the
    // network goes idle. Don't fail the whole run over this — knowledge gaps here
    // are exactly what login.md's "Auto-discovered" section is for.
    await Promise.race([
      page.waitForURL((url) => url.toString() !== baseUrl, { timeout: 15000 }),
      page.waitForLoadState('networkidle', { timeout: 15000 }),
    ]).catch(() => {});

    mkdirSync(join(storageStatePath, '..'), { recursive: true });
    await context.storageState({ path: storageStatePath });
  } finally {
    await browser.close();
  }
}

// ---------------------------------------------------------------------------
// Knowledge-writing tools (the only way the model is allowed to touch a product's knowledge/ folder)
// ---------------------------------------------------------------------------

function buildFreshPageBody(args: {
  pageTitle: string;
  url: string;
  selectors: { element: string; selector: string; notes?: string }[];
  actions: string[];
  expectedOutcomes: string[];
  edgeCases: string[];
}): string {
  const selectorRows = args.selectors.map((s) => `| ${s.element} | \`${s.selector}\` | ${s.notes ?? ''} |`);
  const bulletsOrNone = (items: string[]) => (items.length ? items.map((i) => `- ${i}`).join('\n') : '');
  return [
    '---',
    'reviewed: false',
    `last_verified: ${todayISO()}`,
    '---',
    '',
    `# Page: ${args.pageTitle}`,
    '',
    '## URL',
    '',
    args.url,
    '',
    '## Selectors',
    '| Element | Selector | Notes |',
    '|---|---|---|',
    ...selectorRows,
    '',
    '## Actions',
    '',
    bulletsOrNone(args.actions),
    '',
    '## Expected Outcomes',
    '',
    bulletsOrNone(args.expectedOutcomes),
    '',
    '## Edge Cases / Known Quirks',
    '',
    bulletsOrNone(args.edgeCases),
    '',
    '## Auto-discovered (needs review)',
    '- (agent appends here; engineer reviews and folds into sections above)',
    '',
  ].join('\n');
}

/** Appends text at the end of the named `## Heading` section, leaving every other
 * section byte-for-byte untouched. */
function appendToSection(fileContent: string, heading: string, textToAppend: string): string {
  const lines = fileContent.split('\n');
  const headingIdx = lines.findIndex((l) => l.trim() === heading);
  if (headingIdx === -1) {
    return `${fileContent.trimEnd()}\n\n${heading}\n${textToAppend}\n`;
  }
  let insertAt = lines.length;
  for (let i = headingIdx + 1; i < lines.length; i++) {
    if (lines[i].startsWith('## ')) {
      insertAt = i;
      break;
    }
  }
  const before = lines.slice(0, insertAt);
  while (before.length && before[before.length - 1].trim() === '') before.pop();
  const after = lines.slice(insertAt);
  return [...before, '', textToAppend, '', ...after].join('\n');
}

const selectorSchema = z.object({
  element: z.string().describe('human-readable element name, e.g. "Submit button"'),
  selector: z.string().describe('Playwright locator string, e.g. getByTestId("submit")'),
  notes: z.string().optional(),
});

const writePageKnowledgeTool = tool(
  'write_page_knowledge',
  'Write or update a page knowledge file under <product>/knowledge/pages/. If the ' +
    'file does not exist, or exists but is NOT marked reviewed:true, this creates/' +
    'overwrites the whole file from the given findings. If it exists AND is marked ' +
    'reviewed:true, this ONLY appends the findings under "Auto-discovered (needs ' +
    'review)" — every human-reviewed section is left untouched. Selectors must ' +
    'prefer data-testid, then role, then text — in that order.',
  {
    product: z.enum(PRODUCTS),
    page: z.string().describe('kebab-case page slug, e.g. "policy-quote"'),
    pageTitle: z.string(),
    url: z.string().describe('URL or path pattern for this page'),
    selectors: z.array(selectorSchema),
    actions: z.array(z.string()),
    expectedOutcomes: z.array(z.string()),
    edgeCases: z.array(z.string()).optional(),
  },
  async ({ product, page, pageTitle, url, selectors, actions, expectedOutcomes, edgeCases }) => {
    const dir = pagesDir(product);
    mkdirSync(dir, { recursive: true });
    const filePath = join(dir, `${page}.md`);

    if (existsSync(filePath)) {
      const raw = readFileSync(filePath, 'utf-8');
      const { data } = matter(raw);
      if (data.reviewed === true) {
        const bullets = [
          `URL observed: ${url}`,
          ...selectors.map((s) => `Selector candidate — ${s.element}: \`${s.selector}\`${s.notes ? ` (${s.notes})` : ''}`),
          ...actions.map((a) => `Action observed: ${a}`),
          ...expectedOutcomes.map((e) => `Expected outcome observed: ${e}`),
          ...(edgeCases ?? []).map((e) => `Edge case observed: ${e}`),
        ];
        const block = [`_(explorer-agent, ${todayISO()})_`, ...bullets.map((b) => `- ${b}`)].join('\n');
        writeFileSync(filePath, appendToSection(raw, '## Auto-discovered (needs review)', block));
        return { content: [{ type: 'text' as const, text: `appended to reviewed file ${filePath}` }] };
      }
      writeFileSync(
        filePath,
        buildFreshPageBody({ pageTitle, url, selectors, actions, expectedOutcomes, edgeCases: edgeCases ?? [] }),
      );
      return { content: [{ type: 'text' as const, text: `overwrote unreviewed file ${filePath}` }] };
    }

    writeFileSync(
      filePath,
      buildFreshPageBody({ pageTitle, url, selectors, actions, expectedOutcomes, edgeCases: edgeCases ?? [] }),
    );
    return { content: [{ type: 'text' as const, text: `created ${filePath}` }] };
  },
);

const upsertRegistryEntryTool = tool(
  'upsert_registry_entry',
  "Add or update this page's entry in the product's registry.yaml, with " +
    'last_verified set to today. Call this right after write_page_knowledge for the ' +
    'same page.',
  {
    product: z.enum(PRODUCTS),
    page: z.string(),
    journeys: z.array(z.string()).default([]),
    appVersion: z.string().optional(),
  },
  async ({ product, page, journeys, appVersion }) => {
    const path = join(knowledgeDir(product), 'registry.yaml');
    const raw = existsSync(path) ? readFileSync(path, 'utf-8') : '[]';
    const parsed = parseYaml(raw);
    const arr: any[] = Array.isArray(parsed) ? parsed : [];
    const idx = arr.findIndex((e) => e.page === page);
    const entry = {
      page,
      file: `pages/${page}.md`,
      journeys,
      last_verified: todayISO(),
      ...(appVersion ? { app_version: appVersion } : {}),
    };
    if (idx === -1) arr.push(entry);
    else arr[idx] = { ...arr[idx], ...entry };
    writeFileSync(path, stringifyYaml(arr));
    return { content: [{ type: 'text' as const, text: `registry.yaml updated for ${product}/${page}` }] };
  },
);

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const env = PRODUCT_ENV[args.product];
  const baseUrl = args.startUrl ?? getRequiredEnv(env.baseUrl);

  const storageStatePath = join(process.cwd(), '.auth', `${args.product}.json`);
  console.log(`[explorer] logging in to ${args.product} at ${baseUrl} ...`);
  await loginAndSaveStorageState(args.product, baseUrl, storageStatePath, args.headed);
  console.log(`[explorer] authenticated session saved to ${storageStatePath}`);

  const knowledgeServer = createSdkMcpServer({
    name: 'knowledge',
    version: '1.0.0',
    instructions: "Tools for writing a product's knowledge/ markdown, with review-safety built in.",
    tools: [writePageKnowledgeTool, upsertRegistryEntryTool],
  });

  const systemPrompt = [
    'You are the explorer agent for an insurance test-automation knowledge base.',
    'You control an already-authenticated browser session via the Playwright MCP',
    'tools (mcp__playwright__*). You must never attempt to log in yourself and you',
    'will never be given a password — the session is already authenticated.',
    '',
    'For every distinct page you visit:',
    '  1. Take a snapshot (mcp__playwright__browser_snapshot) to see the accessibility',
    "     tree. Prefer selectors in this order: data-testid, then role + accessible",
    '     name, then label/placeholder/text. Never propose a raw CSS class or XPath',
    '     unless nothing else identifies the element, and say so in the notes field.',
    '  2. Call mcp__knowledge__write_page_knowledge with a kebab-case page slug, the',
    '     URL, the selectors you found for the key interactive elements, the actions',
    '     available on the page, and the expected outcome of each key action.',
    '  3. Call mcp__knowledge__upsert_registry_entry for the same page slug with your',
    '     best-guess journeys (short kebab-case tags like "new-business", "renewal").',
    '  4. Follow primary navigation links to discover more pages, up to the page',
    `     budget you're given. Do not follow links that log the session out, delete`,
    '     data, or leave the app domain.',
    '',
    'Stop and summarize once you run out of budget or new pages to find.',
  ].join('\n');

  const prompt = [
    `Explore the "${args.product}" application, starting from the current page`,
    `(already navigated to ${baseUrl}). Walk the primary navigation and document up`,
    `to ${args.maxPages} distinct pages using the tools you've been given.`,
  ].join(' ');

  for await (const message of query({
    prompt,
    options: {
      systemPrompt,
      cwd: process.cwd(),
      mcpServers: {
        playwright: {
          type: 'stdio',
          command: 'npx',
          args: ['@playwright/mcp', '--isolated', `--storage-state=${storageStatePath}`],
        },
        knowledge: knowledgeServer,
      },
      allowedTools: [
        'mcp__playwright__browser_navigate',
        'mcp__playwright__browser_navigate_back',
        'mcp__playwright__browser_click',
        'mcp__playwright__browser_type',
        'mcp__playwright__browser_select_option',
        'mcp__playwright__browser_hover',
        'mcp__playwright__browser_snapshot',
        'mcp__playwright__browser_take_screenshot',
        'mcp__playwright__browser_wait_for',
        'mcp__playwright__browser_tab_list',
        'mcp__playwright__browser_tab_select',
        'mcp__knowledge__write_page_knowledge',
        'mcp__knowledge__upsert_registry_entry',
      ],
      permissionMode: 'default',
    },
  })) {
    if (message.type === 'assistant') {
      for (const block of message.message.content) {
        if (block.type === 'text') console.log(`[explorer] ${block.text}`);
      }
    } else if (message.type === 'result') {
      console.log(`[explorer] run finished: ${message.subtype}`);
    }
  }

  const registryPath = join(knowledgeDir(args.product), 'registry.yaml');
  console.log(`[explorer] final registry: ${registryPath}`);
  console.log(readFileSync(registryPath, 'utf-8'));
}

main().catch((err) => {
  console.error('[explorer] failed:', err);
  process.exit(1);
});
