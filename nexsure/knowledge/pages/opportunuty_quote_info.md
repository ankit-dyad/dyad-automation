Knowledge Base — "Manual Quote" Modal (Opportunity → Marketing Tab)
Application: Nexsure (R5 Insurance Agency) — nexui Vue.js SPA Captured from: Opportunity record Opportunities: X100_Commercial Lines OPP-001394, client Automation_001, "2. Marketing" tab → Manual Quote button URL at capture: https://jmiqaweb01.nexsure.com/nexui/#/opportunities/1394 Captured on: 2026-09-21

This is a companion document to Opportunity_Marketing_Page_Knowledge_Base.md, which flagged that the Manual Quote button had failed to render its panel in an earlier test session (a CSS-asset preload failure). On a fresh Opportunity record it worked correctly, so this document captures the full Manual Quote modal and the resulting Quote row/grid it creates — the piece that was previously undocumented.

Scope note: A quote was created end-to-end (Issuing Carrier + Line of Business + Quote Status → Save) to document the resulting Quote row and its expandable detail tabs, since that's the normal, expected outcome of using this feature (equivalent in spirit to testing "Add Contact" → Save in earlier KBs). The row-level "BIND" and "REJECT" actions found on the saved quote's row menu were not clicked — both look like real, likely irreversible status-changing actions on the quote (binding converts it toward a policy; rejecting presumably closes it out), consistent with the standing rule of not triggering business-critical actions without explicit user confirmation.
1. How it renders
Clicking Manual Quote (from the Marketing tab toolbar) opens an in-page modal dialog (.dynamicModal pattern, same family as other modals in this app) titled "Manual Quote", centered over the page with the rest of the page dimmed behind it.
Not a new tab, not a popup window, not an iframe.
The modal header has two icons on the right: a minimize icon (⤢-style, actually behaves as minimize, not maximize — see below) and an "×" close icon.
Minimize behavior (confirmed): clicking the header's left-hand icon collapses the modal down into a small floating bar docked at the bottom-left corner of the browser window, labeled "Manual Quote" with its own restore icon — similar to a minimized email-compose window. The rest of the page (including the Marketing tab underneath) becomes interactive again while minimized. Clicking the floating bar restores the modal to its full centered state with all previously-entered field values intact (confirmed: Issuing Carrier, Line of Business, and Quote Status selections all survived a minimize/restore cycle).
2. Fields
Field
Control type
Required?
Options / behavior
Issuing Carrier
Searchable single-select dropdown (vue-select) with a "Type to search" type-ahead prompt
Yes (red asterisk)
Default "Select". Scrollable list of carrier master data, alphabetical — observed: AAA Carrier, AAA of Michigan, Acadia-Berkeley, Bristol West, Great America, Ohio Casualty Insurance Co, and more below the visible fold (org-backed master data list, same pattern as other carrier/master-data pickers in this app — treat as live data, not a fixed enum).
Lines of Business
Checkbox multi-select dropdown (opens a small panel under the field on click)
Yes (red asterisk)
Lists only the Line(s) of Business actually present on this Opportunity — on this record, just one: "X100_General Liability (126)". A small icon inside the field (right-aligned) opens this checklist; the field itself doubles as free text but no typing was needed to filter the single-item list here.
Quote Status
Single-select dropdown (vue-select)
Yes (red asterisk)
Default "Submitted". Full fixed option list (6 values, confirmed): Submitted, Quoted, Rejected, Underwriting Review, Error, Accepted.

3. Buttons
Button
Behavior
Save
Disabled (greyed) until all three required fields have a value. Once Issuing Carrier, Lines of Business, and Quote Status are all set, it becomes a solid blue enabled button. Clicking it closes the modal and immediately adds a new row to the "Quotes" grid on the Marketing tab (no separate confirmation step, no page reload).
Cancel
Red button; closes the modal without saving (not exhaustively tested for a "discard changes?" prompt — none was observed).

4. The resulting Quote row (in the "Quotes" grid, Marketing tab)
Saving produces a new two-line grid row:

