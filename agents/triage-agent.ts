#!/usr/bin/env -S npx tsx
/**
 * Triage agent
 * ============
 * Runs against a completed test run's results — never on every execution, and never
 * as part of the standalone /tests suite. Point it at the JSON report produced by a
 * CI run (see playwright.config.ts's `json` reporter -> reports/results.json).
 *
 * Usage:
 *   npx tsx agents/triage-agent.ts [--results reports/results.json] [--dry-run]
 *
 * For each failing test:
 *   - If Playwright itself reports the test as "flaky" (failed then passed on
 *     retry), it's classified as `flaky` directly — that's a more reliable signal
 *     than asking a model to guess flakiness from one run's error text.
 *   - Otherwise the model classifies it into one of: locator-drift, timing,
 *     test-data, likely-app-defect — from the error text, the test's `scenario`/
 *     `product` annotations, and (for a suspected locator-drift) the relevant Page
 *     Object source, via a structured tool call. The model never edits a file
 *     directly; it only proposes data, which this script then applies.
 *
 * Only `locator-drift` gets code changes: this script edits the affected Page
 * Object(s) on a fresh branch and opens a PR (never merges it) linking the trace/
 * screenshot evidence. Every other classification gets a structured issue file
 * under /reports/issues/ (and a best-effort `gh issue create`, if the CLI is
 * available and authenticated) for a human to pick up.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { z } from 'zod';
import { query, tool, createSdkMcpServer } from '@anthropic-ai/claude-agent-sdk';

const REPO_ROOT = process.cwd();
const REPORTS_DIR = join(REPO_ROOT, 'reports');

// ---------------------------------------------------------------------------
// Playwright JSON report parsing
// ---------------------------------------------------------------------------

interface PwAttachment {
  name: string;
  path?: string;
  contentType: string;
}
interface PwAnnotation {
  type: string;
  description?: string;
}
interface PwResult {
  status: string;
  duration: number;
  retry: number;
  error?: { message?: string; stack?: string };
  errors?: { message?: string }[];
  attachments?: PwAttachment[];
}
interface PwTest {
  status: string; // 'expected' | 'unexpected' | 'flaky' | 'skipped'
  annotations?: PwAnnotation[];
  results: PwResult[];
}
interface PwSpec {
  title: string;
  file: string;
  tests: PwTest[];
}
interface PwSuite {
  title: string;
  file?: string;
  specs?: PwSpec[];
  suites?: PwSuite[];
}
interface PwReport {
  suites: PwSuite[];
}

interface FailingTest {
  id: string;
  title: string;
  file: string;
  status: 'unexpected' | 'flaky';
  scenarioId: string | null;
  product: string | null;
  errorMessage: string;
  errorStack: string;
  attachments: { name: string; path: string }[];
  retries: number;
}

function walkSpecs(suite: PwSuite, out: PwSpec[]) {
  for (const spec of suite.specs ?? []) out.push(spec);
  for (const child of suite.suites ?? []) walkSpecs(child, out);
}

function collectFailingTests(report: PwReport): FailingTest[] {
  const specs: PwSpec[] = [];
  for (const suite of report.suites ?? []) walkSpecs(suite, specs);

  const failing: FailingTest[] = [];
  for (const spec of specs) {
    for (const [i, test] of spec.tests.entries()) {
      if (test.status !== 'unexpected' && test.status !== 'flaky') continue;
      const last = test.results[test.results.length - 1];
      const scenarioId = test.annotations?.find((a) => a.type === 'scenario')?.description ?? null;
      const product = test.annotations?.find((a) => a.type === 'product')?.description ?? null;
      failing.push({
        id: `${spec.file}::${spec.title}::${i}`,
        title: spec.title,
        file: spec.file,
        status: test.status as 'unexpected' | 'flaky',
        scenarioId,
        product,
        errorMessage: last?.error?.message ?? last?.errors?.[0]?.message ?? '(no error message captured)',
        errorStack: last?.error?.stack ?? '',
        attachments: (last?.attachments ?? [])
          .filter((a) => a.path)
          .map((a) => ({ name: a.name, path: a.path as string })),
        retries: test.results.length - 1,
      });
    }
  }
  return failing;
}

// ---------------------------------------------------------------------------
// Classification
// ---------------------------------------------------------------------------

const CLASSIFICATIONS = ['locator-drift', 'timing', 'test-data', 'likely-app-defect'] as const;
type Classification = (typeof CLASSIFICATIONS)[number] | 'flaky';

interface LocatorFix {
  pageObjectFile: string; // relative to repo root, e.g. framework/pages/nexsure/PolicyQuotePage.ts
  element: string;
  newSelector: string; // e.g. getByTestId('submit-quote-v2')
  rationale: string;
}

interface TriageResult {
  test: FailingTest;
  classification: Classification;
  evidence: string;
  suspectedCause: string;
  locatorFix?: LocatorFix;
}

function findLikelyPageObjectFiles(errorText: string): string[] {
  // Best-effort: pull any framework/pages/**/*.ts path mentioned in the stack, else
  // let the model name one explicitly via the tool call.
  const matches = [...errorText.matchAll(/framework\/pages\/[\w./-]+\.ts/g)].map((m) => m[0]);
  return [...new Set(matches)];
}

