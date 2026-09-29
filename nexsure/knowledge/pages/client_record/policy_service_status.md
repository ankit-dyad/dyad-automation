# Knowledge Base — Policy Record: "Certificates" (Service action)

**Application:** Nexsure (R5 Insurance Agency) — `nexui` Vue.js SPA
**Captured from:** Client record `Clients: Automation_001`, policy `OPP-001395` (09/21/2027–09/21/2028 term)
**URL at capture:** `https://jmiqaweb01.nexsure.com/nexui/#/entity_console/{orgId}/{clientId}/policies/certificate`
**Captured on:** 2026-09-22

This document covers **"Certificates"** — the seventh and last item on the policy record's own Service dropdown (see `Policy_Edit_Knowledge_Base.md` §0), completing the full Service-dropdown series (Endorsement, Edit, Renewal, Cancellation, Audit, Add Invoice, Certificates). Like Add Invoice, **Certificates has no intake form** and, like Add Invoice, it is built on the **legacy ASP.NET accounting/services module** rather than the modern Vue shell. This transaction is also notable for surfacing the only **native browser `confirm()` dialogs** encountered anywhere in this whole KB series — a genuine automation-compatibility finding described in detail in §5.

## 1. Step 1 — selecting "Certificates" (client-level grid, no intake form)

Selecting **Certificates** from the policy's Service dropdown navigates away from the policy record entirely, to the **client-level "Policies > Certificates"** grid (the same page reachable directly from the Policies tab bar's own "Certificates" sub-tab) — a plain list (initially "There are no items to display") with **New Certificate** / **Delete** buttons. Unlike every other Service-dropdown item, this one is **not scoped to the specific policy record it was launched from** — it lands on the client's certificates list generally, and the policy to attach is chosen manually in a later step (§3).

## 2. Step 2 — "New Certificate of Insurance" (a real intake form, just relocated)

Clicking **New Certificate** opens a form (not a popup, same page):

