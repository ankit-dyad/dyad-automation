# App: Alis Core

## Environments

| Env | Base URL var | Notes |
|---|---|---|
| Prod (Dyad Tech) | `ALIS_CORE_BASE_URL` | `https://prod-alis-4-1-21.dyadtech.com/ALIS.BMS/APP/` — confirmed by direct observation 2026-09-18. Despite the hostname, this is the environment used for QA/automation against Dyad Tech DC data (AGT003 / Entity "Dyad Tech DC"), so it is treated as this product's primary target environment, not a live customer environment to avoid. |

Set the active environment's base URL via `ALIS_CORE_BASE_URL` (must include the
trailing slash, e.g. `https://prod-alis-4-1-21.dyadtech.com/ALIS.BMS/APP/`, so a
Page Object's hash-only `path` — e.g. `#/login` — resolves to the correct URL).
Never hardcode a URL in a Page Object, fixture, or spec.

The **Accounting** module is a separate sub-app at a different base path —
`https://prod-alis-4-1-21.dyadtech.com/ALIS.Accounting/APP/` (also trailing-
slash) — set via its own `ALIS_CORE_ACCOUNTING_BASE_URL`. It shares the BMS
app's authenticated session (confirmed 2026-09-18: no second login is
required), but `PLAYWRIGHT_BASE_URL`/`ALIS_CORE_BASE_URL` cannot resolve its
pages, since hash-only paths would resolve against the BMS base path instead.
Any Page Object under the Accounting module overrides `goto()` to resolve
against `ALIS_CORE_ACCOUNTING_BASE_URL` explicitly — see
`alis_core/tests/payment_upload/paymentUpload.page.ts` for the pattern.

App version (footer, confirmed 2026-09-18): 4.1.21.5 (released 09/03/2026).

## Credentials

Referenced by environment variable name only — never written here as literal
values.

| Role | Username var | Password var |
|---|---|---|
| Standard agent (AGT003) | `ALIS_CORE_LOGIN_USER` | `ALIS_CORE_LOGIN_PASS` |

No literal credential value has been captured for this product — set these two
env vars locally/in CI before running `alis_core` specs. (Contrast with
`alis/knowledge/data.json`, which stores a plaintext UAT credential as a
pre-existing, flagged convention violation; `alis_core/knowledge/data.json`
deliberately does not repeat that.)

## Login flow

1. Navigate to `${ALIS_CORE_BASE_URL}#/login` (confirmed by direct observation
   2026-09-18 — see `pages/login.md`).
2. Fill `#txtUserName` with `process.env.ALIS_CORE_LOGIN_USER`.
3. Fill `#txtPassword` with `process.env.ALIS_CORE_LOGIN_PASS`.
4. Click `button[type=submit]:has-text("Log In")`.
5. Wait for navigation off `#/login` (landing route not yet confirmed for this
   environment/user — see `pages/login.md` Open Items).

The shared login helper lives in `/framework/utils/auth.ts` (`loginAs()`).

## Primary navigation

- Accounting module → Bulk Payment Upload / Batch List / Invoice Application /
  Check Register / Check Summary / Print Check / Remittance Advice (the flow
  covered by the manual QA pass on this environment; not yet fully mapped as
  knowledge pages — see `alis_core/knowledge/registry.yaml`).
