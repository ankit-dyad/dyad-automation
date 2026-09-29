# Knowledge Base — "Add Contact" / "Edit Contact" Dialog

**Application:** Nexsure (R5 Insurance Agency) — `nexui` Vue.js SPA
**Captured from:** New Client wizard → Step 2 "Client Contacts"
**URL at capture:** `https://jmiqaweb01.nexsure.com/nexui/#/client/new/opportunity?ClientName=QAble_123`
**Captured on:** 2026-09-17

This document is a functional/UI knowledge base of the Add Contact feature, intended as a reference for building automation (test scripts, RPA, or AI-agent driven flows) against this screen. It intentionally contains **no script code** — only structural, behavioral, and validation knowledge.

---

## 1. Where this control lives

- The "Add Contact" button sits on the **Client Contacts** grid, which is **Step 2 of 3** in the "New Client" creation wizard (steps shown in a breadcrumb/stepper: `1. Client Info` → `2. Client Contacts` → `3. Assignment`).
- The grid above the button lists existing contacts for the client being created, with columns: `Primary`, `Name`, `Role`, `Contact Info`, `Service Automation`, and a delete (trash) icon per row.
- Clicking the **"Add Contact"** button, or clicking an existing row in the grid, both open the **same dialog component**:
  - New record → dialog header reads **"Add Contact"**, all fields empty, `CONTACT` checkbox pre-checked, `Enable Service Automation` toggle pre-ON.
  - Existing record → dialog header reads **"Edit Contact"**, fields pre-populated with that contact's saved values.

## 2. How it renders (important for automation targeting)

- **Not a new browser tab.** Confirmed via tab list — no additional tab is created.
- **Not a separate popup window.**
- **Not an iframe.** Confirmed programmatically: `document.querySelectorAll('iframe').length === 0` on the page while the dialog is open.
- It is an **in-page modal overlay**, rendered directly in the main document DOM inside a container with class `dynamicModal`. The rest of the page is dimmed/grayed behind it (standard modal backdrop) and is inert while the dialog is open.
- The app is built with **Vue.js**. Tell-tale signs found in the DOM:
  - The "Contact Role" dropdown uses the **vue-select** library (elements carry classes `vs__search`, `vs__clear`, and a `listbox` for options — a searchable single-select, not a native `<select>`).
  - Custom components use an internal `nex_` class prefix, e.g. `nex_text_input` (text fields), `nex_toggle` (the Service Automation toggle switch).
- **No stable `id` or `name` attributes exist on any of the dialog's input elements.** All 19 focusable/interactive elements in the dialog (10 text/search inputs, 11 checkboxes, 2 buttons — see below) were checked programmatically; none carry `id`, `name`, or `data-test*` attributes. Automation should locate fields by their **visible label text** (via the associated `<label>`), by **tab/DOM order**, or by the **component class names** noted above — not by id/name.

## 3. Field-by-field specification

