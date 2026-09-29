# Check Register

## Overview

The **Check Register** screen, in the ALIS Accounting module
(`https://prod-alis-4-1-21.dyadtech.com/ALIS.Accounting/APP/#/checkregister`).
It's a filterable grid of prepared/approved/printed checks, with actions to
view a batch's transaction detail, view/export a Check Summary, and (for
Prepared/Approved batches) Approve, Print Check, and download a Remittance
Advice. Confirmed by direct observation 2026-09-18, logged in as `qable1`.

Two tabs: **Check Register** (default, this page) and **Spoiled Checks** (not
covered here).

## URL

`#/checkregister`, same Accounting sub-app as `payment-upload.md` — resolved
against `ALIS_CORE_ACCOUNTING_BASE_URL`, **not** `ALIS_CORE_BASE_URL`. Reached
via the left icon rail's "Check Register" link once on any Accounting page
(`#/home`, `#/payment`, etc.) — see `payment-upload.md`'s "Reaching this page".

## Selectors

| Element | Selector | Notes |
|---|---|---|
| Check Register tab | `#pills-cashlisting-tab` | role=tab; default-active |
| Spoiled Checks tab | `#pills-spoilcheck-tab` | role=tab |
| Check Status dropdown | `#ddlCheckStatus` | native `<select>`; options: Prepared (default), Print, Approved, Void Payment |
| Banks multiselect | `#ddlBankGL` | custom `<ng-multiselect-dropdown>`, not a native select — see "Multiselect filters" below |
| From Acct Eff. Date | `#dateFromAcctEff input` <!-- fragile --> | custom `<app-date-picker>` component; inner `<input>` has no id. Default: 3 months before today. |
| To Acct Eff. Date | `#dateToAcctEff input` <!-- fragile --> | same component; default: today |
| Payment Type multiselect | `#ddlpaymenttype` | `<ng-multiselect-dropdown>`; default: all 10 types selected (Check, Wire, ACH, Cash, Credit Card, ...) |
| Client Type multiselect | `#ddlClientType` | `<ng-multiselect-dropdown>`; default: all 7 types selected (Agency, Insured, Market, Tax, Vendor, Finance, ...) |
| Search By dropdown | `#search` | native `<select>`; formcontrolname `ddlSearchby`; options: Batch No (default), Check Number, Payee, Check Amount |
| Search value field | `#txtBatch_Payee_Checkno` | text input, paired with whichever "Search By" option is selected |
| Search button | `button[type=submit]:has-text("Search")` | primary button |
| Export To Excel button | `button:has-text("Excel")` | downloads a file matching the current filtered grid |
| Columns side-tab | `#ag-192-button` <!-- fragile, ag-Grid-generated id --> | text "Columns"; opens ag-Grid's column-configuration panel. The numeric id is generated per grid instance — re-verify before relying on it; prefer `page.getByRole('button', { name: 'Columns' })` if this drifts. |
| Filters side-tab | `#ag-202-button` <!-- fragile, ag-Grid-generated id --> | text "Filters"; same caveat as Columns |
| Approve button | `#btnApprove` | footer bar, acts on selected Prepared-status row(s) |
| Remittance Download As button | `button:has-text("Remittance Download As")` | footer bar |
| Grid row | `.ag-center-cols-container .ag-row` | ag-Grid; `row-id`/`row-index` attributes confirm 0-based ordering. **Must** be scoped to `.ag-center-cols-container` — see Edge Cases, ag-Grid also renders a same-`row-id` duplicate of every row under `.ag-pinned-right-cols-container` for the pinned action-icon column |
| Batch No grid cell | `.ag-center-cols-container [col-id="batch_no"]` | ag-Grid-generated column id, confirmed via live DOM (not the same casing as the column's display header "Batch No"); same center-container scoping applies |

### Multiselect filters (Banks / Payment Type / Client Type)

All three are the same `ng-multiselect-dropdown` component. Structure (per
live DOM inspection):

```
<ng-multiselect-dropdown id="ddlClientType" ...>
  <div class="multiselect-dropdown">
    <span class="dropdown-btn"> ...chips (selected-item)... </span>   <!-- click to open/close -->
    <div class="dropdown-list">
      <ul class="item1"><li><input type=checkbox aria-label="multiselect-select-all"> UnSelect All</li></ul>
      <ul class="item2">
        <li><input type=checkbox aria-label="Agency"> Agency</li>
        <li><input type=checkbox aria-label="Insured"> Insured</li>
        ...
      </ul>
    </div>
  </div>
</ng-multiselect-dropdown>
```

- Open/close: click `#ddlClientType .dropdown-btn` (or any part of the closed
  control).
- Toggle one option: `#ddlClientType input[aria-label="Agency"]` (checkbox's
  `aria-label` matches the option's exact display text — a clean, semantic
  locator, not invented).
- "Select All" / "UnSelect All": `#ddlClientType input[aria-label="multiselect-select-all"]`.
- The closed control shows selected items as removable chips
  (`<a>x</a>` per chip) plus a `+N` badge for however many remain unlisted.
- **ag-Grid duplicates every row into two DOM elements.** Confirmed by direct
  observation 2026-09-18: each data row exists twice — once under
  `.ag-center-cols-container` (the main columns) and once more under
  `.ag-pinned-right-cols-container` (the pinned right-hand action-icon
  column), both sharing the same `row-id`. A row-count assertion against a
  bare `.ag-row` locator will report exactly double the real number of rows.
  Always scope grid-row locators to `.ag-center-cols-container` unless
  specifically targeting the pinned column's own content.
- **The checkbox `<input>` cannot be clicked directly** — confirmed by direct
  observation 2026-09-18: each option's own label `<div>` (e.g. `<div>Insured
  </div>`) visually sits on top of its `<input type=checkbox>` (a custom
  checkbox-styling pattern), so Playwright's actionability check reports "X
  intercepts pointer events" and a direct `.check()`/`.uncheck()`/`.click()`
  on the input times out. Click the option's `<li>` row instead (its
  ancestor), and read `input.isChecked()` for state.

## Actions

- Switch between "Check Register" / "Spoiled Checks" tabs.
- Set Check Status, Banks, Payment Type, Client Type, and the Acct Eff. Date
  range, then click Search to filter the grid.
- Search by Batch No / Check Number / Payee / Check Amount via the "Search By"
  dropdown + its paired text field — confirmed: searching by Batch No "39044"
  narrows the grid from 3 rows to exactly the 1 matching row.
- Export the current filtered grid to Excel.
- Open the Columns / Filters side panels to reconfigure the grid — not
  exercised in this pass.
- Select row(s) and click Approve — not exercised (real write against
  production-looking data; see `payment-batch-list.md`'s note on Create Batch).
- Click Remittance Download As — not exercised (downloads a file).
- Click a row's View / PDF / Check Summary icon — not exercised in this pass;
  each opens its own popup/document, to be documented as its own page once
  exercised (matches the PDF's separate "Action", "Check Summary", and
  "Batch Transaction Detail Popup" test scenarios).

## Expected Outcomes

- The grid loads with rows matching all active filters (Check Status=Prepared,
  all Banks/Payment Types/Client Types, default 3-month Acct Eff. Date range)
  by default.
- Searching by Batch No with an exact, existing batch number returns exactly
  that one row.
- Approve/Remittance/Print-Check actions are gated by the selected row(s)'
  Check Status — not exercised, so the exact enable/disable behavior isn't
  confirmed here (see PDF scenario "Check Register - Approve": switching
  Check Status to Approved is expected to swap the row action from Approve to
  "Print Check").

## Edge Cases / Known Quirks

- **Both tabs' content stay mounted in the DOM at once, and reuse the same
  element ids.** The "Check Register" and "Spoiled Checks" tab-panes are
  Bootstrap tabs (hidden via CSS, not conditionally rendered/destroyed) — so
  e.g. `#ddlClientType` matches **two** elements (a strict-mode violation in
  Playwright) unless scoped under the active pane's container. The Check
  Register pane's container is `#pills-cashlisting` (confirmed via the tab
  button's `data-bs-target` attribute). Every selector in the table above
  should be scoped under `#pills-cashlisting` in automation, not used bare.
- The Banks/Payment Type/Client Type filters are **not** native `<select>`
  elements — they're a third-party `ng-multiselect-dropdown` component with
  its own checkbox-list panel. Don't try `selectOption()` on them; open the
  panel and click the specific `input[aria-label="..."]` checkbox instead.
- The Columns/Filters side-tab buttons have ag-Grid-generated numeric ids
  (`#ag-192-button`, `#ag-202-button` at the time of this pass) — these are
  **not stable across page loads/grid instances**. Flagged fragile; prefer
  `getByRole('button', { name: 'Columns' })` / `{ name: 'Filters' }` if this
  drifts in practice.
- The date-picker fields (`app-date-picker`) have no `id`/`formcontrolname` on
  their actual `<input>` — only on the wrapping custom element. Same caveat as
  `payment-upload.md`'s Acct Eff Date field.
- This is the same production-looking environment as the Payment screen (see
  `payment-batch-list.md`) — real batch/check data, not fixtures. Don't assume
  row count or order is stable run to run; the Batch No search test above is
  itself only stable as long as batch #39044 continues to exist.

## Auto-discovered (needs review)
- (agent appends here; engineer reviews and folds into sections above)
