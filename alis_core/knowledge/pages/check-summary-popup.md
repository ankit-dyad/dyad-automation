# Check Summary Popup

## Overview

A read-only(-looking) popup opened from the **Check Summary** icon on a
Check Register row (`check-register.md`), on the ALIS Accounting module's
Check Register screen (`#/checkregister`). Shows a one-row grid of the
check's payee/client/batch/GL detail, plus an "Update" button (not exercised
— see Edge Cases). Confirmed by direct observation 2026-09-21, logged in as
`qable1`.

Matches the PDF test scenarios "Verify Check Summary" and "Edit Check Summary
Detail".

## URL

No separate route — a Bootstrap modal overlaid on `#/checkregister`. Reached
only by clicking a row's Check Summary icon; not directly navigable.

## Reaching this page

1. Reach the Check Register screen (`check-register.md`).
2. Click a row's **Check Summary** icon (`i[title="Check Summary"]`, in the
   pinned right-hand action column alongside View/PDF — no trailing-space
   quirk on this particular title, unlike several others found elsewhere in
   this app).

## Selectors

| Element | Selector | Notes |
|---|---|---|
| Check Summary icon (trigger, on a Check Register row) | `#pills-cashlisting .ag-pinned-right-cols-container i[title="Check Summary"]` | Sits alongside `i[title="View Batch Data"]` (col-id `0`) and `i[title="PDF Export"]` (col-id `1`) at col-id `2` in the same pinned-right column group |
| Open modal | `.modal.show` | Same multi-modal-mounted pattern as elsewhere in this app — scope everything here. Title text is also "Check Summary", same as the popup itself — don't confuse with the trigger icon's title attribute of the same text |
| Close (X) button | `.modal.show .btn-close` | `data-bs-dismiss="modal"` |
| Update button | `.modal.show button:has-text("Update")` | **Real write** - see Edge Cases. Shows toast "Invalid - Please select a row to update." if clicked with no row selected. |
| Edit form (Payee/Address1/Address2/City-State-Zip) | `#txtClientPayee`, `#txtAddress1`, `#txtAddress2`, `#txtCityStateZip` (all scoped under `.modal.show`) | Plain Angular reactive-form inputs, clean ids (unlike almost everything else in this app) - **not** part of the ag-Grid. Empty until the grid row is selected. |
| Grid cells | `.modal.show .ag-center-cols-container [col-id="<name>"]` | All 20 of the PDF's listed fields confirmed via col-id, 2026-09-30 (see below) |

Full confirmed col-id -> label mapping (2026-09-30, via header cells' own
text - ag-Grid keeps header cells in the DOM even when a column's body
cells are virtualized out of view, so this needed no scrolling):
`client_code`=Client Code, `client_name`=Client Name, `payee_name`=Payee
Name, `payment_amt`=Check Amount, `account_name`=Account Name,
`batch_no`=Batch No, `batch_desc`=Batch Description, `checkstatus`=Status,
`tran_desc`=Transaction Description, `gl_account`=G/L Account,
`apply_dt`=Acct Eff. Date, `entry_dt`=Entry Date, `document_num`=Doc No.,
`country`=Payee Country, `OFAC`=OFAC. The five Payee Address/City/State/Zip
fields are the one exception - they use **plain numeric col-ids**, not named
ones: `0`=Payee Address1, `1`=Payee Address2, `2`=Payee City, `3`=Payee
State, `4`=Payee Zip.

Only ~4 columns (`client_code`, `client_name`, `payee_name`, `payment_amt`)
render without scrolling; the rest need horizontal scroll to appear in the
DOM (ag-Grid column virtualization, same as every other grid in this app) -
and, same quirk as batch-transaction-detail-popup.md, columns already
scrolled past also drop back OUT of the DOM, so automation must check each
field at the scroll offset it is actually confirmed present at (see
checkSummary.test.ts).

## Actions

- Click a Check Register row's Check Summary icon to open the popup.
- Click the X (close) button to dismiss it.
- **Click the grid row to select it** - confirmed live 2026-09-30: this is
  the actual edit mechanism for the PDF's "Edit Check Summary Detail"
  scenario (not ag-Grid inline cell editing - the Payee Address1 cell is
  confirmed NOT inline-editable via dblclick). Selecting the row
  auto-populates the Payee/Address1/Address2/City-State-Zip form fields
  below the grid with that row's current values. Automated in
  `alis_core/tests/check_summary/` (read-only - confirms the fields
  populate correctly, never edits/submits).
- Click Update after modifying a field - **not exercised** in this pass
  (real write; see Edge Cases).
## Expected Outcomes

- The popup opens with a single-row grid showing that row's check detail,
  matching the row that was clicked (confirmed: a $10.00 check → Client Code
  "WWI-M", Client Name "Western World Insurance", Payee Name "Eript E.
  Fiscus", Check Amount "$10.00").

## Edge Cases / Known Quirks

- Same multi-modal-mounted-at-once pattern as `batch-transaction-detail-popup.md`
  and elsewhere in this app — scope to `.modal.show`, never a bare `.modal`.
- **Update performs a real write** - confirmed live 2026-09-30: fires a
  genuine `POST .../Checkregister/UpdateCheckPayeeInformation` (followed by
  a `GetBatchSummary` refresh) against this production-looking environment's
  check/payee data (same caution as Create Batch and Invoice Application's
  Save - see `payment-batch-list.md`'s "Notable behavior"). Clicking it with
  no row selected instead shows a toast: "Invalid - Please select a row to
  update." No automation in this pass ever clicks Update for real.
- Unlike `batch-transaction-detail-popup.md`'s "View Batch Data" popup, this
  popup's grid does **not** duplicate its single row — don't assume every
  popup-modal grid in this app has that quirk; confirm per popup.
- The Check Register grid this popup is reached from can legitimately have
  zero rows for the default filters on this ever-changing, production-looking
  environment (same as `ach-eft-check.md`'s Edge Cases) — a repeat run of
  this page's first automation pass hit exactly that and hard-timed-out
  waiting for a Check Summary icon that didn't exist. Wait for a row's icon
  to become visible (bounded) and skip gracefully if none appears, rather
  than assuming a row is always present.

## Auto-discovered (needs review)
- (agent appends here; engineer reviews and folds into sections above)
