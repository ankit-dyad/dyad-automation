Knowledge Base — Opportunity Detail Page/Opportunity Application Page (ACORD 126 "Application" Tab)
Application: Nexsure (R5 Insurance Agency) — nexui Vue.js SPA Captured from: An already-created Opportunity record — Opportunities: X100_Commercial Lines OPP-001387, client Automation_001 URL at capture: https://jmiqaweb01.nexsure.com/nexui/#/opportunities/1387 Captured on: 2026-09-21

This is a companion document to Opportunities_New_Wizard_Knowledge_Base.md. That document covers the Opportunities: New wizard (Select Client → Select Assignment → Select Product). This document picks up after an Opportunity has been created — i.e. what the user lands on when they open an existing Opportunity record from search results, a client's Opportunities list, or right after finishing the New Opportunity wizard. Unlike the wizard, this is not a gated multi-step flow — it is a persistent record with a 3-tab stepper the user can click freely in any order.

Scope note: This pass explored the page structure, header controls, the Lines-of-Business/Tags side panel, the tag-filter mechanism, and the full field inventory of the one Line of Business present on this record (X100_General Liability — ACORD 126). It also did a light pass over the "2. Marketing" and "3. Binding" tabs for structural orientation only. The following were deliberately NOT clicked/exercised, consistent with the standing rule of not triggering irreversible or record-creating business actions without explicit user confirmation: "Lost Opportunity" (looks like a terminal/irreversible status change), "Prefill" (unknown data-source/overwrite behavior), "Manual Quote" / "Send to Raters" / "Send Application" / "Coverage Comparison" on the Marketing tab (these almost certainly create or transmit real quote/submission records), and the "ADD LINE(S) OF BUSINESS" / "ADD APPLICATION/SUPPLEMENT" menu items (would add real structure to the record). Their existence and location are documented below so automation can target them later, once the user confirms it's safe to exercise them.


