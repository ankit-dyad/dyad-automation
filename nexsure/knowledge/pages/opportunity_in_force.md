Knowledge Base — Opportunity Detail Page, "2. Marketing" & "3. Binding" Tabs
Application: Nexsure (R5 Insurance Agency) — nexui Vue.js SPA Captured from: Opportunity record Opportunities: X100_Commercial Lines OPP-001387 (Marketing tab, §1–§5), client Automation_001; and Opportunities: X100_Commercial Lines OPP-001394 (Binding tab, §6), same client — the latter is the same record used for Manual Quote testing in the companion Manual_Quote_Knowledge_Base.md, carried forward to a "Bind Requested" state URL at capture: https://jmiqaweb01.nexsure.com/nexui/#/opportunities/{id} (tab state is client-side; the hash URL does not change between the 1/2/3 tabs) Captured on: 2026-09-21 (§1–§5); updated 2026-09-21 with §6 (Binding)

This is a companion document to opportunity_in_force.md, which covers the header bar, sidebar, and the "1. Application" tab (the ACORD 126 form) of this same Opportunity record. This document covers the "2. Marketing" tab (§1–§5) and the "3. Binding" tab (§6) — the second and third steps of the Opportunity's 3-tab stepper. The header info bar (Stage/Status/Primary State/Branch-Assignment/Confidence/Likely Premium/Effective/Retail Agent/Description), the left sidebar (Lines of Business / Tags panels — hidden on both tabs, see §1), and the 3-tab stepper's own navigation behavior are identical to what's already documented in the Application-tab KB and are not repeated here — except where the Stage/Status values themselves change as a direct result of actions on these tabs, which is called out inline.

