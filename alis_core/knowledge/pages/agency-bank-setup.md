# Agency Admin — Bank Information

## Overview

The Agency record's **Bank Information** tab in the ALIS **Admin Manager** —
a separate, older ASP.NET WebForms application from the Angular BMS/Accounting
SPAs documented elsewhere in this product. Lists an agency's bank accounts
(Direct Bill, Agency Bill Refund) with their account/routing details, and lets
a user add a new one. Confirmed by direct observation 2026-09-28, logged in
as `qable1`, via Claude in Chrome (the BMS app's "Admin" module switcher entry
opens this in a new browser tab/window — see "Reaching this page").

Matches the PDF test scenario "Agency Admin - Bank Setup".

## URL

The Admin Manager lives at a **third, distinct base path** from the other two
sub-apps in this product:
- BMS: `https://prod-alis-4-1-21.dyadtech.com/ALIS.BMS/APP/`
- Accounting: `https://prod-alis-4-1-21.dyadtech.com/ALIS.Accounting/APP/`
- **Admin Manager**: `https://prod-alis-4-1-21.dyadtech.com/ALIS/admin/index.aspx`
  (note: no `.APP` in the path, and it's `/ALIS/` not `/ALIS.BMS/` — a
  genuinely different IIS application, not just another Angular route)

The Agency edit screen itself is reached at
`https://prod-alis-4-1-21.dyadtech.com/ALIS/InsuranceBusinessManager/Admin/Agency.aspx?data=<token>`.
The `data` query param is an **encrypted, seemingly-static identifier** for
"the Agency admin page" itself (confirmed: two independent browser sessions —
a user's own Chrome and a separate Claude-in-Chrome session, both logged in
as `qable1` — produced the exact same token value for this same sidebar
link). It is **not** a per-agency or per-click nonce; picking a specific
agency happens via the Listing tab's search/grid *after* landing here, not
via this URL. Automation should still reach it by clicking through (see
below) rather than hardcoding this token, since it's unconfirmed whether it's
truly permanent or just stable within this observation window.

## Reaching this page

1. Log in via the BMS login page (`login.md`).
2. Open the module switcher (top-right, shows "Business Manager" by default)
   and click **Admin**. This opens the Admin Manager in a **new browser
   tab/window** — confirmed via `window.open()`-style JS (no `target`
   attribute on the triggering anchor). Automation must capture this with
   Playwright's `page.context().waitForEvent('page')` (or
   `context.waitForEvent('page')`) around the click, the same pattern used
   for any popup — this is *not* blocked for committed Playwright test code,
   only for interactive exploration tooling that treats new-tab opens as
   requiring a genuine human click (see `app.md`'s prior notes on this,
   now superseded for this page specifically).
3. On the new tab (Admin Manager, `/ALIS/admin/index.aspx`), click the top
   nav's **Business** menu, then **Agency** in the left sidebar.
4. On the Agency **Listing** tab, either search or just use the default
   (unfiltered) grid, then click a row's **Edit** icon. This opens that
   agency's **Details** tab.
5. Within Details, click the nested **Bank Information** tab.

## Selectors

