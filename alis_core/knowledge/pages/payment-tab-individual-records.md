# Payment Tab — Individual Payment Records

## Overview

The batch-level **Payment** tab of the ALIS Accounting Payment screen — a grid
listing the individual payment records that make up one batch's upload (one
row per uploaded/entered payment), plus per-row actions (Add Invoice / Edit
Transaction / View Payment data / PDF Export / Delete Transaction). Reached
only from a specific batch on the Batch List tab (`payment-batch-list.md`);
previously used only as a stepping-stone toward `invoice-application.md`
("Add Invoice" icon) but never itself documented. Confirmed by direct
observation 2026-09-28, logged in as `qable1`, against Batch # 35066 (2
payment records, $100.00 each, Total Payment Amount $200.00).

## URL

No separate route — same `#/payment` hash as `payment-batch-list.md`. The
tab itself only appears (and only becomes selectable) after opening a batch
via its Transaction Add/Edit icon; it isn't directly navigable/deep-linkable.

## Reaching this page

1. Reach the Payment screen's Batch List tab (`payment-batch-list.md`),
   `#/payment` resolved against `ALIS_CORE_ACCOUNTING_BASE_URL`.
2. Click a batch row's **Transaction Add/Edit** icon (pencil glyph, pinned
   right-hand action column; `i[title^="Transaction Add/Edit"]` — its
   `title` attribute has a trailing space, `"Transaction Add/Edit "`, so
   match with a `^=` prefix selector, not an exact match — same quirk as
   `invoice-application.md`). This adds and activates a new **Payment** tab
   (`#pills-payment-tab`, target `#pills-payment` — this tab button's own id
   has **no** trailing-space quirk, unlike several of this screen's other
   tabs; confirmed via live DOM) alongside the existing Batch List / ACH-EFT
   & Check / Upload tabs, and switches to it. The footer bar shows
   `Batch # : <n>, Total Payment Amount : $<total>` and a "← Back to
   Batches" button while this tab is active.

## Selectors

