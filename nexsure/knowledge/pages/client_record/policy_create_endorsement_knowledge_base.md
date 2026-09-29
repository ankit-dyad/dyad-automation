# Knowledge Base — Policy Record: "Create Endorsement" (Servicing action)

**Application:** Nexsure (R5 Insurance Agency) — `nexui` Vue.js SPA
**Captured from:** Client record `Clients: Automation_001`, policy `OPP-001395`
**URL at capture:** `https://jmiqaweb01.nexsure.com/nexui/#/entity_console/{orgId}/{clientId}/policies/summary/endorsement`
**Captured on:** 2026-09-21

This document covers **only the "Endorse" action** from the Policies grid's "Servicing:" toolbar (documented as a button but not exercised in `Client_Policies_List_Knowledge_Base.md` §1.1/§3) — by explicit request, the other five Servicing actions (Audit, Claims, Renew, Remarket, Binder, Cancel Policy) were **not** exercised in this pass and remain undocumented. This test was run against a second policy on the same client, **OPP-001395** ("NEW MONOLINE," X100_General Liability, carrier "AAA Carrier"), separate from OPP-001394 documented elsewhere in this series.

> **Scope note:** unlike most other creation flows documented in this KB series (which were cancelled rather than submitted), this endorsement **was actually created** — "Create Endorsement" was clicked through to completion at the user's explicit direction, since the intent was specifically to document what the resulting screen looks like. The endorsement was left in its **Pending** state; **Submit**, **Post**, and **Abort Pending Endorsement** were none of them clicked, so the endorsement has not been finalized, aborted, or posted to billing.

## 1. Step 1 — "Start an Endorsement" form

Clicking **Endorse** on a policy's Servicing toolbar navigates (full page, breadcrumbed **"Policies: {Policy Number}"**, not a modal) to a small form:

- **Policy Term** and **Coverage Term** — read-only display of the underlying policy's term dates.
- **Desired Effective*** — a required date field (calendar-icon picker), pre-filled to the current/today's date.
- **Description*** — a required text field, pre-filled with **"Process endorsement."**
- **Notes** — an optional textarea, also pre-filled with **"Process endorsement."**
- Footer buttons: blue **Create Endorsement**, red **Cancel**.

Submitting shows a brief loading spinner (a few seconds) before landing on the resulting endorsement record (§2).

## 2. Step 2 — the resulting "Pending Endorsement" policy record

The endorsement opens as a **full policy-detail-style page**, structurally similar to the main Policy Detail record documented in `Policy_Details_Knowledge_Base.md`, but overlaid with endorsement-specific state:

- Header: **"Policies: OPP-001395"**, a **Primary** toggle (top right, on by default), and a card showing the policy number with a status badge that now reads **"PENDING ENDORSEMENT"** (replacing the normal "IN FORCE"/etc. status) plus the **NEW MONOLINE** tags and LOB line, unchanged from the base policy.
- A details row: Issuing Carrier / Billing Carrier (both "AAA Carrier," linked), an **ADMITTED** checkbox (unchecked), Policy Term, Coverage Term, **Origination Date**, Assignment (branch + assigned person), and **Next Due** (still pointing at "New Opportunity Policy" / the original assignee).
- An **ANNOTATION** banner (cream background, matching the pattern used for policy/opportunity annotations elsewhere in this app): shows the endorsement's own Description ("Process endorsement.") plus "Created By: [...] To: [...] - {date}", an edit-pencil icon, and the same three activity-counter icons (lightning/envelope/paperclip) seen throughout this app — this endorsement's counters read **3 / 1 / 0**, up from the base policy's counters, confirming the endorsement creation itself generated new Action/activity records (see §3).
- **Toolbar (this is the endorsement-specific part):** **Print**, a red **"Abort Pending Endorsement"** button, an outlined **Submit** button, and a filled blue **Post** button. None of these were clicked. Based on their labels: Abort presumably discards the pending endorsement and reverts the policy to its prior state; Submit presumably moves the endorsement into an underwriting/review queue; Post presumably finalizes/applies the endorsement's changes to the live policy and generates any associated billing transaction. **This 3-button combination (Abort/Submit/Post) replaces whatever toolbar the base, non-endorsement Policy Detail page shows** — a clear, reliable visual signal that a policy is currently mid-endorsement.

### 2.1 A new server error surfaced during this flow

Loading the endorsement record's header triggered a toast: *"Error Loading Header Data. Please contact Nexsure Support and reference issue #260783092."* This is a **fourth distinct server error code** logged across this whole KB series (after `#260782741`, `#260782822`, `#260782904`) — again non-fatal: the underlying header data rendered correctly once the toast was dismissed, consistent with the established pattern that this QA environment throws toast-level "unexpected error" messages fairly often without any actual functional impact.

## 3. Sub-tabs on the Pending Endorsement record

