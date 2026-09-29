# Payment Upload — File Selection & Validation

## Overview

After choosing a file and clicking **Upload** on the Payment screen's Upload
tab (`payment-upload.md`), the app parses the file and splits its rows
between two sub-tabs: **Valid Invoice** and **Invalid Invoice**, each with a
count badge. Confirmed by direct observation 2026-09-21, logged in as
`qable1`, using two different files:

1. The app's own official sample template
   (`assets/DownloadExcel/payment_upload_sample.xlsx`, linked from the Upload
   tab's "Download" button) — contains 2 placeholder rows with fabricated
   codes (`CMP001` / `INV123456`, `CMP001` / `INV123455`). Uploading it
   unmodified: **Valid Invoice: 0, Invalid Invoice: 2**.
2. A file with real `AGT003` (this product's documented reference test
   entity — see `alis_core/knowledge/data.json`) rows referencing real
   invoice codes (`INV115540`, `INV115579-01` through `-10`, `INV115580`).
   Result is **not fixed** — it depends on whether those invoices are
   currently locked in another batch (see `business-rules.md`'s frozen-invoice
   rule):
   - Observed 2026-09-28 (attempt 1): **Valid Invoice: 0, Invalid Invoice: 12**
     — 11 rows failed with "Invoice is locked in Batch#39284", 1 with
     "Invoice not associated with selected Entity" (Entity dropdown left at
     its default "Dyad Inc", which didn't match).
   - Observed 2026-09-28 (attempt 2, same day, same file, done manually by
     the user): **Valid Invoice: 12, Invalid Invoice: 0** — none of the
     invoices were locked this time, so all rows landed Valid. This is the
     path that actually reaches Save Payment.
   - This exact file is committed as a test fixture at
     `alis_core/tests/fixtures/payment_upload_agt003_valid.xlsx` (copied from
     the user's own successful upload, `payment_upload_sample (29).xlsx`) —
     used by `alc_sc_payment_upload_save_payment.md`. Attempt 1's Entity
     mismatch row is avoided by selecting **Entity = "Dyad Tech DC"** (not
     the default "Dyad Inc") before uploading — see `payment-upload.md`.

The official sample template case still lands **zero** rows in Valid
Invoice. The real-`AGT003` file's outcome is data-state-dependent — check
which tab the rows land in after each upload rather than assuming either
outcome. See Edge Cases.

Matches the PDF test scenario "Payment Upload - File Selection & Validation".

## URL

Same as `payment-upload.md` — `#/payment`, Upload tab, resolved against
`ALIS_CORE_ACCOUNTING_BASE_URL`.

## Reaching this page

1. Reach the Payment screen's Upload tab (`payment-upload.md`).
2. Choose a file via the Choose Files control (`#fileuploadtab`).
3. Click Upload (`#pills-Upload button:has-text("Upload")`).

## Selectors

| Element | Selector | Notes |
|---|---|---|
| Valid Invoice tab | `page.getByRole('tab', { name: /Valid Invoice/ })` <!-- not an id --> | No `id` attribute at all (confirmed via live DOM) — must match by role/text. Badge count is part of the same element's text (e.g. "Valid Invoice 0"), so match with a regex, not an exact string |
| Invalid Invoice tab | `page.getByRole('tab', { name: /Invalid Invoice/ })` <!-- not an id --> | Same caveat. Appeared to become the active tab automatically after Upload during manual exploration, but this was **not reliable in automation** — a Playwright run that assumed auto-activation and read the grid without explicitly clicking this tab first saw 0 rows. Always click it explicitly before reading its grid, don't rely on the assumed default state. |
| Valid Invoice grid | `#GridValidInvoice` | `<ag-grid-angular>` component id; columns (confirmed via header text): Client Code, Invoice Code, Amount, Payment Type, Document Number, Description |
| Invalid Invoice grid | `.ag-center-cols-container .ag-row` (page-scoped — only one grid visible at a time since the tabs are mutually exclusive views, unlike the multi-modal-mounted pattern elsewhere in this app) | Confirmed `col-id`s: `client_code`, `invoice_code`, `remark` (Error Reason). Visible columns also include "Excel Row #" and, further right, a second grid section listing Batch No/Client Code/Client Name/Client Email for a "List Of Email Address Missing For Client" sub-case (`#modalvalidate`, `#GridValidate` — not exercised/documented further in this pass) |
| Save Payment button | `button:has-text("Save Payment")` | **Real write** — see Edge Cases |
| Cancel button (post-upload) | `button:has-text("Cancel")` | Distinct from the pre-upload Cancel button on the same tab; both share the same text, so scope by context if both are ever in play |
| Total Payment Amount | text `Total Payment Amount: $<amount>` | Reflects only Valid Invoice rows' amounts — `$0.00` when Valid Invoice is empty; only updates once rows are actually selected (checkbox), not just present in the grid |
| Valid Invoice header select-all checkbox | `#GridValidInvoice .ag-header-select-all input[type="checkbox"]` (take `.first()`) | Confirmed live 2026-09-28: ag-Grid renders **7 duplicates** of this checkbox, one per column header group (an accessibility-copy pattern — all 7 share the same aria-label and control the same underlying select-all state), so an un-scoped locator throws a Playwright strict-mode violation. `.first()` is sufficient — same class of duplication as this app's other `.ag-center-cols-container` vs `.ag-pinned-right-cols-container` row-duplication quirk, just for header checkboxes instead of rows. |
| Valid Invoice row checkbox | `#GridValidInvoice .ag-pinned-left-cols-container [row-index="<N>"] input[type="checkbox"]` | **Not inside the data row itself** — confirmed live 2026-09-28: this grid duplicates every row into two parallel DOM elements sharing a `row-index` attribute, same pattern as `check-register.md`'s pinned-right action-icon column, just pinned **left** here for the leading checkbox column instead of right. The row matched by its visible text/amount (under `.ag-center-cols-container`) has *no checkbox in it at all*; the checkbox lives in the separate `.ag-pinned-left-cols-container` duplicate at the same `row-index`. Two earlier automation attempts assumed the checkbox was inside the text-matched row and timed out waiting for an element that was never going to appear there. This grid also **vertically virtualizes rows** — with all 12 rows selected, the last row (the negative-amount one) isn't necessarily in the DOM until the grid is scrolled down; fixed the same way as `payment-batch-list.md`'s horizontal-scroll quirk, direct `scrollTop` + dispatched `scroll` event on `#GridValidInvoice .ag-body-viewport`, just vertical instead of horizontal. |
| Invalid Transactions modal | `.modal.show` containing text "Invalid Transactions" | Appears instead of a created batch when a selected row fails business validation (confirmed cause: negative payment amount) — same multi-modal-mounted pattern as `invoice-application.md`. Lists the rejected row(s) in a small table (Tran No / Client Code / Payment Type / Document Num / Description) and states "No payment batch was created." Has its own "Close" button. |
| Save Payment success toast | matched by text `/Payment Created Successfully/` <!-- fragile, no narrower selector captured --> | e.g. "Payment Created Successfully. Batch# 39299" — the batch number is parseable out of this text; no toast-library/container class was inspected in this pass |

## Actions

- Upload a file (see `payment-upload.md`) to trigger the Valid/Invalid split.
- Switch between the Valid Invoice and Invalid Invoice tabs to review each
  set.
- Select row checkbox(es) on Valid Invoice and click Save Payment — **now
  exercised**, gated on its own explicit confirmation each run (real write) —
  see `alc_sc_payment_upload_save_payment.md`.

## Expected Outcomes

- Well-formed rows referencing real, unlocked, entity-matching invoices are
  expected to land in Valid Invoice (per the PDF's original scenario,
  observed on the PDF's source environment/data — not reproduced here, since
  no such row was available to test against on this environment in this
  pass).
- Malformed/non-existent/conflicting rows land in Invalid Invoice with a
  human-readable Error Reason per row (confirmed reasons observed: "Invoice
  is locked in Batch#39284", "Invoice not associated with selected Entity").

## Edge Cases / Known Quirks

- **Clicking Upload can silently do nothing if a second browser tab from the
  same session is left open.** Root-caused via a network trace: when the E2E
  composition test's Agency Bank Setup step (which opens Admin Manager in a
  genuinely separate tab/window sharing the same browser context/session —
  see `agency-bank-setup.md`) was left open going into this step, the Upload
  click fired no request at all, both on the first click and a retry. The
  trace showed two `AuthBridge.aspx` re-authentication handshakes tied to
  the Admin Manager tab; the fix — closing that tab and reloading the
  original page before continuing — resolved it consistently across
  multiple runs. **Closing the Admin Manager tab (`AgencyBankSetupPage.close()`)
  and reloading the calling page immediately afterward is required** whenever
  Agency Bank Setup precedes any other write-ish action in the same
  session, not just this one. The retry-once logic in `clickUpload()` below
  is kept as a separate, narrower defense for its own (much rarer, unconfirmed
  root cause) single-click-swallow case — it did not by itself fix the
  two-tabs scenario.
- The official sample template's data is fabricated/placeholder and never
  matches anything real — always lands 0 rows in Valid Invoice, all in
  Invalid. The real-`AGT003`-data file's outcome instead depends on whether
  those invoices happen to be locked in another batch at upload time — see
  Overview: the *same file* landed 0/12 Valid on one attempt and 12/12 Valid
  later the same day, once nothing was locking them. **This is a known,
  documented business rule, not a bug** — see
  `alis_core/knowledge/business-rules.md`'s "Uploaded-batch invoices are
  frozen until the batch is posted (or deleted)": once a file's invoices are
  uploaded into a batch, they stay locked to it until that batch is deleted
  or posted. **If (and only if) an upload errors** with "Invoice is locked in
  Batch#<N>": go to Batch List, search for that batch number, select it, and
  click Del — then the same invoices can be re-uploaded and should land in
  Valid Invoice instead. **Do not delete a batch pre-emptively** — only do
  this in direct response to that specific error actually occurring (told
  directly by the user, 2026-09-28). This remediation itself has not yet been
  exercised by this automation, since no upload in this pass has actually hit
  that error — it's a genuinely consequential real write (deletes a batch
  record) and needs explicit confirmation before automating, same as every
  other real-write action in this suite. **The Valid Invoice → Save Payment
  path is now confirmed reachable** on this environment (2026-09-28, 12/12
  rows landed Valid) — automating that full run is a newly-unblocked open
  item, still gated on its own explicit confirmation before clicking Save
  Payment (see `alc_sc_payment_upload_file_validation.md`'s scope note, which
  predates this and should be revisited).
- Save Payment is a **real write** — applies the batch (per
  `payment-batch-list.md`'s "Create Batch performs a real write" note, same
  caution class). Automated by `alc_sc_payment_upload_save_payment.md` using
  the committed AGT003 fixture, gated on explicit user confirmation before
  each live run.
  - **Root cause found and fixed 2026-09-28, via the user's manual repro**:
    the fixture's last row (`INV115580`) has a **negative amount** (`-$10.00`
    "Cash"). Selecting it alongside the other 11 rows and clicking Save
    Payment rejects the *entire* selection: an **"Invalid Transactions"**
    modal appears (`.modal.show` containing "Invalid Transactions", same
    multi-modal-mounted pattern as `invoice-application.md`), listing the
    offending row(s) and stating *"The following transaction(s) could not be
    saved. No payment batch was created — Please correct the amount and
    upload again."* **No batch is created at all** while any negative-amount
    row is selected, even though the other 11 rows are individually valid.
    Deselecting just that one row and clicking Save Payment again succeeds —
    confirmed via the app's own success toast, *"Payment Created
    Successfully. Batch# 39299"*, and independently verified in Batch List
    (searched Batch No "3929" → #39299 now exists, dated 09/28/2026,
    $380.51, Agency — didn't exist before this run).
  - This explains the two earlier failed automated attempts (which selected
    all 12 rows including the negative one): both got `HTTP 200` back from
    `POST .../api/payment/UploadPaymentBatch` with an **empty response
    body**, which looked like a mystery failure until the modal — which the
    automation wasn't watching for — was found to be exactly what a `200`
    with no batch created actually means on this endpoint. **The HTTP status
    alone cannot distinguish success from this business-validation
    rejection** — both return `200`. The reliable signal is which UI element
    appears afterward: the "Invalid Transactions" modal, or the success
    toast. `paymentUploadSavePaymentPage.waitForSaveOutcome()` races the two.
  - The automation now deliberately reproduces the rejection first (selects
    all 12, confirms the modal, closes it), then deselects the negative row
    and saves the remaining 11 for real — matching the user's exact manual
    repro steps and keeping that failure mode covered rather than just
    worked around silently.
  - **Not idempotent across re-runs**: a successful Save Payment freezes
    these invoices in the new batch (see `business-rules.md`'s
    frozen-invoice rule) — confirmed repeatedly: batch **#39299** (first live
    run, deleted manually by the user afterward), then batch **#39304**
    (second live run, after two automation bugs below were fixed). A
    subsequent run of this spec against unmodified state will find these
    same invoices locked in whichever batch was created last and correctly
    stop at the "12 rows land in Valid Invoice" assertion rather than reach
    Save Payment again — expected, not a regression (see the conditional
    delete-to-unblock remediation above, which needs to run against that
    batch first for a genuine re-run of the Valid path).
  - **Two further automation-only bugs found and fixed after the first
    success (batch #39299), while chasing a clean second run:**
    1. The negative-amount row's checkbox isn't inside the row matched by
       its visible text — see the row-checkbox Selectors entry above for the
       full pinned-left-duplicate explanation. Unchecking the wrong (missing)
       element caused a 90s timeout with no useful signal, until the
       accessibility-tree snapshot in the failure's `error-context.md`
       revealed two parallel rowgroups (one with checkboxes, no data; one
       with data, no checkboxes) sharing `row-index`.
    2. After a successful save, the app **auto-navigates to the Batch List
       tab by itself** — a test step that unconditionally re-clicked that
       tab timed out against the overall test budget waiting on a
       `#pills-batch-tab` click that was unnecessary. Fixed by making
       `openBatchListTab()` a no-op when that tab is already active.
  - **Confirmed reliable across six consecutive live runs** (2026-09-28,
    after the two fixes above): batches **#39299**, **#39304**, **#39306**,
    **#39308**, **#39310** — each a genuine Save Payment success (a sixth
    run's own network trace also showed a successful save+reload sequence,
    though that run wasn't independently followed up in Batch List). Every
    one of these runs actually completed the write correctly, but several
    still reported as *failed* in the test result, because the trailing
    "confirm the batch in Batch List" step raced against the spec's own
    overall `test.setTimeout` and lost. **Root-caused, not just
    timeout-raised**: a trace/network inspection of one such "failure" showed
    the entire real work (both `UploadPaymentBatch` calls, plus the
    post-save `GetPaymentBatches` reload) completing in under 15 seconds —
    then nothing happened for the remaining ~4.7 minutes until the outer test
    timeout force-closed the browser, with the stack trace pinned exactly at
    `openBatchListTab()`'s `locator.click()`. Playwright's own actionability
    wait on a bare `.click()` has no bounded timeout of its own by default,
    so a click that can't complete rides the *entire* remaining global test
    budget instead of failing fast with a diagnosable error. Fixed by giving
    that specific click its own short explicit timeout (`{ timeout: 15_000
    }`) — a failure there is now immediate, not a multi-minute hang, since
    by the time it runs the actual write has already succeeded and this is
    only a nice-to-have final verification. The overall `test.setTimeout`
    (300s) is left as-is as a safety margin for the rest of the flow's
    genuine run-to-run variance (otherwise-identical runs have ranged from
    ~20s to several minutes) — check Batch List directly first if a timeout
    failure ever recurs, rather than reading it as evidence the write didn't
    happen (see Notable behavior above: a `200`/empty-body response is not
    itself proof of success or failure either way).
    #39299 and #39304 were deleted afterward (manually, by the user); #39306
    and #39308 were left in place — repeatedly re-running this real-write
    spec to chase one fully-green report is not worth the toil of manually
    deleting a fresh batch after every attempt, once the underlying
    correctness was already well-established.
- The Valid/Invalid Invoice tab buttons carry no `id` at all — use
  role/text-based locators.

## Auto-discovered (needs review)
- (agent appends here; engineer reviews and folds into sections above)
