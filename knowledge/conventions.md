# Conventions

These conventions are binding for every knowledge file, Page Object, and spec in this
repository. The explorer and generator agents are instructed to follow them; reviewers
should reject anything that doesn't.

## Locator strategy (in priority order)

1. `data-testid` — `page.getByTestId('...')`. Preferred whenever the app exposes one.
2. Role + accessible name — `page.getByRole('button', { name: '...' })`.
3. Label / placeholder / text — `page.getByLabel(...)`, `page.getByPlaceholder(...)`,
   `page.getByText(...)`.
4. CSS/XPath — last resort only, and only when 1–3 are genuinely unavailable. Must be
   flagged with a `<!-- fragile -->` note in the knowledge file so triage knows it's a
   likely locator-drift source.

Never use auto-generated/non-semantic classes (e.g. `.css-1x2y3z`) or absolute XPath.

## Wait strategy

- Rely on Playwright's built-in auto-waiting (actionability checks) — do not add
  arbitrary `waitForTimeout`.
- For network-dependent state, wait on an explicit signal: `page.waitForResponse(...)`,
  `page.waitForURL(...)`, or a `toBeVisible()`/`toHaveText()` assertion with the default
  timeout.
- Shared wait helpers live in `/framework/utils/waits.ts`. Add to that file instead of
  inlining a bespoke wait in a Page Object.

## Assertion style

- Use `expect` (web-first assertions) — `toBeVisible`, `toHaveText`, `toHaveURL`, etc.
  Avoid manual `if`/`throw` assertions.
- One logical outcome per `expect` call; prefer several specific assertions over one
  broad one.
- Assertions belong in the spec, not in the Page Object. Page Objects expose state
  (locators, getters) and actions; they don't assert.

## Page Object rules

- One class per page/major component, under `/framework/pages/<product>/`.
- Constructor takes `page: Page` and defines locators as readonly properties, built
  only from selectors listed in the corresponding `<product>/knowledge/pages/*.md`
  file. No selector may be invented — if a knowledge file doesn't have it, the file
  needs to be completed first (explorer agent or a human).
- Methods are actions (`login()`, `startNewQuote()`) or state getters
  (`isSubmitButtonEnabled()`), named after what the user does/sees — not after DOM
  structure.
- No test data, no environment URLs, no assertions inside a Page Object.

## Knowledge file rules

- One file per page, per product, using the template in `<product>/knowledge/pages/`.
- Never commit credentials, tokens, or secrets — reference the environment variable
  name only (e.g. `NEXSURE_LOGIN_USER`).
- A file is "human-reviewed" once its front matter has `reviewed: true`. Agents may
  only append to the "Auto-discovered (needs review)" section of a reviewed file —
  every other section is human-owned from that point on.
- `registry.yaml` is the single index. No fuzzy search, no embeddings — generator and
  explorer agents resolve knowledge files via direct path lookup in the registry.

## Test data

- No hardcoded policy numbers, customer IDs, claim numbers, or other environment-
  specific values in test files. Use the factories in `/framework/fixtures/`.

## Test IDs / traceability

- Every generated spec's top-level `test.describe` (or file-level annotation) carries
  the originating scenario ID (e.g. `scenario-01-new-business-quote`) so results can be
  mapped back to the scenario in reporting.
