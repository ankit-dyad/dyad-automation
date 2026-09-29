# Agents

Three scripts, each built on the Claude Agent SDK (`@anthropic-ai/claude-agent-sdk`).
None of them run as part of `npm test` — they're invoked explicitly, and their output
is reviewed like any other change (markdown PRs for `/knowledge` and `/scenarios`,
code PRs for `/framework` and `/tests`).

| Agent | Reads | Writes | Never |
|---|---|---|---|
| `explorer-agent.ts` | live app (via Playwright MCP) | `<product>/knowledge/**` | touch `/framework`, `/tests`, or a human-reviewed section |
| `generator-agent.ts` | `/scenarios`, `/knowledge` (via `registry.yaml`) | `<scenario>.testcase.md`, then `/framework/pages/<product>/**`, `/tests/regression/**` | invent a selector, overwrite an existing Page Object/spec, generate before sign-off |
| `triage-agent.ts` | a Playwright JSON report (failed/flaky tests) | `/reports/issues/**`, a PR branch for locator-drift fixes | auto-merge anything |

## explorer-agent.ts

```
npx tsx agents/explorer-agent.ts --product nexsure [--start-url <url>] [--max-pages 10] [--headed]
```

Logs in itself (via `playwright`, reading `NEXSURE_LOGIN_USER`/`NEXSURE_LOGIN_PASS`
etc. — the model never sees the credential values), then hands an already-
authenticated browser to the model over the Playwright MCP server so it can walk the
primary navigation and document what it finds. Two custom tools
(`write_page_knowledge`, `upsert_registry_entry`) are the only way it can touch
`/knowledge`, and they enforce in code — not just by prompting — that a page file
marked `reviewed: true` only ever gets appended to under "Auto-discovered (needs
review)".

## generator-agent.ts

```
npx tsx agents/generator-agent.ts draft    scenarios/nexsure/scenario-01-new-business-quote.md
# ... a human reviews and checks the sign-off box in the .testcase.md file ...
npx tsx agents/generator-agent.ts generate scenarios/nexsure/scenario-01-new-business-quote.md
```

`draft` resolves the scenario's `pages` through `registry.yaml` (direct path lookup
only) and asks the model for a numbered, human-readable test case. `generate`
requires that file to be approved, then asks the model for a *structured* step list —
every referenced element name is validated in code against the knowledge file's
Selectors table before anything is written. An unrecognized element stops generation
and names the exact knowledge file to complete; it is never guessed. Page Objects are
created only if missing (existing ones are never overwritten — missing pieces are
flagged for a human to add) and the spec is written to `/tests/regression/`, tagged
with the scenario ID for traceability.

## triage-agent.ts

```
npx tsx agents/triage-agent.ts --results reports/results.json [--dry-run]
```

Run this after a CI run, not as part of it. Flaky tests are detected from
Playwright's own retry outcome (more reliable than asking a model to guess). Genuine
failures are classified by the model into `locator-drift`, `timing`, `test-data`, or
`likely-app-defect`. Only `locator-drift` gets a code change — applied on a fresh
branch and opened as a PR (never merged) that links the failing trace/screenshot and
is explicitly labeled as unverified against the live app. Everything else becomes a
structured markdown issue under `/reports/issues/` (plus a best-effort `gh issue
create` when the CLI is available).
