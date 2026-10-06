# Knowledge Base — "Assignment" Step (New Client Wizard)

**Application:** Nexsure (R5 Insurance Agency) — `nexui` Vue.js SPA
**Captured from:** New Client wizard → Step 3 of 3, **"Assignment"**
**URL pattern:** `https://jmiqaweb01.nexsure.com/nexui/#/client/new/opportunity?ClientName=<Name>`
**Captured on:** 2026-09-17

Companion document to `Add_Contact_Knowledge_Base.md` (Step 2 of the same wizard). Same purpose: a structural/behavioral reference for automation, no script code included.

---

## 1. Where this screen sits in the flow

- It is **Step 3 of 3** in the linear "New Client" wizard: `1. Client Info` → `2. Client Contacts` → `3. Assignment`.
- The stepper tabs at the top are **not freely clickable** — a step becomes reachable only after the previous one is completed via its own "Next" button. Clicking a not-yet-unlocked step's breadcrumb label does nothing (it is visually greyed/disabled), and clicking a step you have already completed **does not reliably work either** once you've navigated away using browser history — see the important warning in Section 6.
- The page intro text: *"Please enter some information about the primary assignment for this client. You can also search for and add a Retail Agent for this client."*
- **This step's completion is the trigger that actually finalizes client creation.** Clicking **Done** here successfully saves the client and then **immediately redirects into a brand-new "Opportunities: New" wizard** (`1. Select Client → 2. Select Assignment → 3. Select Product`), with the just-created client already selected as the opportunity's client (see Section 5). In other words, "New Client" is really a front-loaded first stage of "New Opportunity" — there is no separate "client saved, stay here" end state.

## 2. Field-by-field specification

| Field | Type / Control | Required? | Default | Gating / cascade behavior |
|---|---|---|---|---|
| **Branch** | Searchable single-select dropdown (vue-select, "Search for option") | **Yes** | `Select` (placeholder) | Always enabled. Backed by a long, **organization-specific master list** of configured branches (30+ entries seen, alphabetically sorted: e.g. `2.5 branch`, `A Interface Branch`, `A1 New Branch`, `Alaska branch 3`, `Automation Test Branch1`, several `BAD Branch ... - Missing Periods` test entries, `Black Hill Lockbox Branch R31T4B1`, `Bloomington Branch edit branch`, `Branch 1.93 Build 11`, `Building 17 Branch R44T1B1`, `Canadian Branch`, ...). This is **not a fixed small enum** — treat it as live master data to be looked up at run time, not hard-coded. |
| **Department** | Searchable single-select dropdown (vue-select) | **Yes** | `Select` (placeholder; the placeholder itself appears as a highlighted first row inside the open listbox) | Always enabled, independent of Branch. Also a long **organization-specific master list** (observed: `Accrual All AB1-3a/DB1-1 - 10Days`, `Allied Health`, `Antique Auto Association Department`, `Assigned Risk`, `Benefits Dept AB2-1/DB2-1 30Days`, `Bond Department`, `Commercial 21 Department`, `Commercial AB2-1/DB2-1`, `Commercial Dept NO UNITS AB1-3a/DB1-2 Due=10`, `Commercial Dept with Units AB1-3a/DB1-2 Due=30`, `Commercial Lines AB1-2/DB2-3a (1) 20days`, `Commercial Lines AB2-1/DB2-1`, ...). **The same Department list appeared regardless of which Branch was selected** — no evidence of Branch→Department filtering was observed. |
| **Unit** | Searchable single-select dropdown | No | `Unassigned` | **Disabled/non-interactive until both Branch and Department are selected.** Once both are set, the dropdown becomes clickable and its option list is **specific to the chosen Department** — in the one case tested (`Commercial Dept with Units AB1-3a/DB1-2 Due=30`), the only option available was still `Unassigned` (no additional units were configured for that particular department in this org), so the presence of options is data-dependent per department. |
| **Responsibility** | Searchable single-select dropdown | No | `Unassigned` | **Always enabled**, independent of Branch/Department/Unit (unlike Unit/Employee). Backed by an org-wide list of responsibility/role types, e.g.: `Unassigned`, `Account Executive`, `Account Manager`, `Billing Carrier Contact-At CA Profile Only`, `Billing Carrier Policy Contact-PRIMARY`, `Billing Carrier Policy Contact-REMOVED`, `Billing Carrier Policy Contact-Secondary`, `Billing Carrier Policy Contact-Tertiary`, `Broker Responsibility`, `Claims Representative Resp`, `Customer Service Representative Resp`, `INACTIVE RA Contact`, `Issuing Carrier Contact-at CA Profile Only`, and more (list continues/scrolls). |
| **Employee** | Searchable single-select dropdown | No | `Unassigned` | **Disabled until Branch and Department are selected**, same gating pattern as Unit. Once enabled, its option list appears to be the set of employees associated with that Branch/Department combination (only `Unassigned` and one specific employee, `Automation, Dyad`, were available for the test Branch/Department combination used) — treat this as org/branch-specific master data, not a fixed list. |