1. Where this screen lives / how it renders
Reached by clicking into an existing Opportunity (from search, a client's record, or immediately after completing the "Opportunities: New" wizard). URL pattern: #/opportunities/{OpportunityId} (e.g. #/opportunities/1387).
Not a new browser tab, not a popup window, not an iframe. It's a normal in-page SPA route render, same as every other screen in this app.
Several controls on this page do open in-page modal dialogs (.dynamicModal pattern, confirmed elsewhere in this app):
Clicking the Branch/Assignment pencil opens an "Assignment: OPP-<number>" modal — this is the same Assignment grid already documented in Opportunities_New_Wizard_Knowledge_Base.md / Assignment_Page_Knowledge_Base.md (columns: Primary, Branch, Name, Department, Unit, Responsibility, Use Signature, Last Updated; add-row via a trailing "+" row). It is reused verbatim at the Opportunity level.
Clicking the Retail Agent pencil opens an "Add Retail Agent" modal with a single Keywords free-text search box (placeholder: "Name, Address, Email, Phone, SSN, FEIN") and Cancel / Save buttons. No agent was searched for in this pass.
On scroll, a sticky condensed header bar appears at the very top of the viewport (below the global app nav), showing just Client name | Opportunity title | STAGE | STATUS | POLICY TERM. This is useful for automation as a persistent "current record" anchor while scrolled deep into the ACORD form.
2. Header info bar (top of page)
Left block: client name banner (e.g. "Automation_001"), with Location (street address, clickable → opens Google Maps in a new tab) and Contact (name + envelope icon, presumably opens an email/compose action — not tested).

Right block — a grid of editable/display fields, each with a pencil (✎) edit icon except Stage:

Field
Control type when edit-pencil clicked
Notes
Stage
(no pencil — not directly editable)
Displays current tab name ("Application" / "Marketing" / "Binding"). Changes only by using the 3-tab stepper below, not by direct edit.
Status
Searchable single-select dropdown (vue-select), opens inline under the label (not a modal)
Full fixed option list (9 values, confirmed via DOM): Incomplete, Application Completed by Applicant, Application Completed by Retail Agent, Application Pending, Application in Underwriting Review, Application in Client Review, Application in Retail Agent Review, Application Rejected by Retail Agency, Application Rejected by Client. Default observed: "Incomplete".
Primary State
Searchable single-select dropdown (vue-select), inline
Full US state list (all 50 states + territories + a generic "[USA]" and "Select" entries), alphabetical. Observed value: "CO" / "Colorado".
Branch / Assignment
Opens the Assignment modal (see §1)
Shows below it (no pencil of its own) a second line with a small badge icon + the assigned employee's name (e.g. "DyadQA2.5 Automation") — this is a read-only reflection of the modal's Primary row, not independently editable.
Confidence
Searchable single-select dropdown (vue-select), inline
Fixed option list: All, 0%, 25%, 50%, 75%, 100%. Empty/unset by default.
Likely Premium
Inline free-text numeric input with a "$" suffix shown inside the box
Empty by default; no formatting/masking observed on open (plain text box).
Effective
Becomes a native HTML <input type="date"> inline (browser-rendered date picker/spinner)
Pre-populated with the record's effective date (e.g. 09/21/2026).
Retail Agent
Opens the "Add Retail Agent" search modal (see §1)
Empty by default (no agent assigned in this test record).
Description
Becomes an inline free-text input (single line, cursor appears directly after "DESCRIPTION:")
Empty by default; no visible Save button — presumably auto-commits on blur/Enter (not explicitly confirmed).
Last Action
(no pencil, read-only)
System-generated activity-log style text; empty on this record.


To the right of the Description/Last Action row, three small counters with icons are shown: a lightning-bolt icon (Actions?), an envelope icon (Deliveries/Messages?), and a paperclip icon (Attachments) — each currently reading 0. Their exact click-through destinations were not explored in this pass, but they visually mirror the "NEW ACTION" / "NEW DELIVERY" / "CREATE DOCUMENT" buttons in the page's top-right toolbar, which were also not exercised (likely create real Action/Delivery/Document records).
3. The 3-tab stepper: Application / Marketing / Binding
Rendered as a simple horizontal tab strip with a colored progress underline (green = visited/current, blue = next, grey = not yet visited).
Important — this is NOT a gated wizard. Unlike the "New Client" and "Opportunities: New" wizards (which require clicking "Next" and validate before advancing), all three tabs here were freely clickable in any order with no validation gate — clicking "3. Binding" worked immediately even though "2. Marketing" had zero quotes.
1. Application — the ACORD 126 form (documented in detail in §4–§6 below). Toolbar on this tab: Print button and Lost Opportunity button (red outline — destructive-looking, not tested).
2. Marketing — shows a "Quotes" data grid with columns: Carrier Name, Quote Number, Quote Date, Good Through, Status, Line of Business, Method, Note, plus a Group By dropdown (default "None") and standard grid pagination controls (Showing/Items per page/Unlocked/Page x of y). Grid was empty ("no items") on this record. Toolbar buttons: Coverage Comparison (greyed/disabled), Manual Quote (enabled, blue outline), Send to Raters (greyed/disabled), Send Application (enabled, solid blue), and Lost Opportunity (red outline). None were clicked.
3. Binding — header text: "Here you can view accepted quotes and complete requirements to convert them to active policies." Shows a grid with columns Policy Number, Effective Date, Expiration Date, Line of Business, same pagination pattern, currently empty. Only Lost Opportunity appears in the toolbar here (no Print).
4. Left sidebar panels (persist across the 3 tabs)
4.1 "Lines of Business" panel
Shows a small tree: a top-level "Commercial Application" node (the ACORD form family/container) with the actual purchased Line of Business nested under it as a clickable link — here: "X100_General Liability (126)". Clicking that link is what loads/selects that LOB's form in the main content area (only one LOB exists on this record, so it's effectively always selected).
A "+ Add" button opens a small dropdown menu with two options: "ADD LINE(S) OF BUSINESS" and "ADD APPLICATION/SUPPLEMENT". Neither was invoked (would add real structure to the record) — worth confirming with the user before automating, since one likely opens a LOB/Product picker resembling the one already documented in the Opportunities-New-Wizard KB.
4.2 "Tags" panel
Lists every distinct tag currently applied to any field on the selected LOB's form, rendered as clickable chip/pill buttons. On this record: ACORD 126, Coverage, Deductible, GL Coverage Summary, GL For Quote Proposal, Limit.
Clicking a chip directly toggles it on as an active filter for the main form (identical effect to selecting it via "Filter by Tag" in §5.2 below) — the chip highlights blue/active, and the ACORD form collapses down to show only the sections/fields carrying that tag.
This is a read/filter-only panel — no evidence of an "add new tag" or "remove tag from field" control here; tag assignment to a field appears to be system/template-defined, not user-editable from this page.
5. Main content area — "X100_General Liability (126)" panel chrome
At the top of the ACORD form panel (above the 13 form sections):
5.1 Panel toolbar
"FILTER BY TAG" — a checkbox multi-select dropdown (see §5.2).
"Prefill" button (blue outline) — not tested; name strongly suggests it auto-populates fields from another source (e.g. the client record, a prior submission, or a template) and could silently overwrite existing field values, so it was left alone.
An unlabeled icon-only button (bullet/list glyph) immediately to the right of Prefill — behavior was inconsistent across repeated tests in this pass (sometimes appeared to fully collapse the entire LOB form down to nothing but an "Expand All" link with no section headers at all; at other times a click produced no visible change). Do not rely on this control for automation without further, dedicated investigation — use the explicit "Collapse All"/"Expand All" text link instead (see §5.3), which behaved consistently.
5.2 "Filter by Tag" control
Click the search-style box to open a checkbox list of all 6 tags (same set as the sidebar Tags panel: ACORD 126, Coverage, Deductible, GL Coverage Summary, GL For Quote Proposal, Limit).
Checking one or more tags immediately filters the entire 13-section ACORD form down to only the sections/fields that carry at least one of the checked tags (confirmed with "Coverage": form narrowed from 13 sections to just "Coverages" and "Limits", and further to only the specific fields within those sections that are tagged Coverage).
Selected tags appear as removable pill chips directly under the search box (with an "×" to clear each one); the sidebar Tags panel simultaneously highlights the same tag(s) as active.
This is purely a display filter — it does not change, lock, or hide data; it only changes which rows/sections are rendered. Automation should not assume fields "don't exist" just because a tag filter is active — always clear filters before asserting on the full form.
5.3 Collapse All / Expand All
A text-link toggle (label flips between "COLLAPSE ALL" and "EXPAND ALL") sits just below the filter row.
Collapsed state: every section renders as just its header bar (colored dark-blue band with a "+" icon and the section name) with no fields visible — all 13 headers remain visible and clickable to expand individually.
Expanded state (default on page load): every section is fully expanded showing all its fields.
Each individual section header also has its own local "+/−" toggle, independent of the global Collapse/Expand All link.
5.4 Per-field chrome common to (almost) every field on the ACORD form
Info icon (ⓘ) immediately after most field labels: hovering (no click needed) reveals a tooltip with ACORD-style help text for that exact field, e.g. hovering the ⓘ next to "Other Coverage Limit" showed: "Enter limit: The general liability, other coverage limit amount. Any questions about appropriate limits or applicable policy coverage(s) should be answered by the issuing insurer(s)." Useful as a source of field-level documentation/tooltips if automation needs to surface help text.
Tag badge: many (not all) fields show a small tag-icon + number to the right of the input, e.g. "🏷 5". This is not an "add another instance" control — clicking it opens a small read-only "Tags" popover listing the actual tag name(s) applied to that specific field (e.g. a field showing "🏷 5" listed: ACORD 126, GL For Quote Proposal, GL Coverage Summary, Coverage, Limit). This is what feeds the Filter-by-Tag mechanism in §5.2 — a field only appears under a given tag filter if its own tag list includes that tag. Fields with no badge have no tags applied and will never be shown by any tag filter.
6. Field inventory — ACORD 126 sections (X100_General Liability)
All 13 sections were captured in fully-expanded state. Field types below are inferred from visible control chrome (checkbox squares, radio circles, $-suffixed boxes, native date pickers, free-text boxes, native <select> dropdowns). Where a control's exact option list was not confirmed by direct interaction in this pass, it's noted as such — treat those as needing a follow-up pass before an automation script depends on exact option text.

