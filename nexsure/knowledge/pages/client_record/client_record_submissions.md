# Knowledge Base — Client Record: "Submissions" Page

**Application:** Nexsure (R5 Insurance Agency) — `nexui` Vue.js SPA
**Captured from:** Client record `Clients: Automation_001`
**URL at capture:** `https://jmiqaweb01.nexsure.com/nexui/#/entity_console/{orgId}/{clientId}/submissions`
**Captured on:** 2026-09-21

Companion document to `Client_Overview_Knowledge_Base.md` and `Client_Profile_Knowledge_Base.md`. This page was **empty** for this test client — no submissions exist on Automation_001.

> **Scope note — what was deliberately NOT exercised:** no Marketing/Submission record was actually created — the "Create Marketing" wizard was filled out visually but **Cancel** was clicked, not "Create Marketing."

## 1. Page layout
- Header **"Submissions"**, a **View** dropdown (**2 options: Active [default], Historical**), an info **"ⓘ"** icon (top right), and a **"New Marketing"** button.
- **Show Filters** toggle, revealing a large three-column filter form (§3).
- Grid area: empty in this test — **"There are no items to display. If this is unexpected, please contact your system administrator."**

## 2. The info "ⓘ" icon — contextual "Online Help" tooltip
Clicking the small info icon next to "New Marketing" surfaces an **"ONLINE HELP: New Marketing"** popover — a genuine in-app contextual-help/onboarding widget, distinct from anything seen on the other Client-level pages so far:
> *"Clicking the 'New Marketing' button allows the addition of a new record or the ability to combine existing applications into a single marketing record."*

It includes its own **"Show Me How"** button (presumably a guided walkthrough/tour — not clicked), a **"No Thanks"** button (dismisses it), a close "×", and even a duplicate **"New Marketing"** button inside the popover itself that would presumably trigger the same action as the page's own button. **Automation implication:** this help widget can appear unprompted-looking on screen (it seemed to fire on a delayed timer after the icon was clicked) and may need to be dismissed before interacting with elements underneath it.

## 3. Show Filters panel
Three columns:
- **Submissions:** Program (text), Submission Number (text), Payment Made (dropdown, default "All"), Transaction Type (dropdown, default "All"), **Submission Status** — rendered as a multi-row select box rather than a dropdown, with **4 options: All, Bind Request, Blocked, Bound**, "All" pre-selected — plus two checkboxes: **Include Inactive Programs**, **Exclude Retail Agent Submissions**.
- **Marketing Records:** Marketing Status (dropdown, default "All"), Mode (dropdown, default "All"), Policy Number (text), Business Type(s) (text with a small icon, likely opens a picker).
- **Common Fields:** Line of Business (text/dropdown-hybrid with an icon), Memo (text), Retail Agent (text), Assignment (text with an icon) + a **Primary** checkbox, Issuing Carrier (text), Billing Carrier (text), Portal Description (text).
- Below that, a **Dates** section: **Updated** From/To (date pickers, each with a **"±DAYS"** quick-offset button) and **Updated By** (text), then **Effective** From/To (same From/To/±DAYS shape).
- **Apply Filter** / **Clear** buttons; **Save / Recall / Clear Memory** preset links at the top of the panel (same pattern as every other filter panel in this app).

## 4. "New Marketing" → the "Submissions: Create Marketing" page
Navigates (full page, breadcrumbed, not a modal) to a form with **two radio-button modes**:

- **"NEW MARKETING"** (default): *"This feature creates a new marketing record. To prefill premium, tax, and fees, you may select a policy template."* — **Policy Template** dropdown (default "(None)") plus an **"Edit List"** button (presumably manages the org's saved policy templates). Then an **"Action Details"** section — *"This process will also create a new Annotation associated to the policy with the following description and memo."* — **Effective Date\*** (date picker, defaulted to today), **Description\*** (pre-filled **"New policy."**), **Memo** (pre-filled **"New policy."**). Footer: **"⚡ Create Marketing"** (blue) and **"× Cancel"** (red) buttons.
- **"MARKET EXISTING"**: *"Use this option to remarket an existing policy or policies. A new record will be created using the policy details selected below."* — two checkboxes, **Refresh Form Prefills** and **Refresh Assignments**; a collapsible **"+ Add Policy or Marketing Records"** section (*"Find and include other sources to merge details from."*); the same Action Details block as above but with Description/Memo pre-filled **"Re-market policy."** instead. **"Create Marketing" stays disabled** until a policy/marketing record is actually selected via "Add Policy or Marketing Records" — confirmed by observing the button greyed out with none selected.

## 5. Summary checklist for automation design
- Submissions was fully empty on this test client — no created records to inspect at the detail-record level; only the list/filter/creation-entry-point UI could be documented.
- The info icon's **"Online Help" popover** can appear after a delay and overlay other controls — dismiss it (via "No Thanks" or the "×") before automating clicks in that area.
- **"Market Existing"'s Create Marketing button stays disabled until a source record is added** via "Add Policy or Marketing Records" — don't expect it to be clickable immediately after choosing that radio option.
- The **Submission Status filter (All/Bind Request/Blocked/Bound)** suggests Submissions are the record type that tracks a policy's marketing/binding lifecycle across carriers — likely related to, but distinct from, the Opportunity-level "Bind Requested"/"Bound" statuses documented in `Opportunity_Marketing_Page_Knowledge_Base.md`. Not confirmed how the two are linked since no Submission records existed to inspect.