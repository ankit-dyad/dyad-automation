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
| Update button | `.modal.show button:has-text("Update")` | **Real write** — see Edge Cases |
| Summary grid row | `.modal.show .ag-center-cols-container .ag-row` | ag-Grid; unlike `batch-transaction-detail-popup.md`'s popup, this one does **not** duplicate its row — confirmed exactly 1 row for 1 check |
| Grid cells | `.modal.show .ag-center-cols-container [col-id="<name>"]` | Confirmed `col-id`s (visible without scrolling): `client_code`, `client_name`, `payee_name`, `payment_amt` |

Full confirmed column header set (left to right, via `[role="columnheader"]`,
not all individually mapped to `col-id`s in this pass): Client Code, Client
Name, Payee Name, Check Amount, Account Name, Batch No, Batch Description,
Status, Transaction Description, G/L Account, Acct Eff. Date, Entry Date, Doc
No., Payee Country, OFAC, Payee Address1, Payee Address2, Payee City, Payee
State, Payee Zip — matches the PDF's "Verify Check Summary" column list
exactly.

## Actions

- Click a Check Register row's Check Summary icon to open the popup.
- Click the X (close) button to dismiss it.
- Click Update after modifying a field (e.g. Address1, City/State/Zip per the
  PDF's "Edit Check Summary Detail" scenario) — **not exercised** in this
  pass (real write; see Edge Cases).

## Expected Outcomes

- The popup opens with a single-row grid showing that row's check detail,
  matching the row that was clicked (confirmed: a $10.00 check → Client Code
  "WWI-M", Client Name "Western World Insurance", Payee Name "Eript E.
  Fiscus", Check Amount "$10.00").

## Edge Cases / Known Quirks

- Same multi-modal-mounted-at-once pattern as `batch-transaction-detail-popup.md`
  and elsewhere in this app — scope to `.modal.show`, never a bare `.modal`.
- **Update performs a real write** against this production-looking
  environment's check/payee data (same caution as Create Batch and Invoice
  Application's Save — see `payment-batch-list.md`'s "Notable behavior"). No
  automation in this pass exercises it.
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
