---
product: alis_core
journey: payment-upload-to-remittance
pages: [login, check-register, check-summary-popup]
---

1. Log in to Alis Core with a standard agent (`ALIS_CORE_LOGIN_USER` /
   `ALIS_CORE_LOGIN_PASS`).
2. Navigate to the Accounting module's Check Register screen
   (`ALIS.Accounting/APP/#/checkregister`).
3. Click the first row's Check Summary icon.
4. Confirm the Check Summary popup opens, showing a single-row grid whose
   Client Code, Client Name, Payee Name, and Check Amount match the row that
   was clicked.
5. Close the popup and confirm it's dismissed.

<!--
Source: "ALIS Accounting - Bulk Payment Upload to Remittance - End-to-End Test
Cases" PDF, test scenario "Verify Check Summary". See
alis_core/knowledge/pages/check-summary-popup.md.

Does not click Update — that's a real write against this production-looking
environment's check/payee data (see payment-batch-list.md's "Create Batch
performs a real write" note, same caution applies here). The PDF's "Edit
Check Summary Detail" scenario is therefore not automated in this pass.

Uses whichever row is first in the (default-filtered) Check Register grid
rather than a hardcoded batch/check number, since this is a production-
looking environment whose data changes over time — see check-register.md's
Edge Cases.
-->