Top line (matches the grid's column headers):

Carrier Name — shows the carrier (e.g. "Acadia-Berkeley", truncated in the narrow column) with a small carrier/shield icon, a checkbox (for bulk row selection — not tested further) to its left, and an expand/collapse arrow (▶/▼) to reveal the detail panel described in §5.
Quote Number — empty by default, pencil-editable inline as free text.
Quote Date — empty by default, pencil-editable inline as a native <input type="date">.
Good Through — empty by default, same native date-input pattern (inferred from Quote Date's behavior; not independently re-tested).
Status — shows the selected Quote Status (e.g. "Submitted", styled as a blue link) with its own pencil — presumably opens the same 6-value Quote Status dropdown as the Manual Quote modal.
Line of Business — read display of the selected LOB (e.g. "X100_General Liability (126)").
Method — read-only, shows "Manual" for a quote created this way (distinguishing it from quotes that might arrive via an automated rater/carrier integration).
Note — empty by default, pencil-editable.
A "≡" hamburger menu at the far right of the row opens a small action menu with exactly two items: BIND and REJECT (not tested — see scope note above).

Second line (a lighter/highlighted sub-row directly under the first):

"$0.00" (pencil-editable currency field, left-aligned under Carrier Name) — appears to be the quote's premium/indication amount, mirrored from the Billing Info tab's "Indication" total (see §5.2).
"ANNOTATION" — a pencil-editable label/field spanning the middle of the row (a free-text annotation on the quote).
"No requirements to bind" (italic, pencil-editable) — reads like a status/link summarizing outstanding requirements before the quote can be bound; presumably becomes a real list/count once binding requirements exist.
Three small counters with icons (⚡ / ✉ / 📎, all showing 0) — the same Actions/Deliveries/Attachments-style counters seen on the Opportunity header, scoped to this individual quote.
5. Expanding the quote row — three detail tabs (Manual Quote Details)
Clicking the row's expand arrow (▶) reveals a tabbed detail panel directly under the row, with three tabs: COVERAGE, BILLING INFO, PORTAL SETTINGS. The panel loads asynchronously (brief spinner) the first time it's expanded. This section documents each tab in depth, including follow-up interactive testing beyond the initial pass (add-row behavior, cross-tab data independence, and the Indication/Details relationship).
5.1 Coverage tab
Shows the quote's coverage limits, organized into labeled groups that mirror the "Limits" section of the ACORD 126 Application form, each with editable $-suffixed inline fields (all defaulted to $0 on a fresh manual quote):

Employee Benefits → Employee Benefits Limit, Employee Benefits Deductible Per Claim
Damage To Rented Premises → Damage to Rented Premises Limit
Each Occurrence Limit → Each Occurrence Limit
General Liability Aggregate → General Aggregate Limit
Medical Expense → Medical Expense Limit
Other Coverage → Other Coverage Limit, Other Coverage Deductible Amount
Personal Advertising Injury → Personal & Advertising Injury Limit
Products, Completed Ops Aggregate → Products & Completed Operations Aggregate Limit

Confirmed independent from the Application tab (tested directly): entering $1,000,000 into this quote's "Each Occurrence Limit" field and then switching to the "1. Application" tab and expanding its ACORD 126 Limits section showed the Application-tab "Each Occurrence Limit" field still empty — the value did not carry over either direction. Each carrier's quote keeps its own fully independent copy of these limit fields; there is no live sync or shared source of truth between a quote's Coverage tab and the Application tab's Limits section, despite the identical field labels. Automation should treat these as two separate data sets that happen to share a schema, not one field mirrored in two places.
5.2 Billing Info tab
A toggle switch labeled "Indication ↔ Details" (default: Indication, "off"/left position).
Indication mode: a single simple view with a Grand Total and one editable currency box (this is the same figure reflected as "$0.00" on the row's second line — see §4).
Details mode (confirmed by toggling): expands into a full billing breakdown with a Grand Total at top and three collapsible, color-coded sections, each with its own running total and an inline "+ Add row" control:
Premiums (green header, "Total Premiums") — grid columns: Level/LOB, Description, Taxable (checkmark), Amount. Pre-seeded with one row for the LOB on this quote (e.g. "X100_General Liability (126) (1)").
Fees (brown header, "Total Fees") — grid columns: Level/LOB, Fee Code, Service Provider, Description, Rate Type, Rate, Taxable, Amount. Empty by default.
Taxes (dark-blue header, "Total Taxes") — grid columns: Level/LOB, Tax Code, Payee Type, Payee, Description, Rate Type, Rate, Amount. Empty by default.
A "Collapse All" link sits above the three sections (mirrors the Collapse/Expand All pattern seen on the ACORD form).

Key insight — Indication mode restricts editing to a single amount (confirmed by testing): while the toggle is set to Indication, the panel shows and allows editing of only the one lump-sum amount field — the itemized Premiums/Fees/Taxes breakdown is not visible or reachable at all in this mode. That single amount is not a separate top-level number: on a quote with exactly one Line of Business, it is that LOB's one and only Premiums line item — editing it in Indication mode directly overwrites the "Amount" on the sole Premiums row, and the Grand Total / Total Premiums shown in Details mode update to match. In other words, Indication mode is a simplified single-field editor for the same underlying Premiums total that Details mode exposes broken out — not a separate/independent value. Practical implication for automation: if a quote will only ever need one flat premium number, Indication mode is the faster path; if fees, taxes, or a Level/LOB-by-Level/LOB breakdown are needed, Details mode must be used, since Indication mode provides no access to those fields at all.

Observed quirk (documented, not fully explained): typing digits directly into the Indication amount field behaves like a right-to-left masked currency input (e.g., typing "5","0","0","0" progressively read as 0.05 → 0.50 → 5.00 → 50.00, landing on $50.00 immediately after tabbing out) — but after switching to Details mode and back, the persisted value had settled at $1,000.00 instead, and that was the figure reflected everywhere (row summary, Grand Total, Total Premiums, and the Premiums line item). The two views agreed on the final number, just not on what was shown immediately after typing versus after a full reload/recalculation. Automation typing into this field should read back the committed value after a save/reload rather than trusting the value shown right after typing, and should consider typing pre-formatted values (e.g. clearing the field first) rather than relying on the masked left-to-right accumulation behavior.

"+ Add row" behavior (tested, in Details mode → Premiums section): clicking the blue "+" at the end of a section's row list opens a new inline editable row directly below the existing rows, with: a Level/LOB dropdown (default "Select"), a Description free-text field (pre-filled with a default value — "Premium" for a Premiums-section row), a Taxable checkbox (unchecked by default), an Amount currency field (defaulting to $0.00), and two small icon buttons at the row's end — a checkmark (✓) to confirm/commit the new row, and a circle-slash (⊘) to discard it without saving. Clicking the circle-slash cleanly removed the in-progress row with no trace left behind (confirmed by re-inspecting the section afterward — only the original pre-seeded row remained). The same add-row pattern is presumed to apply to the Fees and Taxes sections given their identical "+" control and matching visual style, though only Premiums was interactively tested.
5.3 Portal Settings tab
Portal Description — a single free-text input, empty by default.
Visibility — three independent checkboxes: Client, Retail Agent, Carrier (all unchecked by default; confirmed clickable/toggleable — checking "Client" produced a normal checked checkbox state). No cascading UI effect (no new fields, no confirmation message) was observed elsewhere on the page as a result of checking a Visibility box. Presumably controls which portal audiences can see this quote when a client/agent/carrier self-service portal is in use — the actual portal-facing effect couldn't be verified without such a portal connection, so treat this as a plain persisted flag rather than a control with confirmed downstream behavior.
6. Toolbar button state after a quote exists
Re-checked the Marketing tab's toolbar buttons programmatically after saving one quote: Coverage Comparison and Send to Raters were still disabled with exactly one quote present. This corrects/refines the earlier open question in Opportunity_Marketing_Page_Knowledge_Base.md — having a quote is not sufficient by itself to enable either button. Coverage Comparison most likely requires two or more quotes to compare against each other; the enablement condition for Send to Raters remains unconfirmed.
7. Summary checklist for automation design
Manual Quote is an in-page modal (.dynamicModal), not a tab/window/iframe; it supports a genuine minimize-to-corner / restore interaction that preserves all entered field state — don't assume "modal not visible" means "modal was closed/data lost."
All three fields (Issuing Carrier, Lines of Business, Quote Status) are required — Save stays disabled until each has a value; a reliable automation wait-condition is "wait until Save is enabled" rather than trying to detect validation messages.
Issuing Carrier is a live/org master-data list (type-ahead vue-select) — don't hardcode its options as a fixed enum.
Lines of Business only offers the LOB(s) already added to this specific Opportunity, not a global product catalog.
Quote Status is a genuine fixed 6-value enum: Submitted, Quoted, Rejected, Underwriting Review, Error, Accepted.
Saving creates a real, persistent Quote row in the Marketing tab's grid with Method = "Manual" — this is how "Manual" vs. other Method values (e.g. a future rater-integration method) would be distinguished in data.
The saved row exposes further inline-editable fields (Quote Number, Quote Date, Good Through, Status, Note) plus an expandable 3-tab detail panel (Coverage / Billing Info / Portal Settings) with substantially more structured data than the row itself shows — automation that needs full quote detail should plan to expand the row, not rely on the collapsed grid columns alone.
The row's "≡" menu exposes BIND and REJECT actions — both are real status-changing operations on the quote and were intentionally left untested; treat them as needing explicit confirmation before automating, the same as "Send Application" and "Lost Opportunity" on the parent tab.
Coverage Comparison and Send to Raters remain disabled with a single quote present — don't assume one manually-added quote is enough to unlock cross-quote comparison features.
