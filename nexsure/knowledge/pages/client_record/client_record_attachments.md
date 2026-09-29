# Knowledge Base — Client Record: "Attachments" Page (client-level)

**Application:** Nexsure (R5 Insurance Agency) — `nexui` Vue.js SPA
**Captured from:** Client record `Clients: Automation_001`
**URL at capture:** `https://jmiqaweb01.nexsure.com/nexui/#/entity_console/{orgId}/{clientId}/attachments`
**Captured on:** 2026-09-21

Companion document to `Client_Actions_Knowledge_Base.md` and `Client_Deliveries_Knowledge_Base.md`. This is the **client-wide Attachments** tab — a file-management area (folders + uploaded documents) for this client. No files existed in any folder on this test client, so only the folder tree, navigation, filter, and toolbar behavior could be documented, not an actual file's detail view.

> **Scope note — what was deliberately NOT exercised:** no file was uploaded/dragged in; **Create Document**, **Create Action**, and **Delete** were not clicked (Create Action was greyed out regardless, presumably requiring a row selection). The **Training Video** button *was* clicked, since it is a read-only help/media action with no side effect — see §5.

## 1. Page layout

Two-column layout under the standard client header (documented in the Overview KB) and the tab bar:

- **Left sidebar:** a **Show Filters** toggle (§4), a **View: Folders / Flat** toggle (§3), and a **Folders** tree (§2).
- **Main area:** a breadcrumb showing the current folder (e.g. "Automation_001 Folder" at root, or "Automation_001 Folder > Client Referrals" once a subfolder is selected), the **Attachments** grid header with **"No items found"**, a **Show Thumbnails** checkbox, a drag-and-drop upload zone (**"To add attachment, drag & drop or click to browse."**), and — once scrolled into view on the right — the full action toolbar: a yellow **Training Video** button, blue **Create Document** button, greyed-out **Create Action** button, and a red **Delete** button. **These toolbar buttons sit far enough to the right that they are cut off/invisible at default viewport width** — automation and manual testers alike should scroll the page horizontally to reach them, same visibility issue already flagged for other wide toolbars in this app series.

## 2. Folder tree

The client's root folder, **"Automation_001 Folder,"** is expanded by default and contains a mix of files-folders and nested subfolders — clearly seeded QA/test data:

- **1234** (greyed out — likely an inactive/archived folder; not clickable the same way as the others)
- 2.1 build 18 folder
- 2.1 build 18 folder - Copy
- **Client Referrals** (expandable) → **Area Code Listing** (expandable) → **MS Outlook Messages**, **MS Outlook Messages - Copy**, **MS Outlook Messages - Copy** *(a second, apparently duplicate, "- Copy" entry)*
- F3207
- **Folder 1** (expandable) → **Folder 1 Sub Folder**
- old folder
- Outlook Messages
- **Recycle Bin** — a special, fixed system node (recycle-icon, not a plain folder icon) at the bottom of the tree, outside the normal folder hierarchy.

### 2.1 Folder click behavior

Clicking any folder in the tree (confirmed on "Client Referrals"): highlights that row in the tree, updates the main-area breadcrumb to show the full path (e.g. "Automation_001 Folder > Client Referrals"), and triggers a **brief loading spinner** while the grid re-queries for that folder's contents — a real navigation/data-fetch, not just a client-side filter toggle. Clicking the root **"Automation_001 Folder"** node returns to the top-level view.

### 2.2 Recycle Bin

Selecting **Recycle Bin** navigates the same way (breadcrumb becomes "Automation_001 Folder > Recycle Bin") but **disables the drag-and-drop upload zone** (greyed out, "To add attachment..." text dimmed) — confirming this is a **read-only view of deleted attachments**, not a normal folder you can upload into. This is presumably where a file goes after being removed via the **Delete** button, though that flow wasn't exercised.

### 2.3 "Folders" vs. "Flat" view toggle

A toggle switch at the top of the sidebar offers **Folders** (default, selected) and **Flat** modes. **Clicking the toggle in this pass did not produce any visible change** — the switch's knob position and the tree display stayed the same after multiple click attempts at slightly different coordinates. This may be a non-functional/disabled control in this test environment, a click-target precision issue, or a mode that only matters once files actually exist to flatten — **not conclusively confirmed either way; worth re-testing directly (ideally with real files present) before assuming Flat mode is broken.**