| Element | Selector | Notes |
|---|---|---|
| Module switcher toggle | `.dropdown:has(a.dropdown-item:has-text("Admin")) [data-bs-toggle="dropdown"]` | **Must not** be matched by its current label text (e.g. `:has-text("Business Manager")`) — that label reflects whichever module is currently active, and reads "Accounting" once already on the Accounting sub-app. Confirmed broken this way in a composed multi-page flow where Payment Upload ran first. Scope by the "Admin" menu item's presence instead — `has:` only requires DOM presence, not visibility, so this matches even while the dropdown is closed |
| Admin menu item (BMS module switcher) | `page.getByText('Admin', { exact: true })` scoped to the module-switcher dropdown | No `id`/`href` — plain `<a class="dropdown-item mb-2">`, JS click handler. Triggers `window.open()` — capture with `context.waitForEvent('page')` |
| Business top-nav menu (Admin Manager) | `text=Business` (top nav bar) | Plain link, no id observed |
| Agency sidebar link | `text=Agency` (left sidebar, under Business) | Confirmed real `<a>` with a static `href` to `Agency.aspx?data=...` — see URL section |
| Listing tab | `#__tab_ctl01_ContentPlaceHolder2_tcAgencies_tbpnlListing` | ASP.NET AJAX TabContainer tab anchor |
| Details tab | `#__tab_ctl01_ContentPlaceHolder2_tcAgencies_tbpnlDetail` | Same pattern; becomes active automatically after clicking a row's Edit icon |
| Agency grid | `#ctl01_ContentPlaceHolder2_tcAgencies_tbpnlListing_gvAgencyData` | ASP.NET `GridView`; each row has its own auto-numbered id segment (`ctl02`, `ctl03`, ...) |
| Row Edit icon | `[id$="_imgEditAD"]` (scoped to the grid, `.first()` for the first row) | `<img>`, no native click semantics beyond a JS postback handler |
| Bank Information tab (nested, under Details) | `#__tab_ctl01_ContentPlaceHolder2_tcAgencies_tbpnlDetail_tcChildPanels_tpBankInformation` | Nested `TabContainer` inside the Details tab |
| Bank Information panel container | `#ctl01_ContentPlaceHolder2_tcAgencies_tbpnlDetail_tcChildPanels_tpBankInformation` | Scope all fields below to this container — the page has many other same-named-pattern fields on sibling tabs (e.g. Agency Status has its own `ddlStatus`) |
| Bank Account Type dropdown | `#..._tpBankInformation_ddlBankAccountType` | native `<select>`; options: Direct Bill (`DIRECTBILL`), Agency Bill Refund (`REFUND`) |
| Bank Number field | `#..._tpBankInformation_txtBankNumber` | text input |
| Minimum Payment Amount field | `#..._tpBankInformation_txtLimitAmount` | text input — note the id says "Limit", not "MinPayment"; don't assume id matches label text |
| Status dropdown | `#..._tpBankInformation_ddlBankStatus` | native `<select>`; options: Active (`1`), Inactive (`2`), Deleted (`3`) |
| Account Type radios | `#..._tpBankInformation_rdbtnlstAcctType_0` (Checking), `#..._tpBankInformation_rdbtnlstAcctType_1` (Saving) | native radio inputs |
| Account Number field | `#..._tpBankInformation_txtAccountNumber` | text input |
| Direct Deposit checkbox | `#..._tpBankInformation_chkDirectDeposite` | note the id's misspelling ("Deposite", not "Deposit") — don't guess, use exactly this |
| Account Validated checkbox | `#..._tpBankInformation_chkAccountValidate` | native checkbox |
| Add button | `#..._tpBankInformation_btnAddBankInformation` | `input[type=submit]` — **real write**, adds a new bank record (not exercised — see Edge Cases) |
| Cancel button | `#..._tpBankInformation_btnCancelBankInformation` | `input[type=submit]` |
| Filter: All/Active/Inactive radios | `#..._tpBankInformation_rbtnall` / `rbtnactive` / `rbtninactive` | native radios, default `rbtnall` checked |
| Search button (filter) | `#..._tpBankInformation_btnBankSearch` | `input[type=submit]` |
| Existing-records grid | `#..._tpBankInformation_gvBankInformation` | Columns (confirmed via live DOM): Bank Account Type, Bank Number, Account Number, Minimum Payment Amount, Direct Deposit, Account Validate, Edit, View |
| Row Edit/View icons (existing bank record) | `[id$="_imgEditBI"]` / `[id$="_imgViewBI"]` | scoped within `gvBankInformation` |

(`...` above stands for the full prefix
`ctl01_ContentPlaceHolder2_tcAgencies_tbpnlDetail_tcChildPanels_tpBankInformation`
— written in full in the table's first two rows, abbreviated after for
readability. Always use the full id in actual selectors.)

## Actions

- Open a row's Bank Information tab to review its existing bank records.
- Filter existing records by All / Active / Inactive and Search.
- Click a record's View icon to see (presumably read-only) detail — not
  exercised in this pass.
- Fill the Bank Account Type / Bank Number / Minimum Payment Amount / Status /
  Account Type / Account Number / Direct Deposit / Account Validated fields
  and click Add to create a new bank record — **not exercised** (real write;
  see Edge Cases).

## Expected Outcomes