| Element | Selector | Notes |
|---|---|---|
| Payment tab button | `page.getByRole('tab', { name: 'Payment' })` | Confirmed clean id `pills-payment-tab` (no trailing space), but role locator used for consistency with this screen's other tabs |
| Payment tab-pane container | `#pills-payment` | Scope all selectors below under this, same pattern as `payment-batch-list.md`'s `#pills-batch` / `check-register.md`'s `#pills-cashlisting` |
| Grid row | `#pills-payment .ag-center-cols-container .ag-row` | ag-Grid; same center-vs-pinned-right row-duplication caveat as `payment-batch-list.md`/`check-register.md` — **do not** assert row count against a bare `.ag-row` locator |
| Grid cell (any column) | `#pills-payment .ag-center-cols-container [col-id="<name>"]` | See column list below |
| Grid row-action cell | `#pills-payment .ag-pinned-right-cols-container [col-id="<name>"]` | Pinned right-hand action-icon columns (Add/Edit/View/PDF/Del), same duplicate-row pattern |
| "Back to Batches" button | `page.getByRole('button', { name: 'Back to Batches' })` (equivalent to `button:has-text("Back to Batches")`) | Footer bar; returns to the Batch List tab. Confirmed live 2026-09-28: clicking it switches the active tab back to "Batch List" (`#pills-batch`) and the Batch List grid is visible/populated again — see `alis_core/tests/batch_list_back_navigation/` for the automated round-trip (open a batch's Payment tab, confirm it, click this, confirm Batch List again) |

### Grid columns (confirmed via live DOM 2026-09-28)

Center-container columns, left to right, with confirmed `col-id`s (the grid
needs a real horizontal wheel-scroll gesture to render columns past "Status"
— same ag-Grid column-virtualization quirk as `payment-batch-list.md`;
setting `scrollLeft` directly via JS did **not** render them, only a real
`page.mouse.wheel()`/hover+wheel gesture did):

- **No.** (`col-id="0"`) — 1-based row sequence number within this batch,
  e.g. "1", "2". Not a stable business key, just render order.
- **Client Type** (`col-id="client_type"`) — e.g. "MARKET" (upper-cased,
  unlike `payment-batch-list.md`'s `client_type_text` on the Batch List grid
  which is title-cased "Market" — these are different fields on different
  grids, don't conflate them).
- **Client** (`col-id="1"`) — client code + name, e.g. "CMP1425 - AMERICAN
  SAFETY INSURANCE COMPANY".
- **Mode** (`col-id="payment_mode"`) — e.g. "Check".
- **Acct Eff Date** (`col-id="apply_dt"`) — e.g. "08/20/2024".
- **Payment Amt** (`col-id="payment_amt"`) — dollar amount, e.g. "$100.00".
- **Adj Amt** (`col-id="adj_amt"`) — dollar amount, e.g. "$0.00".
- **Bank GL** (`col-id="bank_gl"`) — e.g. "110201".
- **Status** (`col-id="2"`) — e.g. "Complete". Rendered column width is only
  ~30px (narrowest column on the grid) — text likely clips/relies on a
  tooltip; read via `textContent()`, not visual inspection.
- **Tran Description** (`col-id="tran_desc"`) — free text; **can be
  legitimately empty** (confirmed: row 1 of batch 35066 has an empty Tran
  Description) — don't assert non-empty on this column.
- **Doc No** (`col-id="document_num"`) — e.g. "467". **Can be legitimately
  empty** (confirmed: row 2 of batch 35066 has an empty Doc No) — don't
  assert non-empty on this column either.
- **User** (`col-id="createdby"`) — e.g. "Avdhesh Joshi" (single space here,
  unlike `payment-batch-list.md`'s `createdby` on the Batch List grid which
  had a double space — real-data quirk, don't assume consistent whitespace
  across grids/rows).
- **Updated Date** (`col-id="last_updated_dt"`) — e.g. "04/08/2024".

Pinned-right action-icon columns, left to right (own coordinate space,
contiguous immediately after "Bank GL"/"Status" in visual layout even though
DOM-order/col-id numbering differs from the center columns):

- **Add** (`col-id="3"`) — green plus-circle-fill icon,
  `i[title="Add Invoice"]` (exact match, no trailing-space quirk here —
  confirmed via live DOM, unlike the Batch List row's own
  "Transaction Add/Edit" icon). Opens `invoice-application.md`'s modal.
- **Edit** (`col-id="4"`) — pencil icon, `i[title="Edit Transaction"]`. Not
  exercised in this pass (opens the record for editing — presumed write
  surface).
- **View** (`col-id="5"`) — eye icon, `i[title="View Payment data"]`,
  `data-bs-toggle="modal" data-bs-target="#modalPaymentdet..."` (truncated
  in live DOM capture — id not fully confirmed). Opens a payment-detail
  popup, not yet its own knowledge page. Not exercised in this pass.
- **PDF** (`col-id="6"`) — red PDF icon, `i[title="PDF Export"]`. Not
  exercised in this pass (presumed download).
- **Del** (`col-id="7"`) — trash icon, `i[title="Delete Transaction"]`.
  **Not exercised** — real, destructive write (same caution as
  `payment-batch-list.md`'s Del column).

## Actions

- Click a batch's Transaction Add/Edit icon on Batch List to reach this tab
  (see "Reaching this page").
- Click a record row's Add icon to open `invoice-application.md`'s modal for
  that record.
- Click "Back to Batches" to return to the Batch List tab — automated in
  `alis_core/tests/batch_list_back_navigation/`.
- Edit / View / PDF Export / Delete Transaction icons — not exercised in
  this pass; each is a candidate for its own knowledge page once exercised
  (matches the pattern of `batch-transaction-detail-popup.md`,
  `check-summary-popup.md` being split out from their own trigger points).

## Expected Outcomes

- Opening a batch's Transaction Add/Edit icon reliably lands on this tab
  with the grid populated by that batch's real, already-saved payment
  records (not empty/demo data) — confirmed: Batch # 35066 shows exactly 2
  rows (CMP1425 $100.00, CMP1339 $100.00), matching the footer's
  "Total Payment Amount : $200.00".
- Each row's Client, Mode, Acct Eff Date, Payment Amt, Bank GL, Status, User,
  and Updated Date columns render with real, non-empty data. Tran
  Description and Doc No may legitimately be empty per-row (see column
  notes above) — don't assert non-empty on those two.

## Edge Cases / Known Quirks

- **Same multi-row-container ag-Grid pattern as `payment-batch-list.md` and
  `check-register.md`.** Every data row is duplicated into two DOM elements
  — once under `.ag-center-cols-container` (main columns) and once under
  `.ag-pinned-right-cols-container` (the pinned Add/Edit/View/PDF/Del action
  column), sharing the same underlying row. Scope grid-row/cell locators to
  `.ag-center-cols-container` unless specifically targeting an action icon.
- **Column virtualization needs a real scroll gesture.** Columns past
  "Status" (Tran Description, Doc No, User, Updated Date) don't render until
  the grid is actually scrolled horizontally via a genuine wheel/scroll
  event — setting `scrollLeft` directly via JS did not trigger it. Same
  quirk as `payment-batch-list.md`.
- The batch-level Payment tab (`#pills-payment-tab` / `#pills-payment`) is
  added to the DOM dynamically the first time a batch is opened in the
  session — it doesn't exist until then, so don't assume
  `getByRole('tab', { name: 'Payment' })` is present immediately after
  landing on `#/payment`.
- This is the same production-looking environment as the rest of the Payment
  screen — real batch/payment data, not fixtures. Batch # 35066's exact 2
  rows / dollar amounts are only stable as long as that batch continues to
  exist unmodified; don't hardcode an assumption that every batch has
  exactly 2 records.
- `client_type` on this grid (e.g. "MARKET", upper-cased) is a different
  field from `payment-batch-list.md`'s `client_type_text` (e.g. "Market",
  title-cased) on the Batch List grid — same concept, different casing/
  `col-id`, don't conflate them when writing assertions.
- **`aria-selected` on these tab buttons is not kept in sync with which tab
  is actually active** — confirmed live 2026-09-28: after opening a batch's
  Payment tab, its button reports `aria-selected="false"` while the Batch
  List tab's button still reports `aria-selected="true"`, even though the
  Payment tab's pane (`nav-link active` class) is the one actually showing.
  Don't assert active-tab state via `aria-selected`; assert on the relevant
  pane's own content (e.g. its grid rows) becoming visible instead — see
  `alis_core/tests/batch_list_back_navigation/`.

## Auto-discovered (needs review)
- (agent appends here; engineer reviews and folds into sections above)
