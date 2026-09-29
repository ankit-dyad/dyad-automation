# Knowledge Base — Client Record: "Phone Log" Page (client-level)

**Application:** Nexsure (R5 Insurance Agency) — `nexui` Vue.js SPA
**Captured from:** Client record `Clients: Automation_001`
**URL at capture:** `https://jmiqaweb01.nexsure.com/nexui/#/entity_console/{orgId}/{clientId}/phone`
**Captured on:** 2026-09-21

Final companion document in this series, alongside `Client_Actions_Knowledge_Base.md`, `Client_Deliveries_Knowledge_Base.md`, and `Client_Attachments_Knowledge_Base.md`. This is the **client-wide Phone Log** — by far the simplest of the four second-row client tabs, and the only one of the ten pages covered across this whole KB series with **no creation entry point of any kind** visible on the page.

> **Scope note — what was deliberately NOT exercised:** nothing to exercise beyond opening Show Filters and probing the User field — there is no "New"/"Add" action anywhere on this page to test, and none was found by scrolling (the page does not overflow the viewport horizontally, unlike Attachments/Actions/Deliveries).

## 1. Page layout

- Header **"Phone Log"** — **no toolbar buttons at all** next to the header (no Export, no "New Call"/"Add" action, nothing). This is a genuine structural difference from every other client-wide tab (Actions, Deliveries, Attachments) documented in this series, all of which have at least one creation action.
- **Show Filters** toggle (§2) — the only interactive control on the page besides the (empty) grid itself.
- Grid area: empty in this test client, using the now-familiar **"There are no items to display. / If this is unexpected, please contact your system administrator."** empty-state style (same wording/style as Demographic Data, Related Accounts, and Classified in the Profile KB, and the Opportunities/Submissions grids elsewhere in this series).
- No pagination bar was rendered (consistent with every other empty grid in this app series omitting the Showing/Items-per-page footer until at least one row exists).

## 2. Show Filters panel

A single small filter form, notably simpler than every other Show Filters panel documented in this series:

- **Phone Number** (plain text input).
- **User** — a **type-ahead search picker**, not a static dropdown (small calendar/picker-style icon on the right edge of the field, matching the visual pattern already seen on "Business Type(s)" and "Assignment" fields elsewhere in this app). Clicking it shows a loading spinner then an **empty results panel**; typing a character (tested with "a") did **not** surface any matching users in this pass — either this test environment/user has no other users to match against, the search requires a longer/more specific query, or the underlying lookup returned nothing for this particular org. Defaults to blank/"All" behavior implied by the empty state, not confirmed by an explicit "All" label the way other dropdowns in this app show one.
- **Date** — **From / To** pickers, each with the recurring **"±DAYS"** quick-offset button used throughout this app.
- **Apply Filter** / **Clear** buttons, plus **Save / Recall / Clear Memory** preset links at the top of the panel — **Recall and Clear Memory were both greyed out/disabled** in this pass (no saved filter preset exists yet for this user on this page), which is the first time in this KB series a Save/Recall/Clear Memory row has been observed in this partially-disabled state — worth noting as the "before you've ever saved a filter" appearance of this otherwise-recurring control, useful as a reference for what that control looks like pre-first-use.

## 3. Summary checklist for automation design

- **Phone Log has no visible "New"/"Add" entry point anywhere on the page** — of all ten Client-level tabs documented across this whole KB series, this is the only one with zero creation UI. Combined with Profile's read-only "Campaigns" sub-tab (documented in the Profile KB), this reinforces that **not every grid in this app is user-editable** — some are purely aggregated/system-generated views (Phone Log entries are presumably created by an integrated telephony/call-logging system rather than manually by agency staff, though this wasn't directly confirmed since no entries existed to inspect).
- **The User filter is a type-ahead search picker that returned no results for a single-character query** in this test — don't assume it behaves like the simple static "All"-plus-list dropdowns used for most other filter fields in this app; it needs its own lookup-behavior verification (minimum character count? does it require an exact match? is it scoped to users associated with this client only?) before relying on it in automation.
- **This is the only page in the whole KB series observed with Recall/Clear Memory visibly disabled** on first open (no saved preset yet) — a useful reference screenshot/state for distinguishing "never used" vs. "has at least one saved filter" states of that recurring control elsewhere in the app.
- Being the last of the ten Client-level tabs, this closes out full coverage of the tab list originally requested (Overview, Profile, Opportunities, Submissions, Policies, Claims, Accounting, Actions, Deliveries, Attachments, Phone Log) — Policies was already documented in the earlier `Policy_Details_Knowledge_Base.md`, and all ten of the remaining pages now have their own dedicated KB file in this series.