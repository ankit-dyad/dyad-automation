---
product: alis_core
journey: payment-upload-to-remittance
pages: [login, payment-upload, agency-bank-setup, payment-upload-file-validation, payment-batch-list, batch-transaction-detail-popup, invoice-application, ach-eft-check, check-register, check-summary-popup, remittance-advice]
---

1. Log in to Alis Core with a standard agent.
2. Set the Payment Upload batch header fields (Client Type, Acct Eff Date,
   Entity, Bank GL) on the Upload tab.
3. Open Admin Manager (a genuinely new browser tab) and view an agency's
   Bank Information record.
4. Upload the app's own official sample payment file on the Upload tab and
   confirm the Valid/Invalid Invoice split.
5. Open the first Batch List row's Batch Transaction Detail popup and close
   it.
6. Open the first batch's Payment tab, then the first payment record's
   Invoice Application screen; toggle its Receivable/Payable Vouchers
   filters and search; close without saving.
7. Search the ACH/EFT & Check tab by Batch No for whatever batch is first on
   its default grid.
8. Open the first Check Register row's Check Summary popup and close it.
9. Select the first Check Register row and download its Remittance Advice
   PDF.

<!--
Single continuous session composing every already-automated page in this
journey, end to end, in the same order the PDF itself lists its
sub-scenarios — matching the PDF's overall "ALIS Accounting - Bulk Payment
Upload to Remittance - End-to-End Test Cases" narrative in one run rather
than as separate per-feature specs. One login, one browser context (plus the
one genuinely new tab/window Agency Bank Setup opens), walking the full flow
the PDF describes.

This is a composition test, not a new page — it deliberately has no
locators.ts/page.ts of its own (see CLAUDE.md §3's three-file convention);
every locator and action it uses is already declared in each step's own
feature folder. Flagging this as an intentional, narrow exception rather than
silently deviating from the convention.

Steps that need existing data (ACH/EFT & Check, Check Summary, Remittance
Advice) skip gracefully rather than fail if the live grid happens to be empty
at run time — same rationale as each step's own individual spec.

Never clicks Save Payment, Save (Invoice Application), Update (Check
Summary), Approve, Add (Agency Bank Setup), Edit Batch Detail, or Batch
Prepared — all real writes against this production-looking environment.
Print Check is not part of this flow — its own popup content remains
genuinely blocked (see alis_core/knowledge/pages/print-check.md); everything
else the PDF describes that's safe to automate is now included here.
-->
