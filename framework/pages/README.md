# Page Objects

Page Object classes live under `pages/<product>/`, one class per page (or major
reusable component). They are AI-drafted by `agents/generator-agent.ts` the first time
a scenario needs a page that doesn't have one yet, and are **human-owned** from that
point on — treat generated Page Objects as a starting draft to review in the PR, not
as generated code to regenerate over.

Rules (full detail in `/knowledge/conventions.md`):

- Every locator must come from the corresponding
  `<product>/knowledge/pages/<page>.md` file. No selector is ever invented — if the
  knowledge file is missing something a Page Object needs, that's a knowledge-file gap
  to fill first, not something to guess at in code.
- Methods are actions (`login()`, `startNewQuote()`) or state getters
  (`isSubmitEnabled()`) — no assertions inside a Page Object.
- No hardcoded URLs or credentials — see `/framework/utils/env.ts` and
  `/framework/utils/auth.ts`.
- Extend `BasePage` (`../BasePage.ts`) for the shared `page`/`goto()` plumbing, or
  implement the same shape by hand.
