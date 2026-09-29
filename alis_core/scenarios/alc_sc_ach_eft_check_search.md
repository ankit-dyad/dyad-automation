---
product: alis_core
journey: payment-upload-to-remittance
pages: [login, ach-eft-check]
---

1. Log in to Alis Core with a standard agent (`ALIS_CORE_LOGIN_USER` /
   `ALIS_CORE_LOGIN_PASS`).
2. Navigate to the Accounting module's Payment screen
   (`ALIS.Accounting/APP/#/payment`).
3. Select the "ACH / EFT & Check" tab.
4. Confirm the grid loads with its Batch No/Client Type/Batch Total/Payment
   Amount/Adj Amount/Is ACH columns and the NACHA/DMS/Info/Email/PDF/
   Validate/Log action icons.
5. Set "Search By" to "Batch No" and search for an existing batch number.
6. Confirm the grid returns exactly the one matching row, with its Is ACH
   value present.

<!--
Source: "ALIS Accounting - Bulk Payment Upload to Remittance - End-to-End Test
Cases" PDF, test scenario "ACH/EFT & Check Tab". See
alis_core/knowledge/pages/ach-eft-check.md.

Reached directly via this Payment screen's own tab strip rather than the
ChocoBox/hamburger menu path described in the PDF, for the same reliability
reason noted in payment-upload.md.

Does not click any row action icon (NACHA download, Send Email, Export To
PDF, etc.) — several look like they trigger downloads/emails/other side
effects against this production-looking environment, so this pass stays
read-only past the Search step.

Step 5's exact batch number is not hardcoded (sourced from a live query in
the spec) since this environment's batch data changes over time — see
check-register.md's Edge Cases for the same rationale on a similar screen.
-->