async function classify(test: FailingTest): Promise<TriageResult> {
  if (test.status === 'flaky') {
    return {
      test,
      classification: 'flaky',
      evidence: `Passed on retry ${test.retries}/${test.retries + 1} — Playwright reported this test as flaky.`,
      suspectedCause: 'Non-deterministic timing/state between runs; needs de-flaking, not a code fix from this pass.',
    };
  }

  let captured: TriageResult | null = null;
  const hintedFiles = findLikelyPageObjectFiles(test.errorStack || test.errorMessage);
  const hintedSource = hintedFiles
    .filter((f) => existsSync(join(REPO_ROOT, f)))
    .map((f) => `### ${f}\n\n\`\`\`ts\n${readFileSync(join(REPO_ROOT, f), 'utf-8')}\n\`\`\``)
    .join('\n\n');

  const submitTool = tool(
    'submit_triage',
    'Submit the classification for this single failing test. Call exactly once.',
    {
      classification: z.enum(CLASSIFICATIONS),
      evidence: z.string().describe('the specific error text / signal that led to this classification'),
      suspectedCause: z.string(),
      locatorFix: z
        .object({
          pageObjectFile: z.string().describe('path relative to repo root, e.g. framework/pages/nexsure/LoginPage.ts'),
          element: z.string().describe('the locator property name in that Page Object, e.g. "submitButton"'),
          newSelector: z.string().describe('proposed replacement, e.g. getByTestId(\'submit-quote-v2\')'),
          rationale: z.string(),
        })
        .optional()
        .describe('required when classification is "locator-drift"'),
    },
    async (args) => {
      if (args.classification === 'locator-drift' && !args.locatorFix) {
        return {
          content: [{ type: 'text' as const, text: 'REJECTED — locator-drift requires locatorFix. Resubmit with it.' }],
          isError: true,
        };
      }
      captured = { test, ...args } as TriageResult;
      return { content: [{ type: 'text' as const, text: 'accepted' }] };
    },
  );

  const server = createSdkMcpServer({ name: 'triage', version: '1.0.0', tools: [submitTool] });

  const prompt = [
    `Failing test: ${test.title}`,
    `Spec file: ${test.file}`,
    `Scenario: ${test.scenarioId ?? 'unattributed'} (product: ${test.product ?? 'unknown'})`,
    `Retries: ${test.retries}`,
    '',
    'Error message:',
    test.errorMessage,
    '',
    test.errorStack ? `Stack:\n${test.errorStack}` : '',
    '',
    hintedSource ? `Possibly-relevant Page Object source:\n\n${hintedSource}` : '(no Page Object source located from the stack — if you classify this as locator-drift, name the exact framework/pages/<product>/<Page>.ts file and locator property to change.)',
    '',
    'Classify this failure and call submit_triage once. Use "locator-drift" only when',
    'the error clearly shows a selector that no longer resolves (e.g. "waiting for',
    'locator", "0 elements found", "strict mode violation") and you can name the',
    'exact Page Object file/property. Use "timing" for waits/timeouts, "test-data" for',
    'a data conflict/precondition failure, "likely-app-defect" when the app itself',
    'appears to be behaving incorrectly.',
  ].join('\n');

  for await (const message of query({
    prompt,
    options: {
      systemPrompt:
        'You are a test-failure triage assistant for a Playwright automation suite. ' +
        'You classify failures precisely and conservatively — when unsure between ' +
        'locator-drift and likely-app-defect, prefer likely-app-defect so a human ' +
        'reviews it rather than auto-generating a speculative code fix.',
      mcpServers: { triage: server },
      allowedTools: ['mcp__triage__submit_triage'],
      permissionMode: 'default',
    },
  })) {
    if (message.type === 'assistant') {
      for (const block of message.message.content) {
        if (block.type === 'text') console.log(`[triage] ${block.text}`);
      }
    }
  }

  if (!captured) {
    return {
      test,
      classification: 'likely-app-defect',
      evidence: test.errorMessage,
      suspectedCause: 'Model did not return a classification — defaulting to likely-app-defect for human review.',
    };
  }
  return captured;
}

