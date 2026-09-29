---
reviewed: false
last_verified: 2026-09-17
---

# Page: Login

## URL

`https://jmiqaweb01.nexsure.com/nexui/` (QA). Vue.js SPA — the page renders with
zero native `<form>` elements; "submit" is a click handler on the Sign in button,
not a browser form POST. No CAPTCHA, no SSO, no language selector.

## Selectors
| Element | Selector | Notes |
|---|---|---|
| Username field | `.form_group:has-text('username') input` (case-sensitive: lowercase `username` in the DOM, rendered uppercase via CSS) | No `id`/`name`/`placeholder`. Pre-fills from a prior "Remember Me" session. |
| Password field | `.form_group:has-text('password') input` | Same styling; masked; never persists across reloads. |
| Remember Me | `label.checkbox input[type="checkbox"]` | Checkbox nested directly inside its `<label>`. Checked state persists across reloads. |
| Sign in | `getByRole('button', { name: 'Sign in' })` | Filled/primary style. Triggers auth via XHR/fetch, no native form submit. |
| Forgot Password | `getByRole('button', { name: 'Forgot Password' })` | Not exercised — flow undocumented. |
| Change Password | `getByRole('link', { name: 'Change Password' })` | `href="#"` — JS-driven, not a real navigation. |

> Avoid selecting on `data-v-*` attributes or Vue-generated class hashes (e.g.
> `data-v-240f170f`) — build-specific, will break on the next frontend deploy.
> `.form_group` + hand-authored classes (`form-control`, `nexButton`, `checkbox`)
> are the stable hooks.

## Actions

- Fill the username field.
- Fill the password field.
- Optionally toggle Remember Me.
- Click "Sign in" to authenticate.

## Expected Outcomes

- Valid credentials land on the dashboard (`#/`, greeting heading "Good
  {Morning|Afternoon|Evening}, {user}!"). `document.title` stays `"Nexsure"` on
  both the login and dashboard screens — use the URL hash or DOM content as the
  "logged in" signal, not the title or a navigation event.

## Edge Cases / Known Quirks

- **No native `<form>`** (`document.forms.length === 0`) — a network-idle or
  response-based wait after clicking Sign in is more reliable than waiting on a
  navigation event.
- **Remember Me persists the typed username** to `localStorage["username"]`
  across reloads; the checkbox's own checked state also persists (not a fixed
  unchecked default). The password field never persists.
- **Pendo analytics is active app-wide** (`id="pendo*"`, `_pendo_*` in
  `localStorage`, a floating Resource Center badge) — automation may occasionally
  see a Pendo-injected overlay.
- Validation/error messaging for empty or incorrect credentials is not yet
  documented (no failed attempt was triggered during exploration).

## Auto-discovered (needs review)
- (agent appends here; engineer reviews and folds into sections above)