| Field | Type / Control | Required? | Default value | Notes |
|---|---|---|---|---|
| **First Name** | Free-text input | **Yes** | empty | Red asterisk in label. No visible max-length limit found. Plain `nex_text_input`-style text box. |
| **Last Name** | Free-text input | **Yes** | empty | Red asterisk in label. No visible max-length limit found. |
| **Email** | Free-text input | No | empty | **No client-side format validation observed.** A deliberately invalid value (`notanemail`) was accepted and saved without any error or warning. Treat as a plain string field for automation purposes — do not assume email-format enforcement. |
| **Phone** | Free-text input with input mask | No | empty | Auto-formats to US phone pattern **`(XXX) XXX-XXXX`** as you type. Non-digit characters typed are silently stripped/ignored (e.g., typing `abcd1234567890xyz` results in `(123) 456-7890`). Field `maxlength` = **14** (the length of the fully-formatted mask). Effectively numeric input only. |
| **Contact Role** | Searchable single-select dropdown (vue-select) | No | none selected | Click or focus opens a type-ahead listbox. Full option list observed (12 options, alphabetically ordered): <br>• Accounting<br>• Attorney<br>• Billing<br>• Claims<br>• Daughter<br>• Download Contact<br>• General<br>• Husband<br>• Inspection<br>• Service<br>• Son<br>• Wife<br><br>A "Loading..." placeholder briefly appears when the control is opened, indicating the option list is fetched asynchronously (not hard-coded in the page HTML). A "Clear Selected" (×) control appears once a value is chosen. |
| **Primary Contact** | Checkbox | No | unchecked | See **Section 4 — Primary Contact behavior** below; this checkbox has significant cascading side effects. |
| **This person is a: CONTACT** | Checkbox | No (see note) | **checked** | Independent of Driver/Employee — this is **not** a radio-button group; any combination of Contact/Driver/Employee can be checked simultaneously. Becomes **checked and disabled (locked)** whenever "Primary Contact" is checked (see Section 4). |
| **This person is a: DRIVER** | Checkbox | No | unchecked | Independent toggle, no observed side effects on other fields. |
| **This person is a: EMPLOYEE** | Checkbox | No | unchecked | Independent toggle, no observed side effects on other fields. |
| **Enable Service Automation** | Custom toggle switch (`nex_toggle` component, not a plain checkbox) | No | **ON** | See **Section 5 — Notification Settings / toggle quirk** below. |
| **APPLICATIONS** | Checkbox (notification type) | No | unchecked | Sits under "Notification Settings", left column. |
| **BIRTHDAY RECOGNITION** | Checkbox (notification type) | No | unchecked | Right column. |
| **CANCELLATIONS** | Checkbox (notification type) | No | unchecked | Left column. |
| **CERTIFICATES** | Checkbox (notification type) | No | unchecked | Right column. |
| **PAST DUE REMINDERS** | Checkbox (notification type) | No | unchecked | Left column. |
| **VERIFICATIONS** | Checkbox (notification type) | No | unchecked | Right column. |

### Buttons

| Button | Behavior |
|---|---|
| **Save** | Disabled (greyed, non-interactive appearance) until both First Name and Last Name have a non-empty value. Once both are filled, it becomes a solid blue, enabled button. Clicking it while required fields are empty shows inline validation (see Section 6) instead of submitting. On success it closes the dialog and the new/updated contact appears immediately in the Client Contacts grid (no separate confirmation dialog, no full page reload observed). |
| **Cancel** | Red button, bottom-right. Closes the dialog. (Behaves as expected for discarding the in-progress add/edit; not exhaustively tested for "does it prompt if dirty" — no such prompt was observed when clicked after only opening the dialog.) |
| **× (top-right of dialog header)** | Closes the dialog (same visual position as a standard modal close button). |

## 4. Primary Contact behavior (important business rule)

Only **one contact per client can be Primary at a time.** This is enforced automatically, not just visually:

1. When you check **Primary Contact** on the Add/Edit Contact form:
   - The **CONTACT** checkbox (under "This person is a:") is automatically forced to **checked** and becomes **disabled** — you cannot uncheck "Contact" while "Primary Contact" is checked. This implies a Primary Contact must always also be flagged as a Contact.
2. When you **Save** a contact with Primary Contact checked, and another contact in the same client's grid was previously marked Primary, **that other contact's Primary flag is automatically cleared** — confirmed by direct test (checking Primary on a new "Primary Test" contact and saving caused the previously-primary "QAble_123 Automation" contact to lose its Primary checkmark in the grid).
3. **Deleting the current Primary contact does not automatically re-assign Primary to another contact.** After deletion, the grid can be left with **no contact marked Primary at all** until someone manually re-opens a remaining contact, checks Primary Contact, and saves.

**Automation implication:** if a flow needs to guarantee a specific contact stays Primary, do not delete/replace the Primary contact without explicitly re-setting Primary on the intended contact afterward.

## 5. Notification Settings / "Enable Service Automation" toggle — a quirk worth knowing

