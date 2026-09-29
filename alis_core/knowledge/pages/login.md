---
reviewed: false
last_verified: 2026-09-18
---

# Page: Login

## URL

`https://prod-alis-4-1-21.dyadtech.com/ALIS.BMS/APP/#/login` (Prod / Dyad Tech —
this is the environment used for QA/automation against AGT003 / "Dyad Tech DC"
test data). Angular SPA, hash-based routing — the Page Object's path is the
hash-only reference `#/login`, resolved against `ALIS_CORE_BASE_URL` which must
include the trailing slash (`https://prod-alis-4-1-21.dyadtech.com/ALIS.BMS/APP/`)
so the join lands on the URL above. App version (footer): 4.1.21.5 (released
09/03/2026).

Confirmed by direct observation 2026-09-18 via a read-only accessibility-tree and
DOM inspection of the unauthenticated login form (no credentials were entered).

## Selectors

| Element | Selector | Notes |
|---|---|---|
| User Name field | `#txtUserName` | input[type=text], placeholder "User Name"; same id as alis/UAT |
| Password field | `#txtPassword` | input[type=password], placeholder "Password"; same id as alis/UAT |
| Log In button | `button[type=submit]:has-text("Log In")` | no id; inside the login `<form>` |
| Forgot Password link | `a[href="#/forgotpassword"]` | text: "Forgot Password?" |
| Sign In with Microsoft link | `a:has-text("Sign In with Microsoft")` | `href="#"`; SSO option present on this environment — not observed on alis/UAT's login page; not yet exercised, not part of the standard-agent login flow this automation covers |

## Actions

- Enter a username into the User Name field.
- Enter a password into the Password field.
- Click "Log In" to submit the form.
- Click "Forgot Password?" to go to password recovery (not yet documented as its
  own page).
- Click "Sign In with Microsoft" to start SSO login (not yet documented — out of
  scope for the standard-agent flow this file covers).

## Expected Outcomes

- Valid credentials are expected to navigate off `#/login` — the exact landing
  route has not yet been confirmed for this environment with real
  `ALIS_CORE_LOGIN_USER`/`ALIS_CORE_LOGIN_PASS` credentials (see Edge Cases).
  Confirm and record it here, plus whether a post-login startup message popup
  appears (as it does on `alis/` UAT — see `alis/knowledge/pages/login.md`),
  before treating that assumption as verified for this product.
- Invalid credentials show a validation/error message — selector and exact text
  not yet captured.

## Edge Cases / Known Quirks

- Angular SPA with hash-based routing (`#/login`) — URL assertions must check the
  hash, not just the path.
- Credentials are `ALIS_CORE_LOGIN_USER` / `ALIS_CORE_LOGIN_PASS` — see
  `alis_core/knowledge/data.json`. Never hardcode the literal values in test
  source. No literal value has been captured for this product (unlike `alis/`'s
  flagged UAT exception) — these must be set in the environment before running
  `alis_core` specs.
- This login form is structurally identical to `alis/`'s (same `#txtUserName` /
  `#txtPassword` ids, same submit button), plus an extra "Sign In with Microsoft"
  SSO link not present on `alis/` UAT. Whether a post-login startup message popup
  (present on `alis/` UAT after every login) also appears here is **not yet
  confirmed** — verify on the first real credentialed run against this
  environment and update this section rather than assuming parity with `alis/`.
- Only the unauthenticated login form was inspected to build this file (read-only
  accessibility-tree/DOM read, no credentials submitted) — per conventions.md's
  "no selector may be invented" rule, selectors here are taken directly from the
  live DOM, but the post-login behavior section above is explicitly left
  unconfirmed rather than copied from `alis/`'s UAT behavior.

## Auto-discovered (needs review)
- (agent appends here; engineer reviews and folds into sections above)
