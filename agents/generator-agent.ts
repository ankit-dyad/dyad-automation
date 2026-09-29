#!/usr/bin/env -S npx tsx
/**
 * Generator agent
 * ================
 * Turns a signed-off scenario into a Playwright spec, in two explicit phases so a
 * human signs off on the test case before any code is generated.
 *
 * Usage:
 *   npx tsx agents/generator-agent.ts draft    scenarios/<product>/<scenario>.md
 *   npx tsx agents/generator-agent.ts generate scenarios/<product>/<scenario>.md
 *
 * "draft" reads the scenario's front matter (product, journey, pages), resolves the
 * referenced knowledge files via registry.yaml (direct path lookup only — no fuzzy
 * search, no embeddings), and writes a human-readable numbered
 * <scenario>.testcase.md next to the scenario for sign-off.
 *
 * "generate" requires that file to be approved (a checked "- [ ] Approved" box, or
 * `approved: true` in its front matter). It asks the model for a structured list of
 * steps, then validates every referenced UI element in code against the knowledge
 * files' Selectors tables before writing anything — if an element isn't documented,
 * generation stops and names the exact knowledge file to complete. Only once
 * validated does it emit/extend Page Objects under /framework/pages/<product>/ and
 * the spec under /tests/regression/.
 *
 * Generated Page Objects and specs are starting drafts — human-owned from the moment
 * they're written, same as anything explorer-agent.ts writes to /knowledge. This
 * agent never overwrites a Page Object or spec that already exists; it flags what's
 * missing instead.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import matter from 'gray-matter';
import { z } from 'zod';
import { query, tool, createSdkMcpServer } from '@anthropic-ai/claude-agent-sdk';
import { resolvePages, findSelector, type KnowledgePage, type KnowledgeSelector } from '../framework/utils/registry';

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function toIdentifierWords(text: string): string[] {
  return text.replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean);
}

function toCamelCase(text: string): string {
  const words = toIdentifierWords(text);
  if (!words.length) return 'element';
  return words.map((w, i) => (i === 0 ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1).toLowerCase())).join('');
}

function toPascalCase(text: string): string {
  const words = toIdentifierWords(text);
  if (!words.length) return 'Item';
  return words.map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase()).join('');
}

function methodNameFor(action: string, elementName: string): string {
  return action + toPascalCase(elementName);
}

/** Renders a step's `value`/`expected` string into a JS expression. Supports
 * `{{applicant.firstName}}`-style placeholders resolved against the test data
 * fixture locals declared at the top of the generated test; anything else is
 * emitted as a plain string literal. */
function valueExpr(raw: string | undefined): string {
  if (raw === undefined) return '';
  const m = raw.match(/^\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}$/);
  return m ? m[1] : JSON.stringify(raw);
}

const ACTIONS = [
  'goto',
  'fill',
  'select',
  'click',
  'check',
  'uncheck',
  'assertVisible',
  'assertHidden',
  'assertText',
  'assertURL',
  'custom',
] as const;
type Action = (typeof ACTIONS)[number];
const ELEMENT_REQUIRED_ACTIONS: Action[] = ['fill', 'select', 'click', 'check', 'uncheck', 'assertVisible', 'assertHidden', 'assertText'];
const METHOD_ACTIONS: Action[] = ['fill', 'select', 'click', 'check', 'uncheck'];

interface GeneratedStep {
  page: string;
  action: Action;
  element?: string;
  value?: string;
  expected?: string;
  description: string;
}

interface ScenarioFrontMatter {
  product: string;
  journey: string;
  pages: string[];
}

function readScenario(scenarioPath: string): { data: ScenarioFrontMatter; content: string } {
  const raw = readFileSync(scenarioPath, 'utf-8');
  const { data, content } = matter(raw);
  const { product, journey, pages } = data as Partial<ScenarioFrontMatter>;
  if (!product || !journey || !pages || !Array.isArray(pages) || pages.length === 0) {
    throw new Error(`${scenarioPath}: front matter must include product, journey, and a non-empty pages list.`);
  }
  return { data: { product, journey, pages }, content };
}

function testCasePathFor(scenarioPath: string): { scenarioId: string; testCasePath: string } {
  const scenarioId = basename(scenarioPath).replace(/\.md$/, '');
  return { scenarioId, testCasePath: join(dirname(scenarioPath), `${scenarioId}.testcase.md`) };
}

// ---------------------------------------------------------------------------
// Phase 1: draft — scenario + knowledge -> human-readable test case
// ---------------------------------------------------------------------------