// ---------------------------------------------------------------------------
// Non-locator-drift: structured issue files (+ best-effort gh issue create)
// ---------------------------------------------------------------------------

function writeIssueFile(result: TriageResult): string {
  const dir = join(REPORTS_DIR, 'issues');
  mkdirSync(dir, { recursive: true });
  const safeId = result.test.id.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 120);
  const path = join(dir, `${safeId}.md`);
  const lines = [
    `# [${result.classification}] ${result.test.title}`,
    '',
    `- Scenario: ${result.test.scenarioId ?? 'unattributed'} (${result.test.product ?? 'unknown product'})`,
    `- Spec: ${relative(REPO_ROOT, join(REPO_ROOT, result.test.file))}`,
    `- Classification: ${result.classification}`,
    `- Retries: ${result.test.retries}`,
    '',
    '## Evidence',
    '',
    result.evidence,
    '',
    '## Suspected cause',
    '',
    result.suspectedCause,
    '',
    '## Attachments',
    '',
    ...(result.test.attachments.length
      ? result.test.attachments.map((a) => `- ${a.name}: ${a.path}`)
      : ['- (none captured)']),
    '',
  ];
  writeFileSync(path, lines.join('\n'));
  return path;
}

function tryCreateGhIssue(result: TriageResult, filePath: string) {
  try {
    execFileSync(
      'gh',
      [
        'issue',
        'create',
        '--title',
        `[${result.classification}] ${result.test.title}`,
        '--body-file',
        filePath,
        '--label',
        result.classification,
      ],
      { stdio: 'pipe', cwd: REPO_ROOT },
    );
    console.log(`[triage] opened GitHub issue for: ${result.test.title}`);
  } catch {
    console.log(`[triage] (gh CLI unavailable/unauthenticated — issue only written to ${filePath})`);
  }
}

// ---------------------------------------------------------------------------
// locator-drift: branch + Page Object edit + PR (never merged)
// ---------------------------------------------------------------------------

function applyLocatorFix(fix: LocatorFix): boolean {
  const filePath = join(REPO_ROOT, fix.pageObjectFile);
  if (!existsSync(filePath)) {
    console.error(`[triage] cannot apply fix — ${filePath} does not exist.`);
    return false;
  }
  const src = readFileSync(filePath, 'utf-8');
  const declRe = new RegExp(`(readonly\\s+${fix.element}\\s*=\\s*this\\.page\\.)([^;]+)(;)`);
  if (!declRe.test(src)) {
    console.error(`[triage] cannot apply fix — no "readonly ${fix.element} = this.page....;" line found in ${filePath}.`);
    return false;
  }
  const updated = src.replace(declRe, (_m, pre, _old, post) => `${pre}${fix.newSelector}${post}`);
  writeFileSync(filePath, updated);
  return true;
}

function git(args: string[]) {
  return execFileSync('git', args, { cwd: REPO_ROOT, stdio: 'pipe' }).toString().trim();
}