### Retail Agent block

- Below the five dropdowns is a **"Retail Agent:"** section, initially showing greyed-out skeleton placeholders under two column headers, **ADDRESS** and **CONTACT** — this is simply the "nothing selected yet" empty state, not a disabled control.
- An **"Add Retail Agent"** button (outlined blue, bookmark-plus icon) opens a small popover titled **"Find a Retail Agent"** containing one field:
  - **Keywords** — free-text search input, placeholder text: `Name, Address, Email, Phone, SSN, FEIN`. This indicates the search matches against any of those fields server-side.
  - Typing a query and pressing **Enter** (a brief delay/possibly a debounce is involved) returns a results list directly under the input — each result line shows **Agent Name, City, State** (e.g. `Automation Tester, Los Angeles, CA`; `Serendipity Test Retail Agent, Las Vegas, NV`; `QaTest RetailAgent, Nevada, NV`, etc.). This is a live type-ahead search against the org's retail-agent records, not static markup.
  - Clicking a result immediately assigns that Retail Agent to the client and closes the popover.
- Once a Retail Agent is assigned:
  - The section header changes to **"Retail Agent: `<Agent Name>`"** with a small red trash-can icon beside it (presumed to remove/unassign the agent — its exact behavior was **not clicked/verified** in this session, noted here as an inference only).
  - **ADDRESS** column populates with: Location Name, City/State line, Zip, Country.
  - **CONTACT** column populates with three rows, each with its own icon: the agent's **Name** (rendered as a clickable link — presumably opens that agent/contact record), an **email** row (mail icon), and a **phone** row (phone icon).
  - The **"Add Retail Agent"** button's label changes to **"Change Retail Agent"** (same position/style), and clicking it reopens the same "Find a Retail Agent" keyword-search popover to pick a different one.

### Buttons

| Button | Behavior |
|---|---|
| **Add Retail Agent** / **Change Retail Agent** | Opens/reopens the "Find a Retail Agent" keyword-search popover described above. Label reflects whether an agent is currently assigned. |
| **Back** | Returns to Step 2 (Client Contacts), preserving what's been entered on this step (confirmed: Branch/Department selections and the assigned Retail Agent all survived a Back→Next round-trip **within the same page session**, i.e. without a browser reload — see the caveat in Section 6 about what does *not* survive). |
| **Done** | Intended to finalize client creation. See Sections 3 and 5 for its two very different observed outcomes depending on whether required fields are actually valid. |

## 3. Important bug/quirk — "Done" is not client-side-gated the way "Save" was on the Contact dialog

Unlike the Add Contact dialog (where the Save button is genuinely `disabled` until First/Last name are filled), the **Assignment step's Done button here was never observed with a `disabled` DOM attribute, even while Branch and Department were both empty and showing red "Please provide" errors.** Concretely:

