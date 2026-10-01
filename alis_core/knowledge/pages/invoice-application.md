# Invoice Application

## Overview

A full-screen modal ("Invoices" / `app-pay-invoices`) for applying a payment
record against outstanding invoices — search/filter outstanding invoices for
the record's client, select which to apply the payment to, and Save. Reached
from a batch's **Payment** tab (`payment-batch-setup.md`-adjacent — see
"Reaching this page"), on the ALIS Accounting module. Confirmed by direct
observation 2026-09-21, logged in as `qable1`.

Matches the PDF test scenarios "Invoice Application - Save & Select (+) Icon
at grid" and "Invoice Application Screen - Filters". The Filters scenario's
Quick Search / Based On / Client (disabled) / Billing Method coverage was
extended and confirmed by direct observation 2026-09-28, also logged in as
`qable1`.

## URL

No separate route — a full-screen Bootstrap modal (`modal-fullscreen`)
overlaid on `#/payment`. Reached only by clicking a payment record's "Add
Invoice" (+) icon; not directly navigable.

## Reaching this page

Step 1's batch can be a specific one confirmed to exist, instead of
"whichever is first" - read the first row's Batch No, then re-isolate the
grid to that exact number via the Filters side panel's (Select All) recipe
(same mechanism as `payment-batch-list.md`'s Selectors table /
`batchListSearchByNumber.page.ts`) before proceeding to step 2 - confirmed
live 2026-09-29.

1. Reach the Payment screen's Batch List tab (`payment-batch-list.md`).
2. Click a batch row's **Transaction Add/Edit** icon (pencil glyph;
   `i[title^="Transaction Add/Edit"]` — its `title` attribute has a trailing
   space, `"Transaction Add/Edit "`, so match with a `^=` prefix selector, not
   an exact match). This opens that batch's own **Payment** tab, listing its
   individual payment records (one row per uploaded/entered payment).
3. Click a payment record row's **Add Invoice** (+) icon
   (`i[title="Add Invoice"]`, green plus-circle glyph, in the pinned-right
   action column). This opens the Invoice Application modal.

## Selectors

| Element | Selector | Notes |
|---|---|---|
| Payment tab's Add Invoice icon (trigger) | `i[title="Add Invoice"]` | Pinned right-hand action column of a payment record row, same duplicate-row-container pattern as check-register.md/payment-batch-list.md |
| Open modal | `.modal.show` | Same multi-modal-mounted pattern as elsewhere in this app — scope everything here |
| Quick Search field | `#FilterText` | text input; confirmed live 2026-09-28 — accepts free text (e.g. "INV"), re-running Search with it set doesn't error, no specific result set asserted (see Edge Cases) |
| Based On dropdown | `#ddlBasedon` | native `<select>`; options/values: Acct Eff Date (`ACCTEFFDATE`, default), Due Date (`DUEDATE`), Invoice Date (`INVOICEDATE`) — confirmed switching to Due Date and re-searching works without error |
| From Date | `#FromDt input` <!-- fragile --> | custom `<app-date-picker>`, no id on inner input — same pattern as payment-upload.md/check-register.md's date fields. **Not driven by automation** — see Edge Cases |
| To Date | `#ToDt input` <!-- fragile --> | same component. **Not driven by automation** — see Edge Cases |
| Client field | `#txtClient` | text input; formcontrolname `txtClient`; pre-filled with the payment record's client code on open (e.g. "CMP1425"). Confirmed live 2026-09-28: both `disabled` and `readonly` once populated — an agent cannot change which client this application is scoped to |
| Billing Method multiselect | `#ddlBillingMethod` | `ng-multiselect-dropdown`, same component/interaction pattern as check-register.md's filters (checkbox `<li>` rows, `aria-label`-matched, click the row not the input — confirmed live: clicking the raw checkbox input directly fails Playwright's actionability check because its own label `<div>` intercepts pointer events). Options confirmed live: Select All (`aria-label="multiselect-select-all"`), Agency Bill, Direct Bill to Company (default selected), Direct Bill to Insured, Direct Bill to Lien Holder. Closed control shows selections as removable chips, same as check-register.md's multiselects |
| Binding checkbox | `#chkBinding` | default: checked |
| Brokerage checkbox | `#chkBrokerage` | default: checked |
| Paid checkbox | `#chkPaid` | default: unchecked |
| Receivable Vouchers checkbox | `#chkAcctInv` | default: unchecked. Note the id doesn't match the label text (`AcctInv`, not e.g. `chkReceivable`) |
| Payable Vouchers checkbox | `#chkPayableVoucher` | default: checked |
| A/R Paid checkbox | `#chkARPaid` | default: unchecked |
| Financed checkbox | `#chkIsFinanced` | default: unchecked. Labeled "Financed" in the live DOM — the PDF's "A/R Financed" wording for this scenario likely refers to this checkbox, not confirmed 1:1 |
| Search button | `.modal.show button:has-text("Search")` | no id |
| Select All / UnSelect All / Top-Up Selection buttons | `.modal.show button:has-text("Select All")` etc. | no ids; not exercised in this pass |
| Export to Excel button | `.modal.show button:has-text("Excel")` | not exercised |
| Close button | `.modal.show button:has-text("Close")` | dismisses without saving |
| Save button | `.modal.show button:has-text("Save")` | **real write** — applies the payment to selected invoices; not exercised in this pass |
| Outstanding invoice grid row | `.modal.show .ag-center-cols-container .ag-row` | ag-Grid; same center-vs-pinned-right duplication caveat as check-register.md |
| Invoice grid cell | `.modal.show .ag-center-cols-container [col-id="<name>"]` | Confirmed columns (header text, left to right): Invoice Code, Invoice Amt, Due Amt, Current Payment, Write-Off, Revise Due, Unposted Amount, AR Due, AR Paid, AR Total, Client Code, Client Name, Submission Code, Quote Code, Policy Number, Insured, Billing, Authority, Agency, Market, Finance, Risk Company Code, Risk Company Name, Invoice Date, Acct Eff Date, Due Date, Transaction Eff Date, Team, Office, Entity, Cost Center, Premium Amount, Total Fees, Total Taxes, Policy Effective Date, Policy Expiration Date, Policy Status, Invoice Status, Transaction, Finance Code, Transaction Description, Last Update Date, Reversed, Invoice Message, Invoice Reason, Agency Commission (%), Agency Commission Amt, Gross Commission (%), Gross Commission Amt, Gross Premium Amt, Locked Batch, Action. The `col-id` values themselves weren't individually captured for every column in this pass (ag-Grid uses numeric/short ids for several, e.g. `"0"`, `"1"`, not the header text) — resolve per-column `col-id`s as each is actually automated, don't assume a name matches its header. |

