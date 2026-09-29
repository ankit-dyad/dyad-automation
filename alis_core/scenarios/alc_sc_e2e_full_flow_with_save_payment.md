---
product: alis_core
journey: payment-upload-to-remittance
pages: [login, payment-upload, agency-bank-setup, payment-upload-file-validation, payment-batch-list, invoice-application, batch-transaction-detail-popup, payment-tab-individual-records, payment-batch-list-pdf-export, ach-eft-check, check-register, check-summary-popup, remittance-advice]
---

1. Log in to Alis Core with a standard agent (`ALIS_CORE_LOGIN_USER` /
   `ALIS_CORE_LOGIN_PASS`).
2. Payment Upload — fill in the batch header fields (Client Type, Acct Eff
   Date, Entity, Bank GL) and confirm they're accepted.
3. Agency Admin — open Bank Information for the first agency (new tab),
   confirm its panel/grid, close the tab, reload the original page.
4. Payment Upload — set Entity to "Dyad Tech DC", upload the committed
   AGT003 fixture, confirm all 12 rows land in Valid Invoice.
5. Select all 12 rows and click Save Payment. Confirm the expected rejection
   (negative-amount row INV115580, "Invalid Transactions" modal). Close the
   modal, deselect that row, and click Save Payment again — a genuine real
   write that creates a new payment batch.
6. Confirm the write succeeded via the app's own success toast, then go to
   Batch List. Unlike `alc_sc_batch_list_new_batch_verification.md` (which
   searches for a specific batch number), this step does **not** search — it
   opens whichever batch row is first in the grid and confirms its Payment
   tab loads with populated records.
7. Invoice Application — open it for that batch's first payment record,
   toggle the voucher filters, close without saving.
8. Batch List — open and close a Batch Transaction Detail popup for the
   first grid row, confirming its title and modal grid match the row's own
   Batch No.
9. Invoice Application — open it again for the first batch's first payment
   record and exercise its full filter set: confirm the Client field is
   pre-filled and disabled, Quick Search, the Based On dropdown switch
   (Acct Eff Date -> Due Date), and the Billing Method multiselect
   (Select All). Close without saving.
10. Payment tab — open the first batch's individual payment records grid and
    confirm its columns are populated: the leftmost columns without
    scrolling, then the remaining columns after a real horizontal scroll
    gesture. Tran Description and Doc No are excluded, since they're
    confirmed to be legitimately empty per-row.
11. Back to Batches — open a batch's own Payment tab from Batch List, then
    click "Back to Batches" and confirm Batch List is active again.
12. Batch List — open the Filters panel, isolate the grid to the first row's
    own Batch No (using the select-all-twice trick), confirm exactly 1
    matching row, then clear the filter and confirm the full grid is
    restored.
13. Batch List — export the first batch row as PDF; verified via the
    `GetViewBatchTranPDF` report response's base64 body decoding to a
    `%PDF-` file signature, not a real downloaded file.
14. ACH/EFT & Check — if a row is present, search the grid by that row's own
    Batch No and confirm it narrows to exactly 1 match; a no-op (not a test
    skip) if the grid is empty.
15. Check Register — narrow the Client Type filter to Agency only, then, if
    a row remains, search by that row's own Batch No and confirm it narrows
    to exactly 1 match; a no-op if none remain.
16. Check Register — if a row with a Check Summary icon is present, open and
    close its Check Summary popup, confirming Client Code and Payee Name are
    populated; a no-op if none is present.
17. Check Register — if a row is present, select it and download its
    Remittance Advice as a PDF via the "Download As" menu; a no-op if none
    is present.

<!--
Source: "ALIS Accounting - Bulk Payment Upload to Remittance - End-to-End Test
Cases" PDF. This is the fullest single-run composition of that PDF's flow —
broader than alc_sc_e2e_bulk_payment_upload_to_remittance.md, which
deliberately excludes Save Payment. This one exercises the real write
(reusing alc_sc_payment_upload_save_payment.md's proven flow), verifies via
whichever batch is first in the list rather than searching for the specific
new batch number (a simpler, less brittle verification requested directly by
the user), and then continues on into every other already-automated
screen/scenario from the PDF that alc_sc_e2e_bulk_payment_upload_to_remittance.md
doesn't already cover — Batch Transaction Detail, Invoice Application's full
filter set (not just vouchers), the Payment tab's column population check,
Back to Batches navigation, Batch List's Search by Batch No, PDF Export,
ACH/EFT & Check, Check Register (Client Type filter + Search by Batch No),
Check Summary, and Remittance Advice.

Steps 8 onward are read-only and reuse each step's own already-proven Page
Object verbatim — no new selectors or logic, only composition. They operate
on whichever batch/row happens to be first in each grid at the time each step
runs, not specifically the batch step 5 just created (same "first row, no
search" philosophy as step 6, applied consistently onward). Steps 14-17
mirror the conditional "no-op if the grid is empty right now" pattern
established in alc_sc_e2e_bulk_payment_upload_to_remittance.md's own ACH/EFT &
Check / Check Summary / Remittance Advice steps — deliberately never
`test.skip()`, since skipping here would abort this entire composed test
rather than just that one step.

This is a genuinely consequential real write (same caution class as
alc_sc_payment_upload_save_payment.md) — creates one new payment batch per
run (step 5 only; steps 8-17 are read-only). Not idempotent across re-runs: a
successful run freezes the same 11 AGT003 invoices in the new batch until
it's deleted or posted, so a re-run against unmodified state will stop at the
"12 rows in Valid Invoice" assertion. Needs its own explicit confirmation
before each live run, same as every other real-write spec in this suite.
-->
