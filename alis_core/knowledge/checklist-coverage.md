# Checklist Coverage: "ALIS Accounting - Bulk Payment Upload to Remittance - End-to-End Test Cases"

Reconciliation between this automation suite and the source PDF (`ALIS Core Test
Case flow of payment.pdf`, 4 pages, 30 distinct Sub-Module/Test Scenario rows).
Built 2026-09-30 by extracting the PDF's text directly (via `pypdf`) and
cross-checking each row against the actual test code, not just the scenario
`.md` files' prose.

Status legend: [x] fully automated, no caveats · [~] partially automated
(real environment checked less exhaustively than the PDF's exact field list,
or a sub-filter deliberately skipped) · [ ] not automated at all.

## Coverage table

| # | PDF Test Scenario | Status | Notes |
|---|---|---|---|
| 1 | Login & Switch to Accounting | [x] | `alis_core/tests/login/login.test.ts` |
| 2 | Accounting Landing Page (via ChocoBox menu) | [~] | Navigates via direct URL, not the ChocoBox/hamburger menu click path - a deliberate, documented choice for reliability (see `payment-upload.md`), not an oversight |
| 3 | Payment Upload - Batch Setup | [~] | Client Type/Acct Eff Date/Entity/Bank GL automated; **Cost Center** field doesn't exist on our prod test environment (documented environment difference vs. the PDF's preprod-alisblue environment, not a gap) |
| 4 | Agency Admin - Bank Setup | [~] | Panel/grid/dropdown confirmed visible; not a field-by-field check of every value the PDF lists (Bank #, Account #, Direct Deposit, Account Validated, etc.) |
| 5 | Payment Upload - File Selection & Validation | [x] | Uses our own AGT003 fixture (12 rows) instead of the PDF's 2-row sample file - same mechanism, different data |
| 6 | Payment Upload - Save & Auto-Batch Creation | [x] | Real write, confirmed batch creation |
| 7 | Batch List - New Batch Verification | [x] | Isolated to the exact created batch |
| 8 | Payment Tab - Individual Payment Records | [x] | Column population, incl. horizontal scroll |
| 9 | Invoice Application - Save & Select (+) icon (Due/Revise recalculation) | [ ] | Never clicks Save in Invoice Application (avoids a real write) - the PDF's core assertion here (amount recalculation after save) is never exercised |
| 10 | Invoice Application - Filters | [x] | Vouchers, Quick Search, Based On (Due/Invoice/Acct Eff Date), Client field disabled, Billing Method |
| 11 | Batch Transaction Detail Popup | [x] | Title + batch_no match confirmed |
| 12 | PDF Generation | [x] | Covered by Batch List/Check Register PDF export |
| 13 | Edit Payment Details (Payee/Mode/Address) | [ ] | Real write, never attempted |
| 14 | Back to Batches Navigation | [x] | |
| 15 | Search Batch# (Batch List) | [x] | |
| 16 | Edit Batch Detail (+ "Batch updated successfully" toast) | [ ] | Real write, never attempted |
| 17 | View Batch Data popup (full field list) + embedded "Verify Delete" | [~] | Popup open/close automated; not every one of the ~23 listed fields individually asserted; Delete is documented (`payment-batch-list.md`) but not automated - blocked by this session's sandbox classifier (2026-09-30) |
| 18 | Batch Prepared (Prepare button) | [ ] | Investigated 2026-09-30 - blocked by this session's sandbox classifier, same class as Post NACHA (see `payment-batch-list.md`'s Open Items) |
| 19 | Check Register (reach + default filters) | [x] | Check Status=Prepared is the default state used, matching the PDF |
| 20 | Check Register - Filters | [x] | Banks/Payment Type/Client Type/Columns automated; Acct Eff Date range now automated too (2026-09-30 - confirmed `.fill()` works despite no `id` on the inner `app-date-picker` input, contradicting the earlier "fragile, skip it" assumption) |
| 21 | Search By Batch No (Check Register) | [x] | |
| 22 | View action (Batch Transaction Detail from Check Register) | [x] | Automated 2026-09-30 - confirmed it opens the same popup as #11 with a matching `batch_no` cell, from this specific entry point, not just assumed |
| 23 | Check Summary (field verification) | [x] | Deepened 2026-09-30 to full 20-field coverage (all col-ids incl. numeric Payee Address1/2/City/State/Zip) across three horizontal-scroll checkpoints, since ag-Grid virtualizes columns both in and out as the modal grid scrolls |
| 24 | Edit Check Summary Detail | [~] | Deepened 2026-09-30 - reverse-engineered the real mechanism (row click auto-populates a plain reactive form below the grid, confirmed via a genuine `POST .../Checkregister/UpdateCheckPayeeInformation` when the user manually clicked Update); automation selects the row and asserts the form auto-populates correctly, but never clicks Update itself (real write, deliberately skipped) |
| 25 | Export PDF (Check Summary's own icon) | [~] | Unchanged - still overlaps with Batch List/Check Register PDF export coverage; no dedicated Check-Summary-specific check added |
| 26 | Check Register - Export (Excel, filename pattern) | [x] | Filename pattern confirmed and tightened 2026-09-30 to `/^CheckRegister_.+_To_.+\.xlsx$/i` (real pattern verified live, not assumed) |
| 27 | Check Register - Approve | [~] | Coded 2026-09-30 - `selectFirstRow()`/`clickApprove()` are real, working, typechecked page-object methods, and the button was confirmed always-enabled regardless of selection (same pattern as other real-write buttons); the actual test step that calls them is deliberately left commented out in both `checkRegister.test.ts` and the merged e2e test, per explicit instruction, so it never executes |
| 28 | Check Register - Print Check (5 sub-scenarios) | [ ] | Genuinely blocked - opens a separate native client application our browser automation can't drive (confirmed by direct network/DOM observation, see `print-check.md`) |
| 29 | Check Register - Remittance Advice (PDF + Excel match) | [x] | Deepened 2026-09-30 - filename patterns confirmed and tightened (`RemittanceAdvice_<YYYYMMDD>.pdf` / `.xls`, date-stamped not batch-stamped); PDF content verified via `pypdf` against a real downloaded file (title, Printed On, Bank Name, Payee, Check No., Date, Amount, policy detail row); both PDF and Excel downloads now exercised |
| 30 | ACH/EFT & Check Tab (Is ACH flag + 7 action icons) | [x] | All action icons confirmed present, Is ACH cell checked (Yes/No, not asserted to a specific value) |

## Summary

- **18 fully automated** (#1, 5-8, 10-12, 14, 15, 19-23, 26, 29, 30)
- **7 partially automated** (#2-4, 17, 24, 25, 27)
- **5 not automated** (#9, 13, 16, 18, 28)
  - 2 are real-write actions never attempted by design (Edit Payment Details
    #13, Edit Batch Detail #16) - each would mutate production-looking data
    with no test-only environment to isolate the change to. Edit Check Summary
    Detail (#24) and Approve (#27) are no longer in this bucket - both now
    have real, working, deliberately-uninvoked code (see their notes above)
    rather than being uninvestigated.
  - 3 hit hard blockers investigated this session (2026-09-30):
    - **Print Check** (#28): architecturally blocked - opens a separate
      client application, not a same-page modal.
    - **Prepare / Post NACHA** (#18): both buttons are always-enabled with no
      row-selection gate (confirmed via read-only exploration), meaning they
      likely act on the whole filtered grid rather than one selected batch -
      this session's own safety classifier refused to script a real click.
    - **Delete a batch** (#17's embedded sub-item): the confirm-modal
      behavior and success-toast text are fully documented in
      `payment-batch-list.md` (from the user's own manual clicks), but
      scripting the click itself was refused by the same safety classifier.

## Composed end-to-end tests

Two tests stitch most of the above into single continuous sessions, matching
the PDF's own overall narrative rather than testing each page in isolation:

- `alis_core/tests/e2e_bulk_payment_upload_to_remittance/` - read-only walk
  (no Save Payment), composing #1-4 and #7 onward.
- `alis_core/tests/e2e_full_flow_with_save_payment/` - the same, plus the
  real Save Payment write (#6), with every downstream step isolated to the
  exact batch that run creates (fixed 2026-09-30 - see git history for the
  `:visible` filter-panel fix and the row-virtualization scroll fix that made
  this reliable). Extended 2026-09-30 to also fold in the deepened #20-30
  coverage (Acct Eff Date range, View icon, Check Summary's full field
  coverage and edit mechanism, Remittance Advice PDF+Excel, commented-out
  Approve) into steps 15-17. Those steps deliberately act on whichever
  Prepared/Approved row is present in their own grids rather than searching
  for the batch this run itself created, since a same-day Open-status batch
  is never guaranteed to appear there (there is no automatable Open→Prepared
  transition - the "Prepare" button is blocked, same as #18 above) -
  isolating them to that batch would make them permanently no-op every run
  instead of adding real verification.

## Source

PDF: "ALIS Core Test Case flow of payment.pdf" (also titled internally "ALIS
Accounting - Bulk Payment Upload to Remittance - End-to-End Test Cases"),
provided by the user 2026-09-30. Text extracted via `pypdf` since this
environment's `pdftotext.exe` (Git-for-Windows' mingw64 build) crashed with a
DLL-load exit code; `pypdf` worked directly. Environment note: the PDF's own
screenshots/URLs reference `preprod-alisblue.dyadtech.com`, while this
automation suite targets `prod-alis-4-1-21.dyadtech.com` (see `app.md`) -
treated as the same application under test per prior direction from the user,
but explains minor UI/field differences (e.g. Cost Center) called out above.
