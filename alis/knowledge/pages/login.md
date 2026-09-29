---
reviewed: false
last_verified: 2026-09-10
---

# Page: Login

## URL

`https://alisuat.novatae.com/ALIS.BMS/APP/#/login` (UAT). Angular SPA, hash-based
routing — the Page Object's path is the hash-only reference `#/login`, resolved
against `ALIS_UAT_BASE_URL` which must include the trailing slash
(`https://alisuat.novatae.com/ALIS.BMS/APP/`) so the join lands on the URL above.
App version (footer): 4.1.12.121 (released 2025-05-11).

## Selectors
| Element | Selector | Notes |
|---|---|---|
| User Name field | `#txtUserName` | input[type=text], placeholder "User Name" |
| Password field | `#txtPassword` | input[type=password], placeholder "Password" |
| Log In button | `button[type=submit]:has-text("Log In")` | no id; class `btn btn-lg btn-primary mb-0 py-3` |
| Forgot Password link | `a[href="#/forgotpassword"]` | text: "Forgot Password?" |
| Resource Center button | `button[aria-label="Open Resource Center"]` | bottom-left `?` icon; verify exact accessible name at runtime |
| Startup message popup | `getByRole('dialog')` | `<modal-container role="dialog" ...>` wrapping a `<lib-startup-message>` component (tabs: "Visit Notes" / "Message"); opens automatically right after a successful login |
| Startup message Close button | `getByRole('dialog').getByRole('button', { name: 'Close' })` | third item in the modal's pill-tab bar; unlike the other two tabs it has no `data-bs-target` — it dismisses the modal instead of switching tabs |

## Actions

- Enter a username into the User Name field.
- Enter a password into the Password field.
- Click "Log In" to submit the form.
- Click "Forgot Password?" to go to password recovery (not yet documented as its own page).
- Click the Resource Center button to open the help widget (not yet documented).
- Click the startup message popup's "Close" button to dismiss it after login.

## Expected Outcomes

- Valid credentials navigate to `#/followup` (confirmed by direct observation
  2026-09-10) and a startup message popup (`getByRole('dialog')`) opens
  automatically. Closing it via its "Close" button hides the dialog.
- Invalid credentials show a validation/error message — selector and exact text not
  yet captured.

## Edge Cases / Known Quirks

- Angular SPA with hash-based routing (`#/login`) — URL assertions must check the
  hash, not just the path.
- Credentials for UAT are `ALIS_UAT_USERNAME` / `ALIS_UAT_PASSWORD` — see
  `alis/knowledge/data.json`. Never hardcode the literal values in test source.
- The startup message popup opens on every successful login in this UAT
  environment — treat it as part of the standard login flow, not an edge case to
  branch on. Whether it can ever be suppressed (e.g. a "don't show again" setting)
  is not yet known.

## Auto-discovered (needs review)
- (agent appends here; engineer reviews and folds into sections above)