- Agency Admin → Bank Setup.
- (Further pages are populated incrementally, one knowledge file per page, as
  each feature's automation is written — see CLAUDE.md §2.)

## End-to-end composition test

`alis_core/tests/e2e_bulk_payment_upload_to_remittance/` composes every
already-automated page in the "Bulk Payment Upload to Remittance" journey
into one continuous session (one login, walking Payment Upload → Agency Bank
Setup → Payment Upload File Validation → Batch Transaction Detail → Invoice
Application → ACH/EFT & Check → Check Summary → Remittance Advice in order,
matching the PDF's own sub-scenario ordering) — the PDF's full narrative in a
single run, rather than only as separate per-feature specs. It deliberately
has no `locators.ts`/`page.ts` of its own (imports each step's existing Page
Object instead) — a narrow, intentional exception to CLAUDE.md §3's
three-file convention, documented in its own scenario file. Needs
`test.setTimeout()` raised to 240s — the default 30s is far too short for 9
chained steps, one of which (Agency Bank Setup) opens and drives a second
browser tab. Confirmed stable headed (2026-09-28), after extending it from
its original 7-step version to fold in Agency Bank Setup and Payment Upload
File Validation once both were automated.

## Known environment constraint: single shared test account

Every `alis_core` spec currently logs in as the same account (`qable1`,
credentials via `ALIS_CORE_LOGIN_USER`/`ALIS_CORE_LOGIN_PASS`). Confirmed
2026-09-21: running the full `alis_core` project with Playwright's default
parallelism (multiple workers, each logging in independently) intermittently
fails a spec's post-login `expect(page).not.toHaveURL(/#\/login/)` assertion —
the login form re-appears instead of navigating away. This reproduced with 4
tests running in parallel but not with fewer, and not when specs run serially
(`--workers=1`) or in isolation. The most likely explanation is that this
account/environment doesn't tolerate multiple concurrent sessions cleanly
(e.g. single-session enforcement invalidating a not-yet-settled login) — this
has not been root-caused further (would need server-side logs/behavior this
automation can't inspect), and is an environment/account characteristic, not
a defect in any spec's own logic.

**Until a second credentialed test account (or a shared-login/storageState
pattern) is set up**, run `alis_core` with reduced parallelism when running
the full project, e.g. `npx playwright test --project=alis_core --workers=2`
(or `--workers=1` for guaranteed stability) — a single spec run in isolation
is unaffected either way.

## Status

In progress. `login` page/feature documented and automated 2026-09-18, sourced
from direct observation against `https://prod-alis-4-1-21.dyadtech.com`
(read-only accessibility-tree + DOM inspection, no credentials entered).
Payment Upload (Upload tab batch header), Check Register (search/filter), the
Batch Transaction Detail popup, Invoice Application (voucher filters), the
ACH/EFT & Check tab (grid + Batch No search), the Check Summary popup,
Payment Upload File Selection & Validation (Valid/Invalid Invoice split), and
Remittance Advice (PDF download) are now documented and automated
(2026-09-21) — see `alis_core/knowledge/registry.yaml` for the full page
list. That completes every PDF sub-scenario in the "Bulk Payment Upload to
Remittance" flow that this automation's tooling can reach.

**Agency Bank Setup is now documented and automated** (2026-09-28) — see
`alis_core/knowledge/pages/agency-bank-setup.md` and
`alis_core/tests/agency_bank_setup/`. It's reached via a genuinely new
browser tab/window (the BMS module switcher's "Admin" item), which turned out
to be a hard blocker only for this repo's *interactive exploration* tooling
(which treats any new-tab open as requiring a real human click) — **not** for
committed Playwright test code, which captures it fine with
`context().waitForEvent('page')` around a real click. The page itself turned
out to be a completely separate classic ASP.NET WebForms application
(`/ALIS/admin/index.aspx` and friends), a third distinct base path/tech stack
from the BMS/Accounting Angular SPAs — see the knowledge file for its several
own quirks (misspelled/mismatched field ids, `waitForLoadState()` never
resolving due to continuous background polling, needing an explicit
dropdown-open wait before racing the popup capture).

**Print Check** remains blocked the same way Agency Bank Setup used to be,
but hasn't been re-attempted with the "capture the real popup in committed
test code" approach yet — confirmed the trigger button (`#btnPrint`) and its
read-only network calls (`GetNextCheck`,
`NavigateToClientApplication?ApplicationName=PrintCheck`), but the popup's
actual fields/behavior are unconfirmed; see
`alis_core/knowledge/pages/print-check.md`. Worth revisiting with the same
`context().waitForEvent('page')` pattern.

The Valid Invoice → Save Payment write path also remains unexercised — no
file producing actual Valid rows has been available on this environment yet
(see `payment-upload-file-validation.md`'s Edge Cases).
