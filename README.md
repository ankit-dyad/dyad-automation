# Dyad Automation

AI-assisted Playwright automation for Dyad Tech's insurance platforms — **Nexsure**,
**Alis Core**, **Alis Custom**. Built to scale from a handful of scenarios to
thousands without a redesign: markdown knowledge in, plain TypeScript Playwright
tests out, one deterministic index (`registry.yaml`) in between. No vector search, no
embeddings, no RAG — every lookup is a direct path resolution.

## Layout

Product-first — see [`CLAUDE.md`](CLAUDE.md) for the full rules:

```
/alis/                     everything specific to Alis
  knowledge/                 what the app looks like — per-page markdown + data.json. Reviewed like docs.
  scenarios/                 what to test — short markdown outlines with product/journey/pages front matter.
  tests/<feature>/            *.locators.ts + *.page.ts + *.test.ts per feature. Reviewed like code.
/nexsure/                  same shape as alis/, for Nexsure
/framework                 Page Objects base, fixtures, shared utils — common across every product.
/knowledge                 cross-product only: conventions.md, page-template.md.
/agents                    explorer, generator, triage — the only things that write to a product's
                            knowledge/ and scenarios/ directly, and (via review) to framework/ and tests/.
/reports                   execution artifacts — gitignored, published as CI artifacts.
```

> **`/agents/generator-agent.ts` is out of sync with this layout.** It still emits a
> single-file spec into a `/tests/regression/` folder and a Page Object into
> `/framework/pages/<product>/`, not the three-file `<product>/tests/<feature>/`
> shape above. Hasn't been updated to match yet.

See [`knowledge/conventions.md`](knowledge/conventions.md) for locator strategy, wait
strategy, assertion style, and Page Object rules that apply everywhere in this repo,
[`CLAUDE.md`](CLAUDE.md) for the current folder-structure rules, and
[`agents/README.md`](agents/README.md) for how each agent works.

## Rule of thumb

A product's `knowledge/` and `scenarios/` are markdown, reviewed like docs.
`/framework` and a product's `tests/` are code, reviewed like code. Agents only ever
write to the first two categories directly — anything landing in `/framework` or a
product's `tests/` goes through a PR, same as a human's change would. Nothing is
ever silently merged.

## Setup

```bash
npm install
npx playwright install --with-deps
```

Every credential and base URL is read from an environment variable — never
hardcoded. See each product's `<product>/knowledge/app.md` for the exact variable
names (e.g. `NEXSURE_LOGIN_USER`, `NEXSURE_LOGIN_PASS`, `NEXSURE_BASE_URL`). Set
`ANTHROPIC_API_KEY` to run any of the `/agents` scripts.

## Running tests

Each product is its own Playwright project — see `CLAUDE.md` §1/§3 for the
`<product>/tests/<feature>/{*.locators,*.page,*.test}.ts` layout.

```bash
PLAYWRIGHT_BASE_URL="$ALIS_UAT_BASE_URL" npm run test:alis
PLAYWRIGHT_BASE_URL="$NEXSURE_BASE_URL" npm run test:nexsure
npm run test:smoke                                            # every @smoke-tagged test, any product
SHARD_INDEX=1 SHARD_TOTAL=4 npm run test:shard                # one shard of many, for CI
npm run report                                                # open the last HTML report
```

`PLAYWRIGHT_BASE_URL` is what Page Objects' relative paths resolve against — point it
at whichever product's base URL this run targets.

Plain Playwright — no AI calls happen here, and nothing under `/tests` depends on
`/agents` at runtime.

## Building out the knowledge base and tests

1. **Explore** a product to populate its knowledge base from the live app:
   ```bash
   npm run explore -- --product nexsure --start-url "$NEXSURE_BASE_URL"
   ```
2. **Write a scenario** under `/scenarios/<product>/` (see
   [`scenarios/nexsure/scenario-01-new-business-quote.md`](scenarios/nexsure/scenario-01-new-business-quote.md)
   for the shape).
3. **Draft a test case** from it:
   ```bash
   npm run generate:draft -- scenarios/nexsure/scenario-01-new-business-quote.md
   ```
   Review the generated `*.testcase.md`, check its sign-off box (or set
   `approved: true`).
4. **Generate the spec**:
   ```bash
   npm run generate:spec -- scenarios/nexsure/scenario-01-new-business-quote.md
   ```
   This creates/extends Page Objects under `/framework/pages/<product>/` and writes
   `/tests/regression/<scenario-id>.spec.ts`. Review it like any other PR.
5. **Triage failures** after a run:
   ```bash
   npm run triage -- --results reports/results.json
   ```

## Status

This repository is scaffolded and ready to run against a real Nexsure/Alis
environment — `/knowledge` and `/framework/pages` are currently placeholders (see the
`## Status` note in each product's `app.md`) until the explorer agent is run against
a live environment.
