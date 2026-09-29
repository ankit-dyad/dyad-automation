# Nexsure Automation KB

Element-by-element reference for the Nexsure app (`nexui`), built for browser-automation scripts. Growing document — one section per screen/flow as it gets explored. No automation-framework code is included by request; each screen instead gets a plain selector table (accessible role/label + fallback CSS).

**Last updated:** 2026-09-17 · **Environment:** jmiqaweb01 (QA) · **Frontend:** Vue.js SPA, hash-based routing (`#/...`), zero native `<form>` elements throughout. Pendo analytics/guides are active app-wide (elements with `id="pendo..."`, `_pendo_*` in `localStorage`, and a floating Resource Center badge) — automation may occasionally see a Pendo-injected overlay.

> **Correction (Opportunities page):** `<title>` does **not** always stay `"Nexsure"` — it stayed `"Nexsure"` on Sign-in and Dashboard, but updates to the screen name (e.g. `"Opportunities"`) on at least the Opportunities list. Treat the title as page-dependent and verify it per screen rather than assuming either way; prefer the URL hash or DOM content for automation waits.

> **Documentation convention:** whenever a screen has a dropdown/select, open it and record the full option list here rather than leaving it as an open item.

---

## Page: Sign-in

| Fact | Value |
|---|---|
| Screen | Sign in to Nexsure |
| Base path | `/nexui/` |
| Native `<form>` tags | 0 (JS-handled submit) |

### Overview

The sign-in screen is a single card, left-aligned inside a full-viewport gradient background, with a large decorative "dyad" wordmark filling the right side of the card. There is no CAPTCHA, no SSO/social-login button, and no language selector. A short static disclaimer under the action buttons tells users to contact their own Nexsure administrator for login support, since Dyad (the reseller/host in this environment) does not manage credentials.

### Visual layout

```
┌───────────────────────────────────────────┐
│  Sign in to Nexsure                        │
│                                             │
│  USERNAME                                  │
│  [_________________________]               │
│                                             │
│  PASSWORD                                  │
│  [_________________________]               │
│                                             │
│  [x] Remember Me                           │
│                                             │
│  [ 🔒 Forgot Password ]  [ → Sign in ]      │
│                                             │
│         Change Password                    │
│                                             │
│   Please contact your company's            │
│   Nexsure Administrators for Login Support.│
│   Dyad cannot provide your Username or     │
│   Password.                                │
└───────────────────────────────────────────┘   (right side: large faded "dyad" wordmark, decorative only)

Footer (page-level, below the card):
  ☁ Download Attachment Manager     ☁ Download eServices
```

### Element inventory

| # | Element | Type / role | Visible text | Required | Notes |
|---|---|---|---|---|---|
| 1 | Username field | textbox `input[type=text]` | label: `username` | Yes | No `id`/`name`/`placeholder`. Class `form-control form-control-sm`. Pre-fills from a prior "Remember Me" session (see Behavior). |
| 2 | Password field | textbox `input[type=password]` | label: `password` | Yes | Same styling as username. Value is masked and does **not** persist across reloads. |
| 3 | Remember Me | checkbox | `Remember Me` | No | Checkbox is nested directly inside its `<label>` (no `for`/`id` pairing needed). Checked state persists across page loads. |
| 4 | Forgot Password | button | `Forgot Password` | — | Outlined style, lock icon (inline SVG). Not exercised — flow undocumented, see Open items. |
| 5 | Sign in | button | `Sign in` | — | Filled/primary style, arrow icon (inline SVG). Triggers authentication via JS (no native form submit). |
| 6 | Change Password | link `<a>` | `Change Password` | — | Href is a placeholder (`#`); behavior is JS-driven, not a real navigation. |
| 7 | Download Attachment Manager | link, footer | `Download Attachment Manager` | — | External link (points at the NexBox installer host). Has a small download-cloud icon. |
| 8 | Download eServices | link, footer | `Download eServices` | — | External link (points at the NexEServices installer host). Same icon style as #7. |
| 9 | Heading | static text | `Sign in to Nexsure` | — | Card title, not interactive — useful as a "page loaded" anchor for automation waits. |
| 10 | Admin-contact notice | static text | "Please contact your company's Nexsure Administrators…" | — | Confirms Dyad does not manage end-user credentials for this tenant. |

