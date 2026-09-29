---
product: alis_core
journey: payment-upload-to-remittance
pages: [login, payment-upload, payment-upload-file-validation]
---

1. Log in to Alis Core with a standard agent (`ALIS_CORE_LOGIN_USER` /
   `ALIS_CORE_LOGIN_PASS`).
2. Navigate to the Accounting module's Payment screen, Upload tab
   (`ALIS.Accounting/APP/#/payment`).
3. Set Entity to "Dyad Tech DC" (matches the `AGT003` reference test entity —
   see `alis_core/knowledge/data.json`; the default "Dyad Inc" causes an
   Entity-mismatch row failure).
4. Choose the committed AGT003 fixture file
   (`alis_core/tests/fixtures/payment_upload_agt003_valid.xlsx`) and click
   Upload.
5. Confirm all 12 rows land in Valid Invoice (0 in Invalid Invoice). If they
   don't — i.e. an invoice is locked in another batch — stop here; this spec
   does not attempt the delete-to-unblock remediation itself (see
   `alis_core/knowledge/business-rules.md`).
6. Select all 12 rows in the Valid Invoice grid and confirm the Total Payment
   Amount reflects the selection.
7. Click Save Payment. Confirm it's rejected: an "Invalid Transactions" modal
   appears (one row, `INV115580`, has a negative amount and fails business
   validation — no batch is created while it's selected, even though the
   other 11 rows are individually valid). Close the modal.
8. Deselect the negative-amount row (leaving 11 selected) and click Save
   Payment again.
9. Confirm the write succeeded via the app's success toast ("Payment Created
   Successfully. Batch# <N>") and independently verify that batch number
   appears in Batch List.

<!-- Steps 7-9 match the user's own manual repro exactly (2026-09-28): upload
→ select all → Save Payment → hit the negative-amount rejection → close →
deselect the bad row → Save Payment again → success toast with a real batch
number → confirmed in Batch List. -->

<!--
Source: "ALIS Accounting - Bulk Payment Upload to Remittance - End-to-End Test
Cases" PDF, test scenario "Payment Upload - File Selection & Validation"
(the Valid Invoice / Save Payment half, which
alc_sc_payment_upload_file_validation.md deliberately doesn't exercise). See
alis_core/knowledge/pages/payment-upload-file-validation.md.

This is a genuine, consequential real write: it creates a real payment batch
against real AGT003 invoices in a production-looking environment. Automating
it was explicitly requested by the user (2026-09-28) after they manually
confirmed the same fixture file uploads clean (12/12 Valid) on this
environment. Per this repo's established caution around real-write actions,
the first live headed run of this spec still needs its own explicit
go-ahead before Save Payment is actually clicked, separate from the
go-ahead to build the automation itself.

Not idempotent across re-runs — see payment-upload-file-validation.md's Edge
Cases: a second run against unmodified state will find these same invoices
locked in the batch this spec's own prior run created, and will correctly
stop at step 5 rather than proceed to Save Payment again.
-->
