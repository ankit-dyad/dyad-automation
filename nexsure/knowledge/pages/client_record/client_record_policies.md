# Knowledge Base — Client Record: "Policies" Page (list/grid view + sub-tabs)

**Application:** Nexsure (R5 Insurance Agency) — `nexui` Vue.js SPA
**Captured from:** Client record `Clients: Automation_001`
**URL at capture:** `https://jmiqaweb01.nexsure.com/nexui/#/entity_console/{orgId}/{clientId}/policies`
**Captured on:** 2026-09-21

This document covers the **client-level Policies area** in full: the grid of every Policy belonging to this client (the "Policies" sub-tab), and its **5 sibling sub-tabs** — Summary of Insurance, Certificates, Binders, Verifications, and Market Analysis — none of which had been documented anywhere else in this KB series. This is distinct from the individual Policy **record's** own detail tabs (Overview/Coverage/etc.), which are documented in `Policy_Details_Knowledge_Base.md`. Selecting **POLICIES** on the main client tab bar reveals its own dedicated second-row sub-navigation (**Policies · Summary of Insurance · Certificates · Binders · Verifications · Market Analysis**), replacing the client-wide Actions/Deliveries/Attachments/Phone Log row the same way Profile does (documented in `Client_Profile_Knowledge_Base.md` §1).

> **Scope note — what was deliberately NOT exercised:** no policy, certificate, binder, or renewal assembly was created, edited, endorsed, cancelled, renewed, remarketed, or deleted. The "New Policy" wizard was opened only as far as its first step ("Select Assignment") to document its shape — Next was never clicked. On Market Analysis, a browser-native confirm dialog's "Cancel" option was clicked to explore where it led (see §6.4) — this was read-only (no Save Changes was clicked afterward), and the client's policy count was verified to remain unchanged (1) immediately afterward.

## 1. Policies (default sub-tab) — page layout

- Header **"Policies"** with an info **"ⓘ"** icon (an "Online Help" popover, delayed-render like the one on Submissions — see §1.2) and, top right, **Export** and **New Policy** buttons.
- **View** dropdown — **3 options: All Policies, Active and Future** (default), **Historical** — plus two independent toggle switches next to it: **Show Active** and **Show Future** (both on by default).
- **Show Filters** toggle (§2), **Group By** dropdown (**3 options: None, Expiration Date, Line of Business**), and the standard **Showing [10] Items per page / Locked-Unlocked / Page X of Y** pagination bar (top and bottom).
- Grid uses the same **card-style row** layout as the Opportunities list (`Client_Opportunities_List_Knowledge_Base.md` §2): **Policy Number** (with a copy-to-clipboard icon and an expand caret), **Status** badge (e.g. "IN FORCE"), **Issuing Carrier** / **Billing Carrier** (each with estimated/billed premium figures and a small carrier-type icon), **Policy Term** dates, **Assignment** (branch + assigned person), **Next Due** (a linked description, assigned-to name, and a red due-date), a row **"≡" menu** (§3), and a cream sub-row with activity-counter icons (lightning/envelope/paperclip — Actions/Deliveries/Attachments counts, matching the pattern from every other list grid in this app). This test client had exactly **one policy**: **OPP-001394**, Status "In Force", "NEW MONOLINE" badge tags, LOB "X100_General Liability (126)" — the same bound policy built out across the Opportunity/Policy Detail companion documents.

### 1.1 Expanding a row — "Servicing" toolbar and Coverage Terms/Portal Settings

Clicking a policy row's **expand caret** (or its number) reveals, inline, a **"Servicing:"** action bar with **8 buttons**: **Edit**, **Endorse**, **Binder**, **Audit**, **Claims**, **Renew**, **Remarket**, and a red **Cancel Policy** — none of these were clicked. Below that sit **2 sub-tabs**:

- **Coverage Terms** (default) — a transaction-history grid: **Transaction** (e.g. "New"), **Status**, **State** (a single-letter code, e.g. "A"), **Coverage Term** dates, **Last Action** (bold description + "Created By:"), **Estimated / Billed / Net** premiums, **Updated** date/user, and **4 row-level icon actions** (a change-analysis triangle, an assignments icon, a create-document icon, and a printer icon — several appeared greyed/conditional, matching the icon legend documented in §1.2). An **"EXPAND ALL"** link sits above the grid.
- **Portal Settings** — a simple form: **Portal Description** (textarea, empty) and a **Visibility** section with **3 checkboxes: Client, Retail Agent, Carrier** (all unchecked in this test) — controls whether/to whom this policy is visible in the client/retail-agent/carrier portal.