Producer Agency (free text — pre-filled "Diamonds are a girls best friend branch" on this record) · Producer First Name · Producer Middle Initial · Producer Last Name · State Producer License Number · National Producer Number (all free text, all empty except Agency).

Applicant Application Date (native date input, pre-filled) · Agency Customer ID (free text, pre-filled numeric ID, tagged) · Applicant / First Named Insured (free text, pre-filled with client name "Automation_001").

Billing Carrier (free text, empty, tagged) · Insurer's NAIC Code (free text, empty, tagged) · Policy Number (free text, pre-filled "POL3716", tagged) · Effective Date (native date input, pre-filled, tagged).

Coverages Commercial General Liability (checkbox, tagged) · Commercial General Liability - Basis (dropdown — options not enumerated) · Owner's & Contractors Protective (checkbox, tagged) · Other Coverage (checkbox) · Other Coverage Description (free text, tagged) · Deductibles - Property Damage (checkbox) · Property Damage Deductible Amount ($ text, tagged) · Deductible - Bodily Injury (checkbox) · Bodily Injury Deductible Amount ($ text, tagged) · Deductible - Other Deductible (checkbox) · Other Coverage Deductible Description (free text) · Other Coverage Deductible Amount ($ text, tagged "2") · Deductible Type (field present per text dump — control type not independently confirmed).