- Confirmed by direct observation: one existing agency (AGT078, "A P
  Schweitzer Insurance Agency Inc") has exactly one Bank Information record —
  Bank Account Type "Direct Bill", Bank Number "4561", Account Number "641",
  Direct Deposit "True", Account Validated "False" — matching what's
  rendered in `gvBankInformation`.
- The PDF's original scenario (a different environment/agency, AGT002)
  describes **two** rows (Direct Bill and Agency Bill Refund) with specific
  bank/account numbers and a Minimum Payment Amount set on the refund row —
  not reproduced here; this environment's AGT078 only has the one row. Don't
  assume every agency has both account types populated.

## Edge Cases / Known Quirks

- **This flow needs a longer-than-default test timeout.** Confirmed live
  2026-09-28: a run timed out at exactly the default `30000ms` with no
  thrown error — consistent with simply running out of budget partway
  through, not a hang. It's a genuinely multi-step flow: open a second,
  separate popup window (Admin Manager), then several real navigations
  inside it (Business > Agency listing, first agency's Details tab, Bank
  Information tab). Fixed in `agencyBankSetup.test.ts` with
  `test.setTimeout(60_000)` — confirmed passing afterward (~21.5s).
- **Leaving this tab open disturbs the original BMS/Accounting tab's
  session.** Confirmed via a network trace in the E2E composition test:
  after opening Admin Manager (a second tab sharing the same browser
  context/session) and continuing to use it, the *original* tab's next
  write-ish action (a Payment Upload file submission) silently fired no
  request at all — not an error, just nothing happening. The trace showed
  two `AuthBridge.aspx` re-authentication handshakes tied to the Admin
  Manager tab around the same time. The reliable fix, confirmed across
  multiple runs: call `close()` on this Page Object and `page.reload()` on
  the original page immediately after finishing with Agency Bank Setup,
  before any subsequent step that submits something. See
  `payment-upload-file-validation.md`'s Edge Cases for the specific symptom
  this caused.

- **This is a genuinely different application** (classic ASP.NET WebForms,
  `/ALIS/` IIS app) from the Angular BMS/Accounting SPAs — expect different
  conventions throughout: auto-numbered `GridView` row ids, `__tab_...`
  AJAX TabContainer anchor ids, `input[type=submit]` buttons instead of
  `<button>`, no client-side routing (real full-page/iframe postbacks).
- Reaching it requires capturing a genuine new-tab/window open
  (`context.waitForEvent('page')`) — this is straightforward in committed
  Playwright test code, but was a hard blocker for this repo's *interactive
  exploration* tooling (which treats any new-tab open as requiring a real
  human click, and silently swallows JS-triggered ones). If a future
  exploration pass hits the same wall on a different admin screen, this is
  the pattern to use to get past it in the automation itself, even though
  live interactive exploration may still need a human to walk through the
  screen once first.
- **Clicking the module switcher's "Admin" item immediately after clicking
  the toggle is flaky** without an intermediate wait — confirmed via repeated
  runs: racing `context().waitForEvent('page')` against
  `adminMenuItem.click()` right after the toggle click intermittently failed
  (generic test-timeout, no specific locator error, consistent with the
  dropdown's own open animation/render not having finished yet). Fix:
  explicitly wait for the Admin menu item to become visible *before* the
  `Promise.all([...])` popup-capture race, not as part of it.
- **`page.waitForLoadState()` (any variant) is unreliable throughout this
  entire app**, not just after the Edit-icon postback — the default
  no-argument call (waits for `'load'`) right after the new tab/window opens
  also hung to its own 30s timeout. This Admin Manager app appears to run
  some continuous background polling that never lets network/load state
  settle. Use a targeted element-visibility wait at every step in this flow
  instead of any `waitForLoadState()` call.
- **Clicking a row's Edit icon is a classic ASP.NET full-page postback**, not
  an SPA transition — confirmed slower than this repo's default 5s assertion
  timeout when two instances of this flow run in parallel (both timed out
  waiting for the Details tab to appear). `page.waitForLoadState('networkidle')`
  looked like the fix but **never resolved** (hit its own 30s timeout,
  confirmed via a serial re-run, so it wasn't a parallelism artifact) — this
  Admin Manager app appears to have some continuous background polling, so
  "zero network activity for 500ms" never actually happens here. The reliable
  fix is waiting on the Details tab locator itself becoming visible (a
  bounded, targeted signal), not a page-wide network-idle heuristic.
- Two field ids don't match their labels exactly — `txtLimitAmount` for
  "Minimum Payment Amount", `chkDirectDeposite` (sic) for "Direct Deposit" —
  confirmed via live DOM, not guessed.
- **Add performs a real write** (creates a new bank account record for this
  agency) — same caution class as Create Batch / Invoice Application Save /
  Check Summary Update elsewhere in this product. No automation in this pass
  exercises it.

## Auto-discovered (needs review)
- (agent appends here; engineer reviews and folds into sections above)