### 1.2 The "ⓘ" info icon — "Online Help" popover

Like the Submissions page's info icon (`Client_Submissions_Knowledge_Base.md` §2), clicking it surfaces a delayed, scrollable **icon legend** explaining every interactive control on the Policies grid, each with its own **"Show Me How"** button: **Application** (view the application), **Policy Documents** (view attachments flagged as policy documents), the **policy-number right-arrow** (show policy activity), the **Service Automation** gear icon (initiate a service-automation campaign, requires Service Automation to be active), the **E-SERVICES** link (log in to the carrier's website), **Last Action** (open the corresponding action), the **change-analysis triangle** (active only when Status = Submitted), the **assignments** icon (see people assigned to the policy), and **Create Document** (add a document template to the policy). This is the fullest icon legend found in this KB series and is a good single reference for every small icon scattered across the Policies grid and its expanded row.

### 1.3 Row "≡" menu

Opening a policy row's hamburger menu shows **two labeled groups, 12 items total**:

- **SERVICING:** Edit, Endorse, Cancel, Claims, Renew, Market.
- **ACTIVITY:** Print Application, Policy Documents, Summary of Insurance, Send to History, Add Action, Send Delivery.

This duplicates and extends the inline "Servicing:" toolbar from §1.1 (the toolbar has Binder/Audit/Remarket where the menu instead has the broader "Market", and the menu adds the whole ACTIVITY group) — automation should not assume the two surfaces expose an identical action set.

### 1.4 "New Policy" wizard

Clicking **New Policy** navigates (full page, breadcrumbed **"Policies: New"**, not a modal) to a **4-step wizard**: **1. Select Assignment**, **2. Select Product**, **3. Select Retail Agent**, **4. Select Policy Details**. Step 1 is structurally identical to the Opportunity "+New" wizard's own Select Assignment step (`Client_Opportunities_List_Knowledge_Base.md` §6) — a Primary/Branch/Name/Department/Unit/Responsibility/Use Signature grid with a "+" add-row control and a **Next** button — reinforcing that both policies and opportunities are created through the same underlying assignment-first wizard pattern in this app.

## 2. Show Filters panel (Policies sub-tab)

A large three-column-plus panel:

