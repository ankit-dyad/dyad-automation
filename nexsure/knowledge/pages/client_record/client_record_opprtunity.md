# Knowledge Base — Client Record: "Opportunities" Page (list/grid view)

**Application:** Nexsure (R5 Insurance Agency) — `nexui` Vue.js SPA
**Captured from:** Client record `Clients: Automation_001`
**URL at capture:** `https://jmiqaweb01.nexsure.com/nexui/#/entity_console/{orgId}/{clientId}/opportunities`
**Captured on:** 2026-09-21

This document covers the **client-level Opportunities list** — the grid of every Opportunity belonging to this client. It is distinct from the individual Opportunity **record's** own tabs (Application / Marketing / Binding), which are documented in `Opportunity_Detail_Application_Knowledge_Base.md` and `Opportunity_Marketing_Page_Knowledge_Base.md`.

> **Scope note — what was deliberately NOT exercised:** the **"+ New"** Opportunity wizard was opened only as far as its first step (to document the shape) — no assignment was added and **Next** was never clicked, so no new Opportunity record was created. Every row's **"≡" menu** was opened only to inspect the options; **Assignments**, **View Action**, **Lost Opportunity**, and **Delete Opportunity** were none of them clicked.

## 1. Page layout

- Header **"Opportunities"** with **Export** and **"+ New"** buttons (top right).
- **Show Filters** toggle, revealing a rich filter panel (§3).
- **Group By** dropdown, **Showing [10] Items per page / Locked-Unlocked / Page X of Y** pagination bar (same recurring pattern as every other grid in this app).
- Column headers: **Client Name, Stage/Status, Effective, Confidence/Likely Premium, Retail Agent, Branch/Assignment, Last Modified.**

## 2. Row layout — a rich, multi-line "card" per Opportunity

Each Opportunity renders as a taller card-style row rather than a single grid line:

