Search Sidebar — Clearance / Advance Search (ALIS)
Overview
A panel that opens over the left edge of the page (docked below the header, full height) when the green "+" icon at the top of the left icon rail is clicked. Used to search for an existing insured/record before starting a new submission, quote, etc. It has two modes, switched by a toggle at the top: Clearance Search (default) and Advance Search — both modes showed the same fields and controls in this UAT account; the difference is presumed to be in the scope/permissions of the search performed, not the visible form.

Field
Value
Application
ALIS (Alis Core / Alis Custom — Dyad Tech Private Limited automation POC)
Environment
UAT
Opened via
Green "+" icon, top of the left icon rail
Modes
Clearance Search (default) / Advance Search — toggle buttons at top of panel
Close
"X" icon, top right of the panel

Default criteria rows
Four search fields are shown by default, each a text box with a label describing the match type, plus a delete (trash) icon; the first three also show an "Or" affordance next to them:

Insured Name contains — Or — [delete]
DBA contains — Or — [delete]
Mailing Address1 contains — Or — [delete]
Mailing Address2 contains — [delete] (no "Or" on the last row)

These are presumed to be ANDed together when multiple are filled in; the "Or" next to a row is presumed to switch that row's join to the next, but this wasn't confirmed by actually running a search.
"Add Search Criteria" builder
Lets you add further criteria beyond the four defaults:

Field dropdown — one of: Insured Name, DBA, Mailing Address1, Mailing Address2, Mailing City, Mailing State, Mailing Zip, Physical Address1, Mailing Phone, Physical Address2, Physical City, Physical State, Physical Zip, Policy Number, Co-Applicant, Risk Address 1, Risk Address 2, Risk City, Risk State, Risk Zip, FEIN, SSN, SLA Number, Submission, Agency, Quote, UW/Broker.
Operator dropdown — START WITH, CONTAINS (default), SOUNDS LIKE, EQUAL TO.
A text box for the value.
AND / OR toggle (radio buttons) — presumed to commit the new criterion onto the list above, joined to the existing ones with AND or OR; not confirmed by running it.
Other controls
Exclude Prospect — checkbox, unchecked by default.
Exclude Claim — checkbox, unchecked by default.
Search — full-width button at the bottom of the panel; runs the search (not executed/verified — no result screen captured).
Open items / to verify
What the "Advance Search" toggle actually changes (scope, extra fields, permissions) versus "Clearance Search" — no visible difference found in this account.
Exact behavior of the per-row "Or" affordance on the four default criteria.
Whether choosing AND vs. OR in the builder immediately adds the row, or whether a separate action is needed.
What the Search button returns (results list, layout, and whether it navigates away from this panel or shows results inline).
Whether "FEIN"/"SSN" as search fields impose any masking or access restriction in the UI.
