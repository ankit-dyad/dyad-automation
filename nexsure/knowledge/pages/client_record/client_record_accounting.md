# Knowledge Base — Client Record: "Accounting" Page

**Application:** Nexsure (R5 Insurance Agency) — `nexui` Vue.js SPA
**Captured from:** Client record `Clients: Automation_001`
**URL at capture:** `https://jmiqaweb01.nexsure.com/nexui/#/entity_console/{orgId}/{clientId}/accounting/{subtab}`
**Captured on:** 2026-09-21

Companion document to the other Client-level tab documents. Like the **"claims"** sub-tab documented in `Client_Claims_Knowledge_Base.md`, **the entire Accounting section is a legacy ASP.NET Web Forms module embedded in an `<iframe>`**, not a native Vue component — confirmed by inspecting the DOM (`src` resolves to `/Application/NexsureX/invoicing/invoice_searchview.aspx` on the same host, an **.aspx** page rather than the `.asp` used by Claims, but the same overall legacy-embed pattern). This client had **no accounting data of any kind** (no invoices, no summary bills, no bills, no balance), so only the empty-state UI and the available filter/action controls could be documented.

> **Scope note — what was deliberately NOT exercised:** none of the bracket-style action links (**[Add Disbursement]**, **[Add Reconciliation]**, **[Receive Payment]**, **[Add Summary Bill]**, **[Add Master Invoice]**, **[Add New Invoice]**, **[Add New]** on Summary Bill Masters, **[Add New]** on List Bills) were clicked — every one of these creates a real financial/accounting record.

## 1. Sub-tab structure

Selecting **ACCOUNTING** on the main tab bar reveals **4 sub-tabs**: **Summary Views** (default), **Summary Bill Masters**, **List Bills**, **Client Balance Summary**. All four loaded noticeably slower than native Vue pages elsewhere in the app (multi-second spinners) — consistent with each one being its own legacy iframe page load rather than a client-side route change.

## 2. Summary Views (default sub-tab)

- **Select View** dropdown — a rich list of **13 report views**: Assigned Payments, Balance Detail, Detail Assigned (default), Invoice Summary, Open Binder Bill, Payment Summary, Policy Payments, Posted Invoices, Reversed Invoices, Summary, Transactional, Unassigned Payments, Unposted Invoices.
- **Select Client** dropdown (empty in this single-client context).
- A row of **6 bracket-style action links** at top right: **[Add Disbursement] [Add Reconciliation] [Receive Payment] [Add Summary Bill] [Add Master Invoice] [Add New Invoice]** — classic ASP.NET Web Forms link-button styling (plain blue text in square brackets), consistent with the legacy claims iframe's visual language documented in `Client_Claims_Knowledge_Base.md`.
- **Search Filter: [Show]** — a collapsible filter panel (not expanded in this pass, but the field-name conventions below strongly suggest it mirrors the same style as the legacy Claims filter).
- Grid: **"Invoice Transaction Summary"** — columns **Details, Effective Date, Date Booked, Date Due, Status, Type, Transaction ID, Invoice ID/Master Invoice ID, Policy Number, Description, Bill Method, Amount, Remove**, with a footer row showing **Account Balance: $0.00**. Standard **Showing Page X of Y** pagination with **Total Rows: 0** and a **Display: [Default (10) / 500 / Max (1,000)]** page-size dropdown.
- **Full dropdown option sets extracted directly from the iframe's DOM** (ASP.NET Web Forms field names shown in parentheses, matching the `filter$...`-style convention seen on the Claims iframe):
  - **Policy Modes** (`ddlPolicyModes`): All, New, New on Existing, Re-New-Co, Renew.
  - **Post Status** (`ddlPostStatus`): All, Posted-All, Posted-All Exclude Reversals, Posted-Auto, Posted-Manual, Posted-Reversals Only, UnPosted.
  - **Paid Status** (`ddlPaidStatus`): All, Full Paid, Partially Paid, Unpaid.
  - **Bill Methods** (`ddlBillMethods`): Agency Bill, Direct Bill.
  - **Bill Types** (`ddlBillTypes`): Account Service, Audit, Cancellation, Endorsement, Installment, Reporting, Term Policy.
  - **Business Type** (`LOBSearch$ddlBusinessType`): All, Benefits, Bond, Commercial Lines, Financial Services, Personal Benefits, Personal Lines.
  - **Line of Business** (`LOBSearch$lstLOB`) — an enormous multi-select list of **roughly 200+ specific coverage lines** (e.g. "(CCR) Crime," "(E&O) Errors & Omissions," "401K - Group," "Cyber/Network Liability," "D.I.C. - Commercial," and so on through the alphabet) — clearly the agency's full LOB catalog, not something to enumerate by hand in automation; query it live if needed. A few entries carry obvious test-data artifacts (e.g. "Aircraft - Commercial radhika," "Crime bbbbb"), confirming this list is genuinely editable/seeded data in this sandbox, not a hard-coded product list.
  - **Sort Field 1 / Sort Field 2** (`ddlSortField1/2`): Amount, Date Booked, Description, Invoice ID, Policy Number, Status. **Sort Order 1/2**: Ascending, Descending.

## 3. Summary Bill Masters

Much simpler page: a single **"[Add New]"** bracket-link (top right) and, with none on file, the centered message **"There are no summary bill masters for this client."** — a **distinct empty-state wording** from every other empty-state variant already catalogued across this KB series (plain bold centered sentence, no "contact your system administrator" follow-up line, no bracket-link "Filter" control on this particular sub-tab).

## 4. List Bills

- **"[Add New]"** and **"Filter: [Show]"** bracket-links (top right).
- **Showing Page 0 of 0**, **Total Rows: 0**, **Display: Default (10)** dropdown — same pagination shape as Summary Views.
- Empty-state message: **"There are no results for this search criteria."** — yet another distinct wording from Summary Bill Masters' empty state, inside a plain bordered box.

## 5. Client Balance Summary

The simplest of the four: just a small plain-text line, **"No Data on file."**, top-left aligned with no surrounding box, header, or action links at all — the sparsest empty-state rendering found anywhere across this whole KB series.

## 6. Summary checklist for automation design

- **The entire Accounting section runs on a legacy ASP.NET Web Forms module inside an `<iframe>`** (`/Application/NexsureX/invoicing/invoice_searchview.aspx`), exactly like the "claims" sub-tab documented separately — reinforces that this app is a hybrid of a modern Vue shell wrapping several older backend modules by iframe. Automation must switch into the iframe's document context to interact with any Accounting control.
- **Each of the 4 Accounting sub-tabs is its own iframe page load**, not a client-side tab swap — expect real network/page-load latency (several seconds observed) when switching between Summary Views / Summary Bill Masters / List Bills / Client Balance Summary.
- **Empty-state copy is wildly inconsistent even within this one legacy module**: "There are no summary bill masters for this client." vs. "There are no results for this search criteria." vs. the bare "No Data on file." — do not attempt to detect "no data" with a single string match; check for the presence/absence of actual grid rows instead.
- The **Line of Business multi-select alone has ~200+ entries** and includes test-data noise (misspelled/placeholder-looking entries) — treat it as live, queryable agency configuration data rather than something to hard-code, and expect occasional garbage entries in a QA/sandbox environment specifically.
- Six distinct financial record-creation actions are reachable from Summary Views alone (Disbursement, Reconciliation, Receive Payment, Summary Bill, Master Invoice, New Invoice) plus two more from the other sub-tabs (Summary Bill Master, a bill via List Bills) — every one of these is a real accounting transaction and should be treated with the same caution as any other irreversible/business-critical action in this app.