Scope note — what was deliberately NOT exercised: "Send Application" and "Lost Opportunity" were not clicked. "Reject" (on a quote or binding row) was not clicked. Above all, the final "In Force" confirmation on the Binding tab (§6.6) was opened to document its fields but not submitted — that is the one action in this whole flow that actually converts a quote into a real policy record, and it was treated as requiring explicit business confirmation, same as Send Application / Lost Opportunity. "Coverage Comparison" and "Send to Raters" were not clicked either, but for a different reason — they are programmatically disabled. This was originally tested at zero quotes; §6 below confirms they remain disabled with exactly one quote present, even after that quote reaches "Bind Requested" status, which narrows (but doesn't fully resolve) the earlier guess that they're gated on quote count.
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
Presumed gated on having 2+ quotes to compare — not confirmed. Update (§6): retested on a different record with exactly 1 quote, even after that quote reached "Bind Requested" status — still disabled. So the gate is not simply "≥1 quote"; 2+ quotes remains the best guess but is still unconfirmed.
Manual Quote
document/file glyph
Enabled
See §4 — clicking it attempts to open an in-page panel for manually entering a quote, but it failed to render in this test session due to an app asset-loading error (documented as a quirk, not a confirmed working flow). Update: on a later record/session it opened and worked correctly end-to-end — see the "known app defect" caveat at the end of §4.
Send to Raters
small grid/table glyph
Disabled (disabled=true confirmed via DOM)
Presumed gated on having at least one quote/rater target configured — not confirmed. No tooltip on hover. Update (§6): also still disabled with exactly 1 quote present, same as Coverage Comparison above.
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

Resolution (later session): On a different Opportunity record, clicking Manual Quote opened its modal correctly with no CSS/console errors, and the full flow — filling fields, saving, the resulting Quote row, and its expandable Coverage/Billing Info/Portal Settings detail — worked end-to-end. That full walkthrough is documented in the companion Manual_Quote_Knowledge_Base.md. So the CSS-preload failure above looks like a transient/session- or asset-cache-specific issue rather than a permanent defect — still worth a defensive check in your automation target (e.g. wait for the panel and retry once on failure), but don't hard-code it as "Manual Quote never works here."
6. The "Bind" action and the "3. Binding" tab
Binding is reached in two ways: (a) via a row-level "Bind" action on a quote in the Marketing tab's Quotes grid, and (b) by then visiting the "3. Binding" tab itself, which becomes the record's live/current stepper step once a bind has been requested. Both are documented below, using the same Opportunity/quote (OPP-001394, carrier "Acadia-Berkeley", $1,000.00 premium) that was built in the companion Manual Quote KB.
6.1 Requesting a bind — from the Marketing tab's Quotes grid
Each quote row's "≡" (hamburger) menu — the same menu referenced in the Manual Quote KB — offers exactly two actions: BIND (shield icon) and REJECT (circle-slash icon).
Clicking BIND on a quote that hasn't been requested for bind opens the same "In Force Quote" confirmation modal described in §6.6 below (it is not a separate, simpler "request" step — the row-menu Bind and the Binding-tab "In Force Policy" button both lead to that one modal).
Once a bind has been requested on a quote:
The quote's STATUS column in the Quotes grid changes from its prior value to "Bind Requested."
The row's sub-line, which previously just showed an editable ANNOTATION field, now also shows an italic "No requirements to bind" note (when no attachments/signatures/actions were configured as binding requirements) — this mirrors the "Bind Requirements Satisfied" meter seen on the Binding tab (§6.5).
A checkbox appears at the far left of the row (not present, or at least not noticed, before a bind existed) — purpose not confirmed; likely a bulk-action selector, but no bulk toolbar was observed to test against.
The quote's own 3-tab detail panel (Coverage / Billing Info / Portal Settings, documented in the Manual Quote KB) is still visible and expandable here, but the Billing Info tab's Indication/Details toggle becomes visually disabled (greyed) — consistent with billing being locked for quick edits once a bind is in flight. (A stray click near that toggle also appeared to trigger a jump back to the Binding tab's Requests view — not fully explained, possibly an app-level redirect tied to the record's stage; treat as a UI quirk to watch for, not a confirmed mechanism.)
Clicking BIND again on an already-"Bind Requested" row produced no visible effect — no modal, no state change. Treat repeated Bind clicks on an already-requested quote as a no-op in this environment, but verify rather than assume in your target.
Requesting a bind promotes the whole Opportunity, not just the quote: the record's header STAGE changes from "Marketing" to "Binding," and its header STATUS changes to "Bind Requested" — matching the quote's own status. The 3-tab stepper's "3. Binding" step becomes the active (blue-underlined) tab, with "1. Application" and "2. Marketing" shown as completed (green).
The 5-button Marketing toolbar itself is unaffected by this — same buttons, same enabled/disabled states as before (see the Coverage Comparison / Send to Raters update in §2 above).
6.2 The "3. Binding" tab — overview
Page header/intro copy: "Binding — Here you can view accepted quotes and complete requirements to convert them to active policies."
Same page chrome as the Marketing tab's Quotes grid: a Group By dropdown (top right, default "None" — not re-verified for the same None/Raters/Market option set, but visually identical control), and the standard Showing [10] Items per page / Locked-Unlocked / Page 1 of 1 pagination footer.
Grid columns here are narrower than the Marketing Quotes grid (8 columns) — just 4: Policy Number, Effective Date, Expiration Date, Line of Business. Status, Quote Date, Good Through, Method and Note are dropped (they belong to the "quote" framing; this grid is framed around "policy in progress").
Each row is an expandable policy-in-progress card: carrier icon + name, Policy Number (defaults to the Opportunity's own number, e.g. "OPP-001394", and is editable — this is presumably overwritten with the carrier's real policy number once issued), Effective Date, an editable Expiration Date (blank until set — see the "In Force" modal in §6.6, which is where it actually gets populated), Line of Business, a blue "In Force Policy (X of Y)" button (X/Y read 0 of 0 throughout this test, before anything was actually put in force), and a "≡" menu.
That row-level "≡" menu now offers only "REJECT" — no Bind option, since the bind has already been requested. Reject was not clicked (see scope note at the top of this document).
The row's sub-line repeats the $ amount, an editable ANNOTATION field, and the flash/mail/attachment activity counters (all 0 in this test) seen throughout the app.
Below each row, 4 sub-tabs: Binding Requirements, Coverages, Billing Info, Requests — detailed next.
6.3 Sub-tab: Binding Requirements
Three editable panels for building a checklist of what's needed before the policy can go in force:

Attachments — "Show on Portal" toggle (on by default), a grid (Name / Description / Instructions), and a "+" control to add a requirement row.
Signatures — "Show on Portal" toggle (on by default), a "+ Request Signature" button, and a grid (Sent To / Subject / Date Send).
Actions (right-hand column) — a "+ Add Action" button and a grid (Topic / Type / Description / Assigned To / Due).

All three grids were empty in this test (no requirements had been configured), rendered with the same static skeleton-bar empty state seen elsewhere in the app.
6.4 Sub-tab: Coverages
Read-only display of the same coverage data already captured on the quote's own Coverage tab (Marketing-tab detail panel / Manual Quote KB) — same field groups (Employee Benefits, Damage To Rented Premises, Each Occurrence Limit, General Liability Aggregate, etc.), each with its own edit pencil. Values matched exactly what had been set earlier (e.g. Each Occurrence Limit showing $1,000,000, the value entered during quote-level Coverage testing) — so this is the same underlying coverage record surfaced again in the Binding context, not a separate copy.
6.5 Sub-tab: Requests
A read-only status/progress view of the same three requirement types from §6.3:

A "Bind Requirements Satisfied" meter, rendered as a large percentage in a bordered box — showed 100% in this test, because no attachments/signatures/actions had actually been marked required (the percentage is presumably satisfied-count ÷ required-count, trivially 100% when the denominator is 0).
Attachments (0 of 0) — helper text: "These are the supporting documents that the insured needs to supply. If the attachment needs to be added manually, press on the Upload link."
Signatures (0 of 0) — helper text: "Signatures were requested from the following party or entity. If the documents need to be added manually, upload these in the quote's attachments." (has its own small refresh icon)
Actions (0 of 0) — helper text: "This lists pre-issuance subjectivities that must be closed." — columns: Closed / Topic / Type / Assigned To / Due.
6.6 Sub-tab: Billing Info — richer than the quote-level Billing Info
This is a materially bigger data surface than the quote's own Billing Info tab (documented in the Manual Quote KB, which only exposed Premiums/Fees/Taxes):

"Billing Information" card (editable): Bill To (dropdown, e.g. "Client" + a linked-party chip), Bill Method (dropdown, e.g. "Direct Bill"), Billing Type (dropdown, e.g. "Gross") with an adjacent "Third Party Commissionable" checkbox, Premium Finance Company (dropdown, defaulted "None"), Internal Billing Note (free-text). A "Save Billing Info" button (top right of the card) commits changes — not clicked in this pass, so its save behavior (partial vs. full-card validation, any confirmation) is undocumented.
"Invoice Information" card (read-only): resolved Bill To party/contact and Billing Address, pulled straight from the Opportunity's client and location data.
Below that: a Grand Total, then five colour-coded, independently-totaled itemized sections, each with its own inline "+" add-row control (same pattern as the quote-level Billing Info's Premiums section — see Manual Quote KB): Premiums (green header — carried the $1,000 line item from the quote), Fees (tan/brown header), Taxes (dark blue header), Agency Commissions (columns: Commission on Premium / Description / Rate Type / Rate / Amount), Other Commissions (columns: Commission On / Employee / Role / Description / Rate Type / Rate / Production / Amount). Only Premiums had data in this test; the other four were $0.00.
Agency Commissions and Other Commissions only appear at this Binding stage — they are not present on the quote-level Billing Info tab documented in the Manual Quote KB.
6.7 The terminal action: "In Force" confirmation modal — submitted, and what actually happened
Clicking the blue "In Force Policy (X of Y)" button on a Binding-tab row (or clicking BIND from the Marketing-tab row menu on a not-yet-requested quote) opens a modal titled "In Force Quote: {Policy Number}":

"Please confirm that you wish to transform this quote into an In Force policy."

Field
Type
Notes
Issuing Carrier
read-only
Carrier logo + name
Effective Date*
date picker
Pre-filled from the quote
Expiration Date*
date picker
Pre-filled to exactly one year after Effective Date
Policy Number*
text
Pre-filled with the Opportunity's number (e.g. "OPP-001394"); editable
Billing Carrier*
required searchable dropdown
Empty by default. Options seen: AAA Carrier, AAA of Michigan, Acadia-Berkeley, Bristol West, Great America, OneBeacon Insurance Company — this reads as the agency's full carrier list, not scoped to the quote's own carrier
Role*
dropdown
Defaulted to "Account Executive"
Primary Assignment*
dropdown
Defaulted to the record's assigned producer (e.g. "Automation, DyadQA2.5")
Policy Description (optional)
textarea
Empty
Portal Description (optional)
text
Empty


Buttons: "In Force" (blue, the actual irreversible confirm) and "Cancel" (red outline).

This was submitted, with explicit user sign-off, since this is a disposable QA sandbox record. Fields used: Billing Carrier = "Acadia-Berkeley" (matching Issuing Carrier), everything else left at its default (Role "Account Executive", Primary Assignment "Automation, DyadQA2.5", Policy Number/dates unchanged). In a real environment, treat this exactly like Send Application / Lost Opportunity — get explicit business confirmation first, and expect it to be effectively irreversible.

Result: the submission failed, but it was not a clean no-op.

Clicking "In Force" puts the button into a permanent loading spinner and, after a couple of seconds, raises a toast: "An unexpected error occurred. Please contact Nexsure Support and reference issue #260782741." The spinner never clears on its own — the modal has to be dismissed with Cancel.
This reproduced identically on a second, independent attempt (same required fields, submitted minutes apart) with the exact same reference number, #260782741, and the browser console showed the same underlying error both times — Internal Server Error: 260782741, thrown from a component bundle literally named bind_modal-*.js. An identical error code on unrelated submissions reads as a fixed, reproducible server-side defect in this environment for this final conversion step, not a transient blip like the earlier Manual Quote CSS issue.
Despite the visible failure, the backend had already committed real side effects before it errored:
The Opportunity's header STATUS advanced from "Bind Requested" to a new value, "Bound" (STAGE stayed "Binding"). This is a status value not seen anywhere earlier in the flow.
The Binding-tab row's Expiration Date, blank until now, got permanently set to the value from the modal (09/21/2027).
A new system-generated ANNOTATION appeared on the row: *"This marketing record has been created by Nexsure Opportunity via EAI — Created By: [] To: [] — ."* ("EAI" = the app's integration layer — this reads as a backend workflow event, not something a human typed.)
The row's activity counters went from 0/0/0 to 1 action / 1 delivery / 0 attachments. Opening that activity panel (the mail-icon button on the row) showed:
Actions (1): Topic "Marketing", Type "Annotation", Description "New Opportunity Policy", Assigned To the record's producer, Due Date already in the past (shown in red — i.e. created already overdue), Status "Open". It's hidden by default behind the panel's "Hide Automated Actions" toggle — automation reading this list needs that toggle off to see it.
Deliveries (1): a queued client-facing email, From "DyadQA2.5 Automation dyad.automation@dyadtech.com", To the client (Automation_001), Subject "QA0 Org 777 EMAIL SUBJ: Inforce THANK YOU Recipient RA- PERSONAL CLIENT ONLY" (reads like an internal QA/template naming artifact rather than a finished subject line), Status "Scheduled" — i.e. queued to actually send, not sent yet at the time of writing.
What did NOT change: the "In Force Policy" badge stayed "(0 of 0)" — no actual policy record was created — and the row's "≡" menu still only offers "Reject" (no new options appeared).
A second inconsistency: back on the Marketing tab, the same quote's STATUS column still reads "Bind Requested", not "Bound" — i.e. the Opportunity-level header status and the quote-row status in the Marketing grid are two different fields that did not update together here. Automation that watches "Status" for this flow needs to know which of the two it's actually reading.

Automation implication: do not treat this error toast as proof that nothing happened. A failed "In Force" submission in this environment still (a) advances the Opportunity's header status, (b) leaves a stray open "Marketing/Annotation" Action assigned to the producer, and (c) queues a real client-facing "thank you" email for delivery — all without ever creating the policy itself. Any negative-path test against this action should verify record state directly (status fields, the Quote Activity panel's Actions/Deliveries counts) rather than trusting the UI's success/failure signal, and should be prepared to clean up the orphaned Action and cancel the queued Delivery if this is exercised anywhere the email would actually send.
7. Summary checklist for automation design
This tab shares the record's header bar and 3-tab stepper with the Application tab (see the companion KB) but drops the left sidebar and the Print button, and swaps in a 5-button Marketing-specific toolbar.
Coverage Comparison and Send to Raters are disabled on a zero-quote record, and remained disabled even after a quote reached "Bind Requested" (§6.1) — don't assume any specific quote count enables them; exact gating condition still not confirmed.
Manual Quote failed to open once in this pass due to a CSS asset preload error, but opened and worked correctly end-to-end in a later session/record (see §4's resolution note and the companion Manual_Quote_Knowledge_Base.md) — build in a retry/defensive wait rather than assuming it's broken.
Send Application and Lost Opportunity are enabled and clickable but were intentionally not exercised — both look like real, likely irreversible business actions (submission / termination) and should only be automated after explicit confirmation of their exact effect.
The Quotes grid's "Group By" control is a plain native <select> (None/Raters/Market) — simpler to automate than the vue-select comboboxes used elsewhere in this app.
The grid's empty state renders as static skeleton bars with no "no items" text and no spinner — don't build a wait-condition that polls for a loading spinner to disappear on this particular grid; instead check for absence of actual row data.
The Locked/Unlocked pagination toggle is a real, working control here (confirmed) — Locked disables editing of the "items per page" value.
Binding is one action away from a real policy. A quote's row-menu "BIND" (Marketing tab) and a Binding-tab row's "In Force Policy" button both open the same "In Force Quote" confirmation modal (§6.7); only its own "In Force" button actually commits. Everything up to that point — requesting a bind, filling Binding Requirements, editing Billing Info, reviewing Coverages/Requests — is safe to automate and reverse via "Reject" (not tested); the final confirm is not.
Requesting a bind promotes the whole Opportunity: header STAGE → "Binding", header STATUS → "Bind Requested", and the stepper's 3rd tab becomes current — automation that watches Stage/Status for state transitions should watch for exactly this text.
The Binding tab's own Billing Info sub-tab (§6.6) is a superset of the quote-level one — it adds Agency Commissions and Other Commissions sections not present earlier in the flow.
"In Force" itself errored in this environment (§6.7), reproducibly, with the same server error code both times — but it is not side-effect-free on failure: header STATUS advanced to a new value ("Bound"), a stray "Open" Action and a "Scheduled" client email got created, and Expiration Date got persisted, all while the actual policy ("In Force Policy (0 of 0)") never got created. Don't gate success/failure detection on the UI toast alone — check the Opportunity header STATUS, the Binding row's "In Force Policy (X of Y)" count, and the quote row's own STATUS in the Marketing grid, since the last of those did not update in step with the header.
Verify this action against your actual automation target before relying on either outcome — it may well work cleanly outside this specific QA session.
