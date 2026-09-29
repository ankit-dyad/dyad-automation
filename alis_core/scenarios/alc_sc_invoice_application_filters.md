---
product: alis_core
journey: payment-upload-to-remittance
pages: [login, invoice-application]
---

1. Log in to Alis Core with a standard agent (`ALIS_CORE_LOGIN_USER` /
   `ALIS_CORE_LOGIN_PASS`).
2. Navigate to the Accounting module's Payment screen, Batch List tab
   (`ALIS.Accounting/APP/#/payment`).
3. Read the first (unfiltered) row's Batch No, then re-isolate the grid to
   that exact Batch No via the Filters side panel's (Select All) recipe
   (same mechanism as alc_sc_batch_list_search_by_number) rather than acting
   on "whichever row is first" without confirming it still exists.
4. Open that batch's Payment tab via its Transaction Add/Edit icon.
5. Open the Invoice Application screen via the first payment record's Add
   Invoice (+) icon.
6. Confirm the outstanding-invoice search auto-runs for that record's client
   and the filter checkboxes (Binding, Brokerage, Paid, Receivable Vouchers,
   Payable Vouchers, Financed) are present with their default checked states.
7. Confirm the Client field is pre-filled with the record's client code and
   is disabled (an agent cannot retarget which client this application
   applies to).
8. Type into Quick Search and re-run Search — confirm the modal and grid
   still render without error.
9. Switch Based On from Acct Eff Date to Due Date, then to Invoice Date,
   then re-run Search after each — confirm the dropdown value changed and
   the grid still renders without error. Does not change the From/To Date
   range itself (see invoice-application.md's Edge Cases for why).
10. Open the Billing Method multiselect, select all options, close the
    panel, then re-run Search — confirm the closed control reflects the
    selection and the grid still renders without error.
11. Toggle the Receivable Vouchers and Payable Vouchers checkboxes
    independently, then re-run Search.
12. Close the screen without saving.

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
switch is exercised (now all three options: Acct Eff Date / Due Date /
Invoice Date). See invoice-application.md's Edge Cases.

Step 3's batch-search reuses the Batch List Filters panel's (Select All)
isolate/clear recipe (payment-batch-list.md's Selectors table,
batchListSearchByNumber.page.ts) instead of "whichever batch is first" —
confirmed live 2026-09-29. The payment record opened in step 5 is still
whichever is first on that batch's Payment tab, since this environment's
individual payment records don't need the same isolation (a single batch's
own records are stable once the batch itself is confirmed to exist).
-->