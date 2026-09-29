---
product: alis_core
journey: payment-upload-to-remittance
pages: [login, payment-upload]
---

1. Log in to Alis Core with a standard agent (`ALIS_CORE_LOGIN_USER` /
   `ALIS_CORE_LOGIN_PASS`).
2. Navigate to the Accounting module's Payment screen
   (`ALIS.Accounting/APP/#/payment`).
3. Select the "Upload" tab.
4. Set Client Type to "Agency".
5. Set the Acct Eff Date field.
6. Set Entity to "Dyad Inc".
7. Set Bank GL to "110201 - Bank of America".
8. Confirm the Upload tab shows the "Choose Files", "Download", "Upload", and
   "Cancel" controls, and that all four header fields accept the
   entered/selected values.

<!--
Source: "ALIS Accounting - Bulk Payment Upload to Remittance - End-to-End Test
Cases" PDF, test scenario "Payment Upload - Batch Setup" (steps 1-3 from
"Login & Switch To Accounting" / "Accounting Landing Page" are folded into
step 1-2 here, since automation logs in and navigates directly rather than
driving the hamburger/ChocoBox menu — see alis_core/knowledge/pages/payment-
upload.md's "Reaching this page" section).

Stops short of actually clicking "Upload" with a real file — that would create
a real batch/payment record against this production-looking environment (see
payment-batch-list.md's "Create Batch performs a real write" note). The next
PDF test scenarios ("Payment Upload - File Selection & Validation", "... Save &
Auto-Batch Creation") are follow-on work once a safe-to-upload sample file and
a decision on tearing down the resulting batch are in place.

The PDF's source environment (preprod-alisblue.dyadtech.com) lists a "Cost
Center" field on this tab that does not exist on this environment
(prod-alis-4-1-21, app 4.1.21.5) — omitted from this scenario, see the
knowledge file's Edge Cases section.
-->
