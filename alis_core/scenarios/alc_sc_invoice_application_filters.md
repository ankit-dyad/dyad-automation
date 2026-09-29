---
product: alis_core
journey: payment-upload-to-remittance
pages: [login, invoice-application]
---

1. Log in to Alis Core with a standard agent (`ALIS_CORE_LOGIN_USER` /
   `ALIS_CORE_LOGIN_PASS`).
2. Navigate to the Accounting module's Payment screen, Batch List tab
   (`ALIS.Accounting/APP/#/payment`).
3. Open the first batch's Payment tab via its Transaction Add/Edit icon.
4. Open the Invoice Application screen via the first payment record's Add
   Invoice (+) icon.
5. Confirm the outstanding-invoice search auto-runs for that record's client
   and the filter checkboxes (Binding, Brokerage, Paid, Receivable Vouchers,
   Payable Vouchers, Financed) are present with their default checked states.
6. Confirm the Client field is pre-filled with the record's client code and
   is disabled (an agent cannot retarget which client this application
   applies to).
7. Type into Quick Search and re-run Search — confirm the modal and grid
   still render without error.
8. Switch Based On from Acct Eff Date to Due Date, then re-run Search —
   confirm the dropdown value changed and the grid still renders without
   error. Does not change the From/To Date range itself (see
   invoice-application.md's Edge Cases for why).
9. Open the Billing Method multiselect, select all options, close the
   panel, then re-run Search — confirm the closed control reflects the
   selection and the grid still renders without error.
10. Toggle the Receivable Vouchers and Payable Vouchers checkboxes
    independently, then re-run Search.
11. Close the screen without saving.

<!--
Source: "ALIS Accounting - Bulk Payment Upload to Remittance - End-to-End Test
Cases" PDF, test scenarios "Invoice Application - Save & Select (+) Icon at
grid" and "Invoice Application Screen - Filters". See
alis_core/knowledge/pages/invoice-application.md.

Does not click Save — that applies the payment to real outstanding invoices
against production-looking data (see payment-batch-list.md's "Create Batch
performs a real write" note, same caution applies here). Only Close is
exercised.

Does not drive the From/To Date pickers (fragile `app-date-picker` popup
component, not yet characterized in this app) — only the Based On dropdown
switch is exercised. See invoice-application.md's Edge Cases.

Uses whichever batch/payment record is first in the (unfiltered, default)
grids rather than hardcoded batch/client values, since this is a
production-looking environment whose data changes over time.
-->
