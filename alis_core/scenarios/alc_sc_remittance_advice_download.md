---
product: alis_core
journey: payment-upload-to-remittance
pages: [login, check-register, remittance-advice]
---

1. Log in to Alis Core with a standard agent (`ALIS_CORE_LOGIN_USER` /
   `ALIS_CORE_LOGIN_PASS`).
2. Navigate to the Accounting module's Check Register screen
   (`ALIS.Accounting/APP/#/checkregister`).
3. Select the first row's checkbox.
4. Open the "Remittance Download As" dropdown and choose PDF.
5. Confirm a PDF file downloads.

<!--
Source: "ALIS Accounting - Bulk Payment Upload to Remittance - End-to-End Test
Cases" PDF, test scenario "Check Register - Remittance Advice". See
alis_core/knowledge/pages/remittance-advice.md.

Downloading a file is a real-world action — this scenario was only built
after explicit user permission to trigger the download during exploration.
Uses Playwright's download-event handling rather than asserting anything
about the filesystem.

Does not independently re-verify the downloaded PDF's rendered content
(letterhead, payee, check detail) against the PDF's expected-outcome
description — only that a PDF is generated and downloaded for the selected
row. Content verification is follow-on work (would need a PDF-parsing
dependency this repo doesn't currently have).

Uses whichever row is first in the (default-filtered) Check Register grid
rather than a hardcoded batch number, since this is a production-looking
environment whose data changes over time — see check-register.md's Edge
Cases.
-->