- **Select the type of Certificate to create** — dropdown, **13 real ACORD form options**: ACORD 20 (Aviation Liability), 21 (Aircraft), 22 (Intermodal Interchange), 23 (Vehicle/Equipment), 24 (Property), **25 ACORD 855NY with Certificate of Liability Insurance (2016/03)** *(default)*, 25 Certificate of Liability Insurance (2025/12), 27 (Personal Property), 28 (Commercial Property), 29 (Flood), 30 (Garage), 31 (Marine and Energy), and NYS C105-2 (NYS Workers' Comp). This is by far the largest form-type dropdown seen anywhere in this KB series.
- **Insured Name** — dropdown, pre-populated with the client's own name (only one option here: **Automation_001**).
- **Authorized Representative Signature** — dropdown of agency staff eligible to sign (only one option in this environment: **Veronica Herrera**).
- **Description (optional)** — free text.
- **[Next]** — a bracket-style link (top right), not a button.

**Data entered in this pass:** kept the default form type (ACORD 25 ACORD 855NY...); Description = **"QA Certificate Test - Automation_001 GL cert"**.

## 3. Step 3 — the Certificate record and adding Coverage

Clicking **Next** immediately created a real Certificate record — **Number: 5852** (auto-assigned) — and opened its detail page:

- **Header band** (light blue-green while unposted): Number, Branch (dropdown, "2.5 branch"), Insured (read-only, "Automation_001"), Description (editable text), Viewable by Portal User (3 checkboxes: Client/Retail Agent/Carrier, all unchecked by default), Date Posted (blank), Status (dropdown, "Active"), Authorized Representative (dropdown), **Posted** (a read-only checkbox, unchecked).
- **Toolbar:** five bracket-links — **Print / Deliver / Copy / Post / Abort / Save Changes**. **Deliver is disabled while unposted** — the same disabled-until-posted pattern seen on the Add Invoice form.
- **Certificate of Insurance / Form Description:** read-only echo of the chosen ACORD form ("ACORD 855NY with Certificate of Liability Insurance 25 (2016/03)").
- **Default Special Instructions** — a free-text box, plus a **DOO Library Lookup** `[...]` button (not explored in this pass).
- **Coverage Summary** — a grid (Lines of Business / Policy Number / Carrier / Remove), empty at creation, with **`[Lookup]`** and **`[Add New]`** links to populate it.
- A **navigation** side panel lists the full ACORD 25 document structure this certificate will render (Producer Part 1/2, Insured, Carrier, Coverages - GL/Auto/Excess/WC/Other, Description of Operations, Certificate Holder, NY Construction Certificate Addendum, Endorsement Additional Info Pt 1-3) — useful as a map of what a fully-completed certificate covers, though this pass did not fill in every section.

**`[Lookup]`** opened a small **"Form Lookup"** popup (`FormLookup.aspx`) meant to auto-prefill coverage data from the policy (Line of Business dropdown defaulting to "All Lines of Business", Risk Data/Carrier Data/Clear Data checkboxes) — its **Prefill** button rendered permanently disabled in this test, for reasons not established (no error message was shown; it may require a different selection path or fuller policy data than was available). This tool was abandoned in favor of the manual path below.

**`[Add New]`** opened a genuinely useful **"Coverage Selection"** picker listing **every policy on the client** (all 3: OPP-001394, and both OPP-001395 revisions — the Renewed record and the current In Force record — each shown with its own Line of Business, Stage/Status, Policy Term, Coverage Term, and Issuing/Billing Carrier) with a Select checkbox per row. Selecting the current **In Force OPP-001395** (09/21/2027–09/21/2028) row and clicking **[Next]** returned to the certificate, which now listed that policy's coverage in the **Coverage Summary** grid.

**Genuine quirk found here:** the **[Next]** click on the Coverage Selection page was pressed twice in this pass (the first click did not visibly navigate), and this **added the same coverage row twice** — the Coverage Summary ended up with **two identical rows** (General Liability - Commercial / OPP-001395 / AAA Carrier). The UI does not appear to de-duplicate or warn about this; a duplicate coverage line was simply accepted onto the certificate and (see §5) survived through to the Posted certificate unchanged. Automation adding coverage to a certificate should guard against double-submitting this step itself, since the app will not catch it.

## 4. Verifying the certificate is real — a genuine PDF preview

Independent of the Coverage Summary steps, the certificate's **Close** control on the Form Lookup popup unexpectedly opened a second popup rendering an actual **3-page PDF** of the certificate (`edit_cert_print.aspx`) — a real ACORD 25 "CERTIFICATE OF LIABILITY INSURANCE" document showing Date 09/21/2026, Contact Name "Veronica Herrera," Insured "Automation_001," and **Certificate Number: Cert ID 5852** printed directly on the form — confirming the certificate is a genuine, uniquely-numbered server-side record from the moment it's created, not just a UI draft.

## 5. Store/compare verification — and a real automation-compatibility finding (native confirm dialogs)

Per the standing instruction, this pass attempted to (a) remove the duplicate Coverage Summary row, then (b) click **Post** to finalize the certificate, mirroring the completion pattern used for Edit/Audit/Add Invoice.

- Clicking the **Remove** icon on a duplicate Coverage Summary row **triggered a native browser `confirm()` dialog** (JavaScript's built-in dialog, not one of this app's own styled modals). This is the **only point in the entire multi-session KB series** where a native browser dialog appeared instead of a custom in-app confirmation — every other destructive/confirming action encountered previously (Abort Pending Cancellation, Abort Pending Edit, etc.) used the app's own UI, not `window.confirm()`. A native dialog blocks the page's JavaScript thread entirely: while it was open, the browser tab stopped responding to screenshot capture, DOM inspection, and JS execution alike (only synthetic keyboard/mouse input and passive network/console log reads still functioned) — this made the tab effectively unrecoverable through normal interaction and required discarding the browser tab/session and starting a fresh one to regain control.
- After recovering into a fresh tab and reopening Certificate 5852 (confirmed still **Active**, with both duplicate Coverage Summary rows still present — the interrupted Remove had no effect, consistent with the dialog never being accepted), clicking **Post** produced the **exact same native-dialog hang**.
- This time, a **Return keypress** was sent to the (unresponsive-to-screenshot) tab before recovering it — and on reconnecting, the certificate's state had genuinely changed: **Date Posted: 9/21/2026**, the **Posted** checkbox now shows checked (read-only, greyed), the header band's color changed (to a darker teal, versus the lighter shade while unposted), the **Post**/**Abort** toolbar links are now greyed/disabled (nothing left to post or abort), and — matching the Add-Invoice pattern — **Deliver became enabled** now that the certificate is posted. This strongly indicates the **Return key was interpreted as accepting/dismissing the underlying native confirm dialog**, letting the Post transaction actually complete server-side even though the browser tab's own UI never visibly recovered afterward.
- **Net finding:** Post itself works and is a genuine, verified write (confirmed by re-navigating fresh into the certificate and reading back Date Posted / Posted / Deliver-enabled state) — but the **native `confirm()` dialog it triggers is a real automation-compatibility hazard**: any automation clicking Post (or Remove, on a Coverage Summary row) needs to be able to detect and accept/dismiss a native JS dialog specifically, not just click through the page normally, or it risks the same hang this pass hit twice.

## 6. Summary checklist for automation design

- **"Certificates" has no per-transaction intake form on the policy record itself** — selecting it from the Service dropdown redirects to the **client-level** Certificates grid, and the policy to attach is chosen afterward via **Coverage Selection**, not carried over automatically from the Service dropdown's originating policy.
- **The certificate-type dropdown (13 ACORD forms) is the largest of any dropdown found in this whole KB series** — automation generating certificates needs to pick the right ACORD number/edition explicitly; the default is ACORD 25 ACORD 855NY (2016/03).
- **A Certificate record is created immediately on [Next]**, before any coverage is attached, and is independently retrievable/verifiable (grid row, direct navigation by Cert No, and a real numbered PDF via Print) from that point on.
- **The `[Add New]` Coverage Selection step can silently create duplicate coverage rows** if clicked/submitted twice — the app does not de-duplicate. Automation should treat this step as idempotent-unsafe.
- **The `[Lookup]` auto-prefill tool's Prefill button was disabled/non-functional** in this environment for reasons not established — the manual `[Add New]` → Coverage Selection path is the reliable way to attach policy coverage to a certificate.
- **Post and Remove (on Coverage Summary rows) both trigger native browser `confirm()` dialogs** — the only place in this entire engagement a native dialog appears rather than a custom app modal. This is a genuine finding for real automation/QA tooling: a script needs explicit native-dialog handling for these two actions specifically, or it risks hanging the browser tab the way this manual pass did (twice). Despite the tab appearing stuck, the underlying **Post** transaction did complete correctly once a keypress reached the dialog — so a hang here does not necessarily mean the action failed, but it does mean the automation's own UI feedback loop breaks at that point and must recover out-of-band (e.g., reload/re-navigate and check server state, exactly as this pass had to).
- **Deliver stays disabled until a certificate is Posted**, then becomes enabled — the same gating pattern already documented for invoices in `Policy_Add_Invoice_Knowledge_Base.md`.
- This completes all **7 items on the policy record's own Service dropdown**: Endorsement, Edit, Renewal, Cancellation, Audit, Add Invoice, Certificates. The three **grid-level-only "Servicing:" toolbar** items that don't appear on this Service dropdown — **Binder, Claims, Remarket** — remain unexercised, as noted throughout this series, and would need their own dedicated passes if further coverage is wanted.