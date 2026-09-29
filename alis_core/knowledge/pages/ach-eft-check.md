# Payment — ACH / EFT & Check (ACH / EFT & Check tab)

## Overview

This is the "ACH / EFT & Check" tab of the **Payment** screen in the ALIS
Accounting module (`#/payment`). It's a filterable grid of payment batches
showing their ACH flag and export/notification actions (NACHA download, DMS,
email, PDF, validation, log). Confirmed by direct observation 2026-09-21,
logged in as `qable1`.

Matches the PDF test scenario "ACH/EFT & Check Tab".

The Payment screen has three tabs: **Batch List** (default), **ACH / EFT &
Check** (this one), and **Upload**.

## URL

`#/payment` (same route as Batch List/Upload — client-side tab switch, not a
separate route). Resolved against `ALIS_CORE_ACCOUNTING_BASE_URL`, not
`ALIS_CORE_BASE_URL` — see `payment-upload.md`'s "Reaching this page".

## Reaching this page

1. Reach the Payment screen (`payment-batch-list.md`).
2. Click the **ACH / EFT & Check** tab button. Its `id` attribute has a
   trailing space (`"pills-ACHEFT-tab "`, confirmed via live DOM inspection —
   same quirk class as `payment-batch-list.md`'s Batch List tab button and
   `invoice-application.md`'s Transaction Add/Edit icon) — use a role-based
   locator (`getByRole('tab', { name: 'ACH / EFT & Check' })`), not `#id`.
   Its tab-pane container id (`#pills-ACHEFT`, via `data-bs-target`) is clean.

## Selectors

| Element | Selector | Notes |
|---|---|---|
| ACH/EFT & Check tab button | `page.getByRole('tab', { name: 'ACH / EFT & Check' })` <!-- not an id --> | See "Reaching this page" |
| Tab-pane container | `#pills-ACHEFT` | Clean id; scope grid/filter selectors under this, same pattern as `check-register.md`'s `#pills-cashlisting` |
| Client Type multiselect | `#pills-ACHEFT #ddlClientTypeACH` | `ng-multiselect-dropdown`; default selection observed: Agency, Market, Finance (+2 more, 5 of some larger total — not fully enumerated this pass) |
| Search By dropdown | `#pills-ACHEFT #ddlSearchBy` | native `<select>`; options: Batch No (value `1`, default), Amount (value `2`) |
| Batch No search field | `#pills-ACHEFT #txtBatchNo` | text input; paired with Search By = Batch No |
| From Acct Eff Date | `#pills-ACHEFT #dateACHFrom input` <!-- fragile --> | custom `<app-date-picker>`, no id on inner input — same pattern as other date fields in this app |
| To Acct Eff Date | `#pills-ACHEFT #dateACHTo input` <!-- fragile --> | same component |
| Search button | `#pills-ACHEFT button:has-text("Search")` | no id |
| Grid row | `#pills-ACHEFT .ag-center-cols-container .ag-row` | ag-Grid; same center-vs-pinned-right duplication caveat as check-register.md |
| Grid cell | `#pills-ACHEFT .ag-center-cols-container [col-id="<name>"]` | Confirmed `col-id`s (center container): `Batch_No`, `client_type`, `Total` (Batch Total), `paid_amt` (Payment Amount), `adj_amt` (Adj Amount), `Acct_Eff_Date`, `Entry_Date`, `Posted_By` (User), `Description` (Batch Description) |
| Is ACH cell | `#pills-ACHEFT .ag-pinned-right-cols-container [col-id="Is_ACH"]` | Text "Yes"/"No", in the pinned-right column alongside the action icons |
| Action icons (pinned-right column, per row) | `#pills-ACHEFT .ag-pinned-right-cols-container i[title="<Title>"]` | Confirmed titles: "Download NACHA", "Save Doc to DMS", "Doc Status info", "Send Email", "Export To PDF", "Validate Email Address", "View Email Log" — these map to the PDF's "NACHA, DMS, Info, Email, PDF, Validate, Log" column headers |

## Actions

- Set Client Type (multiselect), Search By + its paired field, and the
  Acct Eff Date range, then click Search to filter the grid.
- Search by Batch No: confirmed — searching for an exact, existing batch
  number returns exactly that one row.
- Click a row's NACHA/DMS/Info/Email/PDF/Validate/Log icon — not exercised in
  this pass (several look like they'd trigger downloads, emails, or other
  side effects; left alone in this read-only pass).

## Expected Outcomes

- The grid loads by default with rows matching the default filters.
- Searching by an exact Batch No returns exactly that one row, with its
  Client Type, Batch Total, Payment Amount, Adj Amount, and Is ACH value
  matching that batch's actual data (confirmed: batch #39249 → Client Type
  "Finance", Is ACH "Yes").

## Edge Cases / Known Quirks

- **The grid populates asynchronously after the tab becomes active** — a
  row-count check made immediately after clicking the tab can see 0 rows even
  though the grid does load shortly after (confirmed: this caused the first
  automation pass of this page to spuriously skip itself). Wait for at least
  one row to become visible (`locator.waitFor({ state: 'visible' })` or an
  `expect(...).toBeVisible()`) before reading the row count, rather than
  calling `.count()` right after switching tabs.
- **That same `waitFor()` needs its own explicit, bounded `timeout` —
  confirmed live 2026-09-28.** With no `timeout` passed, `locator.waitFor()`
  defaults to consuming the *entire remaining test timeout* as its own
  budget. When the grid genuinely has no rows (a legitimate, data-dependent
  state — see `alc_sc_ach_eft_check_search.md`'s `test.skip()` fallback),
  that wait silently ate the test's whole default 30s on its own; by the time
  it resolved `false` (via a `.catch()`), the *outer* test timeout had also
  just fired, so Playwright reported a hard `"Test timeout of 30000ms
  exceeded"` failure instead of letting the graceful `test.skip()` run.
  Fixed in `achEftCheck.test.ts` by capping that wait at `15_000` and giving
  the test `test.setTimeout(45_000)` overall — confirmed live afterward: an
  empty-grid run now skips cleanly instead of failing.
- Same ag-Grid row-duplication pattern as `check-register.md` and
  `payment-batch-list.md` — always scope to `.ag-center-cols-container` (or
  `.ag-pinned-right-cols-container` when specifically targeting the action
  icons/Is ACH cell), never a bare `.ag-row`.
- Same tab-button trailing-space-in-`id` quirk as elsewhere in this app — see
  "Reaching this page".
- This is the same production-looking environment as the rest of this
  Accounting module (see `payment-batch-list.md`) — don't assume grid
  contents or the Client Type multiselect's full default-selected set are
  stable run to run.

## Auto-discovered (needs review)
- (agent appends here; engineer reviews and folds into sections above)
