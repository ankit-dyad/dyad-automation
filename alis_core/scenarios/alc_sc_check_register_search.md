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
6. Confirm the grid returns exactly the one matching row.

<!--
Source: "ALIS Accounting - Bulk Payment Upload to Remittance - End-to-End Test
Cases" PDF, test scenarios "Check register", "Check Register - Filters"
(Client Type filter), and "Search By" (Batch No). Reached directly via the
Accounting left nav rather than the ChocoBox/hamburger menu path described in
the PDF, for the same reliability reason noted in
alis_core/knowledge/pages/payment-upload.md.

Does not exercise Approve, Print Check, or Remittance Download As — all real
writes/downloads against this production-looking environment (see
payment-batch-list.md's "Create Batch performs a real write" note). Those,
plus the Banks/Payment Type multiselect filters, the Columns/Filters side
panels, and the row-level View/PDF/Check Summary actions, are follow-on work.

Step 5's exact batch number is not hardcoded in this scenario (kept in the
spec, sourced from a live query) since this environment's batch data changes
over time — see check-register.md's Edge Cases.
-->
