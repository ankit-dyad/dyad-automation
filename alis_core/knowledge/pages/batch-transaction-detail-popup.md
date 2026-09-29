# Batch Transaction Detail Popup

## Overview

A read-only popup opened from the **View** (eye) icon on a Batch List row
(`payment-batch-list.md`), on the ALIS Accounting module's Payment screen
(`#/payment`, Batch List tab). Shows a one-row summary grid of the batch's key
transaction fields. Confirmed by direct observation 2026-09-21, logged in as
`qable1`.

Matches the PDF test scenario "Batch Transaction Detail Popup".

## URL

No separate route — a Bootstrap modal overlaid on `#/payment` (Batch List
tab). Reached only by clicking a row's View icon; not directly navigable.

## Reaching this page

1. Reach the Payment screen's Batch List tab (`payment-batch-list.md`).
2. Click the **View** icon (eye glyph, `title="View Batch Data"`) in the
   pinned right-hand action column of any batch row.

## Selectors

| Element | Selector | Notes |
|---|---|---|
| View icon (trigger, on a Batch List row) | `i[title="View Batch Data"]` | Also carries `data-bs-toggle="modal"` and `data-bs-target="#modalBatchdetail"` — **that target id does not exist anywhere in the DOM** (confirmed: `document.querySelector('#modalBatchdetail')` returns null). The modal is actually opened by an Angular click handler, not native Bootstrap `data-bs-toggle` wiring. Don't rely on `#modalBatchdetail` as a locator. |
| Open modal | `.modal.show` | Several `.modal` elements are mounted in the DOM at once — confirmed: at least one other hidden modal (title "Batch", a `txtBatchModalDescription` field, "Create Batch"/"Post"/"Close" buttons — not yet documented as its own page, and not confirmed to be the same flow as `payment-batch-setup.md`'s full-tab Create Batch form) is present alongside this popup. Only the currently-open one carries Bootstrap's `.show` class. Same pattern as check-register.md's duplicate-tab-pane ids; scope everything to `.modal.show`. |
| Modal title | `.modal.show .modal-title` | Text: "Batch Detail # `<BatchNo>`" |
| Close (X) button | `.modal.show .btn-close` | `data-bs-dismiss="modal"` |
| Summary grid row | `.modal.show .ag-center-cols-container .ag-row` | ag-Grid; same center-container-only caveat as check-register.md (a pinned-column duplicate also exists) |
| Grid cells | `.modal.show .ag-center-cols-container [col-id="<name>"]` | Confirmed `col-id`s: `batch_no`, `batch_desc`, `status`, `tran_desc`, `gl_account` |

## Actions

- Click a Batch List row's View icon to open the popup.
- Click the X (close) button to dismiss it.

## Expected Outcomes

- The popup opens with a single-row grid showing that batch's Batch No,
  Batch Description, Status, Transaction Description, and GL Account, matching
  the row that was clicked (confirmed: batch #35066 → Batch No "35066", Status
  "Approved", GL Account "110201").
- The PDF's fuller field list for this popup (Client Type, Account Name, Acct
  Eff Date, Entry Date, Payer/Payee Name, etc. — see the PDF's page-3
  "Action — Verify View Batch Data" scenario) was **not** all visible in this
  pass; only 5 columns rendered without any observed horizontal-scroll or
  column-configuration interaction. Treat the wider field list as unconfirmed
  on this environment until the grid is scrolled/inspected further.

## Edge Cases / Known Quirks

- The trigger icon's `data-bs-target="#modalBatchdetail"` is a dead
  reference — confirmed no element in the DOM has that id. This looks like a
  copy-paste leftover from Bootstrap's usual data-attribute modal wiring, with
  the actual open/close behavior handled by Angular instead. Automation must
  locate the open modal via `.modal.show`, not by that id.
- At least one other modal is present-but-hidden in the DOM even when this
  popup is the one open (see the Selectors table) — always scope to
  `.modal.show`, never a bare `.modal`.
- **This popup's own grid renders its single data row twice**, both copies
  under `.ag-center-cols-container` itself — confirmed by direct observation
  (visible in the very first screenshot taken of this popup: two identical
  "35066 / POL_89 / Approved" rows). This is a different quirk from the
  usual center-container-vs-pinned-right-container row duplication documented
  in check-register.md and payment-batch-list.md (where the fix is to scope
  to the center container) — here, scoping to the center container still
  leaves 2 matching elements per cell, so a cell locator also needs
  `.first()`.

## Auto-discovered (needs review)
- (agent appends here; engineer reviews and folds into sections above)
