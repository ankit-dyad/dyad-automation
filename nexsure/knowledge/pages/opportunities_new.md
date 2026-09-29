# Knowledge Base — "Opportunities: New" Wizard

**Application:** Nexsure (R5 Insurance Agency) — `nexui` Vue.js SPA
**Captured from:** the "Opportunities: New" wizard, reached automatically after finishing the "New Client" wizard's Assignment step (see `Assignment_Page_Knowledge_Base.md`, Section 5) — confirmed reachable both via that chained redirect and by landing on it directly (client `qable_234` was already selected on arrival in this session).
**Steps (3, or 4 conditionally):** `1. Select Client` → `2. Select Assignment` → `3. Select Product` → *(optional)* `4. Select Retail Agent`
**Captured on:** 2026-09-17

Third companion document, alongside `Add_Contact_Knowledge_Base.md` and `Assignment_Page_Knowledge_Base.md`. Same purpose and ground rules: structural/behavioral reference for automation, no script code.

**Important note on scope:** this document stops short of actually finalizing an opportunity/policy. The final actions on Step 3/4 (**Create Policy**, **Create Opportunity**) create real, likely hard-to-reverse business records, so they were deliberately **not clicked** during this exploration — per the standing rule that irreversible/submit-type actions need explicit go-ahead first. Everything described about those two buttons is based on their visible state/labels and the DOM's `disabled` attribute, not on having exercised them to completion.

---

## Step 1 — "Select Client"

Subtitle: *"Search for a client to associate with this opportunity. You may add a new client if you can not find an existing one."*

| Element | Behavior |
|---|---|
| **Client display block** | Shows `Client: <Name> (P)` (the `(P)` suffix again denotes a Personal client type, consistent with the Client-wizard finding), plus an **ADDRESS** block (street/city/state/zip/country) and a **CONTACT** block (primary contact name, shown as a link). |
| **OFAC Check** | A link labeled "OFAC Check" with an external-link icon. Its `href` resolves to **`https://ofac.treasury.gov/`** — the U.S. Treasury's actual sanctions-search site. This is a manual-workflow nudge (agent is expected to open it and check the client), not an automated/embedded check. |
| **Status dropdown (next to OFAC Check)** | A vue-select combobox with exactly **4 fixed options**: `Pending`, `Completed`, `Blocked`, `Review Required`. Defaulted to **`Review Required`** for a freshly created client. This appears to be a manually-set compliance/review status field the user sets themselves after doing the OFAC lookup — nothing about it triggers automatically. |
| **Change Client** | Opens a **"Find a Client"** popover/modal: *"Search using the keyword options and apply the branch or retail agent filter to narrow the results."* Contains: a **Keywords** text input (placeholder `Name, Email, Phone, SSN, FEIN`), a **Branch** searchable dropdown (default `Any`), and a **Retail Agent** searchable dropdown (default `Any`). Typing a keyword and pressing **Enter** triggers a `Searching...` indicator, then a **"Search Results"** list appears below the fields, each result formatted as `<Name>(<Type letter>) <City>, <State>` (e.g. `qable_234(P) Leadville, CO`), with a small person icon. Clicking a result presumably reselects the client (not exercised in this session to avoid changing the working client). Close via the **×** in the modal's top-right corner. |
| **New Client** | Genuinely `disabled` (confirmed via DOM) whenever a client is already selected for this opportunity — i.e., you cannot use this button once Step 1 already has a client; it's only meant for opportunities started with no client pre-selected. |
| **Next** | Enabled once a client is present. |

## Step 2 — "Select Assignment"

Subtitle: *"Add assignments for this policy. One must be designated as primary before proceeding."*

This is a **different, richer UI** than the New-Client wizard's single-row Assignment form — here it's a **grid/table of assignment rows**, since an opportunity/policy can have multiple assignments.

**Columns:** `PRIMARY` (checkmark), `BRANCH`, `NAME` (this is the assigned **employee**, not a client contact), `DEPARTMENT`, `UNIT`, `RESPONSIBILITY`, `USE SIGNATURE` (checkbox), and a per-row delete (trash) icon.

