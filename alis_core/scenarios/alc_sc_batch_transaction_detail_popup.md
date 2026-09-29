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
5. Close the popup and confirm it's dismissed.

<!--
Source: "ALIS Accounting - Bulk Payment Upload to Remittance - End-to-End Test
Cases" PDF, test scenario "Action — Verify View Batch Data" / "Batch
Transaction Detail Popup". See
alis_core/knowledge/pages/batch-transaction-detail-popup.md.

Uses whichever batch is first in the (unfiltered, default) Batch List grid
rather than a hardcoded batch number, since this is a production-looking
environment whose data changes over time — see payment-batch-list.md's Edge
Cases.

Only asserts the 5 columns confirmed present in this pass (Batch No, Batch
Description, Status, Transaction Description, GL Account) — the PDF's fuller
field list for this popup (Client Type, Account Name, Payer/Payee Name, etc.)
was not confirmed visible without further grid interaction; see the knowledge
file's Expected Outcomes note.
-->