async function draft(scenarioPath: string, scenarioPathArg: string) {
  const { data, content } = readScenario(scenarioPath);
  const { product, journey, pages } = data;
  const { scenarioId, testCasePath } = testCasePathFor(scenarioPath);

  const knowledgePages = resolvePages(product, pages); // throws + names the missing page/registry entry

  const knowledgeBlock = knowledgePages
    .map((kp) => `### Page: ${kp.entry.page} (${relative(process.cwd(), kp.absPath)})\n\n${kp.body}`)
    .join('\n\n---\n\n');

  const submitTool = tool(
    'submit_test_case',
    'Submit the drafted, human-readable numbered test case for sign-off. Call this exactly once.',
    {
      preconditions: z.array(z.string()).default([]),
      steps: z.array(
        z.object({
          number: z.number(),
          description: z.string(),
          expectedResult: z.string().optional(),
        }),
      ),
    },
    async ({ preconditions, steps }) => {
      const lines = [
        '---',
        `product: ${product}`,
        `journey: ${journey}`,
        `pages: [${pages.join(', ')}]`,
        `scenario: ${scenarioId}`,
        'approved: false',
        `generated_at: ${todayISO()}`,
        '---',
        '',
        `# Test Case: ${scenarioId}`,
        '',
        '## Preconditions',
        '',
        ...(preconditions.length ? preconditions.map((p) => `- ${p}`) : ['- (none)']),
        '',
        '## Steps',
        '',
        ...steps.map(
          (s) => `${s.number}. ${s.description}${s.expectedResult ? `\n   - **Expected:** ${s.expectedResult}` : ''}`,
        ),
        '',
        '## Sign-off',
        '',
        '- [ ] Approved for spec generation',
        '',
        '<!--',
        '  To approve: check the box above (or set `approved: true` above in the front',
        '  matter), then run:',
        `    npx tsx agents/generator-agent.ts generate ${scenarioPathArg}`,
        '-->',
        '',
      ];
      writeFileSync(testCasePath, lines.join('\n'));
      return { content: [{ type: 'text' as const, text: `wrote ${testCasePath}` }] };
    },
  );

  const server = createSdkMcpServer({ name: 'testcase', version: '1.0.0', tools: [submitTool] });

  const prompt = [
    `Scenario steps (from ${basename(scenarioPath)}):`,
    '',
    content.trim(),
    '',
    'Knowledge for the pages this scenario touches — this is ground truth. Do not',
    'describe any UI element, action, or outcome that is not supported by it:',
    '',
    knowledgeBlock,
    '',
    'Call submit_test_case exactly once with clear preconditions and a numbered list',
    'of steps (with the expected result of each meaningful step) that a non-technical',
    'reviewer can read and sign off on. No code.',
  ].join('\n');

  for await (const message of query({
    prompt,
    options: {
      systemPrompt:
        'You turn a terse scenario outline plus page knowledge into a precise, ' +
        'human-readable numbered test case for QA sign-off. Never reference a UI ' +
        'element, action, or outcome that is not explicitly present in the knowledge ' +
        'you were given.',
      mcpServers: { testcase: server },
      allowedTools: ['mcp__testcase__submit_test_case'],
      permissionMode: 'default',
    },
  })) {
    if (message.type === 'assistant') {
      for (const block of message.message.content) {
        if (block.type === 'text') console.log(`[generator] ${block.text}`);
      }
    }
  }

  if (!existsSync(testCasePath)) {
    console.error('[generator] model did not submit a test case. Nothing was written.');
    process.exit(1);
  }
  console.log(`\n[generator] draft written to ${testCasePath}`);
  console.log('[generator] have a human review and check the sign-off box, then run:');
  console.log(`  npx tsx agents/generator-agent.ts generate ${scenarioPathArg}`);
}

// ---------------------------------------------------------------------------
// Phase 2: generate — approved test case -> Page Objects + Playwright spec
// ---------------------------------------------------------------------------