- The grid arrives pre-populated with whatever assignment(s) already exist for the client/opportunity (in this session: one row, marked Primary).
- A blue **"+"** icon at the bottom of the grid opens a new **inline-editable row** with: a Primary checkbox, and five dropdowns — **Branch**, **Name** (employee), **Department**, **Unit**, **Responsibility** — plus the Use Signature checkbox, and two row-level action icons: a **checkmark** (confirm/save this row) and a **circle-slash "no" icon** (cancel/discard this row).
  - While a new row is being edited, the **existing saved row's controls are visually greyed and its trash icon disabled** — you cannot edit/delete anything else mid-add.
  - **Branch** dropdown here is a **long org master list, but NOT alphabetically sorted** — order observed: `First CRM Branch, QA West Branch, Northeast - Branch, Inc., QA 1.93.9 branch, Support Branch, Branch 1.93 Build 11, Eastern Branch, Z QAINF Branch, ...`. This is a **different ordering (and possibly a different underlying option source) from the plain alphabetical Branch list seen in the New-Client wizard's Assignment step** — do not assume the two Branch pickers in this app are interchangeable/identically sourced.
  - **Name** (employee) dropdown is a long, alphabetically-ish sorted roster of individual employees (e.g. `BlackHillBranch, DianaLBX`, `Chandanala, Latha`, `Cordell, Robin`, `Cross, Jane`, `Euper, Jami`, `Mallett, Rosanne`, `Mammadov, Riyad`, `Norris, Chuck`, `O'Dell, Digger`, `O'Malley, Erin`, `O'Malley, Thomas`, `Olthuis, Elaine`, ...) — again, org-wide master data, not enumerable/fixed.
  - **Department** dropdown here is likewise **not alphabetically sorted** (`Commercial Lines AB1-2/DB2-3a (1) 20days, Personal Lines AB1-3a/DB2-3 (2) 15days, Life & Health 5days, Bond Department, Program Business, EPO - Release 1.93 Build 15 department, Mass Marketing AB1-1/DB2-1 (9) 36500 Max Days, Assigned Risk, Niche Market AB2-3/DB1-2 (14) 365days, ...`) — same observation: different ordering than the New-Client wizard's Department list, treat as a separately-behaving picker.
  - **Unit**, once Department is picked, is gated the same way as the New-Client wizard (only shows `Unassigned` unless that specific department has configured units).
  - **Responsibility** is a very long list, heavily populated with QA/test placeholder entries in this org (e.g. `RA Contact Added First/Second/Third`, `RA Contact Added then Removed`, `Resp NOT Selected in Any Notification Setup`, `RespAdded via Assgmt Utility1/2/3`, `Responsibility is Setup With Maximum 50 Characters`, `Retail Agent Primary/Secondary/Tertiary`, `SS Program Assignment`, `Unassigned`, ...).
- **Primary exclusivity (same pattern as Contacts):** checking a new row's Primary checkbox **immediately checks-and-locks that checkbox** (it becomes `disabled` right after being checked, presumably to force you to then confirm the row rather than fiddle further). Confirming that row (the row-level checkmark) **automatically clears the Primary flag on whichever row previously held it** — verified directly: adding and confirming a second row as Primary caused the original row's checkmark to disappear.
- **Deletion is guarded, unlike the Contact grid:** attempting to delete the row currently marked Primary produces a **warning dialog**: `⚠ Warning — Cannot delete the primary assignment. Promote another assignment to primary first.` This is a meaningfully safer design than the Add Contact dialog (which allows deleting the Primary contact and leaves the client with none) — the Assignment grid actively prevents ending up with zero Primary rows via deletion, though you can still get there by re-editing a row and manually unchecking Primary (not tested — Primary appeared to lock/disable once checked, so it's unclear if it can be unchecked again without picking a different row's Primary instead).
- To promote a different row back to Primary, click directly on that row to re-enter its inline edit mode, check its Primary box, and confirm (checkmark) — this is how the original row was restored to Primary after testing.

