---
reviewed: false
last_verified: 2026-09-10
---

# Page: Header

## URL

Not a page of its own — `<app-header>` is a sticky top bar (`position-fixed`,
dark red/maroon) present on every authenticated/workspace page after login (e.g.
`#/followup`). Confirmed present after closing the post-login startup message
popup (see `pages/login.md`).

## Selectors
| Element | Selector | Notes |
|---|---|---|
| Header bar | `app-header` | Angular component tag wrapping the `<header>` element; confirmed present on `#/followup` |
| Logo / home link | `a[routerlink="/workspace"]` | text "ALIS"; navigates to `#/workspace` |
| Search type dropdown | `#inputGroupSelect01` | options: Submission, Policy, Insured/DBA/Co-App, Invoice, Quote |
| Search box | `input.header-search` | placeholder "Type here"; accessible label changes with the dropdown selection (e.g. "Last name") |
| User avatar | `getByAltText('Header Avatar')` | `<img alt="Header Avatar" class="... header-profile-user">`, far right |

## Actions

- Click the logo to navigate to `#/workspace`.
- Select a record type from the search type dropdown.
- Type into the search box to look up a record of the selected type.
- Click the user avatar to open the account/user menu (not yet opened/verified).

## Expected Outcomes

- The header bar (`app-header`) is visible on every authenticated page, with the
  logo, search controls, and avatar all visible.

## Edge Cases / Known Quirks

- Apps-grid icon (far top-left, 3×3 dot grid) — likely an app/module switcher;
  contents not opened/verified, no selector captured yet.
- "Business Manager" menu — appears to be a dropdown/switcher; contents not
  opened/verified, no selector captured yet.
- Icon toolbar (between "Business Manager" and the avatar) — unlabeled icon
  buttons, no tooltips on hover, no accessible names exposed. Glyphs suggest
  Documents, e-signature/underwriting, Accounting/Carrier info, Reports,
  Contacts/Users, Watchlist/Monitoring, Dashboard, Search/Lookup, Settings
  (gear), and Notifications (bell) — none of this is confirmed; needs a
  click-through per icon to get a real selector and label.
- Notification bell behavior (badge/count, panel contents) — not yet verified.
- Whether the header changes on non-workspace pages (e.g. inside a
  submission/policy detail screen) — not yet verified; current selectors were
  only confirmed on the `#/followup` landing page.

## Auto-discovered (needs review)
- (agent appends here; engineer reviews and folds into sections above)