function renderPageObjectFile(
  product: string,
  pageSlug: string,
  elementsUsed: KnowledgeSelector[],
  methodsNeeded: { name: string; kind: Action; element: string }[],
  url: string,
): string {
  const className = `${toPascalCase(pageSlug)}Page`;
  const locatorDecls = elementsUsed
    .map((e) => `  readonly ${toCamelCase(e.element)} = this.page.${e.selector};`)
    .join('\n');
  const methodFor = (m: { name: string; kind: Action; element: string }) => {
    const locator = `this.${toCamelCase(m.element)}`;
    switch (m.kind) {
      case 'fill':
        return `  async ${m.name}(value: string): Promise<void> {\n    await ${locator}.fill(value);\n  }`;
      case 'select':
        return `  async ${m.name}(value: string): Promise<void> {\n    await ${locator}.selectOption(value);\n  }`;
      case 'click':
        return `  async ${m.name}(): Promise<void> {\n    await ${locator}.click();\n  }`;
      case 'check':
        return `  async ${m.name}(): Promise<void> {\n    await ${locator}.check();\n  }`;
      case 'uncheck':
        return `  async ${m.name}(): Promise<void> {\n    await ${locator}.uncheck();\n  }`;
      default:
        return '';
    }
  };
  return [
    `import { BasePage } from '../BasePage';`,
    '',
    '/**',
    ` * Drafted by generator-agent.ts from ${product}/knowledge/pages/${pageSlug}.md.`,
    ' * Human-owned from here — edit freely. If the app changes, update the knowledge',
    ' * file first (source of truth for selectors), then this class to match.',
    ' */',
    `export class ${className} extends BasePage {`,
    `  protected override path = ${JSON.stringify(url || '/')};`,
    '',
    locatorDecls,
    '',
    methodsNeeded.map(methodFor).join('\n\n'),
    '}',
    '',
  ].join('\n');
}

function renderSpecFile(opts: {
  scenarioId: string;
  product: string;
  journey: string;
  pages: string[];
  steps: GeneratedStep[];
  testCaseTitle: string;
}): string {
  const pageVarFor = (page: string) => toCamelCase(page) + 'Page';
  const pageClassFor = (page: string) => toPascalCase(page) + 'Page';
  const usedPages = [...new Set(opts.steps.map((s) => s.page))];
  const touchesPlaceholder = (prefix: string) =>
    opts.steps.some((s) => (s.value ?? '').includes(`${prefix}.`) || (s.expected ?? '').includes(`${prefix}.`));
  const needsApplicant = touchesPlaceholder('applicant');
  const needsPolicyRef = touchesPlaceholder('policyRef');

  const imports = [
    `import { test, expect } from '../../framework/fixtures';`,
    ...usedPages.map(
      (p) => `import { ${pageClassFor(p)} } from '../../framework/pages/${opts.product}/${pageClassFor(p)}';`,
    ),
  ];

  const body: string[] = [];
  for (const page of usedPages) body.push(`const ${pageVarFor(page)} = new ${pageClassFor(page)}(page);`);
  if (needsApplicant) body.push('const applicant = testData.applicant();');
  if (needsPolicyRef) body.push(`const policyRef = testData.policyRef(${JSON.stringify(opts.product)}, ${JSON.stringify(opts.journey)});`);
  body.push('');

  for (const step of opts.steps) {
    const pv = pageVarFor(step.page);
    body.push(`// ${step.description}`);
    switch (step.action) {
      case 'goto':
        body.push(`await ${pv}.goto();`);
        break;
      case 'fill':
        body.push(`await ${pv}.${methodNameFor('fill', step.element!)}(${valueExpr(step.value)});`);
        break;
      case 'select':
        body.push(`await ${pv}.${methodNameFor('select', step.element!)}(${valueExpr(step.value)});`);
        break;
      case 'click':
        body.push(`await ${pv}.${methodNameFor('click', step.element!)}();`);
        break;
      case 'check':
        body.push(`await ${pv}.${methodNameFor('check', step.element!)}();`);
        break;
      case 'uncheck':
        body.push(`await ${pv}.${methodNameFor('uncheck', step.element!)}();`);
        break;
      case 'assertVisible':
        body.push(`await expect(${pv}.${toCamelCase(step.element!)}).toBeVisible();`);
        break;
      case 'assertHidden':
        body.push(`await expect(${pv}.${toCamelCase(step.element!)}).toBeHidden();`);
        break;
      case 'assertText':
        body.push(`await expect(${pv}.${toCamelCase(step.element!)}).toHaveText(${valueExpr(step.expected)});`);
        break;
      case 'assertURL':
        body.push(`await expect(page).toHaveURL(${valueExpr(step.expected)});`);
        break;
      case 'custom':
        body.push(`// TODO(human): ${step.description} — generator could not express this deterministically.`);
        break;
    }
  }

  const indent = (lines: string[]) => lines.map((l) => (l ? `  ${l}` : l)).join('\n');

  return [
    ...imports,
    '',
    '/**',
    ` * Generated by generator-agent.ts from /scenarios/${opts.product}/${opts.scenarioId}.md`,
    ` * and its signed-off ${opts.scenarioId}.testcase.md. Goes through PR review like`,
    ' * any other code change, and is human-owned once merged.',
    ' */',
    `test(${JSON.stringify(opts.testCaseTitle)}, {`,
    '  annotation: [',
    `    { type: 'scenario', description: ${JSON.stringify(opts.scenarioId)} },`,
    `    { type: 'product', description: ${JSON.stringify(opts.product)} },`,
    '  ],',
    "}, async ({ page, testData }) => {",
    indent(body),
    '});',
    '',
  ].join('\n');
}

