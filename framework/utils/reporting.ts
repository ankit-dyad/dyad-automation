import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from '@playwright/test/reporter';

/**
 * Traceability reporter: maps every test result back to the scenario ID it was
 * generated from, so `/reports` output can answer "which scenario failed", not just
 * "which spec file". Runs alongside the standard HTML reporter (see
 * playwright.config.ts) — it doesn't replace it.
 *
 * Convention: every generated spec tags its tests with a `scenario` annotation, e.g.
 *
 *   test('logs in and starts a new business quote', {
 *     annotation: { type: 'scenario', description: 'scenario-01-new-business-quote' },
 *   }, async ({ page }) => { ... });
 *
 * generator-agent.ts adds this annotation automatically to every spec it writes.
 * Tests without a `scenario` annotation are reported under "unattributed" so gaps in
 * traceability are visible rather than silently dropped.
 */

const REPORTS_DIR = join(__dirname, '../../reports');

interface ScenarioResultRow {
  scenarioId: string;
  product: string | null;
  testTitle: string;
  file: string;
  status: TestResult['status'];
  durationMs: number;
  retries: number;
  errors: string[];
}

function scenarioIdFor(test: TestCase): string {
  const ann = test.annotations.find((a) => a.type === 'scenario');
  return ann?.description ?? 'unattributed';
}

function productFor(test: TestCase): string | null {
  const ann = test.annotations.find((a) => a.type === 'product');
  return ann?.description ?? null;
}

export default class ScenarioTraceabilityReporter implements Reporter {
  private rows: ScenarioResultRow[] = [];

  onBegin(_config: FullConfig, _suite: Suite): void {
    this.rows = [];
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    this.rows.push({
      scenarioId: scenarioIdFor(test),
      product: productFor(test),
      testTitle: test.titlePath().slice(1).join(' > '),
      file: test.location.file,
      status: result.status,
      durationMs: result.duration,
      retries: result.retry,
      errors: result.errors.map((e) => e.message ?? String(e)).filter(Boolean),
    });
  }

  onEnd(_result: FullResult): void {
    mkdirSync(REPORTS_DIR, { recursive: true });

    const byScenario = new Map<string, ScenarioResultRow[]>();
    for (const row of this.rows) {
      const list = byScenario.get(row.scenarioId) ?? [];
      list.push(row);
      byScenario.set(row.scenarioId, list);
    }

    const summary = [...byScenario.entries()].map(([scenarioId, results]) => ({
      scenarioId,
      product: results[0]?.product ?? null,
      total: results.length,
      passed: results.filter((r) => r.status === 'passed').length,
      failed: results.filter((r) => r.status === 'failed' || r.status === 'timedOut').length,
      skipped: results.filter((r) => r.status === 'skipped').length,
      results,
    }));

    writeFileSync(
      join(REPORTS_DIR, 'scenario-summary.json'),
      JSON.stringify(summary, null, 2),
    );

    const lines: string[] = ['# Scenario Result Summary', ''];
    for (const s of summary) {
      const icon = s.failed > 0 ? '❌' : s.skipped === s.total ? '⏭️' : '✅';
      lines.push(`## ${icon} ${s.scenarioId} ${s.product ? `(${s.product})` : ''}`);
      lines.push(`- ${s.passed}/${s.total} passed, ${s.failed} failed, ${s.skipped} skipped`);
      for (const r of s.results) {
        lines.push(`  - [${r.status}] ${r.testTitle} (${r.file})`);
      }
      lines.push('');
    }
    writeFileSync(join(REPORTS_DIR, 'scenario-summary.md'), lines.join('\n'));
  }
}