> **Note:** Labels are stored lowercase in the DOM (`username`, `password`) and rendered uppercase purely via CSS `text-transform`. Match on the lowercase text if you select by label content.

### DOM & structure notes

Each input sits inside a `.form_group` wrapper together with its label — this is the most reliable structural hook, since inputs themselves carry no `id` or `name`:

```html
<div class="form_group nex_required_input noStar">
  <label class="required_label">username</label>
  <input type="text" class="form-control form-control-sm">
</div>

<div class="form_group nex_required_input noStar">
  <label class="required_label">password</label>
  <input type="password" class="form-control form-control-sm">
</div>

<label class="checkbox">
  <input type="checkbox">Remember Me
</label>
```

The `nex_required_input noStar` classes indicate both fields are treated as required by the app, but the usual required-asterisk is suppressed (`noStar`). Elements carry Vue scoped-style attributes, e.g. `data-v-240f170f` — **do not hardcode these hashes as selectors**, they are build-specific.

### Behavior & persistence

- **Remember Me → username persistence.** When previously checked, the typed username is saved to `localStorage["username"]` and re-populates the field automatically on the next page load.
- **Remember Me checkbox state itself also persists** across reloads — it reflects whatever it was last set to, not a fixed unchecked default.
- **Password is never persisted.** Always empty on a fresh load regardless of Remember Me.
- **Storage keys observed:** `mainTabExpiration`, `username`, plus the app-wide Pendo keys. `sessionStorage` is empty. 4 cookies are set (names/values not inspected — treat as session-managed).

### Test credentials

> ⚠️ Recorded here because this KB is the automation reference you asked for. Treat this file as confidential, and prefer pulling these into a secrets manager / environment variables for actual scripts rather than hardcoding them from this doc.

| Field | Value | Notes |
|---|---|---|
| Environment | `jmiqaweb01.nexsure.com/nexui/` | QA/automation tenant |
| Username | `dyad.automation.7772&0724` | Contains a literal `&` — no escaping needed when typed via automation's native "fill" action, but be careful if it's ever built into a URL query string. |
| Password | `!Dyad0001` | Starts with `!` — same query-string caveat applies. |

### Selectors

| Element | Accessible role / label | Fallback CSS |
|---|---|---|
| Username field | textbox, label text `username` | `.form_group:nth-of-type(1) input` |
| Password field | textbox, label text `password` | `.form_group:nth-of-type(2) input` |
| Remember Me | checkbox, label text `Remember Me` | `label.checkbox input[type="checkbox"]` |
| Sign in | button, name `Sign in` | `.nexButton.primary:not(.outlined)` |
| Forgot Password | button, name `Forgot Password` | `.nexButton.primary.outlined` |
| Change Password | link, name `Change Password` | — |

> **Note:** Avoid selecting on the `data-v-*` attributes or on Vue-generated class hashes — only the hand-authored classes (`form_group`, `form-control`, `nexButton`, `checkbox`) are safe to depend on across deploys.

### Open items

- Validation/error messaging for empty or incorrect credentials (no failed attempt was triggered).
- The "Forgot Password" and "Change Password" flows (screens/fields beyond this page).
- Whether pressing Enter in either field submits, or only the Sign-in button click does.
- Exact destinations of the two footer download links and the cookie names/purposes.

---

## Global header / navigation (present on every app screen, post-login)

| Fact | Value |
|---|---|
| Present on | Every screen after sign-in (not the login screen itself) |
| Container | `nav#navbar > .branding` + `.menu_bar` |
| Menu mechanism | 4 click-to-open dropdown menus (`.dropdownMenuWrapper.menuTarget`), all sharing the same `.dropdownMenu > .dropdownSection > .dropdownLink > a` markup |

### Overview

The top bar is a single shared component rendered around the whole app shell, not part of any individual page — it's what makes the Home icon's menu effectively the app's primary navigation. It has three zones: the tenant logo on the left, a search + quick-access icon cluster in the middle, and four account-level menu icons on the right (Home, Profile, Organization, Help), each of which opens its own dropdown.