## Step 3 — "Select Product"

Subtitle: *"Select a Product that best describes your client's insurance needs. You may then choose which Lines of Business to include for this Product. Multiple lines of business can be selected, or ALL lines can be chosen."*

| Field | Details |
|---|---|
| **Product** | Searchable single-select dropdown, but this one is a **short, fixed list** (only 6 entries seen): `X100_Personal Lines`, `X100_Commercial Lines`, `X100_Benefits Lines`, `X100_Bonds`, `X100_Financial Lines`, `X100_Personal Benefits Lines`. |
| **Lines of Business (LOB)** | The available LOB options are **specific to the selected Product** and, in aggregate across products, this list is **very large** — for `X100_Commercial Lines` alone, scrolling revealed 200+ entries, including many per-U.S.-state variants of the same base code (e.g. `X100_Commercial Auto (137 AK)`, `... (137 AL)`, `... (137 AR)`, ... running through most state postal codes) alongside plain entries like `X100_BOP (160)`, `X100_Cargo (193)`, `X100_Boiler and Machinery (155)`, `X100_Charterers Legal Liability (a)`, etc. **Do not attempt to hard-code or fully enumerate this list** — treat it as live master data and either search/filter for the needed entry or look it up via the API layer if automating. |
| **Switching Product resets the LOB selection.** Confirmed directly: with `X100_General Liability (126)` selected under `X100_Commercial Lines`, switching Product to `X100_Personal Lines` initially still *showed* "1 Selected" in the LOB field, but as soon as the LOB control was interacted with, its option list changed to Product-appropriate entries (e.g. `X100_All Terrain Vehicle (a)`, `... (AK a)`, `... (AL a)`, ...) and the prior selection was gone (chip list emptied, Next/Create buttons became disabled again). **Automation should always re-select LOB(s) after changing Product, never assume a prior LOB selection survives a Product change.** |

### Two alternate presentations of the same LOB picker — a **"Flat View" toggle** switches between them:

1. **Flat View ON (default):** a big two-column **checkbox grid** of every matching LOB (one checkbox+label per line), with a **"SELECT ALL"** checkbox above it and a **FILTER** text box (placeholder `Search for LOBs`) to the right that live-narrows which checkboxes are shown.
   - Confirmed: **typing in Filter only changes which items are displayed — it does not clear or affect already-made selections** (checked a LOB, cleared the filter entirely so the checked item scrolled out of the visible top of the list, then re-typed the filter and confirmed the checkbox was still checked).
   - **"SELECT ALL" only acts on the currently filtered/visible subset, not the entire underlying LOB catalog.** Confirmed: with the Filter set to `general` (3 matching items visible), clicking "Select All" checked exactly those 3 visible items, not all 200+ LOBs for the product. Be aware that after doing this and then unchecking some of those items individually, the "Select All" checkbox itself stays visually checked (it does not re-sync to an indeterminate/unchecked state) — its checked-state is not a reliable reflection of "are all visible items actually still checked."
2. **Flat View OFF:** collapses down to a single **"LINE OF BUSINESS"** combobox field (a vue-select multi-select with a small keyboard/grid icon on its right edge) showing a `<N> Selected` summary, plus a **"Lines of Business"** area below listing each current selection as a removable chip (`<LOB name> ×`). Clicking into the field opens the same searchable checkbox listbox as Flat View, just presented as a dropdown instead of an inline grid — typing directly into this field also live-filters the dropdown's own items (no separate Filter box needed in this mode, since the field itself is the filter/search input).
   - Both views operate on the **same underlying selection state** — switching between Flat View on/off did not reset or alter which LOBs were checked in this session's testing.

### Bottom controls

