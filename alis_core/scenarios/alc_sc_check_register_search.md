---
product: alis_core
journey: payment-upload-to-remittance
pages: [login, check-register]
---

1. Log in to Alis Core with a standard agent (`ALIS_CORE_LOGIN_USER` /
   `ALIS_CORE_LOGIN_PASS`).
2. Navigate to the Accounting module's Check Register screen
   (`ALIS.Accounting/APP/#/checkregister`).
3. Confirm the Check Register grid loads with its default filters (Check
   Status = Prepared) and the Approve / Remittance Download As actions are
   present.
4. Narrow the Client Type filter to "Agency" only (uncheck the other default-
   selected client types).
5. Set "Search By" to "Batch No" and search for an existing batch number.
6. Confirm the grid returns exactly the one matching row (tolerant of a known
   environment race - see check-register.md's Edge Cases).
7. Open the Banks multiselect filter and confirm it opens/closes without
   breaking the grid.
8. Narrow the Payment Type multiselect filter by unchecking one option and
   confirm the change survives reopening the panel.
9. Open the Columns side tab and confirm ag-Grid's column-configuration tool
   panel renders.
10. Export the first row as PDF via its pinned-right PDF Export icon (a
    genuine file download, not a JSON-response trick like Batch List's own
    PDF Export) - a no-op if no row is present.
11. Export the current filtered grid to Excel via the Excel button (also a
    genuine file download).

<!--
Source: "ALIS Accounting - Bulk Payment Upload to Remittance - End-to-End Test
Cases" PDF, test scenarios "Check register", "Check Register - Filters"
(Client Type, Banks, Payment Type, Columns filters), and "Search By" (Batch
No). Reached directly via the Accounting left nav rather than the
ChocoBox/hamburger menu path described in the PDF, for the same reliability
reason noted in alis_core/knowledge/pages/payment-upload.md.

Does not exercise Approve, Print Check, or Remittance Download As - all real
writes/downloads against this production-looking environment (see
payment-batch-list.md's "Create Batch performs a real write" note). Does not
exercise the Acct Eff. Date range picker (fragile `app-date-picker`, not yet
characterized in this app). The row-level View / Check Summary actions are
covered by their own scenarios (batch-transaction-detail-popup,
check-summary-popup) - PDF Export (step 10) is this screen's own row-level
action, distinct from those two and from Batch List's own PDF Export.

Step 6's assertion is intentionally tolerant, not a hard failure, for a known
race confirmed live 2026-09-29 (see check-register.md's Edge Cases/
Auto-discovered sections) - a Batch No read from the filtered grid can still
return 0 rows on immediate re-search. Steps 5/6 run right after step 4 (not
after 7-9) specifically to minimize exposure to that race - reordering this
was confirmed live to matter.

Step 5's exact batch number is not hardcoded in this scenario (kept in the
spec, sourced from a live query) since this environment's batch data changes
over time — see check-register.md's Edge Cases.
-->