async function generate(scenarioPath: string) {
  const { data } = readScenario(scenarioPath);
  const { product, journey, pages } = data;
  const { scenarioId, testCasePath } = testCasePathFor(scenarioPath);

  if (!existsSync(testCasePath)) {
    console.error(`[generator] no test case found at ${testCasePath}. Run "draft" first.`);
    process.exit(1);
  }
  const { data: tcData, content: tcContent } = matter(readFileSync(testCasePath, 'utf-8'));
  const approved = tcData.approved === true || /- \[[xX]\]\s*Approved/.test(tcContent);
  if (!approved) {
    console.error(`[generator] ${testCasePath} is not approved yet — check its sign-off box or set approved: true.`);
    process.exit(1);
  }

  const specPath = join(process.cwd(), 'tests', 'regression', `${scenarioId}.spec.ts`);
  if (existsSync(specPath)) {
    console.error(
      `[generator] ${specPath} already exists. Generated specs are human-owned once ` +
        'written — edit it directly, or delete it first if you want to regenerate.',
    );
    process.exit(1);
  }

  const knowledgePages = resolvePages(product, pages); // fresh lookup — flags drift since draft time
  const byPage = new Map(knowledgePages.map((kp) => [kp.entry.page, kp]));

  const elementCatalog = knowledgePages
    .map(
      (kp) =>
        `Page "${kp.entry.page}": ${
          kp.selectors.length ? kp.selectors.map((s) => `"${s.element}"`).join(', ') : '(no selectors documented yet)'
        }`,
    )
    .join('\n');

  let capturedSteps: GeneratedStep[] | null = null;
  let capturedTitle = scenarioId;

  const submitTool = tool(
    'submit_generated_steps',
    'Submit the structured steps to translate into a Playwright spec. Every `element` ' +
      'must exactly match one of the element names given to you for that page — never ' +
      'invent or paraphrase one. If something the scenario needs has no matching ' +
      'element, use action "custom" and describe it instead of guessing.',
    {
      testCaseTitle: z.string(),
      steps: z.array(
        z.object({
          page: z.enum(pages as [string, ...string[]]),
          action: z.enum(ACTIONS),
          element: z.string().optional(),
          value: z
            .string()
            .optional()
            .describe('literal value, or a {{applicant.firstName}} / {{policyRef.policyNumber}} placeholder'),
          expected: z.string().optional(),
          description: z.string(),
        }),
      ),
    },
    async ({ testCaseTitle, steps }) => {
      const errors: string[] = [];
      for (const step of steps as GeneratedStep[]) {
        if (!ELEMENT_REQUIRED_ACTIONS.includes(step.action)) continue;
        const kp = byPage.get(step.page);
        if (!step.element) {
          errors.push(`step "${step.description}": action "${step.action}" requires an element name.`);
        } else if (!kp || !findSelector(kp, step.element)) {
          errors.push(
            `step "${step.description}": element "${step.element}" is not in the Selectors ` +
              `table of ${kp ? relative(process.cwd(), kp.absPath) : `${product}/knowledge/pages/${step.page}.md`}. ` +
              'Add it there (explorer agent or by hand) before this can be generated.',
          );
        }
      }
      if (errors.length) {
        return {
          content: [{ type: 'text' as const, text: `REJECTED — fix and resubmit:\n${errors.join('\n')}` }],
          isError: true,
        };
      }
      capturedSteps = steps as GeneratedStep[];
      capturedTitle = testCaseTitle;
      return { content: [{ type: 'text' as const, text: `accepted ${steps.length} steps` }] };
    },
  );

  const server = createSdkMcpServer({ name: 'spec', version: '1.0.0', tools: [submitTool] });

  const prompt = [
    `Approved test case for ${scenarioId}:`,
    '',
    tcContent.trim(),
    '',
    'Element names available per page (use ONLY these — nothing else):',
    '',
    elementCatalog,
    '',
    'Call submit_generated_steps exactly once, translating the approved test case into',
    'structured steps in execution order.',
  ].join('\n');

  for await (const message of query({
    prompt,
    options: {
      systemPrompt:
        'You translate an approved, human-readable test case into structured ' +
        'Playwright steps. You never invent a selector or element — every element ' +
        'you reference must be one you were explicitly given for that page.',
      mcpServers: { spec: server },
      allowedTools: ['mcp__spec__submit_generated_steps'],
      permissionMode: 'default',
    },
  })) {
    if (message.type === 'assistant') {
      for (const block of message.message.content) {
        if (block.type === 'text') console.log(`[generator] ${block.text}`);
      }
    }
  }

  if (!capturedSteps) {
    console.error('[generator] no valid step list was produced — see the rejection above. Nothing was written.');
    process.exit(1);
  }
  const steps: GeneratedStep[] = capturedSteps;

  for (const pageName of pages) {
    const kp = byPage.get(pageName) as KnowledgePage;
    const pagePath = join(process.cwd(), 'framework', 'pages', product, `${toPascalCase(pageName)}Page.ts`);
    const stepsForPage = steps.filter((s) => s.page === pageName);
    const elementNames = [...new Set(stepsForPage.filter((s) => s.element).map((s) => s.element as string))];
    const elementsUsed = elementNames.map((name) => findSelector(kp, name)!) as KnowledgeSelector[];
    const methodsNeeded = [
      ...new Map(
        stepsForPage
          .filter((s) => METHOD_ACTIONS.includes(s.action) && s.element)
          .map((s) => [`${s.action}:${s.element}`, { name: methodNameFor(s.action, s.element!), kind: s.action, element: s.element! }]),
      ).values(),
    ];
    if (!elementsUsed.length && !methodsNeeded.length) continue;

    if (existsSync(pagePath)) {
      const existingSrc = readFileSync(pagePath, 'utf-8');
      const missingLocators = elementNames.filter((name) => !existingSrc.includes(toCamelCase(name)));
      const missingMethods = methodsNeeded.filter((m) => !existingSrc.includes(`${m.name}(`));
      if (missingLocators.length || missingMethods.length) {
        console.error(`[generator] ${pagePath} exists but is missing what this scenario needs:`);
        missingLocators.forEach((l) => console.error(`  - a locator for "${l}"`));
        missingMethods.forEach((m) => console.error(`  - a ${m.name}() method`));
        console.error('[generator] Page Objects are human-owned once created — add these by hand, then re-run generate.');
        process.exit(1);
      }
    } else {
      try {
        mkdirSync(dirname(pagePath), { recursive: true });
        writeFileSync(pagePath, renderPageObjectFile(product, pageName, elementsUsed, methodsNeeded, kp.url));
        console.log(`[generator] created ${pagePath}`);
      } catch (err) {
        console.error(`[generator] could not write ${pagePath}: ${(err as Error).message}`);
        process.exit(1);
      }
    }
  }

  const specContent = renderSpecFile({ scenarioId, product, journey, pages, steps, testCaseTitle: capturedTitle });
  try {
    mkdirSync(dirname(specPath), { recursive: true });
    writeFileSync(specPath, specContent);
  } catch (err) {
    console.error(
      `[generator] could not write ${specPath}: ${(err as Error).message}\n` +
        '[generator] if this is a permissions error, fix ownership of /tests and re-run.',
    );
    process.exit(1);
  }
  console.log(`[generator] wrote ${specPath}`);

  writeFileSync(
    testCasePath,
    matter.stringify(tcContent, {
      ...tcData,
      generated: true,
      generated_spec: relative(process.cwd(), specPath),
      generated_at: todayISO(),
    }),
  );
  console.log(`[generator] marked ${testCasePath} as generated. Open a PR for the new/updated files under /framework and /tests.`);
}

// ---------------------------------------------------------------------------

async function main() {
  const [cmd, scenarioPathArg] = process.argv.slice(2);
  if (!cmd || !scenarioPathArg || !['draft', 'generate'].includes(cmd)) {
    console.error('Usage:');
    console.error('  npx tsx agents/generator-agent.ts draft    scenarios/<product>/<scenario>.md');
    console.error('  npx tsx agents/generator-agent.ts generate scenarios/<product>/<scenario>.md');
    process.exit(1);
  }
  const scenarioPath = resolve(process.cwd(), scenarioPathArg);
  if (!existsSync(scenarioPath)) {
    console.error(`[generator] no such file: ${scenarioPath}`);
    process.exit(1);
  }
  if (cmd === 'draft') await draft(scenarioPath, scenarioPathArg);
  else await generate(scenarioPath);
}

main().catch((err) => {
  console.error('[generator] failed:', err);
  process.exit(1);
});