## 3. Show Filters panel

Three columns, opened via the **Show Filters** toggle:

- **Attachment Properties:** **Name** (text), **Description** (text), **Type** (dropdown — **11 options: All, BMP, GIF, JPG, MS Word, MS Excel, MS PowerPoint, Outlook Attachment, PDF, PNG, TIFF**).
- **Created:** **From / To** date pickers (each with a "±DAYS" quick-offset button) plus a separate **"By"** text field.
- **Modified:** same From/To/±DAYS/"By" shape as Created.
- **Associated Properties:** **Policy/Cert/Ref/Claim #** (text), **LOB** (text), **Issuing Carrier** (text), **Business Type(s)** (dropdown, default "All"), and a **"Policy Documents Only"** checkbox.
- **Settings:** **Portal Visibility** (dropdown — **6 options: Any, None, All Types, Carrier, Client, Retail Agent**), **Status** (dropdown — **3 options: Any, Draft, Completed**).
- **Apply Filters** / **Clear** buttons at bottom right; note this panel does **not** have the Save/Recall/Clear Memory preset-link row used by most other filter panels in this app — just the two action buttons (a minor inconsistency worth flagging for anyone pattern-matching filter panels across the app).

## 4. Toolbar actions

- **Training Video** — a static help/media link, **not a modal**: clicking it opens a **new browser tab** pointing to `https://jmiqaweb01.nexsure.com/Application/Infrastructure/VideoPlayer.aspx?id=601163773` — yet another legacy **.aspx** page (consistent with the Accounting section and the Attachments-adjacent "New ___" modals' backend, reinforcing how much of this app's tooling still runs on classic ASP.NET Web Forms pages even where the front-end is Vue). The page itself embeds a **Vimeo video player** showing a screen-recording walkthrough of the "Create Document" template-selection flow (visible in the recording: a "Select Template" search grid with Category/Type/keyword filters and a list of ~132 available document templates) — i.e., this is genuinely an instructional video for using the Create Document feature, not a decoy or dead link.
- **Create Document** — presumably opens the same template-selection flow shown in the training video; not exercised directly in this pass (already implied to be a substantial feature — a client-level document-generation wizard backed by ~130+ templates).
- **Create Action** — greyed out with no attachment row selected (consistent with the "requires a selection first" pattern already seen on the Actions tab's "Assign to Me"/"Close Actions" and the Deliveries tab's "Reassociate").
- **Delete** — red, destructive; not exercised.

## 5. Summary checklist for automation design

- **The Attachments toolbar is off-screen at default viewport width** — the same horizontal-scroll visibility issue already noted elsewhere in this KB series; automation targeting Training Video/Create Document/Create Action/Delete must either scroll first or query the DOM directly rather than relying on default viewport visibility.
- **Folder selection is a real async navigation** (breadcrumb update + brief loading spinner), not an instant client-side filter — build in a short wait/poll after selecting a folder.
- **Recycle Bin is a distinct, upload-disabled system folder** at a fixed position at the bottom of the tree — a useful, denied-upload signal for automation to detect "is the user currently viewing the Recycle Bin" without parsing the breadcrumb text.
- **The Folders/Flat toggle showed no observable effect in this pass** — don't assume it works without direct re-verification, ideally against a folder that actually contains files.
- **"Training Video" is a genuine new-tab help video** hosted on a legacy `.aspx`/Vimeo-embed page (`VideoPlayer.aspx?id=...`) — automation exercising this button should expect and handle a new-tab/window open, and note the `id` query parameter likely varies per contextual help topic across the app (this is presumably the same mechanism behind any other "Training Video"-style buttons elsewhere in Nexsure, not unique to Attachments).
- The **Type filter's 11 options (BMP/GIF/JPG/MS Word/MS Excel/MS PowerPoint/Outlook Attachment/PDF/PNG/TIFF plus All)** define the complete set of attachment file types this module recognizes — useful as a fixed enum (unlike most other dropdown lists in this app, which turned out to be editable agency configuration).
- This filter panel is the **first one across the whole KB series without a Save/Recall/Clear Memory preset row** — don't assume every "Show Filters" panel in this app has that feature.