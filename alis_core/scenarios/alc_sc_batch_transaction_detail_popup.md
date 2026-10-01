---
product: alis_core
journey: payment-upload-to-remittance
pages: [login, batch-transaction-detail-popup]
---

1. Log in to Alis Core with a standard agent (`ALIS_CORE_LOGIN_USER` /
   `ALIS_CORE_LOGIN_PASS`).
2. Navigate to the Accounting module's Payment screen, Batch List tab
   (`ALIS.Accounting/APP/#/payment`).
3. Click the View icon on the first batch row in the grid.
4. Confirm the Batch Detail popup opens, showing a summary row whose Batch No
   matches the row that was clicked.
5. Confirm the pre-scroll fields are populated (Transaction Description, GL
   Account).
6. Scroll the modal grid 700px and confirm the next 8 fields are populated
   (Account Name, Acct Eff Date, Entry Date, Document No., Client Type,
   Client Code, Payer/Payee Name, Invoice Code).
7. Scroll a further 1400px and confirm the final 7 fields are populated
   (Insured Name, Policy Number, Total Amount, Due Amount, Payment Amt, Adj
   Amt, Adj Account).
8. Close the popup and confirm it's dismissed.

<!--
Source: "ALIS Accounting - Bulk Payment Upload to Remittance - End-to-End Test
Cases" PDF, test scenario "Action — Verify View Batch Data" / "Batch
Transaction Detail Popup". See
alis_core/knowledge/pages/batch-transaction-detail-popup.md.

Uses whichever batch is first in the (unfiltered, default) Batch List grid
rather than a hardcoded batch number, since this is a production-looking
environment whose data changes over time — see payment-batch-list.md's Edge
Cases.

Asserts 20 of the PDF's ~23 listed fields (Batch No, Batch Description,
Status, Transaction Description, GL Account, Account Name, Acct Eff Date,
Entry Date, Document No., Client Type, Client Code, Payer/Payee Name,
Invoice Code, Insured Name, Policy Number, Total Amount, Due Amount,
Payment Amt, Adj Amt, Adj Account) - confirmed live 2026-09-30 via two
horizontal scroll passes (see the knowledge file's Selectors table for the
exact col-ids and scroll offsets). The remaining 3 (Cost Center, Policy
Status, Billing) were not found at any scroll offset, consistent with Cost
Center also not existing on this environment elsewhere - likely an
environment difference rather than a real gap.
-->