- Visually, the "Enable Service Automation" control is a rounded toggle switch (blue = the component's styling), and it appears **ON by default** when the Add Contact dialog opens for a new contact.
- **Caveat for automation:** the underlying `<input type="checkbox">` behind this toggle was observed with `checked: false` in the DOM at a point where the control was visibly in its default/"on-looking" state. In other words, **the native `checked` DOM property of this control cannot be trusted at face value** — it appears to be a custom-styled component where the authoritative on/off state is tracked internally (Vue component state) rather than reliably mirrored onto the native checkbox's `checked` IDL property. If automating this control:
  - Prefer asserting on the **visual/knob position or CSS class state**, or interact with it purely via click actions and verify the resulting effect (e.g., check whether the six notification checkboxes below become enabled/disabled), rather than reading `element.checked` via the DOM.
  - When the toggle is switched **off**, the six notification checkboxes underneath (`Applications`, `Birthday Recognition`, `Cancellations`, `Certificates`, `Past Due Reminders`, `Verifications`) were observed to become **disabled** (matching expectation — you cannot pick individual notification types while the master automation switch is off), even though their own `checked` values are simply `false`, not toggled by this action.
- The six notification-type checkboxes are independent multi-select checkboxes (any combination), all default to unchecked.
- The `Enable Service Automation` state is reflected back in the parent Client Contacts grid via a checkmark in the **"Service Automation"** column for that contact's row.

## 6. Validation behavior observed

- Leaving **First Name** and/or **Last Name** blank and clicking Save (with the button somehow triggered, or after it becomes enabled and then cleared again) produces an inline **"Please provide"** message in red directly under the empty field, and the field's border turns red. The dialog does not close and no network save occurs.
- **Email** field: no format validation was enforced client-side in testing (accepted a non-email string and it saved successfully into the contact record, later visible verbatim in the grid's "Contact Info" column).
- **Phone** field: input is constrained/reformatted at the character level (see Section 3) rather than validated after the fact — you cannot easily get an "invalid phone" state because non-numeric characters are filtered as you type and the mask auto-punctuates.
- No character-length (maxlength) restriction was detected on First Name, Last Name, or Email inputs.

## 7. Grid / list-level behavior (context around the dialog)

- After a successful Save, the new contact row appears immediately in the **Client Contacts** grid with:
  - A checkmark in the **Primary** column if Primary Contact was checked.
  - The contact's full name as a clickable link (opens the same dialog in "Edit Contact" mode, pre-filled).
  - A small badge/icon under the name representing the "This person is a:" flags; hovering it shows a tooltip (e.g., **"Contact"**) confirming which role-type flags are set. (Only one badge/tooltip was observed in testing with the default Contact-only flag; Driver/Employee combinations were not fully explored for multi-badge display.)
  - The **Role** column reflects the selected Contact Role value, if any.
  - The **Contact Info** column stacks Email and formatted Phone (whichever are populated).
  - The **Service Automation** column shows a checkmark if "Enable Service Automation" was on at save time.
  - A trash-can icon per row **deletes that contact immediately, with no confirmation dialog/prompt observed.** Treat delete as instantaneous and irreversible from the UI's perspective — automation should not expect an "Are you sure?" step.

## 8. Summary checklist for automation design

- Target the dialog as an **in-page DOM element** (`.dynamicModal`), not a new tab/window/iframe.
- No `id`/`name` attributes exist — **locate fields by label text or DOM position**, and recognize the Contact Role control as a vue-select combobox (type-ahead + listbox), not a native `<select>`.
- Required fields: **First Name, Last Name** only. Everything else is optional.
- Do not rely on email format validation existing — it does not.
- Phone field self-formats; send digits only and expect `(XXX) XXX-XXXX` in the DOM afterward.
- Contact Role has a fixed, known set of 12 options (listed in Section 3) — confirm this list still matches at automation run-time since it appears to load from a back-end call rather than being static markup.
- Checking "Primary Contact" has **two side effects**: it locks "Contact" to checked, and it silently un-sets Primary on whatever other contact currently holds it, once saved.
- The "Enable Service Automation" toggle is a custom component whose native `checked` property is not reliable evidence of on/off state — verify via downstream effects (notification checkboxes enabled/disabled) instead.
- Save button is disabled until required fields are populated — a reliable, simple automation wait-condition ("wait until Save is enabled") before attempting to click it.
- Deletes from the contacts grid are immediate/unconfirmed.