Limits General Aggregate Limit ($ text, tagged "5") · GL Limit Applies Per Policy / Per Project / Per Location / Per Other (four checkboxes) · Other Description (free text) · Products & Completed Operations Aggregate Limit ($ text, tagged "5") · Personal & Advertising Injury Limit ($ text, tagged "5") · Each Occurrence Limit ($ text, tagged "5" — confirmed tags: ACORD 126, GL For Quote Proposal, GL Coverage Summary, Coverage, Limit) · Damage to Rented Premises Limit ($ text, tagged "4") · Medical Expense Limit ($ text, tagged "5") · Employee Benefits Limit ($ text, tagged "4") · Other Limit Description (free text) · Other Coverage Limit ($ text, tagged "2") · Premiums-Premises/Operations Premium ($ text) · Products Premium ($ text) · Other Coverage Premium ($ text) · Total General Liability Premium ($ text) · Other Coverages, Restrictions and/or Endorsements (multi-line textarea) · UM / UIM Coverage is available or Not Available (dropdown, options not enumerated) · Medical Payments Coverage is or Not available (dropdown, options not enumerated).

Schedule of Hazards — see §7 (grid/repeater section).

Claims Made

Proposed Retroactive Date · 2. Entry date into uninterrupted claims made coverage · 3. "Has any product, work, accident or location been excluded, uninsured or self-insured from any previous coverage?" (YES/NO radio pair) with "If yes, explain (Claims Made question #3):" textarea · 4. "Was tail coverage purchased under any previous policy?" (YES/NO radio pair) with "If yes, explain (Claims Made question #4):" textarea.

Employee Benefits Liability Deductible Per Claim (tagged "2") · Number of Employees · Number of Employees Covered By Employee Benefits Plan · Retroactive Date.

