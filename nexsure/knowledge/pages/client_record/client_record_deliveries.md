# Knowledge Base — Client Record: "Deliveries" Page (client-level)

**Application:** Nexsure (R5 Insurance Agency) — `nexui` Vue.js SPA
**Captured from:** Client record `Clients: Automation_001`
**URL at capture:** `https://jmiqaweb01.nexsure.com/nexui/#/entity_console/{orgId}/{clientId}/deliveries`
**Captured on:** 2026-09-21

Companion document to `Client_Actions_Knowledge_Base.md` and the other Client-level tab documents. This is the **client-wide Deliveries** tab — an aggregated log of email/document deliveries (both inbound and outbound) associated with this client, distinct from the "New Delivery" creation modal already documented in the Client Overview KB (client header), which is reachable from every Client-level page.

> **Scope note — what was deliberately NOT exercised:** no delivery was created, imported, reassociated, exported, or deleted. The Outlook drag-drop import zone was not exercised (no file was dropped into it).

## 1. Page layout

- Header **"Deliveries"** with an **Outlook drag-and-drop import zone** at the top ("drag an email from Outlook here to import it as a Delivery" — same general pattern as the Attachments drag-drop zone, but specifically Outlook-email-flavored).
- Toolbar (duplicated above and below the grid): **Reassociate** (greyed out with no row selected), **Export**, **New Delivery**, **Delete**.
- **Show Filters** toggle, revealing a three-section filter panel (§3).
- Standard **Showing [10] Items per page / Locked-Unlocked / Page X of Y** pagination bar.
- Grid columns: a leading checkbox, an attachment-paperclip icon, a lightning-bolt icon, **Policy/LOB - Cert Or Ref#**, **From**, **To/Cc**, **Via** (an "@" icon — presumably denotes the delivery channel, e.g. email vs. portal), **Title/Subject**, **Associated With**, **Status**, **Updated By**, **Date Created / Date Delivered**.
- This test client had **one Delivery on file**: an email titled **"Inforce THANK YOU"** with **Status: Cancelled** — almost certainly an automated thank-you/confirmation email tied to the same policy bind/in-force event documented in `Opportunity_Marketing_Page_Knowledge_Base.md` (the "In Force" submission whose UI error was found to be misleading, since the underlying policy actually succeeded). Its "Cancelled" status here (rather than "Sent" or "Delivered") is itself worth flagging as a possible QA-sandbox quirk — e.g. outbound mail delivery may be intentionally disabled/cancelled in this test environment.

## 2. Toolbar detail

- **Reassociate** — greyed out until at least one row is checked; presumably lets a delivery record be re-linked to a different Policy/Opportunity/LOB.
- **Export** — always enabled; standard grid-export pattern seen throughout this app.
- **New Delivery** — opens the same `.dynamicModal` already documented in the Client Overview KB.
- **Delete** — a destructive action on selected row(s); not exercised.

## 3. Show Filters panel

Three labeled sections:

- **Delivery:** **Title/Via** (dropdown, default "All"), **Status** (dropdown, default "All"), **Subject** (text), **Message** (text), **Updated By** (text), **Sent By** (text), **Sent To** (text).
- **Dates:** **Created From / To** (date pickers, each with a "±DAYS" quick-offset button, plus a separate **"By"** field alongside the range), **Delivered From / To** (same From/To/"±DAYS" shape).
- **Associated Properties:** **Policy** (text/picker), **Associated Entity Type** (dropdown, default "All"), **Associated Entity** (text/picker).
- **Apply Filter** / **Clear** buttons, plus the recurring **Save / Recall / Clear Memory** preset links at the top of the panel.

## 4. Summary checklist for automation design

- **"Reassociate" requires at least one row selected** — observed disabled with the grid's single row unchecked, same pattern as "Assign to Me"/"Close Actions" on the Actions tab.
- The one Delivery present (**"Inforce THANK YOU"**, Status **Cancelled**) ties directly back to the policy-bind event documented in the Opportunity Marketing KB — useful as a cross-reference point if automation needs to verify that binding a policy produces a downstream Delivery record, though note its status here is "Cancelled" rather than "Sent," which may be sandbox-specific (outbound email likely suppressed in this QA environment) rather than representative of production behavior.
- The **Outlook drag-and-drop import zone** is a genuinely different delivery-creation path from the "New Delivery" modal — worth treating as a separate automation surface (drag/drop or file-upload simulation) if delivery-import needs to be tested, rather than assuming "New Delivery" covers all creation paths.
- **"Via" appears twice** — once as a grid column (icon-only, "@" style) and once folded into the "Title/Via" filter dropdown — the exact relationship between the two wasn't fully disambiguated in this pass; likely both refer to delivery channel (email vs. portal vs. other), but confirm before relying on filter-value-to-column-icon mapping.
- Filter panel's **Dates** section has an unusual extra **"By"** field next to the Created range (not seen on the Created/Delivered range shape used elsewhere in the app) — worth a closer look if filtering by delivery date needs to be automated precisely.