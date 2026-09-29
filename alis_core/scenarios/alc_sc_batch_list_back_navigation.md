---
product: alis_core
journey: payment-upload-to-remittance
pages: [login, payment-batch-list, payment-tab-individual-records]
---

1. Log in to Alis Core with a standard agent (`ALIS_CORE_LOGIN_USER` /
   `ALIS_CORE_LOGIN_PASS`).
2. Navigate to the Accounting module's Payment screen, Batch List tab.
3. Open the first batch row's own Payment tab via its Transaction Add/Edit
   icon.
4. Confirm the batch's own Payment tab is now active (its footer shows the
   opened batch's number and the payment records grid is visible).
5. Click "Back to Batches".
6. Confirm the Batch List tab is active again and its grid is visible.

<!--
Source: "ALIS Accounting - Bulk Payment Upload to Remittance - End-to-End Test
Cases" PDF, checklist item #20, "Payment - Back to Batches" (navigation-
confirmation step off a batch's own Payment tab). See
alis_core/knowledge/pages/payment-tab-individual-records.md (where the "Back
to Batches" button was already documented as a footer-bar control, reached
via a batch's Transaction Add/Edit icon on payment-batch-list.md) and
alis_core/knowledge/pages/invoice-application.md's "Reaching this page"
section for the same Transaction Add/Edit icon quirk (trailing space in its
`title` attribute — matched with a `^=` prefix selector).

Read-only: no Save/Delete/Approve/Prepare/Post NACHA click anywhere in this
suite. The only "action" performed against a batch is opening its own Payment
tab (read-only navigation) and navigating back — no transaction data is
created, edited, or removed.

No dedicated knowledge page was created for this feature since the
"Back to Batches" control was already fully documented in
payment-tab-individual-records.md; this scenario/test suite folds into that
existing page rather than duplicating it.
-->