1. With Branch filled but Department still empty (and Department's field showing "Please provide" in red), clicking **Done** did **not** get blocked by validation. Instead:
   - The button's icon changed to a spinner.
   - After roughly 1–2 seconds, a **toast/banner error appeared**: `⚠ An unexpected error occurred. Please contact Nexsure Support and reference issue #<numeric-id>` (the reference number is presumably generated per-incident).
   - **The Done button was left permanently stuck**: its text remained "Done" but its `disabled` DOM property flipped to `true` and the icon stayed a static spinner — it did not recover on its own. Navigating to another step and back (within the same SPA session, no reload) did **not** reset it either; the button stayed disabled/stuck.
   - The only way found to recover was a **full page reload** (which itself carries the consequence described in Section 6 — it can discard in-progress wizard data).
2. With **both** Branch and Department properly selected (valid required fields), clicking **Done** succeeded cleanly (see Section 5) — no stuck-button behavior was seen in the valid case.

**Automation implication:** never treat the mere clickability/enabled-ness of "Done" as proof the required fields are valid — check the actual field values (and absence of the "Please provide" error text) before clicking, or you risk hitting the stuck-button failure mode and having to reload to recover.

## 4. Validation display (as opposed to enforcement)

- Both **Branch** and **Department**, when left unset, display a red-outlined field border plus an inline red `Please provide` message directly beneath — visually identical in style to the Add Contact dialog's required-field errors.
- However — and this is the key difference from the Contact dialog — **this inline error display does not actually block submission**; it is cosmetic/informational only on this screen, as demonstrated by the failed-submit scenario in Section 3.
- No validation errors were observed on Unit, Responsibility, or Employee (all optional).

## 5. Successful completion behavior — this step chains directly into a NEW wizard

When Branch and Department are both validly selected and **Done** is clicked:

1. The client record is created/saved (confirmed by the client's name, e.g. `ZZZ_KB_Test_DoNotUse`, appearing as a saved, selectable entity afterward).
2. The app **immediately navigates away from the "Clients: New" wizard into a new, separate wizard: "Opportunities: New"**, which has its own 3-step stepper: `1. Select Client → 2. Select Assignment → 3. Select Product`.
3. On landing on that new wizard's Step 1 ("Select Client"), the client you just finished creating is **already selected and displayed**, showing:
   - `Client: <Name> (P)` — the `(P)` suffix appears to denote "Personal" client type (as opposed to Commercial).
   - An **"OFAC Check"** link (opens in a new context — external icon shown) alongside a status dropdown badge reading **"Review Required"**. OFAC = a sanctions/compliance screening check automatically surfaced for the new client.
   - The client's **ADDRESS** (street/city/state/zip/country) and **CONTACT** (the primary contact's name as a link) are displayed, matching what was entered in Steps 1–2 of the client wizard.
   - Buttons: **Change Client**, **New Client** (this one appeared greyed/disabled in context), **Next**.

**Automation implication:** a flow automating "create a new client" must be prepared to land on a *different* wizard ("Opportunities: New") immediately after the final Done click — this is not a dead-end confirmation screen, and there is no separate "client created successfully" toast/message observed; the redirect itself is the success signal. If the automation's goal is only to create the client (not an opportunity), it should detect arrival on the Opportunities wizard as the completion condition and stop/back out there rather than expecting to remain on the Assignment screen.

## 6. Navigation pitfalls discovered while testing this step (important warning)

While probing this screen, browser-level navigation (as opposed to the app's own Back/Next buttons) reliably broke the wizard's internal state:

- Using the **browser's Back button** to leave the Assignment step, then clicking directly on a stepper tab label (e.g. "2. Client Contacts"), produced the same **"An unexpected error occurred"** toast (a slightly different message variant was seen here: `Please contact Nexsure Support if this problem persists`, with no reference number this time).
- Continuing to interact after that point, or issuing a **hard page reload (F5)** to recover, caused the wizard to **reset entirely back to Step 1 (Client Info) with the Primary Location/address fields blank**, and Steps 2/3 became locked again (their tabs greyed out/unreachable) until Step 1 was re-completed from scratch. Any contacts added in Step 2 before the reload were **no longer part of the recovered flow** — a fresh Step 1 submission is needed to get back to Steps 2/3, effectively starting the whole client-creation process over.
- **Conclusion: this wizard is not designed to tolerate browser history navigation (Back/Forward) or page reloads mid-flow.** Automation must exclusively use the in-app "Back"/"Next"/"Done" buttons and the stepper tabs (only for already-unlocked steps, clicked in the normal flow) to move between steps. Treat any appearance of the "An unexpected error occurred" toast as a signal that the current wizard session may already be compromised, rather than something to dismiss and continue past.

## 7. Bonus observations (Step 1, incidentally revisited during this exploration — not the main subject of this document)

Not the requested scope, but noted since they were directly observed and may help explain overall wizard behavior:

- Step 1 ("Client Info") includes a **Client Type** toggle (`Commercial` / `Personal`, pill-style selector) and a **Client Name** field, followed by a "Primary Location" address block (Location Type dropdown, Location Name, Street Address, Unit, City, State/Province, Zip/Postal, Country, International Address Info, Phone, Fax, and a "Same as Mailing Address" checkbox).
- Typing into **City** auto-populates the **Location Name** field with `"<City>,"` (e.g. typing `Testville` into City produced `Testville,` in Location Name) — a live auto-fill side effect worth knowing about if automating that step.
- Clicking **Next** on Step 1 with a Street Address/City/State/Zip combination that a background address-verification service can't confirm shows a confirmation dialog: **"This address cannot be verified — Would you like to continue anyway?"** with **OK**/**Cancel** buttons — meaning fabricated/test addresses are still accepted, just gated behind one extra confirmation click.
- For a **Personal** client type with **no existing contacts**, arriving at Step 2 ("Client Contacts") **automatically pops open the Add Contact dialog** with **First Name pre-filled from the Client Name**, and **Primary Contact pre-checked** (which in turn force-locks the "Contact" checkbox, per the behavior already documented in `Add_Contact_Knowledge_Base.md`). This did not happen for the original `QAble_123` client explored in that companion document, because it already had a contact in its grid — the auto-open appears to be conditional on the contacts grid being empty.

## 8. Summary checklist for automation design

- Branch and Department are **required** but their dropdown option lists are **live organization master data** (dozens of entries each) — do not hard-code the option sets; look them up or search/filter at run time instead.
- Unit and Employee are **disabled until both Branch and Department are chosen**; Responsibility is **always enabled/independent**. Wait for Unit/Employee to become interactive (not just present in the DOM) before trying to open them.
- Do **not** rely on the Done button's enabled/disabled state as proof the form is valid — it can be clicked with missing required fields, resulting in a generic server error and a **permanently stuck, disabled Done button** that only a full page reload clears (and reloading resets the entire wizard back to Step 1).
- Successful completion of this step **redirects into a different wizard ("Opportunities: New")** — design automation's "did client creation succeed" check around detecting that redirect/landing page, not around any message on the Assignment screen itself.
- Never navigate this wizard with the browser's Back/Forward buttons or a page refresh — use only the in-app Back/Next/Done controls and already-unlocked stepper tabs, or risk corrupting the in-progress session (observed first-hand: a corrupted state produces an "unexpected error" toast, and recovering via reload discards all wizard progress made so far).
- The Retail Agent search (Keywords field) is a live, debounced/Enter-triggered type-ahead against agent Name/Address/Email/Phone/SSN/FEIN — build in a short wait after typing (or explicitly send Enter) before expecting results to appear.