# Payment — Batch List (Batch List tab)

## Overview

This is the "Batch List" tab — the default/landing tab of the **Payment** screen
in the ALIS Accounting module
(`https://prod-alis-4-1-21.dyadtech.com/ALIS.Accounting/APP/#/payment`, reached
via the "Payments" link in Accounting's left nav). It's the entry point for the
Bulk Payment Upload / batch-payment workflow: a filterable list of existing
payment batches, plus the button that starts a new one.

## Layout (left to right, top to bottom)

**Filter row:**
- **Client Type** — dropdown, defaults to "Agency".
- **Entry Date** — date field, defaults to today.
- **Acct Eff Date** — date field, defaults to today.
- **Bank GL** — dropdown, no default selection shown (placeholder), lists bank
  accounts.
- **Batch Status** — dropdown, defaults to "Open".
- **Batch Description** — free-text field, empty placeholder.

**Action row (below filters):**
- **Create Batch** — dark maroon button. Immediately creates a new batch (see
  "Notable behavior" below) and switches to the "Payment" tab for it.
- **Excel** (icon: downward-arrow-into-tray, labeled "Excel") — right-aligned,
  same row. Presumed to export the current grid to Excel (not exercised in
  this pass).

**Grid** (below the action row), columns left to right, with confirmed
`col-id`s (all confirmed via live DOM 2026-09-28, including the ones a
previous pass of this file had left unconfirmed — the grid needs a real
horizontal scroll gesture to render them; setting `scrollLeft` via JS alone
did **not** work, ag-Grid's column virtualization apparently needs a genuine
wheel/scroll event):
- Checkbox column (select row / select-all in header).
- **Batch No** (`batch_no`) — the batch's number, shown as a link/bold value
  (e.g. "35066").
- **Client Type** (`client_type_text`) — e.g. "Market".
- **Batch Description** (`batch_desc`) — free text entered when the batch was
  created (e.g. "POL_89", "pay april", "PArtial Pay", "Payment- Wire",
  "NEgative" — real values, not placeholders, from other batches already in
  the system).
- **Payment Amt** (`paid_amt`) — dollar amount, e.g. "$200.00".
- **Batch Total** (`batch_amt`) — dollar amount.
- **Adj Amt** (`batch_adj_amt`) — dollar amount, e.g. "$0.00".
- **Acct Eff Date** (`apply_dt`) — date, e.g. "08/20/2024".
- **Entry Date** (`entry_dt`) — date, e.g. "04/08/2024".
- **Bank GL** (`bank_gl`) — e.g. "110201".
- **Bank Name** (`bank_name`) — e.g. "Bank of America".
- **Status** (`status_text`) — e.g. "Approved".
- **Created By** (`createdby`) — e.g. "Avdhesh  Joshi" (double space observed
  in the real data — not a typo in this doc).
- **Updated By** (`updatedby`) — e.g. "vikas  Chaudhary".
- **Updated Date** (`last_updated_dt`) — e.g. "05/12/2025".
- **ACH** (`is_ach`) — "Yes"/"No", e.g. "No".
- **Add/Edit** (`col-id="0"`) — icon-only column (pencil glyph). Function name
  comes from the column header text, not a tooltip; exact behavior not
  exercised in this pass.
- **Batch Edit** (`col-id="1"`) - icon-only column (pencil-in-box glyph).
  Clicking it fires two API calls - `GetCostCenterByEntity` (returns `[]`,
  empty, on this environment) and `GetBankList` (returns real bank data) -
  confirmed live 2026-09-30 via network trace - but **no modal or form ever
  appears**, no console error/warning fires, and the page/URL don't
  change. This looks like a genuine environment limitation: the edit
  form likely guards on a non-empty Cost Center list before rendering,
  and this environment has none configured (consistent with Cost Center
  also being absent from the Payment Upload tab - see payment-upload.md).
  Investigated three separate ways (clicking the bare `<i>`, clicking the
  cell wrapper, and confirming the row's own select-checkbox is disabled
  so pre-selection isn't the cause) - not yet reproducible on this
  environment. The PDF's "Edit Batch Detail" test scenario is therefore
  currently blocked here, not merely unautomated.
- **View** (`col-id="2"`) — icon-only column (eye glyph). Opens a "View Batch
  Data" popup — see `batch-transaction-detail-popup.md`.
- **PDF** (`col-id="3"`) — icon-only column (red PDF-document glyph),
  `i[title="PDF Export"]`, pinned-right, same row-duplication caveat as other
  action columns. Confirmed live 2026-09-28: clicking it POSTs to
  `ALIS.Accounting/ReportAPI/API/api/Report/GetViewBatchTranPDF` with that
  batch's id, and the response body is the batch's transaction PDF as a
  base64 string embedded directly in JSON (not a `Content-Disposition`
  file response) — the app then converts that into a client-side file
  download itself (no modal, no new browser tab; confirmed no new tab opened
  and no dialog appeared). See `payment-batch-list-pdf-export.md` for the
  automated coverage of this — waits on that specific network response
  rather than trying to inspect a real downloaded file on disk.
- **Del** (`col-id="4"`) - icon-only column (trash-can glyph, no `title`
  attribute, rightmost pinned-right column, same row-duplication caveat as
  the other action columns). Clicking it opens a plain Bootstrap confirm
  modal (`.modal.show`, same shape as this app's other popups): title
  **"Please Confirm"**, body text **"Are you sure you want to delete this
  payment batch ?"**, an outlined **Cancel** button and a maroon primary
  **Ok** button - confirmed live 2026-09-30 via the user's own manual click
  (screenshot). Clicking Del also visually checks/highlights that row's own
  select-checkbox (previously seen as `disabled` when inspected directly -
  this suggests it's set programmatically to indicate the delete target,
  not independently clickable by a user/automation). Clicking **Ok**
  performs the delete for real - confirmed directly by the user
  2026-09-30 via two live screenshots: the row disappears from the grid,
  and a green success toast appears reading **"<BatchNo>" / "Batch Deleted
  Successfully"** (with a checkmark icon) - e.g. "35094" / "Batch Deleted
  Successfully" for batch #35094. This is a real, destructive write; see
  business-rules.md's frozen-invoice rule for why deleting a batch matters
  (it's the only confirmed way to unfreeze that batch's invoices). Still
  not automated - this session's sandbox blocked scripting the click
  itself (2026-09-30); everything above is documented from the user's own
  manual run, not from automation.

**Right-edge vertical tabs** (rotated text, along the grid's right border):
- **Columns** — opens a column-configuration panel (seen in prior manual
  testing on the Check Register grid; not re-opened in this pass).
- **Filters** — opens a per-column filter panel (same caveat).

**Footer bar (shared across all tabs of this Payment screen):**
- **Total Payment Amount : $4,362,520.57** — running total across the
  (filtered) grid.
- **Post NACHA** — outlined button.
- **Prepare →** — dark maroon primary button.

## Dropdown options observed

- **Client Type**: Agency, Insured, Market, Finance, Underwriter, Association.
- **Bank GL**: 110203 - BANK OF CLAIM, 110201 - Bank of America, 110202 - Royal
  Bank of Scotland, 110603 - City National Bank, 120102 - City National Bank,
  520602 - Bank of New York Mellon, 120101 - Bank of AMEX, 110701 - BNPP-1,
  110702 - Bank of America-1, 110602 - Bank of Texas, 140201 - Bank of
  California, 110101 - Bank of America.
- **Batch Status**: Open, Hold.

No checkboxes appear in the filter row itself (only the grid's row-select
checkboxes).

## Selectors

| Element | Selector | Notes |
|---|---|---|
| Batch List tab button | `page.getByRole('tab', { name: 'Batch List' })` <!-- not an id --> | Confirmed 2026-09-21: this button's actual `id` attribute is `"pills-batch-tab "` — with a **trailing space** — so a `#pills-batch-tab` CSS selector matches nothing (verified: both `document.querySelector` and `getElementById` return null/false for it). Several of this Payment screen's other tab buttons have the same trailing-space quirk (`"pills-ACHEFT-tab "`, `"pills-emaillog-tab "`, `"pills-EFTContact-tab "`) — only `pills-Upload-tab` (see payment-upload.md) is clean. Use a role-based locator for any of the affected tabs instead of assuming its id works. |
| Batch List tab-pane container | `#pills-batch` | The pane's own id (not the tab button's) has no trailing-space issue — confirmed clean. Grid/action-icon selectors below should be scoped under this, the same way check-register.md's are scoped under `#pills-cashlisting`. |
| View icon (row action) | `i[title="View Batch Data"]` | In the pinned right-hand action column (`.ag-pinned-right-cols-container`, same duplicate-row pattern as check-register.md) — see `batch-transaction-detail-popup.md` for what it opens. |
| Grid row | `#pills-batch .ag-center-cols-container .ag-row` | Same ag-Grid row-duplication caveat as check-register.md |
| Grid cell (any column) | `#pills-batch .ag-center-cols-container [col-id="<name>"]` | All 15 data-column `col-id`s confirmed via live DOM 2026-09-28 — see the Layout section's Grid bullet list for the full mapping (`batch_no`, `client_type_text`, `batch_desc`, `paid_amt`, `batch_amt`, `batch_adj_amt`, `apply_dt`, `entry_dt`, `bank_gl`, `bank_name`, `status_text`, `createdby`, `updatedby`, `last_updated_dt`, `is_ach`) |
| Grid horizontal scroll | real scroll gesture (e.g. Playwright `mouse.wheel()` or `locator.hover()` + wheel, not `element.scrollLeft = x`) at a point inside the grid | Confirmed necessary to render columns past "Entry Date" — ag-Grid's column virtualization didn't respond to `scrollLeft` set directly via JS (with or without a dispatched `scroll` event), only to an actual wheel/scroll input |
| Filters side-panel tab | `page.getByRole('tab', { name: 'Filters' })`, scoped under `#pills-batch` | Vertical rotated-text tab on the grid's right edge (ag-Grid's built-in Filters tool panel side-bar). Real DOM: `<button class="ag-side-button-button" role="tab">Filters</button>` — confirmed via live DOM 2026-09-28. Opens/toggles the tool panel; the "Columns" tab sits above it with the same shape. |
| Filters panel — column group header (e.g. "Batch No") | `page.getByRole('button', { name: 'Batch No' })`, scoped to the open filters tool panel (not the grid header) | ag-Grid tool-panel row, `role="button"`, class `ag-filter-toolpanel-group-title-bar`. Click to expand/collapse that column's own filter UI. One such header per grid column (e.g. "Client Type", "Batch Description", ...); scope by container to avoid matching the grid's own `[col-id="batch_no"]` header cell, which has the same visible text. |
| Filters panel — per-column value search box | `page.getByRole('textbox', { name: 'Search filter values' })` | Appears once a column group (e.g. "Batch No") is expanded. `aria-label="Search filter values"`, placeholder `"Search..."`. Confirmed live: typing a value (e.g. "35066") narrows the checkbox list below to only matching values — confirmed to search/match against the full loaded column dataset, not just currently-DOM-rendered grid rows. <!-- fragile: no data-testid, but this aria-label is real and stable --> |
| Filters panel — `(Select All)` checkbox | `<!-- fragile -->` `panel.locator('.ag-set-filter-item, .ag-list-item', { hasText: '(Select All)' }).locator('input[type="checkbox"]')` | Renders as a plain `<div class="ag-set-filter-item">` with an unlabeled checkbox `<input>` inside — no accessible role/name exposed (confirmed via live DOM 2026-09-28), so a role-based locator isn't available here; match by the item's visible text instead. **This is the only reliably-clickable control for changing the applied filter** — see the isolate/clear recipe below. Its own checked state reflects only the *currently search-narrowed* subset of values, not the column's full value set. |
| Filters panel — individual value checkbox (e.g. "35066") | same shape as `(Select All)`'s, substituting the value's text | **Confirmed unreliable 2026-09-28: clicking an individual value's own checkbox visually toggles it to `checked`/`unchecked`, but does not reliably update the grid's actual applied filter** (reproduced repeatedly, both via Playwright's `locator.click()` and via manual full pointer-event dispatch in a live console session) — don't build automation that depends on checking/unchecking one specific value directly. Isolating a single value works reliably only via the `(Select All)` recipe below. |

## Notable behavior

- **Create Batch performs a real write immediately** — see the callout in
  `payment-batch-setup.md`. There is no preview/draft step; a real Batch # is
  assigned the instant the button is clicked.
- The grid already contains real production-looking batch data (real
  descriptions, dollar amounts, dates) rather than being empty/demo data —
  worth keeping in mind when writing automation assertions (don't assume an
  empty grid, and don't assume row order/count is stable run to run).
- **Filters panel — the only reliable way to isolate one Batch No is the
  `(Select All)` checkbox, toggled twice, never the individual value's own
  checkbox** (see the Selectors table's two Filters-panel-checkbox rows for
  why). Confirmed live 2026-09-28, the working recipe:
  1. Expand the "Batch No" group (its value-search box starts empty).
  2. Click `(Select All)` once — this deselects every value in the entire
     column (confirmed via the grid actually going to 0 rows).
  3. Type the target Batch No into the value-search box, narrowing the
     checkbox list to just that one value (still unchecked from step 2).
  4. Click `(Select All)` again — now scoped to the single-value narrowed
     list, so this checks just that one value, isolating the grid to it.
  5. To clear: empty the search box, then click `(Select All)` once more
     (now scoped to the full column again) to re-select everything and
     restore the unfiltered grid.
  See `alis_core/tests/batch_list_search_by_number/batchListSearchByNumber.page.ts`'s
  `isolateBatchNo()`/`clearBatchNoFilter()` for the automated version.
- **A grid row's flattened `textContent` has no separators between cells**
  (e.g. `"35066MarketPOL_89$200.00$200.00$0.00"`), so a `\b<value>\b`
  word-boundary regex to match a specific Batch No **silently never
  matches** — the digit run is immediately followed by a letter (both
  "word" characters for regex purposes, so there's no boundary between
  them). Use digit-based lookaround instead, e.g.
  `new RegExp('(?<!\\d)' + batchNo + '(?!\\d)')` — confirmed live 2026-09-28
  while debugging `alis_core/tests/batch_list_search_by_number/`. The same
  `\b`-based pattern existed in `batch_list_verification`'s `rowForBatch()`/
  `cellForBatch()` helpers too (not yet hit by their specific test data, but
  latent) — fixed the same way, and a repo-wide grep confirmed no other
  `alis_core/tests` file had this pattern.

## Open items / to verify

- **Post NACHA** and **Prepare** — purpose and effect not exercised (both look
  like they'd act on selected/filtered batches; clicking either could mutate
  data, so left alone in this read-only pass).
- Exact behavior of the Add/Edit, Batch Edit, and PDF icon columns — known
  qualitatively from an earlier manual QA pass but not exercised in
  automation. View is automated (`batch-transaction-detail-popup.md`); Del is
  deliberately never exercised (destructive).
- Whether the filter fields (Client Type / Entry Date / Acct Eff Date / Bank
  GL / Batch Status / Batch Description) actually re-filter the grid on this
  screen — an earlier manual QA pass found the Check Register page's header
  filters appeared unresponsive after a full page reload on this same
  environment; whether that also affects this Batch List grid is unconfirmed.
- Contents of the **Columns** side panel for this specific grid — not
  reopened in this pass. The **Filters** panel's "Batch No" column search is
  now documented (see Selectors table above) and automated in
  `alis_core/tests/batch_list_search_by_number/`.
