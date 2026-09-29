---
product: alis_core
journey: payment-upload-to-remittance
pages: [login, payment-batch-list, payment-tab-individual-records]
---

1. Log in to Alis Core with a standard agent (`ALIS_CORE_LOGIN_USER` /
   `ALIS_CORE_LOGIN_PASS`).
2. Navigate to the Accounting module's Payment screen, Batch List tab.
3. Click the first batch row's Transaction Add/Edit icon to open that
   batch's own Payment tab, listing its individual payment records.
4. Confirm the first record row's Client, Mode, Acct Eff Date, Payment Amt,
   and Bank GL columns are all populated with real data.
5. Scroll the grid horizontally and confirm the Status and User columns are
   also populated for that same row.

<!--
Source: derived from the "ALIS Accounting - Bulk Payment Upload to
Remittance - End-to-End Test Cases" PDF's use of the batch-level Payment
tab as a stepping-stone toward "Invoice Application - Save & Select (+) Icon
at grid" (see alis_core/knowledge/pages/invoice-application.md's "Reaching
this page"). That tab was previously only ever reached in passing, never
documented or verified as its own page — this scenario closes that gap. See
alis_core/knowledge/pages/payment-tab-individual-records.md.

Read-only: verifies whichever batch is first in the default Batch List grid
and whichever payment records it already has, rather than uploading/entering
a fresh one. Save Payment, Add Invoice, Edit Transaction, and Delete
Transaction are never clicked in this pass - this is purely a verification
pass of an existing batch's already-saved records. The genuinely-new-batch
half is covered separately, in
alis_core/tests/payment_upload_save_payment/paymentUploadSavePayment.test.ts
(the "Verify batch #<N>'s own Payment tab individual records" step, added
2026-09-29 with the user's explicit go-ahead to run it), reusing that spec's
already-approved real Save Payment write rather than adding a second,
independent real-write test here.


Confirmed necessary: the grid's rightmost columns (Status, Tran Description,
Doc No, User, Updated Date) don't render until the grid is actually scrolled
horizontally — ag-Grid's column virtualization didn't respond to setting
scrollLeft directly, only to a real wheel/scroll gesture (Playwright's
page.mouse.wheel()), same quirk as
alis_core/knowledge/pages/payment-batch-list.md.

Tran Description and Doc No are deliberately not asserted here — both are
confirmed to be legitimately empty on some real payment records (see the
knowledge file's column notes), so asserting non-empty on them would be
flaky against production-looking data.
-->
