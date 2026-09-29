---
product: alis_core
journey: payment-upload-to-remittance
pages: [login, payment-batch-list]
---

1. Log in to Alis Core with a standard agent (`ALIS_CORE_LOGIN_USER` /
   `ALIS_CORE_LOGIN_PASS`).
2. Navigate to the Accounting module's Payment screen, Batch List tab.
3. Confirm the first batch row's Batch No, Client Type, Batch Description,
   Payment Amt, Batch Total, and Adj Amt are all populated.
4. Scroll the grid horizontally and confirm Acct Eff Date, Entry Date, Bank
   GL, Bank Name, Status, and ACH are also populated for that same row.

<!--
Source: "ALIS Accounting - Bulk Payment Upload to Remittance - End-to-End Test
Cases" PDF, test scenario "Batch List - New Batch Verification". See
alis_core/knowledge/pages/payment-batch-list.md.

The PDF's original scenario verifies a batch immediately after uploading it;
this spec instead verifies whichever batch is first in the (default,
unfiltered) grid, deliberately kept read-only/no-write. The genuinely-new-
batch half is covered separately, in
alis_core/tests/payment_upload_save_payment/paymentUploadSavePayment.test.ts
(the "Verify batch #<N>'s own row columns (New Batch Verification)" step,
added 2026-09-29 with the user's explicit go-ahead to run it) - reusing that
spec's already-approved real Save Payment write rather than adding a second,
independent real-write test here. batchListVerification.locators.ts/.page.ts's
rowForBatch()/cellForBatch()/scrollGridToBottom() helpers (added 2026-09-28
in preparation for this) ended up reused as the pattern for
paymentUploadSavePayment's own equivalent locators, not directly imported
(each feature keeps its own copy - see CLAUDE.md §3/§4).

Confirmed necessary: the grid's rightmost columns (Bank GL, Bank Name,
Status, Created By, Updated By, Updated Date, ACH) don't render until the
grid is actually scrolled horizontally - ag-Grid's column virtualization
didn't respond to setting scrollLeft directly, only to a real wheel/scroll
gesture (Playwright's page.mouse.wheel()).
-->