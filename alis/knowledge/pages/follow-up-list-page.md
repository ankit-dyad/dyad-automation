Follow Up List (ALIS)

Overview
The default landing page after a successful login on the "dyad"-branded ALIS instance (`https://customer-alis.dyadtech.com`, v4.1.19.5) — see `login.md`. URL hash: `#/followup`. Shows the logged-in user's open follow-up items in a grid, with toolbar controls to filter/act on them.

Field
Value
Application
ALIS (Alis Core / Alis Custom — Dyad Tech Private Limited automation POC)
Environment
customer-alis.dyadtech.com, v4.1.19.5
Opened via
Automatically shown immediately after login; presumably also reachable again later via one of the left icon-rail icons (not isolated/confirmed which one — see `header.md`'s open items).

Default state
Status and Assigned To toolbar filters default to the logged-in user's own open items — in this pass: Assigned To = "Test QA1", Status = "Open". The grid below reflects only items matching those two defaults until changed.

Grid columns (9 total)
ACTIONS, REFERENCE, POLICY, INSURED, DESCRIPTION, FOLLOWUP REASON, ASSIGNED TO, ASSIGNED BY, ASSIGNED DATE.

Toolbar controls
- Status dropdown — defaults to "Open"; other values not enumerated in this pass.
- Assigned To dropdown — defaults to the logged-in user ("Test QA1").
- "Show Future Date Follow-ups" toggle — off by default; not exercised.
- Export icon — not opened/verified.
- Refresh icon — reloads the grid; not deliberately tested for side effects.
- "Assigned To Others" toggle — presumably broadens the grid beyond the logged-in user's own items; not exercised.
- "Actions" dropdown — a maroon dropdown button; its option list wasn't enumerated in this pass.
- "+ Add Follow Up" — a green button, presumably opens a form to create a new follow-up item; not opened/verified in this pass.

Open items / to verify
- The Status dropdown's full option list beyond "Open".
- What "Assigned To Others" reveals when toggled on.
- The "Actions" dropdown's option list (per-row vs. bulk actions).
- What "+ Add Follow Up" opens and what fields it requires.
- What the ACTIONS column (per row, leftmost) contains — likely row-level action icons/links, not confirmed.
- The export icon's output format (CSV/PDF/etc.).
- Whether this page is reachable again after navigating away, and via which left-rail icon.

(Element IDs/classes/selectors intentionally omitted — tracked separately.)

Data used to produce this document
Observed immediately after logging in as testqa1 against `https://customer-alis.dyadtech.com` (v4.1.19.5) at the start of this session (2026-09-22). The grid was effectively empty/showed only pre-existing items for this user at the time of observation; no new follow-up items were created or interacted with in this pass.