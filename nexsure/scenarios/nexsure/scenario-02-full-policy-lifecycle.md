---
product: nexsure
journey: full-policy-lifecycle
pages: [login, header, opportunities, create-client]
---

# Full policy lifecycle: client & opportunity creation through rewrite

## Phase 1 — Login

1. Navigate to the environment URL (`NEXSURE_BASE_URL`). Confirm the browser
   launches and loads the target URL.
2. Log in to the Main/Deployment org (`NEXSURE_LOGIN_USER` / `NEXSURE_LOGIN_PASS`).
   Confirm the user is authenticated and lands on the dashboard.

## Phase 2 — Client & Opportunity Creation

3. Navigate to Home > Opportunities. Confirm the Opportunities list/dashboard
   page loads successfully.
4. Click the "New" button. Confirm the New Opportunity creation form opens.
5. Search for a client that isn't in the system yet (any new, non-existing
   client name, e.g. `QAble_Client`). Confirm the system returns "No records
   found" / no matching client displayed.
6. Click "Create Client". Confirm the Create Client form opens.
7. Fill all mandatory and valid client data:
   - Client Type: Personal
   - Location Type: Home Office
   - Street Address: 326 E 7th St
   - City: Leadville
   - State: Colorado
   - Zip: 80461

   Confirm all fields accept valid data with no validation errors.
8. Click Next > (Add Contact popup: fill Last Name = `Test`, click Save) >
   Next. Confirm the Assignment page is visible.
9. Select Branch (`2.5 branch`), Department (`Allied Health`), Responsibility
   (`Account Executive`), and Employee (`Automation, DyadQA2.5`). Confirm the
   selected values are saved and reflected on the Opportunity.
10. Select Product (`X100_Commercial Lines`), then LOB
    (`X100_General Liability (126)`), and enable "Skip Retail Agent". Confirm
    the LOB list filters based on the selected Product and the selection is
    retained.
11. Click "Create Opportunity". Confirm the new Client and Opportunity are
    created successfully and the Opportunity detail page opens with a
    confirmation message.

## Phase 3 — Marketing / Quote

12. Navigate to the Marketing tab on the Opportunity. Confirm the tab opens
    showing the existing/blank Quote grid.
13. Click "Create Manual Quote". Confirm the Manual Quote creation form opens.
14. Select Issuing Carrier (`AAA Carrier`), LOB
    (`X100_General Liability (126)`), then Status. Confirm all three fields
    accept selection without error and dependent fields populate correctly.
15. Click "Save". Confirm the Quote is saved successfully with a confirmation
    message.
16. Verify the newly created Quote appears in the Marketing grid with the
    correct Carrier, LOB, and Status.

## Phase 4 — Bind

17. Click the hamburger (⋮ / menu) icon on the Quote, then click "Bind".
    Confirm the Bind action is triggered and Bind confirmation/options are
    presented.
18. Proceed to the Binding page. Confirm it opens showing Quote/Policy details
    for bind processing.

## Phase 5 — Inforce

19. Click "Inforce". Confirm the Inforce action is initiated for the bound
    policy.
20. Select Billing Carrier (`AAA Carrier`). Confirm it is selected and saved
    against the policy.
21. Inforce the policy. Confirm the policy status changes to "Inforce" and a
    policy number is generated and displayed.

## Phase 6 — Endorsement

22. Create an Endorsement on the Inforce policy. Confirm the endorsement
    transaction is created in Draft/Pending status.
23. Post the Endorsement. Confirm it posts successfully and the policy
    reflects the updated (endorsed) details and effective dates.

## Phase 7 — Policy Edit

24. Create an Edit transaction. Confirm it is created against the current
    policy term.
25. Post the Edit. Confirm it posts successfully and the policy record
    reflects the edited data with no version/date conflicts.

## Phase 8 — Renewal

26. Create a Renewal. Confirm a renewal transaction is generated for the
    upcoming term with carried-forward policy data.
27. Post the Renewal. Confirm it posts successfully and a new term policy is
    created and linked to the expiring term.

## Phase 9 — Cancellation

28. Create a Cancellation (Cancellation Reason: `Insured Request`, Cancellation
    Method: `Flat`). Confirm the cancellation transaction is created in
    Draft/Pending status.
29. Post the Cancellation (Status: `Appointment`). Confirm it posts
    successfully and the policy status changes to "Cancelled" with the
    correct effective date.

## Phase 10 — Rewrite

30. Create a Rewrite (Primary State: `Colorado`), then post it. Confirm the
    rewrite transaction is created and posted successfully, generating a new
    policy term that references the original policy.

<!--
Full end-to-end lifecycle scenario, provided 2026-09-17 as a manual test case
covering client/opportunity creation through Bind, Inforce, Endorsement, Policy
Edit, Renewal, Cancellation, and Rewrite.

Several referenced steps have no knowledge file yet: Opportunity
Assignment/Product/LOB (steps 9-10), Marketing/Quote, Bind, Inforce,
Endorsement, Policy Edit, Renewal, Cancellation, and Rewrite are all
undocumented in nexsure/knowledge/pages/ as of this writing. Client &
Opportunity Creation partially reuses nexsure/knowledge/pages/create-client.md
(steps 5-8) and nexsure/knowledge/pages/header.md (step 3's Home > Opportunities
navigation, and note its "Auto-discovered" correction on the Home menu trigger's
actual selector) — steps 9-11 (Assignment/Product/LOB/Create Opportunity) go
beyond what create-client.md currently documents (that file's flow ends at
"Done" on the New Client wizard, it doesn't continue into Product/LOB
selection) and need their own exploration pass before a generated spec can
drive them. registry.yaml has no entries yet for opportunities/marketing/
quote/bind/inforce/endorsement/policy-edit/renewal/cancellation/rewrite.

The credentials given for this scenario ("dyad.automation.jmiqa" against
https://loginjmiqa.nexsure.com) differ from the QA tenant credentials already
recorded in nexsure/knowledge/pages/login.md ("dyad.automation.7772&0724"
against jmiqaweb01.nexsure.com/nexui/) — this looks like a separate "Main /
Deployment Org" login, not yet reconciled with the existing login.md.
Referenced here as NEXSURE_LOGIN_USER / NEXSURE_LOGIN_PASS per convention
(never commit credentials to a knowledge/scenario file) — confirm with an
engineer whether this needs its own env var pair instead before automating.
-->