- **Skip Retail Agent** — a toggle switch (nex_toggle style, matching the one seen in the Add Contact dialog). **Default: ON.**
  - **ON:** the wizard stays at 3 total steps, and the footer shows two finishing buttons directly: **Create Policy** and **Create Opportunity**.
  - **OFF:** a **4th step, "Select Retail Agent," is dynamically added** to the breadcrumb, and the footer's finishing buttons are replaced by a single **Next** button (you must go through Step 4 before finishing).
  - This toggle can be flipped back and forth freely without losing the Product/LOB selections already made.
- **Back** — returns to Step 2 (Select Assignment).
- **Create Policy** / **Create Opportunity** (visible only when Skip Retail Agent is ON) — two distinct terminal actions. Both were confirmed **not** `disabled` in the DOM even with Product+LOB properly filled (i.e., both are genuinely clickable once the form is valid) — **neither was clicked** in this session (see the scope note at the top of this document). Based on the labels alone: "Create Opportunity" presumably creates just an opportunity/pipeline record, while "Create Policy" presumably fast-tracks straight to a bound policy — but their actual downstream behavior was not observed and should be confirmed carefully (ideally with the user's explicit go-ahead) before automating either.

## Step 4 — "Select a Retail Agent" (only present when "Skip Retail Agent" is OFF)

Subtitle: *"You may use the assigned Retail Agent for your Client, or search for one with the find button."*

- On arrival, this step **automatically pops open the same "Find a Retail Agent" search popover** documented in `Assignment_Page_Knowledge_Base.md` (a single **Keywords** field, placeholder `Name, Address, Email, Phone, SSN, FEIN`, live/Enter-triggered search results below it). This is a difference from the New-Client wizard's Assignment page, where that popover only opens on an explicit "Add Retail Agent" button click — here it opens proactively.
- Behind that popover, the page shows the same **"Retail Agent:"** empty-state block (greyed `ADDRESS` / `CONTACT` skeleton placeholders) seen before, plus a **"Find Retail Agent"** button (with a binoculars/search icon) to reopen the search popover if closed.
- Footer buttons: **Back**, **Create Policy**, **Create Opportunity** — both confirmed clickable (`disabled: false`) even with no Retail Agent yet chosen, so — at least in the DOM sense — assigning a Retail Agent on this step is not strictly gated/required before finishing, despite the step existing specifically to collect one. (Not verified by actually finishing the flow, per the scope note above.)

## Summary checklist for automation design

- Step 1's client search (**Change Client**) and Step 4's retail-agent search share the same interaction pattern as the Retail Agent search in the New-Client wizard: type a keyword, then either wait for a debounce or explicitly send **Enter**, then read the "Search Results"/results list that appears below the input.
- The **OFAC Check** link is a real external URL (`https://ofac.treasury.gov/`) — automating "perform the OFAC check" means opening that link and reading results elsewhere, not calling anything in-app; the in-app **status dropdown** (`Pending/Completed/Blocked/Review Required`) is a manual field the operator sets afterward.
- Branch/Department/Responsibility option lists **differ in sort order (and likely differ as data sources) between the New-Client wizard's Assignment step and this Opportunity wizard's Select Assignment grid** — never assume the two are the same dropdown just because the field names match.
- Primary-assignment exclusivity works the same way as Primary Contact (checking a new Primary un-sets the old one on confirm), but this grid is **safer on delete** — it blocks deleting the current Primary row outright, instead of silently leaving zero Primaries the way the Contact grid does.
- LOB selection is Product-scoped and resets when Product changes; re-select LOBs after any Product change.
- The Filter box and "Select All" in the LOB grid both operate only on the **currently filtered/visible** subset — never assume "Select All" means "select every LOB the product offers" if a filter is active.
- "Skip Retail Agent" toggling changes the wizard's total step count (3 vs. 4) and which finishing buttons are shown — detect the current step count/labels rather than assuming a fixed 3-step flow.
- **Create Policy** and **Create Opportunity** were deliberately left unclicked in this investigation; before wiring automation to either one, confirm with the user which is intended and be prepared for it to be a genuinely final, hard-to-undo action (new business records).