Contractors — 6 YES/NO questions, each followed by an always-visible "Remarks" free-text textarea (see §8 for the important radio/Remarks behavior note): 1. Does applicant draw plans, designs, or specifications for others? · 2. Do any operations include blasting or utilize or store explosive material? · 3. Do any operations include evacuation, tunneling, underground work or earth moving? · 4. Do your subcontractors carry coverages or limits less than yours? · 5. Are subcontractors allowed to work without providing you with Certificates of Insurance? · 6. Does applicant lease equipment to others with or without operators? Followed by: Amount Paid to Subcontractors ($ text) · Percent of Work Subcontracted (text) · Number Full Time Staff (text) · Number Part Time Staff (text) · Remarks/Describe the type of work & percentage subcontracted (textarea).

Products / Completed Operations — see §7 (grid/repeater section).

Products Information — 10 YES/NO questions, each with a Remarks textarea: 1. Does applicant install, service or demonstrate products? · 2. Foreign products sold, distributed, or used as components? · 3. Research and development conducted or new products planned? · 4. Guarantees, warranties, hold harmless agreements? · 5. Products related to aircraft/space industry? · 6. Products recalled, discontinued, changed? · 7. Products of others sold or repackaged under applicant's label? · 8. Products under label of others? · 9. Vendor's coverage required? · 10. Does any named insured sell to any other named insured?

Additional Interest — see §7 (grid/repeater section).

General Information (organized into "Part 1"–"Part 4" sub-headers within one section) — 22 numbered YES/NO questions, several with extra conditional-looking sub-fields (though see §8 — sub-fields are not confirmed to actually be conditionally hidden):

Part 1: 1. Any medical facilities provided or medical professionals employed or contracted? (tagged "1", Remarks tagged "1") · 2. Any exposure to radioactive/nuclear materials? (tagged "1", Remarks tagged "1") · 3. Do operations involve storing, treating, discharging, applying, disposing or transporting hazardous material? · 4. Any listed operations sold, acquired, or discontinued in the last five (5) years? · 5. Do you rent or loan equipment to others? — with a doubled sub-block "(A)" and "(B)", each containing: Describe Machinery or Equipment Loaned/Rented, Type of Equipment - Small Tools, Type of Equipment - Large Equipment, Instruction Given (its own YES/NO pair) · 6. Any watercraft, docks, floats owned, hired, or leased?
Part 2: 7. Any parking facilities owned/rented? · 8. Is a fee charged for parking? · 9. Are any recreational facilities provided? · 10. Are there any lodging operations including apartments? — with Number of Apartments, Total Apartment Area (Sq. Ft.), Describe Other Lodging Operations · 11. Is there a swimming pool on the premises? — with a row of checkboxes: Approved Fence, Limited Access, Diving Board, Slide, Above Ground, In Ground, Lifeguard · 12. Are social events sponsored?
Part 3: 13. Are athletic teams sponsored? — with a doubled sub-block "Type of Sport (A)"/"(B)", each with its own "Is this a Contact Sport?" YES/NO, Participant Age Group checkboxes (12 & Under / 13 to 18 / Over 18), and "Describe the Extent of the Sponsorship" · 14. Any structural alterations contemplated? · 15. Any demolition exposure contemplated? · 16. Has applicant been active in or is currently active in joint ventures?
Part 4: 17. Do you lease employees to or from others? — with three lettered sub-blocks (Company A "leased to", Company B "leased from", Company C "leased to") each pairing a company-name free-text field with its own "Workers Compensation Coverage Carried" YES/NO, plus a final unlettered "Lease From" + Workers Compensation Coverage Carried YES/NO pair · 18. Is there a labor interchange with any other business or subsidiaries? · 19. Are daycare facilities operated or controlled? · 20. Have any crimes occurred or been attempted on your premises within the last three (3) years? · 21. Is there a formal, written safety and security policy in effect? · 22. Does the businesses' promotional literature make any representations about the safety or security of the premises?
Trailing fields: "ACORD 45 attached for additional names" (checkbox) and a final free-text "REMARKS" box.
7. Grid / repeater sections (Schedule of Hazards, Products/Completed Operations, Additional Interest)
All three sections share identical chrome:

