# Fixtures

`factories.ts` generates unique, self-contained test data per run (applicants,
policy references, claim references) — no test may hardcode a policy number,
customer ID, or claim number. `index.ts` extends Playwright's base `test` with a
`testData` fixture that wraps those factories and releases whatever was created once
the test finishes.

Import `test`/`expect` from `framework/fixtures` in every spec, not from
`@playwright/test` directly:

```ts
import { test, expect } from '../../framework/fixtures';

test('...', async ({ page, testData }) => {
  const applicant = testData.applicant();
  // ...
});
```

If a product later needs test data checked out from a real system (an existing
policy that must already exist, say), extend the relevant factory in
`factories.ts` to call that system instead of generating synthetic data — callers
don't need to change.
