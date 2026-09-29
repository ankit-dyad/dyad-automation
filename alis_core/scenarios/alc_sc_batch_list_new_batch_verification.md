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
this automation instead verifies whichever batch is first in the (default,
unfiltered) grid. An upgrade to verify an actually-freshly-created batch (by
reusing alc_sc_payment_upload_save_payment.md's proven real-write flow) was
attempted 2026-09-28 but the harness's own safety classifier blocked writing
that test file, flagging it as encoding a real-world-transaction outcome —
see batchListVerification.locators.ts/.page.ts for the (currently unused)
rowForBatch()/cellForBatch()/scrollGridToBottom() helpers added in
preparation for it, kept in place in case this is revisited with the user's
explicit involvement. The column-population checks themselves are identical
regardless of whether the batch was just created or already existed.

Confirmed necessary: the grid's rightmost columns (Bank GL, Bank Name,
Status, Created By, Updated By, Updated Date, ACH) don't render until the
grid is actually scrolled horizontally — ag-Grid's column virtualization
didn't respond to setting scrollLeft directly, only to a real wheel/scroll
gesture (Playwright's page.mouse.wheel()).
-->
