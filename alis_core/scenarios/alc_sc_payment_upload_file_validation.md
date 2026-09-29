---
product: alis_core
journey: payment-upload-to-remittance
pages: [login, payment-upload, payment-upload-file-validation]
---

1. Log in to Alis Core with a standard agent (`ALIS_CORE_LOGIN_USER` /
   `ALIS_CORE_LOGIN_PASS`).
2. Navigate to the Accounting module's Payment screen, Upload tab.
3. Choose the app's own official sample payment upload file (downloaded live
   from the Upload tab's own "Download" link) and click Upload.
4. Confirm the Valid Invoice and Invalid Invoice tabs both appear with count
   badges, and that the Invalid Invoice grid lists each row's Client Code,
   Invoice Code, and Error Reason.
5. Confirm the Valid Invoice grid's columns are present (Client Code, Invoice
   Code, Amount, Payment Type, Document Number, Description).

<!--
Source: "ALIS Accounting - Bulk Payment Upload to Remittance - End-to-End Test
Cases" PDF, test scenario "Payment Upload - File Selection & Validation". See
alis_core/knowledge/pages/payment-upload-file-validation.md.

Scope note: uses the app's own official sample template (fetched live via the
page's own "Download" link, as a buffer — never written to disk or committed
to the repo, so this stays a real upload against real app behavior without a
stale binary fixture going out of date). That template's data is fabricated
placeholder data that always lands in Invalid Invoice on this environment
(confirmed 0 Valid / 2 Invalid) — this scenario therefore only exercises the
Invalid Invoice path. A file that produces Valid Invoice rows was not
available on this environment in this pass (see the knowledge file's Edge
Cases for what was tried) — automating the Valid Invoice → Save Payment path
is follow-on work once one is.

Never clicks Save Payment — real write against production-looking data (see
payment-batch-list.md's "Create Batch performs a real write" note).
-->