- **Policy:** Policy Number (text), Policy Description (text), Issuing Carrier (text/picker), Billing Carrier (text/picker), Business Types (text/picker), Line of Business (text/picker), **Bill Method** (dropdown — **3 options: All, Agency Bill, Direct Bill**), **Policy Mode** (dropdown — **5 options: All, New, New on Existing, Renew, Re-New-Co** — identical set to the Accounting KB's "Policy Modes" list), **Policy Status** (a **multi-select checkbox list, 16 options: 2nd Request, 3rd Request, Bound, Disputed, Expired, Final, Future, In Force, Interim, Pending, Pending Cancellation, Received, Reinstated, Renewed, Rewritten, Submitted**), Retail Agent (text/picker), Assignment (text/picker), a **Primary Only** checkbox, Responsibility (text), Portal Description (text), Action Description (text).
- **Dates:** Term Effective, Coverage Effective, Term Expiration, Coverage Expiration, and Updated — each a From/To pair with the recurring "±DAYS" quick-offset buttons — plus Updated By (text/picker).
- **Apply Filter** / **Clear** buttons, plus **Save / Recall / Clear Memory** preset links at the top.

## 3. Summary of Insurance sub-tab

Confirmed via DOM inspection to be **another legacy ASP.NET Web Forms page embedded in an `<iframe>`** — `src` resolves to `/efiles/clients/soi/SOI.aspx?embed=true` — the **third** such legacy-embed area found in this app (after the Claims "claims" sub-tab and the whole Accounting section). Layout:

- **LOB** dropdown (default "All"), an **Include:** checkbox row (**Coverages, Premiums, Schedules, Deductibles** checked by default; **Expired Policies, Rating Info, Other, Named Insured(s)** — Other is checked, the rest unchecked by default), and export/print links: **NIC**, two separate **Export** links (Excel-style and Word-style icons), and **Print**.
- A **Quick Navigation** panel on the right lists each Line of Business as a collapsible tree node (only "General Liability - Commercial" in this test).
- The generated report itself: a "Prepared for" header with the client's name/address, then one section per LOB showing **Policy Period / Carrier / Policy Number / Total Premium**, followed by a **Coverages** breakdown (e.g. "Each Occurrence Limit: $1,000,000"), a **Select Schedule** link, and a **"Please Note"** disclaimer block. The disclaimer text itself carries a visible **QA/test-environment artifact** appended to the boilerplate ("...Higher limits and additional coverages may be available upon request. update personal client type for 2.1.1 build 8") — confirming this legal-style boilerplate text is itself an editable, agency-configurable template, not hard-coded.

## 4. Certificates sub-tab

**View** dropdown offers **3 distinct modes, each with its own toolbar** (confirming this is a multi-mode page, not a single grid with filters):

- **Certificates** (default) — toolbar: **New Certificate**, **Delete**.
- **Certificate Holders** — toolbar: **Print Selected** (greyed with nothing selected), **Export** with a **"Selected"** dropdown-caret option.
- **Renewal Assemblies** — toolbar: **New Renewal Assembly**, **Delete**.

All three were empty in this test client, using the standard "There are no items to display. If this is unexpected, please contact your system administrator." empty state. A **Show Filters** toggle and an info **"ⓘ"** icon (Online Help, not opened in this pass) are present regardless of View mode.

## 5. Binders sub-tab

Confirmed via DOM inspection to be a **fourth legacy ASP.NET page**, embedded via `<iframe>` — `src` resolves to `/efiles/clients/binders_summary.aspx`. Visually and structurally matches the Claims "claims" sub-tab and the Accounting iframe (grey table filter layout, native `<select>` controls, "Filter: [Show/Hide]" bracket-link, "Showing page 0 of 0" pagination, "Filter result found no record(s). Please modify search criteria and try again." empty state).

Full filter field set (ASP.NET field names extracted directly from the iframe DOM via `contentDocument.querySelectorAll('select')`, options in brackets):

- **Carrier Name, Policy Number, Binder No** (text). **Line Of Business** dropdown: `All, General Liability - Commercial`. **Policy Stage** (`PolicyStageId`): `All, Audit, Edit, Endorsement, Policy`. **Policy Status** (`PolicyStatusId`): `All, In Force`. **Policy Mode** (`PolicyModeId`): `All, New, New on Existing, Re-New-Co, Renew`. **Binder Status** (`PolicyBinderStatusId`, default **Open**): ` , Open, Closed`. **Policy Type** (`PolicyTypeId`): `All, Package, Monoline`. **Updated By, Retail Agent** (text). **Binder Posted** (`ddlPosted`, default **Both**): `Both, No, Yes`.
- Date ranges: Coverage Eff/Exp Date, Policy Eff/Exp Date, Updated Date (all From/To).
- **Business Type(s)** (text with a "..." browse button).
- **Sort Filters:** Sort Field 1 (default **Binder No**) / Sort Field 2 (default **Cov Eff Date**), each with its own Sort Order (Ascending/Descending); the full Sort Field option list is: `Binder No, Carrier Name, Cov Eff Date, Cov Exp Date, Eff Date, Exp Date, Line of Business, Policy No, Posted, Retail Agent, Updated By, Updated Date`.
- **Search / Clear** buttons, a **"Save Filter Settings"** checkbox.

## 6. Verifications sub-tab

Confirmed via DOM inspection to be a **fifth legacy ASP.NET page** — `src` resolves to `/efiles/clients/services/verifications/verification_summary.aspx`. This is where insurance-verification documents (e.g. vehicle/auto ID cards) are tracked.

- **Current View** dropdown (`ddlViewMode`): **`Verification Policy Masters`, `Vehicles`** (default "Vehicles" in this test).
- Grid columns (Vehicles view): **Select, Details, Year, Make, Model, Form Title, Named Insured, Reference, Active, Issued/Issue Date, Remove**. Empty-state text here is **yet another distinct wording**: *"No records found, please try again."*
- **Show Filters** panel: **Policy No, Issuing Carrier Name, Reference** (text); **Eff Date From/To, Cov Eff Date From/To** (with calendar-icon pickers); **Vehicle Year, Vehicle Make, Vehicle Model, Vehicle VIN** (text); **Named Insured, Form State** (text); **Status** dropdown (` , Active, Inactive`, shown defaulting to "Active" in the UI); **Issued** dropdown (default **Both**: `Both, Yes, No`); **Issue Date From/To**; **Business Type(s)** (text with "..." button). **Sort Field 1** (default **Issue Date**, descending) / **Sort Field 2**, each from the option set `Active, Issue Date, Make, Model, Named Insured, Reference, VIN, Year`. **Search / Clear** buttons, **"Save Filter Settings"** checkbox.

## 7. Market Analysis sub-tab

The most structurally unusual page in this whole KB series. It has **its own 3 further sub-tabs**, rendered **twice** — once as small tab links at the top-left of the panel and again, duplicated, at the bottom-right (**marketing · history · market analysis**) — a legacy-UI layout quirk not seen anywhere else in this app.

- **"market analysis"** (the tab that loads by default) shows the same legacy "Showing Page 0 of 0" / "Filters: [Show]" / "Filter result found no record(s)" shell as Binders and Verifications, but also displays a literal **`[ Install ActiveX ]`** link — a striking artifact confirming this specific feature was originally built for an IE/ActiveX-based control (almost certainly a document viewer or comparison tool) and has never been fully modernized, unlike the rest of the legacy-but-plain-HTML iframe pages found elsewhere in this app.
- **"marketing"** shows a full Search Filters / Sort Filters panel (Policy Number, Mode, Policy Status, Issuing Carrier, Billing Carrier, Retail Agent on the left; Assignment, Responsibility, Updated By, LOB, Bill Method on the right) plus its own **"▶ Training Video"** button (yellow, same visual pattern as the Attachments tab's Training Video button documented in `Client_Attachments_Knowledge_Base.md` — likely the same VideoPlayer.aspx mechanism, not independently confirmed here). Searching with no results here triggers a **native-style JavaScript confirm dialog**, titled **"Filter Found No Records,"** offering three explicit choices: **[OK] Check for marketing history**, **[Re-Set] Modify Search Criteria and Try Again**, **[Cancel] Ignore and go to marketing** — a materially different empty-state UX pattern from every other grid in this app (which just show inline text), and the only place in this whole KB series where an empty search result is handled via a blocking dialog instead of an inline message.
- Choosing **[Cancel]** ("Ignore and go to marketing") on that dialog navigated to what appears to be a **blank "New Marketing"/underwriting record shell** — a legacy form headed by Branch/Policy Type/Issuing Co/Billing Co/Policy Number/Policy Description fields (all "Unassigned"/empty) and Stage "Marketing" / Mode "New" / Status "Empty", with its own **13-tab sub-navigation** (underwriting, policy info, assignment, attachments, actions, qualification, history, transactions, claims, carrier claims, summary of insurance, classified, delivery) and a **"Save Changes"** button. **This was not saved** — no field was touched and no Save action was clicked, and the client's policy count was independently re-verified as still "1" immediately after navigating away, confirming nothing was persisted. This shell is presumably the same underlying "new marketing record" screen that the Submissions page's "New Marketing" wizard front-ends in the modern Vue UI (`Client_Submissions_Knowledge_Base.md` §4) — i.e., a second, older UI entry point into essentially the same underlying feature.
- **"history"** was not separately explored in this pass (time-boxed after the unexpected marketing-shell navigation above); presumably a read-only log of past marketing activity for the policy/client.

## 8. Summary checklist for automation design

- **Policies has its own 6-tab sub-navigation** (Policies · Summary of Insurance · Certificates · Binders · Verifications · Market Analysis), directly analogous to Profile's 6 sub-tabs and Accounting's 4 — don't assume "Policies" is a single page; it's a whole area.
- **Three more legacy ASP.NET/iframe pages were found here** — Summary of Insurance (`SOI.aspx`), Binders (`binders_summary.aspx`), and Verifications (`verification_summary.aspx`) — on top of the two already known (Claims, Accounting). That brings the running total to **five confirmed legacy-iframe surfaces** in this application; Market Analysis is very likely a sixth (same visual/empty-state style) though its iframe `src` wasn't independently captured via DOM in this pass.
- **Market Analysis's empty-state confirm dialog is a genuinely different interaction pattern** — a blocking native-style dialog with three named choices, rather than inline text — and one of its choices silently opens what looks like a record-creation shell. Automation clicking through Market Analysis should treat this dialog as a decision point requiring an explicit, deliberate choice, not something to dismiss reflexively.
- **The "ⓘ" Online Help popover on Policies is the richest icon legend in this KB series** (9 distinct icon/link meanings) — a good single reference if automation needs to identify what a specific small icon on the Policies grid or its expanded row actually does.
- **The row "≡" menu and the inline "Servicing:" toolbar overlap but are not identical** (the toolbar has Binder/Audit/Remarket; the menu has a broader "Market" plus a whole separate ACTIVITY group) — don't assume one surface is a subset of the other.
- **Certificates' "View" dropdown changes the entire toolbar per mode** (Certificates → New/Delete; Certificate Holders → Print Selected/Export Selected; Renewal Assemblies → New Renewal Assembly/Delete) — treat it as three distinct page states, not one grid with a display filter.
- Yet another **distinct empty-state wording** was found on Verifications ("No records found, please try again.") — bringing the running catalogue of distinct empty-state phrasings across this whole KB series to at least 8-9 variants. Automation should never pattern-match on empty-state text; check for actual absence of grid rows/iframe content instead.