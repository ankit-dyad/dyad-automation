---
reviewed: false
last_verified: 2026-09-17
---

# Page: Create Client

## URL

Not a route of its own — reached through the "New Opportunity" wizard:
`#/opportunities` → **New** button → `#/opportunities/new` (Select Client step) →
**Find Client** search with no match → **New Client** button →
`#/client/new/opportunity?ClientName=<name>` (3-step "Clients: New" wizard) →
**Done** on step 3 returns to `#/opportunities/new/<new-opportunity-id>` with the
new client now attached as the opportunity's selected client.

Live-verified end-to-end 2026-09-17: this actually creates a persisted client
record in the `jmiqaweb01` QA tenant (confirmed via the post-Done client summary
card showing `Client: <name>(P)` with the entered address/contact). Superset of
`nexsure/knowledge/pages/find_a_client_and_create_client.md`'s "New Opportunity —
Select Client" section, which stopped at step 1 of the New Client wizard; steps 2
(Client Contacts) and 3 (Assignment) below were undocumented until this pass.

## Selectors
| Element | Selector | Notes |
|---|---|---|
| Opportunities "New" button | `getByRole('button', { name: 'New', exact: true }).first()` | Two "New" buttons exist on the page (top/bottom toolbar) — `.first()` avoids a strict-mode violation |
| Find-a-Client keywords field | `.form_group.keywords input` | Search is live/near-live as you type — no need to click a separate "Find Client" button, which becomes covered by the results popover anyway |
| Find-a-Client results popover | `#findClientPopover` | Native HTML Popover API element |
| "New Client" button (in popover) | `page.locator('#findClientPopover').getByRole('button', { name: 'New Client' })` | Only appears in the popover's "No Results Found" state |
| Client Type toggle | `.form_group:has-text('Client type') >> getByRole('button', { name: 'Commercial' \| 'Personal' })` | Two-button toggle |
| Client Name field | `.form_group.nex_required_input:has-text('Client Name') input` | Pre-fills with the search keyword — verify, don't re-fill |
| Location Type select | `.form_group:has-text('Location Type') .vs__dropdown-toggle` to open, then `.vs__dropdown-menu li:has-text('<option>')` | vue-select; option list depends on Client Type (see Edge Cases) |
| Street Address field | `.form_group:has-text('Street Address') input` | |
| City field | `.form_group.nex_required_input:has-text('City') input` | |
| State/Province select | `.form_group:has-text('State/Province') .vs__dropdown-toggle` to open, `input.vs__search` to type-filter, then `.vs__dropdown-menu li:has-text('<state>')` | Type first and wait for the filtered option to be visible before clicking — clicking too early can select whatever was still showing from the unfiltered list |
| Zip/Postal field | `.form_group:has-text('Zip/Postal') input` | |
| Step 1 "Next" button | `getByRole('button', { name: 'Next', exact: true })` | Triggers address verification — see Edge Cases |
| Address-unverifiable dialog OK button | `getByRole('button', { name: 'OK' })` | Only appears if the entered address fails verification |
| Add Contact modal | `.contact_modal` | Auto-opens on reaching step 2 the first time |
| Add Contact — Last Name field | `.contact_modal .form_group:has-text('Last Name') input` | Required; First Name is pre-filled from the client name |
| Add Contact "Save" button | `getByRole('button', { name: 'Save', exact: true })` | |
| Step 2 "Next" button | `getByRole('button', { name: 'Next', exact: true })` | |
| Branch select (step 3) | `.form_group:has-text('Branch') .vs__dropdown-toggle` to open, `.vs__dropdown-menu li:has-text('<branch>')` | Required; tenant-specific list (84 entries observed) — includes a literal **"Automation Test Branch1"** entry, clearly meant for scripted use |
| Department select (step 3) | `.form_group:has-text('Department') .vs__dropdown-toggle` to open, `.vs__dropdown-menu li:has-text('<department>')` | Required; tenant-specific list |
| Step 3 "Done" button | `getByRole('button', { name: 'Done', exact: true })` | Finalizes creation — after this, the client is persisted |
| Post-creation client summary | `text=Client: <name>(P)` (or `(C)` for Commercial) | Appears back on the opportunity's Select Client step once the client exists |