### Visual layout

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [R5 Insurance Agency]  🔍  [Enter search keywords] [Search]  ⓘ    🔔📞✉️✅☁️🔗⭐   🏠 👤 🗺️ ❓ │
└──────────────────────────────────────────────────────────────────────────┘
   logo (non-link)  global-search   inline search box    info   quick-access icons   account menus
                      modal trigger                      (hover)  (7, see below)      (4 dropdowns, see below)
```

### Element inventory

| # | Element | Type / role | Visible text | Notes |
|---|---|---|---|---|
| 1 | Branding logo | static, `div.branding > img` | "R5 Insurance Agency" | Not wrapped in an `<a>`/`<button>` — plain markup, click behavior not confirmed (see Open items). |
| 2 | Global Search icon | button, title `Global Search` | (binoculars icon) | Opens a **modal dialog** titled "Global Search", separate from the inline search box — see Behavior. |
| 3 | Inline search input | textbox | placeholder `Enter search keywords` | `.searchBox input`, wrapper `id="pendoSearchBoxGuide"`. |
| 4 | Search button | button | `Search` | `id="PendoSearchGuide"`. |
| 5 | Info icon | icon, no visible action on click | — | Sits right after the Search button; clicking produced no visible change in this pass — likely a hover-only tooltip. |
| 6–12 | Quick-access icons (×7) | buttons/icons, titled | `View New Alerts`, `View Phone Calls`, `View New Messages`, `View Today's actions`, `View eServices`, `View eLinks`, `View Bookmarks` | Clicking "View New Alerts" produced no visible UI change in this session (likely nothing to show, or it requires a different trigger) — see Open items. |
| 13 | Home menu | button, name `Home` | (house icon) | Opens the app's **primary navigation menu** — see below, this is the most important menu in the header. |
| 14 | Profile menu | button, name = user's short name (e.g. `Dyad 7772 A.`) | — | Opens the account menu — see below. |
| 15 | Organization menu | button, name `Organization` | (sitemap icon) | Opens the org menu — see below. |
| 16 | Help menu | button, name `Help` | (question-mark icon) | Opens the help menu — see below. |

### Home menu — full option list

Clicking the Home icon opens the app's primary navigation, grouped into 7 sections (dividers between groups, no group headings):

| Group | Items |
|---|---|
| 1 | Dashboard |
| 2 | Leads, Submissions |
| 3 | Opportunities, Marketing |
| 4 | Binder Log, Edits, Endorsements, Audits |
| 5 | Policies, Cancellations, Claims |
| 6 | Delivery, Phone Log, Interface |
| 7 | Batch Print |

### Profile menu — full option list

| Item |
|---|
| My Inbox |
| My Actions |
| My Profile |
| Logout |
| Administrator |

### Organization menu — full option list

| Item |
|---|
| Setup |
| Manage |
| All Employees |
| Accounting |
| Campaigns |
| Reports |

### Help menu — full option list

Header reads "Help Center", then:

| Item |
|---|
| Videos |
| Knowledgebase |
| Contact Support |

### DOM & structure notes