- A dark-blue header strip with a client-type icon and the **Client Name** (linked).
- Below it, on the left: the **Opportunity Number** (e.g. "OPP-001387", with a small "copy to clipboard" icon) and, on the next line, a contact icon + the client's contact name (linked), then the **Line of Business** (e.g. "X100_Commercial Lines").
- **Stage/Status column:** a colored **Stage** badge — **yellow "Application"**, **green "Binding"** seen in this test (colors likely vary by stage) — with the **Status** text directly beneath it in plain type (e.g. "Incomplete" under Application, "Bound" under Binding — this "Bound" value is the same header-status change documented as a side effect of the "In Force" submission in `Opportunity_Marketing_Page_Knowledge_Base.md` §6.7).
- **Effective** date.
- **Confidence/Likely Premium column:** a small edit-pencil icon (for Confidence, inline-editable) and a **$ value** with its own edit-pencil (Likely Premium, also inline-editable) — both editable directly from the list without opening the record.
- **Retail Agent** (seen as "N/A" throughout this test client).
- **Branch/Assignment column:** a branch icon + branch name (e.g. "2.5 branch") and an assignment icon + assigned person (e.g. "DyadQA2.5 Automation").
- **Last Modified** column: date, plus the modifying user's name underneath.
- A **"≡" (hamburger) menu** at the far right of each row's header line (§4).
- A second, cream/yellow-tinted sub-row beneath the main line, with **Description:** and **Last Action:** labels (both blank in this test — presumably editable/fillable inline, not confirmed) and, at the far right, **three small icon-counters**: a lightning bolt (Actions), an envelope (Deliveries), and a paperclip (Attachments), each showing a count (all **0** in this test client's non-bound Opportunities). This mirrors the activity-counter pattern already seen on Opportunity/quote/policy rows throughout the companion KBs.

Five Opportunities existed on this test client: **OPP-001387, OPP-001391, OPP-001392, OPP-001393** (all Stage "Application" / Status "Incomplete," $0.00 Likely Premium — these look like abandoned/incomplete test records), and **OPP-001394** (Stage "Binding" / Status "Bound" — the same record built out and bound across the Manual Quote, Marketing/Binding, and Policy Details companion documents).

## 3. Show Filters panel

Expands into a **three-column filter form**:

- **Opportunity** column: Opportunity Number (text), Description (text), Product Name (dropdown, default "All"), Confidence (dropdown, default "All"), **Stage** (dropdown — **5 options: All, Application, Marketing, Proposal, Binding**), **Status** (dropdown — **dependent on Stage**; with Stage left at "All" it offers only a single "All" option and no other values are selectable until a specific Stage is chosen), Likely Premium (currency input).
- **Associations** column: Client Name (text), Retail Agent Name (text), Branch (dropdown, default "All"), Assignment Name (text).
- **Dates** column: Effective **From / To** (two date pickers with calendar icons).
- **Apply Filter** / **Clear** buttons, plus the same **Save / Recall / Clear Memory** filter-preset links seen on the Overview page's Account Activity panel.
- **Notable finding:** the Stage filter's option list includes a **"Proposal"** stage that does **not** appear anywhere in the Opportunity record's own 3-tab stepper (Application / Marketing / Binding, as documented in the companion Opportunity KBs). This suggests either a 4th stage that exists in the data model but isn't currently surfaced as a stepper tab in this environment/configuration, or a legacy/unused value. Worth confirming directly before assuming the stepper is the complete list of stages an Opportunity can be in.

## 4. Group By

A separate dropdown (independent of the filter panel) with **5 options: None, Stage, Retail Agent, Branch, Effective Date.**

## 5. Row "≡" menu

Opening the hamburger menu on a row shows up to **4 items**, and the set differs by the Opportunity's state:

- On an **"Application/Incomplete"** row: **Assignments**, **View Action**, **Lost Opportunity** (greyed/disabled in this test — not confirmed why; possibly requires a precondition, or may simply be disabled in this environment), **Delete Opportunity** (red, with a trash icon).
- On the **"Binding/Bound"** row (OPP-001394): only **3 items** — **Assignments**, **View Action**, **Lost Opportunity** (also greyed). **"Delete Opportunity" is absent** on this bound record — consistent with a bound/in-force Opportunity no longer being deletable via this menu.

## 6. "+ New" — Opportunity creation wizard

Clicking **"+ New"** navigates (not a modal — a full in-app page, breadcrumbed **"Opportunities: New"**) to a **2-step wizard**:

- **Step 1 — "Select Assignment":** *"Add assignments for this policy. One must be designated as primary before proceeding."* A grid: **Primary** (✓), **Branch**, **Name**, **Department**, **Unit**, **Responsibility**, **Use Signature** (checkbox), and a delete icon per row, plus a **"+"** row to add another assignment. A **Next** button (leads to Step 2, "Select Product" — not explored further in this pass; presumably the same product/LOB selection that seeds a new Opportunity's ACORD application, consistent with the Application-tab KB).
- Note the wizard's own copy says "this **policy**" even though it's titled "Opportunities: New" — likely just informal/reused copy from a shared component, not a meaningful distinction.

## 7. Summary checklist for automation design

- This is a genuinely different UI shape from most grids in the app — **multi-line "card" rows** with inline-editable Confidence/Likely Premium fields, rather than a flat single-line grid — build parsers accordingly.
- **Stage filter reveals a "Proposal" stage not present in the Opportunity record's own stepper UI** — worth investigating directly (e.g. by filtering to Stage=Proposal) if automation needs to handle every possible Opportunity stage, not just the three visible tabs.
- **Status filter options are dependent on the selected Stage** — don't expect Status choices to populate until Stage is set to something other than "All."
- The row-level **"≡" menu's option set changes based on Opportunity state** (a Bound Opportunity loses "Delete Opportunity") — don't assume a fixed 4-item menu everywhere.
- **"+ New" is a full-page multi-step wizard, not a modal** — differs from most "New ___" flows elsewhere in this app (which are typically in-page `.dynamicModal`s). Automating Opportunity creation means driving this wizard's Assignment step (at least one row must be marked Primary) before a Product/LOB can even be selected.
- The activity-counter icons (lightning/envelope/paperclip) and Description/Last Action inline row all read **0/blank** for every non-bound test Opportunity here — useful as a quick "has anything happened on this record" signal without opening it.