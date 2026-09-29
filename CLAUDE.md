# Framework Rules

This is the single rule file for this framework — the folder structure and
conventions every future change (by a human, by Claude, or by `/agents`) must
follow. It's being built incrementally: sections below are confirmed; anything
marked `(TBD)` is still open and will be filled in as more direction is given.
Don't restructure code against these rules without flagging the conflict first.

## 1. Product-first folder structure

Each product gets its own top-level folder, named after the product
(`alis/`, `nexsure/`, and any product added later). Everything specific to that
product — its knowledge base, its scenarios, and its tests — lives under that
folder. Do not put product-specific knowledge, scenarios, or tests under a shared
top-level `/knowledge`, `/scenarios`, or `/tests` — that was the original layout
and is now superseded by this one.

```
/alis/
  knowledge/             Alis's app knowledge base (see §2)
  scenarios/              human-readable scenario outlines for Alis
  tests/                  Alis tests, one folder per feature/scenario (see §3)
/nexsure/
  knowledge/
  scenarios/
  tests/
```

- Alis knowledge in `alis/knowledge/`, scenarios in `alis/scenarios/`, tests in
  `alis/tests/`.
- Nexsure knowledge in `nexsure/knowledge/`, scenarios in `nexsure/scenarios/`,
  tests in `nexsure/tests/`.
- A new product follows the same three-folder shape under its own top-level name.

## 2. Knowledge base moved into each product's own folder

`<product>/knowledge/` is that product's app knowledge base (`alis/knowledge/`,
`nexsure/knowledge/`) — moved out of a shared top-level `/knowledge/<product>/` to
live alongside that product's `scenarios/` and `tests/`, per §1. It's still the one
place that product's pages, selectors, and app data are documented, and still the
thing `registry.yaml` indexes — only its location changed.

The top-level `/knowledge/` folder still exists, but now holds only what's genuinely
shared across every product: [`knowledge/conventions.md`](knowledge/conventions.md)
(locator strategy, wait strategy, assertion style — still applies everywhere) and
[`knowledge/page-template.md`](knowledge/page-template.md) (the canonical template
to copy into `<product>/knowledge/pages/<page>.md`). This file takes precedence
over conventions.md's original (now superseded) folder-structure section.

## 3. Tests are organized feature-by-feature, three files per feature

Inside `<product>/tests/`, each automated scenario/feature gets its own folder,
named after the feature, containing exactly three files:

```
alis/tests/login/
  login.locators.ts     # locator definitions only — nothing else
  login.page.ts          # the Page Object — imports the locators file, exposes actions
  login.test.ts           # the Playwright spec — imports the page object, has the assertions
```

- **`*.locators.ts`**: locator definitions only (selectors sourced from the
  matching `<product>/knowledge/pages/<page>.md` file — never invented). No
  actions, no assertions.
- **`*.page.ts`**: the Page Object class. Imports its locators file, extends the
  common base from `/framework` (§4), and exposes actions/state getters named
  after user-visible behavior. No assertions, no test data, no hardcoded URLs.
- **`*.test.ts`**: the spec. Imports the page object, drives it, and holds the
  `expect(...)` assertions. No raw locators here — go through the page object.

Same shape for Nexsure under `nexsure/tests/<feature>/`.

## 4. `/framework` holds only what's common across products

`/framework` is shared code — the common Page Object Model base that both Alis and
Nexsure page objects build on. If a method is generic enough to be useful for both
products (click an element, enter/fill text, select an option, wait for an
element, etc.), it belongs here, once, not duplicated per product.

- Common, reusable actions (click, enter/fill, select, check, wait-for-visible,
  etc.) live on the shared base Page Object in `/framework` — every product's
  `*.page.ts` extends this base and gets them for free instead of re-implementing
  them.
- Only truly product-specific behavior lives in a product's own `*.page.ts`.
- Shared non-POM utilities (env var handling, auth, reporting) also live under
  `/framework` — see `framework/utils/`.

## 5. Test data lives with the knowledge base, organized per product

Test data is organized folder-wise per product, under `<product>/knowledge/`
(e.g. `<product>/knowledge/data.json`) — the knowledge folder is the source for
what data a product's tests need, not something duplicated separately per test
folder. `(TBD: exact shape/splitting of test data per feature, if any, beyond the
per-product data.json — to be refined as more scenarios are added.)`

Synthetic/generated-per-run data (unique applicant names, policy numbers, etc.,
so parallel test runs never collide) still comes from the factory pattern in
`/framework/fixtures/` — that's a different concern from the reference/config data
in `<product>/knowledge/data.json` and both are used together, not one replacing
the other.

## 6. Reporting

Test runs must produce proper, traceable reporting — not just pass/fail. This
repo's reporting stack (Playwright HTML report + JSON report + the scenario-
traceability reporter in `framework/utils/reporting.ts`, wired in
`playwright.config.ts`) is what "proper reporting" means here: every result maps
back to the scenario it came from. Any new test folder structure (§3) must keep
each test's `scenario`/`product` annotation intact so this mapping keeps working.

## Open items

- `(TBD)` exact test-data folder shape per feature, if any.
- More sections to be added as further direction is given.
