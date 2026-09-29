Knowledge Base — Opportunity Detail Page, "2. Marketing" Tab (Quotes)
Application: Nexsure (R5 Insurance Agency) — nexui Vue.js SPA Captured from: Opportunity record Opportunities: X100_Commercial Lines OPP-001387, client Automation_001, "2. Marketing" tab URL at capture: https://jmiqaweb01.nexsure.com/nexui/#/opportunities/1387 (tab state is client-side; the hash URL does not change between the 1/2/3 tabs) Captured on: 2026-09-21

This is a companion document to Opportunity_Detail_Application_Knowledge_Base.md, which covers the header bar, sidebar, and the "1. Application" tab (the ACORD 126 form) of this same Opportunity record. This document covers only the "2. Marketing" tab, reached by clicking that tab in the 3-tab stepper. The header info bar (Stage/Status/Primary State/Branch-Assignment/Confidence/Likely Premium/Effective/Retail Agent/Description), the left sidebar (Lines of Business / Tags panels — hidden on this tab, see §1), and the 3-tab stepper's own navigation behavior are identical to what's already documented there and are not repeated here.

Scope note — what was deliberately NOT exercised: "Send Application" and "Lost Opportunity" were not clicked. Both look like they trigger a real, likely irreversible business action (submitting the application to a carrier/rater, or terminating the opportunity) and fall under the standing rule of not triggering side-effecting business actions without explicit user confirmation. "Coverage Comparison" and "Send to Raters" were not clicked either, but for a different reason — they are programmatically disabled in the current (zero-quote) state of this record, so there was nothing to click. Their likely enablement condition (≥1 quote row) is noted below as an inference, not a confirmed fact.
1. Layout differences from the "Application" tab
The left sidebar (Lines of Business panel and Tags panel) that appears on the "1. Application" tab is not shown on this tab — the Marketing tab uses the full page width for the Quotes toolbar and grid.
The Print button (present in the Application tab's toolbar) is not present here.
The toolbar row now contains five buttons instead of Application's two (Print / Lost Opportunity): Coverage Comparison, Manual Quote, Send to Raters, Send Application, Lost Opportunity — always in that left-to-right order.
2. Toolbar buttons
Button
Icon
Enabled? (on a record with 0 quotes)
Notes
Coverage Comparison
small branching/compare glyph
Disabled (disabled=true confirmed via DOM)
Presumed gated on having 2+ quotes to compare — not confirmed, since no quotes exist to test with on this record. No tooltip appears on hover explaining why it's disabled.
Manual Quote
document/file glyph
Enabled
See §4 — clicking it attempts to open an in-page panel for manually entering a quote, but it failed to render in this test session due to an app asset-loading error (documented as a quirk, not a confirmed working flow).
Send to Raters
small grid/table glyph
Disabled (disabled=true confirmed via DOM)
Presumed gated on having at least one quote/rater target configured — not confirmed. No tooltip on hover.
Send Application
envelope glyph
Enabled
Not clicked — an envelope icon strongly suggests this transmits/submits the application (to a rater, carrier, or retail agent) as a real, possibly irreversible action. Treat as needing explicit user confirmation before automating.
Lost Opportunity
red "no/circle-slash" glyph, red outline styling
Enabled
Same control seen on the Application tab's toolbar — marks the Opportunity as lost. Not clicked — presumed terminal/irreversible status change.


All five buttons were confirmed programmatically via button.disabled; the two disabled ones (Coverage Comparison, Send to Raters) carry an additional disabled CSS class and render visually greyed-out/lower-contrast, consistent with the rest of the app's disabled-button styling.
3. "Quotes" grid
Section header: "Quotes".
Group By control — a native HTML <select> (not a vue-select combobox, unlike most other dropdowns in this app) with exactly 3 fixed options: None, Raters, Market. Default: "None". Changing it presumably re-groups/re-sorts the grid rows once quotes exist (not testable further with an empty grid).
Grid columns (8 total, left to right): Carrier Name, Quote Number, Quote Date, Good Through, Status, Line of Business, Method, Note.
Empty-state rendering differs from the ACORD-form grids (Schedule of Hazards, etc., documented in the Application-tab KB): instead of an explicit "There are no items to display" message, this grid shows persistent grey skeleton/placeholder bars in the header row area at all times, with no items message and no visible loading spinner — this is simply its at-rest empty-state visual style, not a stuck loading indicator (confirmed by waiting, reloading the page, and re-observing the identical rendering each time).
Pagination/footer controls (duplicated above and below the row area, identical to the pattern seen elsewhere in this app): Showing [10] Items per page, a Locked/Unlocked toggle link with a padlock icon, and Page [1] of 1 with first/prev/next/last navigation arrows.
Locked/Unlocked toggle confirmed interactive: clicking it flips the padlock icon (open ↔ closed) and its label text ("UNLOCKED" ↔ "LOCKED"); when Locked, the "Items per page" number changes from an editable-looking input box to plain bold text (implying editing of that page-size value is disabled while Locked). This same Locked/Unlocked control pattern appears throughout the app's other data grids.
4. "Manual Quote" — attempted deep-dive and an observed app defect
Clicking Manual Quote produces no visible change on screen in this test environment — no modal opens, no panel slides in, and the Quotes grid remains in its empty skeleton state. However, this is not a "dead button": browser console inspection during the click showed the app actively trying to load and render a quote-entry panel, via calls into a NexProducts module:

getQuestionnaireListItemPages
getPolicyQuestionnairePanel
saveQuestionnaireFieldValues

...invoked from Vue components named application_step and questionnaire_preview — strongly suggesting the "Manual Quote" flow is a questionnaire-style form (conceptually similar in shape to the ACORD 126 form on the Application tab) where a user manually keys in a carrier's quoted terms.

The console also logged: Error: Unable to preload CSS for .../assets/manual_quote-B5fz0Gxf.css, immediately followed by several Vue rendering exceptions (getBoundingClientRect is not a function, Cannot read properties of undefined/null) — consistent with the panel's Vue component mounting before its stylesheet chunk finished loading, then crashing during layout. This reproduced identically across a full page reload and multiple repeated clicks.

Automation implication: treat "Manual Quote" as a known-unreliable control in this environment rather than assuming it's simply unimplemented. It could not be exercised end-to-end in this pass, so its actual form fields, validation, and Save/Cancel behavior remain undocumented. Before scripting against it, confirm in the target automation environment (which may not share this session's asset-loading issue) that the panel actually opens.
5. Summary checklist for automation design
This tab shares the record's header bar and 3-tab stepper with the Application tab (see the companion KB) but drops the left sidebar and the Print button, and swaps in a 5-button Marketing-specific toolbar.
Coverage Comparison and Send to Raters are disabled on a zero-quote record — don't script clicks on them until at least one quote row exists (exact enablement condition not confirmed).
Manual Quote is enabled but did not successfully open its panel in this environment due to a CSS asset preload failure — verify it renders correctly in your actual automation target before relying on it; do not assume its absence of visible effect means it's a no-op button.
Send Application and Lost Opportunity are enabled and clickable but were intentionally not exercised — both look like real, likely irreversible business actions (submission / termination) and should only be automated after explicit confirmation of their exact effect.
The Quotes grid's "Group By" control is a plain native <select> (None/Raters/Market) — simpler to automate than the vue-select comboboxes used elsewhere in this app.
The grid's empty state renders as static skeleton bars with no "no items" text and no spinner — don't build a wait-condition that polls for a loading spinner to disappear on this particular grid; instead check for absence of actual row data.
The Locked/Unlocked pagination toggle is a real, working control here (confirmed) — Locked disables editing of the "items per page" value.