## Actions

- Click Search to re-run the outstanding-invoice query with the current
  filters (Quick Search / Based On / date range / Client / Billing Method /
  checkboxes).
- Type into Quick Search and re-run Search — confirmed live: accepts input,
  Search re-runs without error. No specific result set asserted (production-
  looking environment, data changes over time).
- Switch Based On from Acct Eff Date to Due Date, then to Invoice Date, then
  re-run Search after each confirmed live 2026-09-29: dropdown value changes,
  Search re-runs without error, for both options.
- Open the Billing Method multiselect, use Select All (or an individual
  option's row), close the panel, then re-run Search — confirmed live: panel
  opens, selection changes reflect in the closed control's chips, Search
  re-runs without error. See Edge Cases for the label-covers-input click
  quirk.
- Confirm the Client field is disabled/readonly (an agent cannot retarget
  which client this application applies to) — confirmed live.
- Toggle Binding / Brokerage / Paid / Receivable Vouchers / Payable Vouchers /
  Financed independently, then re-run Search — confirmed present and
  independently togglable (matches the PDF's "Invoice Application Screen -
  Filters" scenario), full before/after result-set comparison not exercised
  in this pass.
- Click Close to dismiss without saving.
- Click Save to apply the payment to whichever invoice rows are selected —
  **not exercised** (real write against production-looking data).

## Expected Outcomes

- Opening the modal for a payment record auto-populates Client with that
  record's client code and runs an initial search — confirmed: opening it for
  a $100 payment against client "CMP1425" returned exactly 1 outstanding
  invoice row ("INV106851").
- The full outstanding-invoice column set (see Selectors table) renders with
  real data.

## Edge Cases / Known Quirks

- Same multi-modal-mounted-at-once pattern as `batch-transaction-detail-popup.md`
  — scope everything to `.modal.show`.
- The Batch List row's "Transaction Add/Edit" icon's `title` attribute has a
  trailing space (`"Transaction Add/Edit "`) — same quirk class as
  `payment-batch-list.md`'s tab-button-id trailing-space finding. Use a
  prefix (`^=`) selector, not an exact match.
- **Save performs a real write** against a client's real outstanding
  invoices in this production-looking environment (same caution as Create
  Batch — see `payment-batch-list.md`'s "Notable behavior"). No automation in
  this pass exercises it.
- This screen's own field naming doesn't always match its `id` (e.g.
  "Receivable Vouchers" is `#chkAcctInv`, not something containing
  "receivable") — always confirm an id against its actual rendered label
  before use, don't infer one from the other.
- **From/To Date pickers are not driven by automation.** Both are the same
  fragile `app-date-picker` component documented elsewhere in this app
  (payment-upload.md's Acct Eff Date field, check-register.md's date
  fields) — no `id`/`formcontrolname` on the actual `<input>`, and opening
  the picker renders a separate calendar popup whose own DOM wasn't
  characterized in this pass. Rather than invent a fragile popup-driving
  routine against a component nobody has automated yet in this app, this
  pass only exercises the Based On dropdown switch and leaves the date
  range at its default (3/28/2026–9/28/2026 at the time of this pass). If a
  future pass needs to actually change these dates, characterize the popup
  live first — don't guess at its selectors.
- **Billing Method's checkbox inputs can't be clicked directly** — same
  quirk as check-register.md's Client Type filter. Each `<li>` row's own
  label `<div>` visually overlaps the checkbox `<input>`, so Playwright's
  actionability check fails with "intercepts pointer events" if you target
  the input. Click the `<li>` row (via `xpath=ancestor::li[1]` from the
  input) instead, same as check-register.md's `clientTypeOptionRow()`
  pattern.
- The Client field is confirmed **disabled and readonly** once populated —
  not just "possibly disabled" as an earlier pass guessed. Direct DOM
  inspection 2026-09-28: `disabled=true`, `readOnly=true`.
- This production-looking environment's Payment/Batch List screen re-renders
  fairly frequently while idle (observed during manual exploration: element
  references captured moments apart can already be stale, and the screen can
  silently fall back to the Batch List tab). Automation should keep gaps
  between locating an element and acting on it as short as possible and
  prefer Playwright's own auto-waiting/retrying locators over multi-step
  manual coordinate-based interaction sequences — the Playwright test itself
  did not hit this issue when run end-to-end.

## Auto-discovered (needs review)
- (agent appends here; engineer reviews and folds into sections above)
