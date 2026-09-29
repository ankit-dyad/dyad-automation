---
product: alis_core
journey: payment-upload-to-remittance
pages: [login, agency-bank-setup]
---

1. Log in to Alis Core with a standard agent (`ALIS_CORE_LOGIN_USER` /
   `ALIS_CORE_LOGIN_PASS`).
2. Open the module switcher and click "Admin" — capturing the new
   tab/window this opens.
3. In the Admin Manager, navigate to Business > Agency.
4. Open the first agency row's Details, then its Bank Information tab.
5. Confirm the Bank Details form fields and the existing-records grid are
   present, with each existing row's data non-empty.

<!--
Source: "ALIS Accounting - Bulk Payment Upload to Remittance - End-to-End Test
Cases" PDF, test scenario "Agency Admin - Bank Setup". See
alis_core/knowledge/pages/agency-bank-setup.md.

Previously blocked: this repo's interactive exploration tooling can't drive a
JS-triggered new tab/window without a real human click, so this page went
undocumented for several turns. Unblocked once the user manually walked
through it once (sharing screenshots) and a Claude in Chrome session
confirmed the click-through path and captured the real selectors. Committed
Playwright automation captures the new tab via
`context.waitForEvent('page')`, which works fine for a real click — the
earlier block was specific to the interactive tooling, not Playwright itself.

Uses whichever agency is first in the (unfiltered) Listing grid rather than a
hardcoded agency code, since this is a production-looking environment whose
data changes over time.

Never clicks Add (Bank Information) — real write, creates a new bank account
record for the agency (see payment-batch-list.md's "Create Batch performs a
real write" note, same caution class).
-->
