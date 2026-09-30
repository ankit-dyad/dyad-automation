---
product: alis_core
journey: payment-upload-to-remittance
pages: [login, check-register, check-summary-popup]
---

1. Log in to Alis Core with a standard agent (`ALIS_CORE_LOGIN_USER` /
   `ALIS_CORE_LOGIN_PASS`).
2. Navigate to the Accounting module's Check Register screen
   (`ALIS.Accounting/APP/#/checkregister`).
3. Click the first row's Check Summary icon.
4. Confirm the Check Summary popup opens, showing a single-row grid whose
   Client Code, Client Name, Payee Name, and Check Amount match the row that
   was clicked.
5. Scroll the modal grid across three checkpoints and confirm all 20 of the
   PDF's listed fields are populated (Account Name, Batch No, Batch
   Description, Status, Transaction Description, G/L Account, Acct Eff.
   Date, Entry Date, Doc No., Payee Country, OFAC, and the five Payee
   Address/City/State/Zip fields).
6. Click the grid row to select it and confirm the Payee/Address1 edit
   fields below the grid auto-populate with that row's values (the actual
   "Edit Check Summary Detail" mechanism - not ag-Grid inline editing).
7. Close the popup and confirm it's dismissed.

<!--
Source: "ALIS Accounting - Bulk Payment Upload to Remittance - End-to-End Test
Cases" PDF, test scenarios "Verify Check Summary" and "Edit Check Summary
Detail". See alis_core/knowledge/pages/check-summary-popup.md.

The "Edit Check Summary Detail" mechanism is now fully confirmed (2026-09-30):
selecting the grid row auto-populates a plain Angular reactive-form below the
grid (Payee/Address1/Address2/City-State-Zip), NOT ag-Grid inline cell
editing (confirmed the Address1 cell is not inline-editable via dblclick).
Automated read-only up through confirming those fields populate correctly.
Does not click Update - confirmed live to fire a real
`POST .../Checkregister/UpdateCheckPayeeInformation` write against this
production-looking environment's check/payee data (same caution as Create
Batch and Invoice Application's Save).

Uses whichever row is first in the (default-filtered) Check Register grid
rather than a hardcoded batch/check number, since this is a production-
looking environment whose data changes over time - see check-register.md's
Edge Cases.
-->