The endorsement record has its own **8-tab sub-navigation**: **Overview** (default), **Application**, **Assignments**, **Claims**, **Billing Info**, **Invoicing**, **Activity**, **Summary of Insurance**. Each was opened to confirm shape; none of their content was modified.

- **Overview** — the same panel layout used on the base Policy/Client Overview pages: **History** (2 results — the endorsement's own creation plus the policy's original creation), **Messages** (empty, "Add Message" button), **Actions** (shows two auto-generated Annotation actions: an **"Endorsement Annotation"** — "Process endorsement.", assigned to the same user, due 10/11/2026 — and the original **"Marketing Annotation"** carried over from the policy's creation; toolbar has Filter/Show Only Open/Hide Automated Actions toggles, Close Selected, and an "Add New"+"Select Action Plan..." split button matching the client-level Actions tab), **Activity** (a combined Actions/Deliveries/Attachments feed, filterable, "0 results found" at the activity-feed level distinct from the Actions panel itself), **Attachments** (empty, same drag-and-drop pattern used everywhere else in this app).
- **Application** — same shape as the policy's own Application tab: a **Lines of Business** side panel (one LOB, "X100_General Liability (126)," plus an "+ Add" button) and a main panel with **Filter by Tag** search, **Prefill** button, and **Expand All** — presumably this is where the actual endorsement changes (coverage/limit edits) would be made, though no fields were edited in this pass.
- **Assignments** — not explored in depth in this pass; presumably mirrors the assignment-editing grid seen on the Opportunity/Policy "+New" wizards.
- **Claims** — not explored in depth; presumably the same "No records found" shape documented for the Policy Detail record's own Claims sub-tab.
- **Billing Info** — a **Billing Information** card (Bill To: dropdown "Client" linked to Automation_001; Bill Method: dropdown "Direct Bill"; Billing Type: dropdown "Gross"; a "Third Party Commissionable" checkbox; Premium Finance Company: dropdown "None"; Internal Billing Note textarea; a "Save Billing Info" button) plus an **Invoice Information** card (read-only Bill To / Billing Address) and a **Premiums** breakdown section below showing **Grand Total: $1,000.00** and **Total Premiums: $1,000.00**, matching the policy's coverage figures documented elsewhere.
- **Invoicing** — a grid with **Show Filters**, a **Delete** button, and an **"Add New"** split-button offering **5 options: Invoice, Master Invoice, Payment Received, Reconciliation, Disbursement** — the exact same 5-action set as the client-level Accounting > Summary Views bracket-links documented in `Client_Accounting_Knowledge_Base.md`, now surfaced as a proper Vue dropdown rather than legacy bracket-links. Empty in this test.
- **Activity** — identical in shape to the client-level Actions tab (`Client_Actions_Knowledge_Base.md`): Actions/Deliveries/Attachments toggle links, Export, Add New + Select Action Plan split-button, Assign to Me / Close Actions (both greyed with nothing selected), Show Filters, and an **Apply Predefined Filter** dropdown (default "No Pre-Defined Filter").
- **Summary of Insurance** — the same legacy `SOI.aspx` iframe report documented in `Client_Policies_List_Knowledge_Base.md` §3, here scoped to this one policy/endorsement, showing the identical LOB/Include checkbox controls and export/print links.

## 4. Summary checklist for automation design

- **"Endorse" is a real two-step transaction, not a modal**: Step 1 (Start an Endorsement) collects Desired Effective/Description/Notes; Step 2 opens a full policy-detail-shaped record in a distinct **"PENDING ENDORSEMENT"** status with its own **Abort/Submit/Post** toolbar. Automation driving an endorsement end-to-end needs to handle this as a multi-page flow, not a single form submission.
- **Creating an endorsement auto-generates a new Annotation Action** ("Endorsement Annotation," pre-filled from the Description field) on the policy, visible in the Overview > Actions panel — the same "creation auto-spawns an Action" pattern already observed for Submissions/Marketing records (`Client_Submissions_Knowledge_Base.md`, `Client_Actions_Knowledge_Base.md`).
- **A fourth distinct server error code (`#260783092`, "Error Loading Header Data")** was logged here — non-fatal, same pattern as the three prior codes. Keep building the running catalogue of these codes rather than treating any single one as unique/diagnostic.
- **The Invoicing tab's "Add New" 5-option split-button (Invoice/Master Invoice/Payment Received/Reconciliation/Disbursement) is functionally identical to the legacy Accounting section's 6 bracket-links** (minus "Add Summary Bill") — useful confirmation that the modern Vue Invoicing tab and the legacy Accounting iframe are two front-ends onto the same underlying transaction types.
- The other five Servicing actions on a policy — **Audit, Claims, Renew, Remarket, Binder, Cancel Policy** — remain **unexplored** by explicit scope decision in this pass. If they're needed later, each should get its own short KB note the same way this one does, rather than assuming they share Endorse's shape (Cancel and Renew in particular are likely to have materially different flows).