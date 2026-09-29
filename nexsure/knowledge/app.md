# App: Nexsure

## Environments

| Env | Base URL var | Notes |
|---|---|---|
| QA | `NEXSURE_QA_BASE_URL` | |
| Staging | `NEXSURE_STAGING_BASE_URL` | |

Set the active environment's base URL via `NEXSURE_BASE_URL` (or export the specific
`NEXSURE_<ENV>_BASE_URL` and point `NEXSURE_BASE_URL` at it in your shell/CI env). Never
hardcode a URL in a Page Object, fixture, or spec.

## Credentials

Referenced by environment variable name only — never written here as literal values.

| Role | Username var | Password var |
|---|---|---|
| Standard agent | `NEXSURE_LOGIN_USER` | `NEXSURE_LOGIN_PASS` |

## Login flow

1. Navigate to `${NEXSURE_BASE_URL}/login` (confirm exact path in
   `pages/login.md` once explored).
2. Fill username field with `process.env.NEXSURE_LOGIN_USER`.
3. Fill password field with `process.env.NEXSURE_LOGIN_PASS`.
4. Submit and wait for the post-login landing page (see `pages/dashboard.md`).

The shared login helper lives in `/framework/utils/auth.ts` — Page Objects and specs
call that helper rather than re-implementing the flow.

## Primary navigation (for the explorer agent)

- (agent fills this in on first crawl — top-level nav items it found, one per line)

## Status

This file is a scaffold. Run `agents/explorer-agent.ts` against a real Nexsure
environment to populate environments, confirm the login flow, and discover primary
navigation and pages under `pages/`.
