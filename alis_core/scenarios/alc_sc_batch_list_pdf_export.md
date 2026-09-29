---
product: alis_core
journey: payment-upload-to-remittance
pages: [login, payment-batch-list, payment-batch-list-pdf-export]
---

1. Log in to Alis Core with a standard agent (`ALIS_CORE_LOGIN_USER` /
   `ALIS_CORE_LOGIN_PASS`).
2. Navigate to the Accounting module's Payment screen, Batch List tab.
3. Click the first batch row's PDF Export icon.
4. Confirm the `GetViewBatchTranPDF` report request responds successfully
   with a non-empty PDF payload (decodes to valid PDF magic bytes).

<!--
Source: "ALIS Accounting - Bulk Payment Upload to Remittance - End-to-End Test
Cases" PDF, test scenario "PDF Generation (payment)". See
alis_core/knowledge/pages/payment-batch-list-pdf-export.md.

This is a read-only report-export action (confirmed: the underlying endpoint
is a `GetView...` report call, not a write), so it's automated directly,
unlike this screen's Del/Create Batch/Save Payment actions. Verified via the
network response itself rather than a real downloaded file on disk, since
this app converts an ordinary JSON API response into a download client-side
rather than serving a navigable/`Content-Disposition` file — see that
knowledge file's Edge Cases for why.
-->