- Every one of the 4 right-hand menus shares one markup pattern: `.dropdownMenuWrapper.menuTarget` (the clickable icon) containing `.dropdownMenu > .dropdownSection > .dropdownLink > a` (the popup content, one `.dropdownSection` per visual group — this is how the Home menu's 7 groups are structured in the DOM, one `.dropdownSection` each).
- The quick-access icon row is `.widgetIcons > .widgetLink[title="..."]`, distinct from the account-menu markup above.
- The inline search box and its button carry Pendo guide IDs (`#pendoSearchBoxGuide`, `#PendoSearchGuide`) — they're active Pendo targets, separate from the Global Search modal.
- All icons use inline SVGs with the same `data-v-240f170f` Vue scoped-style hash seen elsewhere in the app — don't select on it.

### Behavior & persistence

- The Global Search icon opens a modal dialog ("Global Search") that, in this pass, stayed on a loading spinner indefinitely with no query entered — it may require typing a query before it resolves, or it may depend on a service not exercised here. Treat as unconfirmed (see Open items).
- The header itself does not appear on the sign-in screen — it's part of the authenticated app shell only.
- None of the 4 dropdown menus appear to change the URL hash on open (only on selecting an item) — safe to open/close them without affecting navigation state.

### Selectors

| Element | Accessible role / label | Fallback CSS |
|---|---|---|
| Global Search icon | button, title `Global Search` | `.altSearchBtn` |
| Inline search input | textbox, placeholder `Enter search keywords` | `.searchBox input` |
| Search button | button, name `Search` | `#PendoSearchGuide` |
| Quick-access icon (any) | element with matching `title` | `.widgetIcons [title="View New Alerts"]` (swap title text) |
| Home menu trigger | button, name `Home` | 1st of the 4 `.dropdownMenuWrapper.menuTarget` elements |
| Profile menu trigger | button, name = user's short name | 2nd of the 4 |
| Organization menu trigger | button, name `Organization` | 3rd of the 4 |
| Help menu trigger | button, name `Help` | 4th of the 4 |
| Any open menu's items | link, item text (e.g. `Policies`) | `.dropdownMenu .dropdownSection .dropdownLink a` (scope to the open menu) |

### Open items

- Whether the branding logo is clickable (no `<a>`/`<button>` wrapper found, but a JS click-handler can't be ruled out without clicking it).
- Why the Global Search modal never left its loading state — needs a retry with an actual query typed in.
- Why the quick-access icons (Alerts, Phone Calls, etc.) produced no visible change on click — may need existing data in that category to show anything, or may open a panel elsewhere on the page that was missed.
- Destination pages for each Home-menu, Profile-menu, Organization-menu, and Help-menu item (only the menu contents were captured, not what each link opens).

---

## Page: Dashboard (home, `#/`)

| Fact | Value |
|---|---|
| Screen | Dashboard home / "Good Morning, {user}!" |
| Route | `#/` (hash-based, no full page reload) |
| Tenant branding | "R5 Insurance Agency" (top-left logo — this is the agency the automation account belongs to, distinct from the Dyad-branded login screen) |
| Native `<form>` tags | 0 |

### Overview

The dashboard is the landing screen after sign-in. It's a two-column layout: a wider left column with a personalized greeting, a dashboard/view picker, and a grid of stat widgets; a narrower right column showing a "Recently Accessed" list of recently opened client/policy records. A persistent top bar (present on every screen, not just the dashboard) carries global search, several quick-access shortcut icons, and account-level icons on the far right. A floating help/chat bubble sits bottom-right with an unread-count badge.

### Visual layout

```
┌───────────────────────────────────────────────────────────────────────┐
│ [R5 Insurance Agency]   [🔍 Enter search keywords] [Search] ⓘ    🏠 👤 🗺 ❓ │  ← persistent top bar
├───────────────────────────────────────────────────────────────────────┤
│ Good Morning, {User}!                          Recently Accessed       │
│ Last sign in was on {date/time}                  {entity link 1}      │
│                                                   {entity link 2}      │
│ 🕐 Dashboards: [Overview ▾]  ⓘ                    {entity link 3...}   │
│                                                                        │
│ Viewing [My Dashboard ▾]  ⓘ                                           │
│ ┌───────────────────┬───────────────────┐                            │
│ │ New Message(s)     │ Actions Due Today │                            │
│ │ Today          0   │              4    │                            │
│ │           View All │         View All  │                            │
│ │ Handled / Change   │ Due this month /  │                            │
│ │             more▾  │ Past due · more   │                            │
│ ├───────────────────┼───────────────────┤                            │
│ │ Pending             │ (Open/Closed      │                            │
│ │ Cancellations   0   │  breakdown rows)  │                            │
│ │  Cancelled/Change   │                   │                            │
│ └───────────────────┴───────────────────┘                            │
└───────────────────────────────────────────────────────────────────────┘
                                                        [💬 4]  ← floating help bubble
```

### Element inventory

| # | Element | Type / role | Visible text | Notes |
|---|---|---|---|---|
| 1 | Global search input | textbox | placeholder `Enter search keywords` | Class `.searchBox input`; the search box wrapper has `id="pendoSearchBoxGuide"` (Pendo-instrumented). |
| 2 | Search button | button | `Search` | `id="PendoSearchGuide"`. |
| 3 | Quick-access icons (×7) | buttons/icons, titled | `View New Alerts`, `View Phone Calls`, `View New Messages`, `View Today's actions`, `View eServices`, `View eLinks`, `View Bookmarks` | Each is a `.widgetLink` inside `.widgetIcons`; identify by its `title` attribute. Destinations not explored (see Open items). |
| 4 | Home icon | button | `Home` | Far-right account icon group. |
| 5 | Profile icon | button | current user's short name, e.g. `Dyad 7772 A.` | Far-right group, 2nd icon. |
| 6 | Organization icon | button | `Organization` | Far-right group, 3rd icon (sitemap/hierarchy glyph). |
| 7 | Help icon | button | `Help` | Far-right group, 4th icon. |
| 8 | Greeting heading | static text | `Good Morning, {user}!` | Text changes with time of day ("Good Afternoon"/"Good Evening") — don't hardcode "Morning" in assertions. |
| 9 | Last-sign-in line | static text | `Last sign in was on {date/time}` | Timestamp updates every session — not a stable assertion target, only a "logged in" landmark. |
| 10 | Dashboards selector | combobox (vue-select) | `Overview` | Picks which dashboard *definition* is shown. Selected value renders in `span.selected_dash_header`. Full option list: **Overview, Analytics**. |
| 11 | Viewing selector | combobox (vue-select) | `My Dashboard` | Picks *whose* dashboard is shown; same vue-select component as #10 but carries an extra `.viewMode` class. Full option list: **My Dashboard, Organization Dashboard**. |
| 12 | Widget: New Message(s) Today | card, class `.widget_container` | title `New Message(s) Today`, a count, a "View All" link, sub-stats, "more/less" toggle | Left accent bar colored per widget (blue). |
| 13 | Widget: Actions Due Today | card, class `.widget_container` | title, count, "View All" link, "Due this month" / "Past due" stats, an Open/Closed breakdown sub-panel | Left accent bar green. |
| 14 | Widget: Pending Cancellations | card, class `.widget_container` | title, count, "Cancelled" / "Change" stats | Left accent bar red. |
| 15 | Recently Accessed panel | list, class `.recently_accessed` | header `Recently Accessed`, a list of entity links | Each entry is `a.nex_entity_link` inside `.recent_entity`, with a small type icon (e.g. a client icon). Actual entries are tenant business data (client/policy names) — omitted here, see the callout below. |
| 16 | Help/chat bubble | floating button, bottom-right | unread-count badge (e.g. `4`) | Pendo Resource Center widget (`_pendo-resource-center-badge-container`). |

> ⚠️ The "Recently Accessed" list shows real client/policy record names from this QA tenant. Treat those as tenant business data rather than stable fixtures — they'll differ per user/session and shouldn't be hardcoded into scripts or shared outside this KB.

### DOM & structure notes

- Top bar structure: `.menu_bar > .nav_sections` contains the search icon + `.searchBox`; the quick-access group is `.widgetIcons > .widgetLink[title="..."]` (repeated 7×); the account icons (Home/Profile/Organization/Help) sit in a separate group further right in the same bar. This top bar is shared across screens, not dashboard-specific.
- Dashboard-specific container starts at `.dash_header` (greeting + dashboard picker) followed by the widget grid and `.recently_accessed` panel.
- Widgets are Vue components (`vue-select` powers both dropdowns — classes `v-select vs--single vs--searchable`, plus `.viewMode` on the "Viewing" one specifically). Same caution as the login page: don't depend on `data-v-*` hashes.
- Still zero native `<form>` elements on this screen — confirms the whole app avoids native form submission in favor of JS-driven actions/XHR.
- `document.title` remains `"Nexsure"` on the dashboard, same as the login screen; the URL hash (`#/`) is the only page-level signal that navigation occurred.

### Behavior & persistence

- No new `localStorage` keys are added by reaching the dashboard — the same keys from the login screen carry over (Pendo keys, `mainTabExpiration`, `username`). Session state appears to live in cookies, not `localStorage`.
- The greeting and "last sign in" timestamp are dynamic per session/time — don't assert their exact text, only their presence as a "you're logged in" signal.
- Pendo elements (`id="pendoSearchBoxGuide"`, `id="PendoSearchGuide"`, the Resource Center badge) mean this screen is an active Pendo guide target — expect the possibility of a Pendo tooltip/guide overlay appearing unprompted during a session.

### Selectors

| Element | Accessible role / label | Fallback CSS |
|---|---|---|
| Global search input | textbox, placeholder `Enter search keywords` | `.searchBox input` |
| Search button | button, name `Search` | `#PendoSearchGuide` |
| Quick-access icon (any) | element with matching `title` | `.widgetIcons [title="View New Alerts"]` (swap the title text per icon) |
| Home icon | button, name `Home` | far-right nav group, 1st icon |
| Profile icon | button, name = current user's short name | far-right nav group, 2nd icon |
| Organization icon | button, name `Organization` | far-right nav group, 3rd icon |
| Help icon | button, name `Help` | far-right nav group, 4th icon |
| Dashboards selector | combobox, current value `Overview` | `.v-select:not(.viewMode)` |
| Viewing selector | combobox, current value `My Dashboard` | `.v-select.viewMode` |
| Widget "View All" link | link, name `View All` | `.widget_container a` (filter by visible text) |
| Widget more/less toggle | button/text `more` / `less` | `.viewMore` |
| Recently Accessed entries | link, entity name as text | `.recently_accessed .nex_entity_link` |

### Open items

- Destinations/behavior of the 7 quick-access icons (Alerts, Phone Calls, Messages, Today's actions, eServices, eLinks, Bookmarks) — not clicked through yet.
- Destinations of the Home, Organization, and Help icons.
- What "Analytics" (Dashboards selector) and "Organization Dashboard" (Viewing selector) actually display — options are now enumerated, but only the "Overview" + "My Dashboard" combination was opened and inspected.
- Global search results screen/behavior.
- Full widget catalog — only 3 widgets were visible in the default "My Dashboard" view; other dashboard/view combinations may show more.
- Navigation structure beyond the dashboard (left/side module menu, if any — none was visible on this screen).

---

## Page: Opportunities (list, `#/opportunities`)

| Fact | Value |
|---|---|
| Screen | Opportunities list/grid |
| Route | `#/opportunities` |
| Reached via | Home menu → Opportunities (see Global header section) |
| `<title>` | `"Opportunities"` — **not** `"Nexsure"` (see correction note at the top of this doc) |
| Record count (this tenant) | 137 pages at 10/page (~1,370 records) |

### Overview

This is a list/grid view of insurance opportunities (sales-pipeline records) for the tenant, rendered as stacked cards rather than a native HTML table. Each row shows a client, its stage/status, confidence and likely premium, retail agent, and branch/assignment, plus a description/last-action strip and three activity-count icons. The toolbar supports filtering, grouping, paging, exporting, and creating new opportunities.

### Visual layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Opportunities                                   [📄 Export]  [+ New]     │
├─────────────────────────────────────────────────────────────────────────┤
│ ▽ Show Filters   GROUP BY [None ▾]   SHOWING [10] ITEMS PER PAGE   🔓 UNLOCKED   |<  <  PAGE [1] OF 137  >  >| │
├─────────────────────────────────────────────────────────────────────────┤
│ CLIENT NAME          STAGE/STATUS   CONFIDENCE/PREMIUM   RETAIL AGENT   BRANCH/ASSIGNMENT   ≡ │
│ ┌───────────────────────────────────────────────────────────────────┐ │
│ │ 👤 {client}          [Binding]     ✎ {confidence}      N/A          🌿 {branch}         ≡ │ │
│ │ OPP-##### 📋  {product}                                📋 {assignment} │ │
│ │    {associated contact}                                              │ │
│ │ ──────────────────────────────────────────────────────────────────  │ │
│ │ DESCRIPTION:              LAST ACTION:            ⚡0  ✉0  📎0        │ │
│ └───────────────────────────────────────────────────────────────────┘ │
│  (repeats for each of the 10 rows shown)                               │
└─────────────────────────────────────────────────────────────────────────┘
```

When "Show Filters" is expanded, a filter panel appears above the grid with two groups, **Opportunity** (Opportunity Number, Description, Product Name, Confidence, Stage, Status, Likely Premium) and **Associations** (Client Name, Retail Agent Name, Branch, Assignment Name), plus a **Dates** group (Effective From/To), and `Apply Filter` / `Clear` buttons. The toolbar also gains `Save`, `Recall`, and `Clear Memory` for filter presets.

### Element inventory

| # | Element | Type / role | Visible text | Notes |
|---|---|---|---|---|
| 1 | Page heading | static text | `Opportunities` | Also the document `<title>`. |
| 2 | Export button | button | `Export` | Not clicked (would trigger a file download — needs explicit permission). |
| 3 | New button | button | `+ New` | Not clicked — presumably opens a new-opportunity form. Undocumented, see Open items. |
| 4 | Show/Hide Filters toggle | button/link | `Show Filters` ⇄ `Hide Filters` | Expands/collapses the filter panel described above. |
| 5 | Group By selector | combobox (vue-select) | `None` | Full option list: **None, Stage, Retail Agent, Branch, Effective Date**. |
| 6 | Items per page | number input (plain, not a dropdown) | `10` | Free-type numeric field — no preset list. |
| 7 | Lock/Unlock toggle | icon + text | `UNLOCKED` | Purpose not confirmed — not toggled in this pass (see Open items). |
| 8 | Pagination controls | icon buttons + number input | `PAGE [1] OF 137` | First/prev icons disabled on page 1; next/last enabled. Page content updates ~1–2s after the page number does (async) — see Behavior. |
| 9 | Filter: Product Name | combobox | `All` | Full option list: **All, X100_Personal Lines, X100_Commercial Lines, X100_Benefits Lines, X100_Bonds, X100_Financial Lines, X100_Personal Benefits Lines**. |
| 10 | Filter: Confidence | combobox | `All` | Full option list: **All, 0%, 25%, 50%, 75%, 100%**. |
| 11 | Filter: Stage | combobox | `All` | Full option list: **All, Application, Marketing, Proposal, Binding**. |
| 12 | Filter: Status | combobox | `All` | Only **All** was available with Stage also set to `All` — may be a dependent list that populates once a specific Stage is chosen (not confirmed). |
| 13 | Filter: Branch | combobox, async-loaded | `All` | Loads from the server on open; returned **85** tenant-specific branch entries in this environment. Real org data — not reproduced here, see the callout below. |
| 14 | Filter: Client Name / Retail Agent Name / Assignment Name | text inputs | — | Free-text filter fields. |
| 15 | Filter: Opportunity Number / Description | text inputs | — | Free-text filter fields. |
| 16 | Filter: Likely Premium | currency input | `$0.00` | |
| 17 | Filter: Effective From/To | date pickers | placeholders `From` / `To` | Calendar-icon triggered pickers. |
| 18 | Apply Filter / Clear | buttons | `Apply Filter`, `Clear` | |
| 19 | Save / Recall / Clear Memory | buttons | `Save`, `Recall`, `Clear Memory` | `Recall` and `Clear Memory` are disabled until a filter set has been saved once via `Save` — a filter-presets feature. |
| 20 | Grid row: client link | link | client/entity name | Real tenant data — see callout. |
| 21 | Grid row: opportunity id | static + copy icon | `OPP-#####` | Copy-to-clipboard icon next to the id. |
| 22 | Grid row: stage badge | static, colored pill | e.g. `Binding` | Plus a plain-text status line under it, e.g. `Bound`, `Bind Requested`. |
| 23 | Grid row: confidence / premium | inline-edit fields (pencil icon) | e.g. `$0.00` | These are click-to-edit controls, not plain text — see DOM notes. |
| 24 | Grid row: row menu | icon button (hamburger) | — | Opens a small menu: **Assignments, View Action, Lost Opportunity** (Lost Opportunity was greyed out/disabled on an already-Bound record). |
| 25 | Grid row: description / last action | static text | `DESCRIPTION:`, `LAST ACTION:` | Empty in the observed records. |
| 26 | Grid row: activity counters (×3) | icon + count | e.g. `⚡0 ✉0 📎0` | Likely actions/messages/attachments counts — exact meaning per icon not confirmed, see Open items. |

> ⚠️ Grid rows show real client names, opportunity IDs, and contact emails from this QA tenant, and the Branch filter's 85 entries are this tenant's real branch structure. All are treated as tenant business data here, not reproduced or used as stable fixtures.

### DOM & structure notes

- Grid container: `.nex_search_grid > .grid_container > .nex_flexible_grid > .grid_body.light`. Header cells are `.grid_header.<columnClass>` (e.g. `.opportunitySection`, `.stageStatus`); data rows are `.grid_row > .grid_cell` (cell classes line up with the header classes, some cells are unclassed).
- Client cell: `.grid_cell.opportunitySection > .clientName > a.nex_entity_link > span.nex_entity_icon + span.entityName` — same `nex_entity_link` pattern seen in the Dashboard's "Recently Accessed" panel. A sibling `.oppDetails` block holds the `OPP-#####` id (`.sectionTitle`) and the associated contact (`.nex_contact`).
- Confidence/Premium cells use `.nex_inline_edit > .readVersion` — they're inline-editable controls, not static text.
- Description/Last Action + activity counters: `.grid_cell.noteSection > .leftNotes > .descSection` (and a sibling block for Last Action) plus `.activity_buttons > .activityBtn` (×3, each an icon + count div).
- Row menu trigger: `.action_context` (the hamburger icon cell).
- Toolbar: `.filter_top_row` containing `.header_btns` (Show/Hide Filters), `.groupByFilter` (a `v-select`), and `.nex_paginator` (`.itemsPerPage`, `.anchor-link.lock_section` for the lock toggle, `.pageNumInputs` for the paging controls).
- Same Vue scoped-style hash (`data-v-240f170f`) and vue-select pattern (`v-select vs--single vs--searchable`) as every other screen — don't select on the hash.
- Still zero native `<form>` elements.
- `document.title` is `"Opportunities"` here (see the correction note at the top of this document).

### Behavior & persistence

- **Pagination is asynchronous.** Clicking next-page updates the page-number field immediately, but the row content takes roughly 1–2 seconds to refresh. Automation should wait for the row content to change (e.g. a client name or OPP id), not just the page-number value, before asserting on the new page.
- **Filter presets:** `Save` stores the current filter as a named/recallable preset (enabling `Recall` and `Clear Memory`); neither was exercised in this pass.
- **Branch filter is server-loaded**, not a static list baked into the page — expect a brief load delay the first time it's opened, same as the async pagination.
- Filters, grouping, and items-per-page all live in the same `.filter_top_row` toolbar and presumably combine (not verified in combination in this pass).

### Selectors

| Element | Accessible role / label | Fallback CSS |
|---|---|---|
| Export button | button, name `Export` | header area, button text `Export` |
| New button | button, name `New` | header area, button text `New` |
| Show/Hide Filters toggle | button/link, text `Show Filters`/`Hide Filters` | `.header_btns .header_button` |
| Group By selector | combobox, value `None` | `.groupByFilter .v-select` |
| Items per page | number input | `.itemsPerPage input` |
| Lock/Unlock toggle | icon + text `UNLOCKED` | `.lock_section` |
| Page number input | number input | `.pageNumInputRpw input` |
| Next / last page icons | icon buttons | `.pagingIcons` (the enabled pair) |
| Grid row | — | `.grid_row` |
| Client link (in a row) | link, client name as text | `.grid_row .clientName a.nex_entity_link` |
| Row menu trigger | icon button | `.grid_row .action_context` |
| Activity counters (in a row) | icon + count | `.grid_row .activity_buttons .activityBtn` |
| Filter: Product Name / Confidence / Stage / Status / Branch | combobox, current value `All` | within the filter panel, in that left-to-right, top-to-bottom order |
| Apply Filter / Clear | buttons | text `Apply Filter` / `Clear` |

### Open items

- What each row-menu item does (`Assignments`, `View Action`, `Lost Opportunity`) — menu was opened but items weren't clicked.
- What the Lock/Unlock toggle actually changes — not toggled in this pass.
- Whether the Status filter's option list expands once a specific Stage is selected (only "All" was available with Stage also at "All").
- The full 85-entry Branch filter list — recorded as "exists, tenant-specific, 85 entries," not enumerated (treated as sensitive org data).
- What clicking Export produces (file format, contents) and what the New button's form looks like — neither was triggered.
- What each of the three activity-counter icons precisely represents (labelled generically here as actions/messages/attachments by icon shape, not confirmed via tooltip).
- Destination of the client-name / OPP-id links (they route to `#/entity_console/...`, consistent with the Dashboard's "Recently Accessed" links, but the destination page itself hasn't been documented yet).

---

*Captured from the QA environment (jmiqaweb01) for Dyad Inc. web-automation work.*