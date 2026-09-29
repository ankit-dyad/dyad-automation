# Knowledge Base — Client Record: "Actions" Page (client-level)

**Application:** Nexsure (R5 Insurance Agency) — `nexui` Vue.js SPA
**Captured from:** Client record `Clients: Automation_001`
**URL at capture:** `https://jmiqaweb01.nexsure.com/nexui/#/entity_console/{orgId}/{clientId}/actions`
**Captured on:** 2026-09-21

Companion document to `Client_Overview_Knowledge_Base.md`, `Client_Profile_Knowledge_Base.md`, `Client_Opportunities_List_Knowledge_Base.md`, `Client_Submissions_Knowledge_Base.md`, `Client_Claims_Knowledge_Base.md`, and `Client_Accounting_Knowledge_Base.md`. This is the **client-wide Actions** tab — the second-row tab that aggregates every Action (task/to-do/annotation) tied to this client, distinct from the "New Action" creation modal already documented in the Client Overview KB (§ client header), which is reachable from every Client-level page via the header buttons.

> **Scope note — what was deliberately NOT exercised:** no Action was created, closed, assigned, exported, or deleted. The "Select Action Plan..." split-button's individual template options were inspected as a dropdown list only — none were selected/applied. "Assign to Me" and "Close Actions" were observed greyed-out (no row selected) and not forced into an enabled state.

## 1. Page layout

- Header **"Actions"** with a toolbar of 4 controls at top right: **Export**, a split-button **"Add New ▾"** (main button + a caret that opens **"Select Action Plan..."**, see §3), **"Assign to Me"** (greyed out with no row selected), **"Close Actions"** (greyed out with no row selected).
- **Show Filters** toggle, revealing the filter panel (§2).
- **Apply Predefined Filter** dropdown, separate from Show Filters (§2.1).
- Standard **Showing [10] Items per page / Locked-Unlocked / Page X of Y** pagination bar (top and bottom).
- Grid columns: a leading checkbox (bulk-select), an attachment-paperclip icon column, a mail/envelope icon column, **Topic**, **Type**, **Effective Date**, **Description/Memo**, **Policy/LOB - Cert Or Ref#**, **Assigned To**, **Due Date**, **Status** (rendered as a colored dot + a day-count, e.g. "● 3 days"), **Created By / On**, **Modified By / On**.
- This test client had **exactly one Action** on file: a stray record with Topic **"Marketing"**, Type **"Annotation"** — presumably an artifact of the Submissions/Marketing record creation flow ("New Marketing" auto-creates an Annotation Action per the copy documented in `Client_Submissions_Knowledge_Base.md` §4) rather than something manually added here.

## 2. Show Filters panel

A single filter form (columns not fully itemized field-by-field in this pass beyond what's listed, but the visible fields were): **Topic** (dropdown/text), **Type** (dropdown, dependent on Topic — mirrors the same Topic→Type dependency already documented for the "New Action" modal in the Overview KB), **Status** (dropdown), **Assigned To** (text/picker), **Description/Memo** (text), **Policy/LOB** (text), plus a **Dates** section with **Effective** and **Due Date** From/To range pickers (each with the recurring "±DAYS" quick-offset pattern used throughout this app). **Apply Filter** / **Clear** buttons, and the usual **Save / Recall / Clear Memory** preset links at the top of the panel.

### 2.1 Apply Predefined Filter

A separate dropdown (independent of the Show Filters panel, sitting above the grid) offering **7 preset views**:

1. No Pre-Defined Filter (default)
2. My Appointments
3. My High Priority Actions
4. My Personal Actions
5. My Portal Items
6. My Service Automation Items
7. My Activity Notes

These read as canned, per-user saved searches (likely tied to the logged-in user's own Action assignments) rather than agency-wide report definitions.

## 3. "Select Action Plan..." — a distinct batch-creation feature

Clicking the caret next to **"Add New"** reveals **"Select Action Plan..."**, which is not a single new-Action form but a **template/batch feature**: selecting one presumably creates a whole pre-defined set of Actions against this client at once (an "Action Plan"), rather than one ad-hoc Action. The dropdown lists **9 named plan templates**, several with obvious QA/test-authoring artifacts in their names:

- 5th Action Plan @
- 6th"Action plan"1.94
- 7th Action plan"1.94
- Action Plan 7720
- Action Plan F7720C
- Can not delete
- Closed type plan
- EPO plan 1.94 B4
- INACTIVE Compone... *(label truncated in the UI; full text not confirmed)*

None of these were selected/applied in this pass — the resulting workflow (does it open a preview/confirmation step, or fire immediately?) was not observed.

## 4. Summary checklist for automation design

- **"Add New" is a split-button**: the main button presumably opens the same single "New Action" modal documented in the Overview KB (client header); the caret opens a completely different batch/template feature ("Select Action Plan...") — don't conflate the two when automating Action creation.
- **Action Plan template names are clearly editable, agency/QA-seeded data** (e.g. "Can not delete," "6th\"Action plan\"1.94") — treat as live configuration to query, not a fixed enum.
- **"Assign to Me" and "Close Actions" require at least one row selected** — both were observed disabled with the grid's single row unchecked; automation must check a row first.
- The **Apply Predefined Filter dropdown is separate from, and sits above, the Show Filters panel** — two independent filtering mechanisms on the same page; don't assume they're the same control.
- The single Action found on this client (Topic "Marketing" / Type "Annotation") reinforces that **creating a Submission/Marketing record auto-generates an Action** behind the scenes — worth checking for a similar auto-Action side effect from other creation flows (e.g. does binding a policy, or adding a Delivery, also spawn an Action?) if that matters for automation assertions.
- **Status is rendered as a colored dot + day-count** (e.g. "● 3 days") rather than plain text — parsing this column programmatically will need to handle both the color semantic and the numeric/text portion separately.