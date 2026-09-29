# App: Alis Core

## Environments

| Env | Base URL var | Notes |
|---|---|---|
| QA | `ALIS_CORE_QA_BASE_URL` | |
| Staging | `ALIS_CORE_STAGING_BASE_URL` | |

Set the active environment's base URL via `ALIS_CORE_BASE_URL`. Never hardcode a URL in
a Page Object, fixture, or spec.

## Credentials

Referenced by environment variable name only — never written here as literal values.

| Role | Username var | Password var |
|---|---|---|
| Standard agent | `ALIS_CORE_LOGIN_USER` | `ALIS_CORE_LOGIN_PASS` |

## Login flow

1. Navigate to `${ALIS_CORE_BASE_URL}/login` (confirm exact path in
   `pages/login.md` once explored).
2. Fill username field with `process.env.ALIS_CORE_LOGIN_USER`.
3. Fill password field with `process.env.ALIS_CORE_LOGIN_PASS`.
4. Submit and wait for the post-login landing page.

The shared login helper lives in `/framework/utils/auth.ts`.

## Primary navigation (for the explorer agent)

- (agent fills this in on first crawl)

## Status

Scaffold only. No exploration run yet for this product.
