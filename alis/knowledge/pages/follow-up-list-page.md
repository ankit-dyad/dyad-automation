Follow Up — List Page (ALIS)
Overview
The "Follow Up" module, opened from the left-side icon rail (envelope icon). Shows follow-up records assigned to/by the logged-in user, in a filterable grid.

Field
Value
Application
ALIS (Alis Core / Alis Custom — Dyad Tech Private Limited automation POC)
Environment
UAT
Module
Follow Up (left nav, envelope icon)

Filter bar (above the grid)
Control
Type
Details
Status
Dropdown
Options: Open (default), Completed
Assigned To
Dropdown
Filters by assignee. Only "Dyad QA" was loaded in this UAT account — likely a searchable/multi-user picker in accounts with more users; full option list not verified.
Show Future
Checkbox
Unchecked by default. Presumed to include/exclude future-dated follow-ups; exact behavior not verified.
Refresh
Icon button (circular arrow, right side)
Reloads the grid with current filters.
Actions
Dropdown button (dark red, top right)
Being documented separately.
+ Add Follow Up
Button (green, top right)
Being documented separately.

Grid columns
The grid scrolls horizontally — 27 data columns in total (plus the leading row-select checkbox column). Left to right:

#
Column
Contents / notes
—
(unlabeled checkbox)
Row select checkbox; a header checkbox likely selects/deselects all rows (not verified).
1
Actions
Pencil/edit icon per row. Clicking a data cell in the row (see "Inline editing" below) — not the pencil itself — puts that row into inline edit mode; the pencil icon's own behavior wasn't isolated. (This is the grid column — distinct from the toolbar "Actions" dropdown above, which is being documented separately.)
2
Reference
Hyperlinked submission/policy reference (e.g. SUB1654449, or a policy-style code like pol09092026). Click navigates to the underlying record.
3
Policy
Policy number. Empty on all observed rows — presumably populates once a submission converts to a policy.
4
Insured
Insured's name.
5
Description
Free-text description of the follow-up. Empty on all observed rows.
6
Followup Reason
Free-text/selected reason for the follow-up. Empty on all observed rows.
7
Assigned To
User the follow-up is assigned to (e.g. "Dyad QA"). Editable inline as a dropdown.
8
Authority
Empty on all observed rows — purpose not verified.
9
Assigned By
User who created/assigned the follow-up (e.g. "Dyad QA").
10
Assigned Date
Date the follow-up was assigned (e.g. 05/08/2026).
11
Due Date
Empty on all observed rows.
12
Effective
Effective date (e.g. 05/08/2026) — matches Assigned Date on observed rows.
13
Priority
Text value, e.g. "Normal" on all observed rows; editable inline.
14
Email Notification
Checkbox per row, unchecked on all observed rows.
15
UW/Broker
Name, e.g. "Greg Whaley", "David Kono".
16
Market Company
Empty on all observed rows.
17
Agency
e.g. "DYAD Test Agency", "Test agency jv".
18
Team
e.g. "Papillion NE Live…", "Legacy Team Mar…" (truncated in the grid).
19
Office
e.g. "Midwest", "Legacy Office Ma…" (truncated).
20
Coverage
Empty on all observed rows.
21
Renewal Quoter
Empty on all observed rows.
22
Secondary UW
Empty on all observed rows.
23
Expiry
Date, e.g. 05/08/2027.
24
Complete
Status icon (checkmark circle) — checked on all observed rows.
25
Void
Status icon (X circle) — unchecked/not-void on all observed rows.
26
Document
Icon column, no values observed.
27
DMS
Folder icon per row — last column in the grid.


Two more columns exist but are hidden by default (see Columns control below): Completed By and Completed Date.
Inline editing
Clicking directly on a data cell (tested on Description and Priority) puts that row into inline edit mode — text cells become text inputs, and reference/lookup cells like Assigned To become dropdowns — without a separate "edit" click needed. Not confirmed whether this is triggered by single click on any cell or only certain columns; not confirmed how changes are saved/cancelled beyond that Escape reverts the row without saving.
Columns control
The vertical "Columns" label + icon at the far right edge of the grid header opens a column-chooser panel:

A search box at the top to filter the column list by name.
A "select all" master checkbox at the top of the list.
One row per column, each with a checkbox (show/hide) and what looks like a drag handle, suggesting columns can be reordered as well as toggled.
All 27 columns above are listed; Completed By and Completed Date are present in the list but unchecked (hidden) by default — every other column is checked (visible).
Open items / to verify
Full option list for the Assigned To filter.
Exact effect of the "Show Future" checkbox.
What clicking the Reference link opens, and whether it's the same tab or a new one.
Meaning/possible values of the Authority column.
Header row-select checkbox behavior.
Exact trigger and save/cancel behavior for inline cell editing.
Whether the Columns panel's drag handles actually support reordering, and whether hide/reorder choices persist per user.
Purpose of the Document and Completed By/Completed Date columns (no data observed).
Toolbar "Actions" dropdown and "+ Add Follow Up" button — tracked separately.

(Element IDs/classes/selectors intentionally omitted — tracked separately.)

