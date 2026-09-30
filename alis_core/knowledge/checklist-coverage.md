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
| 20 | Check Register - Filters | [~] | Banks/Payment Type/Client Type/Columns automated; Acct Eff Date range picker explicitly skipped (documented as fragile `app-date-picker`) |
| 21 | Search By Batch No (Check Register) | [x] | |
| 22 | View action (Batch Transaction Detail from Check Register) | [~] | Same popup as #11, not separately re-verified from this specific entry point |
| 23 | Check Summary (field verification) | [~] | Client Code + Payee Name checked; not all ~19 listed fields |
| 24 | Edit Check Summary Detail | [ ] | Real write, never attempted |
| 25 | Export PDF (Check Summary's own icon) | [~] | Overlaps with Batch List/Check Register PDF export coverage; not a dedicated Check-Summary-specific check |
| 26 | Check Register - Export (Excel, filename pattern) | [~] | Download confirmed; exact filename pattern (`CheckRegister_<From>_To_<To>.xlsx`) not asserted |
| 27 | Check Register - Approve | [ ] | Real write (changes batch status), never attempted |
| 28 | Check Register - Print Check (5 sub-scenarios) | [ ] | Genuinely blocked - opens a separate native client application our browser automation can't drive (confirmed by direct network/DOM observation, see `print-check.md`) |
| 29 | Check Register - Remittance Advice (PDF + Excel match) | [~] | PDF download confirmed (filename only); no content verification, no Excel-vs-PDF comparison |
| 30 | ACH/EFT & Check Tab (Is ACH flag + 7 action icons) | [x] | All action icons confirmed present, Is ACH cell checked (Yes/No, not asserted to a specific value) |

## Summary

- **13 fully automated** (#1, 5-8, 10-12, 14, 15, 19, 21, 30)
- **10 partially automated** (#2-4, 17, 20, 22, 23, 25, 26, 29)
- **7 not automated** (#9, 13, 16, 18, 24, 27, 28)
  - 4 are real-write actions never attempted by design (Edit Payment Details,
    Edit Batch Detail, Edit Check Summary Detail, Approve) - each would mutate
    production-looking data with no test-only environment to isolate the
    change to.
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
  this reliable).

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