## Actions

- Click Opportunities' "New" button to start a new opportunity (this is the only
  documented entry point into client creation).
- Type a client-name keyword into the Find-a-Client search to check for an
  existing match.
- Click "New Client" (in the no-results popover) to start the "Clients: New" wizard.
- Step 1 (Client Info): pick Client Type, confirm/enter Client Name, pick Location
  Type, fill the address block, click Next.
- If prompted that the address can't be verified, click OK to continue anyway.
- Step 2 (Client Contacts): fill the auto-opened Add Contact modal's Last Name and
  Save, then click Next.
- Step 3 (Assignment): pick Branch and Department, click Done.

## Expected Outcomes

- After Done, the browser returns to the opportunity's Select Client step
  (`#/opportunities/new/<id>`), now showing a client summary card
  `Client: <name>(<C|P>)` with the address and contact just entered — this is the
  confirmed "client was created" signal.

## Edge Cases / Known Quirks

- **Address verification on step 1 Next.** A synthetic/unverifiable street address
  triggers a "This address cannot be verified — Would you like to continue anyway?"
  confirmation (OK/Cancel). Automation must handle this conditionally — it does not
  always appear (a genuinely deliverable address wouldn't trigger it).
- **Location Type's option list depends on Client Type**, same as documented in
  `find_a_client_and_create_client.md`. For **Personal**, the exact live-verified
  list is: Home Office, Rental Property, Primary Residence, Vacation Residence, CRM
  QA Office, Mailing Address, Travel Station, INACTIVE Personal Location, UNUSED
  Personal Location, DELETED Personal Location, PRIME Personal Location, Risk
  Location — note these are 4 *separate* options, not one combined
  "INACTIVE/UNUSED/DELETED/PRIME" entry as the other KB file's shorthand suggested.
- **State/Province select needs a settle wait.** Typing into its search box and
  clicking the first `.vs__dropdown-menu li` immediately can select a stale option
  from before the filter applied — wait for the specific option text to be visible
  first.
- **Add Contact modal auto-opens** the first time step 2 is reached — it isn't
  triggered by clicking a button in this flow. First Name arrives pre-filled from
  the client name; only Last Name needs to be typed.
- **Branch/Department are real tenant configuration data**, not enumerable/stable
  fixtures in general — but "Automation Test Branch1" (branch) is a clear, safe,
  purpose-built exception for scripted use. No equivalent obviously-safe Department
  option was found; "Personal Lines AB1-3a/DB2-3 (2) 15days" was picked only because
  it's thematically consistent with a Personal client, not because it's flagged for
  automation.

## Auto-discovered (needs review)
- (agent appends here; engineer reviews and folds into sections above)
- **State/Province select's search input needs scoping.** `input.vs__search` alone
  is ambiguous once other vue-select widgets are on the page at the same time
  (e.g. Location Type already chosen, Country defaulted to "United States") —
  vue-select always renders a `.vs__search` input per instance, not just while
  open, so a bare `input.vs__search` matches all of them (3, in a live run) and
  trips Playwright's strict mode. Scope it to the field's own group instead:
  `.form_group:has-text('State/Province') input.vs__search`. Confirmed working
  end-to-end 2026-09-17 automation run (see nexsure/tests/create_client/).
- **Reaching this flow via a direct `page.goto('#/opportunities')` did not work**
  in a live automation run — the SPA stayed on whatever page it was already on
  (the Vue Router didn't react to a same-document hash change the way it does to
  an in-app navigation click). Use the header's Home menu → "Opportunities" link
  instead (see nexsure/knowledge/pages/header.md's Auto-discovered note on the
  Home menu trigger's actual selector).