function openLocatorDriftPr(fixes: TriageResult[], dryRun: boolean) {
  if (!fixes.length) return;

  const originalBranch = git(['rev-parse', '--abbrev-ref', 'HEAD']);
  const branch = `triage/locator-drift-${new Date().toISOString().replace(/[:.]/g, '-')}`;
  const changedFiles: string[] = [];

  const prBodyLines = [
    'Proposed locator fixes from the triage agent. **Unverified against the live',
    'app** — review the trace/screenshot evidence below and confirm before merging.',
    'This PR is never auto-merged.',
    '',
  ];

  for (const r of fixes) {
    const fix = r.locatorFix!;
    prBodyLines.push(`### ${r.test.title}`);
    prBodyLines.push(`- File: \`${fix.pageObjectFile}\``);
    prBodyLines.push(`- Element: \`${fix.element}\``);
    prBodyLines.push(`- Proposed selector: \`${fix.newSelector}\``);
    prBodyLines.push(`- Rationale: ${fix.rationale}`);
    prBodyLines.push(
      `- Evidence: ${r.test.attachments.length ? r.test.attachments.map((a) => `${a.name} (${a.path})`).join(', ') : '(no trace/screenshot captured)'}`,
    );
    prBodyLines.push('');
  }
  const prBody = prBodyLines.join('\n');

  if (dryRun) {
    console.log(`[triage] --dry-run: would apply ${fixes.length} locator fix(es) on branch ${branch} and open a PR:`);
    console.log(prBody);
    // Still show what the edits would look like, without touching the working tree's branch.
    return;
  }

  try {
    git(['checkout', '-b', branch]);
    for (const r of fixes) {
      if (applyLocatorFix(r.locatorFix!)) changedFiles.push(r.locatorFix!.pageObjectFile);
    }
    if (!changedFiles.length) {
      console.error('[triage] no fixes could be applied — aborting PR.');
      git(['checkout', originalBranch]);
      git(['branch', '-D', branch]);
      return;
    }
    git(['add', ...changedFiles]);
    git(['commit', '-m', `triage: proposed locator fix(es) for ${changedFiles.length} file(s)`]);
    git(['push', '-u', 'origin', branch]);
    const prTitle = `[triage] proposed locator fix(es) (${fixes.length})`;
    const prUrl = execFileSync(
      'gh',
      ['pr', 'create', '--title', prTitle, '--body', prBody, '--base', originalBranch, '--head', branch],
      { cwd: REPO_ROOT, stdio: 'pipe' },
    )
      .toString()
      .trim();
    console.log(`[triage] opened PR: ${prUrl}`);
  } catch (err) {
    console.error(`[triage] could not open a PR automatically (${(err as Error).message}).`);
    console.error(`[triage] the fix(es) are committed on branch "${branch}" locally — push/open the PR by hand.`);
  } finally {
    try {
      git(['checkout', originalBranch]);
    } catch {
      /* best effort */
    }
  }
}

// ---------------------------------------------------------------------------

function parseArgs(argv: string[]) {
  const get = (flag: string) => {
    const i = argv.indexOf(flag);
    return i === -1 ? undefined : argv[i + 1];
  };
  return {
    resultsPath: get('--results') ?? join(REPORTS_DIR, 'results.json'),
    dryRun: argv.includes('--dry-run'),
  };
}

async function main() {
  const { resultsPath, dryRun } = parseArgs(process.argv.slice(2));
  if (!existsSync(resultsPath)) {
    console.error(`[triage] no results file at ${resultsPath}. Run the suite with the json reporter first.`);
    process.exit(1);
  }
  const report: PwReport = JSON.parse(readFileSync(resultsPath, 'utf-8'));
  const failing = collectFailingTests(report);
  if (!failing.length) {
    console.log('[triage] no failing/flaky tests in this report — nothing to do.');
    return;
  }
  console.log(`[triage] classifying ${failing.length} failing/flaky test(s)...`);

  const results: TriageResult[] = [];
  for (const test of failing) {
    results.push(await classify(test));
  }

  const locatorDrift = results.filter((r) => r.classification === 'locator-drift');
  const others = results.filter((r) => r.classification !== 'locator-drift' && r.classification !== 'flaky');
  const flaky = results.filter((r) => r.classification === 'flaky');

  for (const r of others) {
    const path = writeIssueFile(r);
    console.log(`[triage] [${r.classification}] ${r.test.title} -> ${path}`);
    if (!dryRun) tryCreateGhIssue(r, path);
  }
  for (const r of flaky) {
    const path = writeIssueFile(r);
    console.log(`[triage] [flaky] ${r.test.title} -> ${path}`);
  }

  openLocatorDriftPr(locatorDrift, dryRun);

  console.log(
    `[triage] done. ${locatorDrift.length} locator-drift, ${others.length} other issue(s) written, ${flaky.length} flaky.`,
  );
}

main().catch((err) => {
  console.error('[triage] failed:', err);
  process.exit(1);
});