A drag-and-drop file import zone ("Drag a file here to import or click to browse.") for bulk-loading rows from a file.
Export, Add New, and Delete buttons.
A Filter: free-text box for searching within the grid's rows.
Standard pagination footer (Showing/Items per page/an "Unlocked" toggle-link/Page x of y, with first/prev/next/last controls), duplicated above and below the row area.
Empty-state message when no rows exist: "There are no items to display. If this is unexpected, please contact your system administrator."

All three grids were empty on this test record. Important quirk: clicking "Add New" on the Schedule of Hazards grid produced no observable effect in this pass — no new editable row appeared inline, no modal opened, and the empty-state message persisted through two separate attempts. This may be a genuine defect (similar in spirit to the "stuck Done button" bug documented on the Assignment page), or it may require an unmet precondition (e.g. the grid's "Unlocked" state, or a page reload) not identified here. Automation should not assume "Add New" reliably opens a row-entry UI on this grid without a dedicated follow-up investigation — treat it as an open question, not a confirmed working control.
8. YES/NO radio + Remarks pattern — correction from earlier assumption
Earlier exploration of this app (documented in prior KB files) assumed YES/NO questions conditionally reveal their "Remarks" field only when answered. On this page, that assumption does not hold: every "Remarks" / "explain" textarea observed in Claims Made, Contractors, Products Information, and General Information is rendered at all times, regardless of whether YES, NO, or neither radio option is selected. Selecting YES (tested on Contractors Q1) simply fills the radio circle — no field appeared, disappeared, became required, or changed style as a result. Automation targeting these Remarks fields does not need to first select a radio value to make them interactable.
9. Summary checklist for automation design
Target this page as a normal in-page SPA route (#/opportunities/{id}) — no tab/iframe/popup handling needed for the page itself, but do expect true in-page modals (.dynamicModal) for Branch/Assignment ("Assignment: OPP-<n>" grid) and Retail Agent ("Add Retail Agent" search).
The 3-tab stepper (Application/Marketing/Binding) is freely navigable — do not build wizard-style "Next must be enabled" gating logic for it the way the creation wizards require.
Header fields are a mix of control types per-field: two vue-select dropdowns with fixed option sets (Status: 9 values; Confidence: 6 values), one vue-select with a large dynamic option set (Primary State: US states), one native date input (Effective), one free-text currency box (Likely Premium), one inline free-text (Description), and two fields that open modals instead of editing inline (Branch/Assignment, Retail Agent). Stage and Last Action are display-only.
The tag system (sidebar Tags panel + per-field tag badges + "Filter by Tag" control) is a display filter only — do not treat a filtered-out field as missing from the DOM/model; always clear active tag filters (click each chip's "×", or the sidebar chip again) before asserting on full-form state.
Use the explicit "Collapse All" / "Expand All" text link for reliable programmatic section-expand control; avoid the unlabeled icon button next to Prefill, whose behavior was inconsistent in testing.
Every field's ⓘ icon exposes ACORD-style help text on hover (no click required) — a potential source for auto-generating field documentation or on-screen guidance in an automation UI.
Grid sections (Schedule of Hazards, Products/Completed Operations, Additional Interest) share one reusable pattern (import/export/add/delete/filter/paginate) — but confirm "Add New" actually works before scripting against it; it did not visibly do anything in this pass.
Remarks/explain textareas next to YES/NO questions are always present in the DOM — no need to select a radio value first to interact with them.
Left unexplored/untested and flagged for explicit user confirmation before automating: Prefill, the "ADD LINE(S) OF BUSINESS" / "ADD APPLICATION/SUPPLEMENT" menu, all Marketing-tab action buttons (Manual Quote, Send to Raters, Send Application, Coverage Comparison), and Lost Opportunity (very likely a terminal/irreversible status change).

