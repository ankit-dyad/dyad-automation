Login (ALIS)

Overview
The sign-in screen for the "dyad"-branded ALIS instance at `https://customer-alis.dyadtech.com`. This is a separate, independently-configured instance from the Novatae UAT instance referenced elsewhere in this knowledge base (see the "Environment variant" notes in `add-edit-risk.md`, `add-quote.md`, `market-selection.md`, `new-insured-form.md`, and `commercial-property-building.md`) — do not assume credentials, agency data, or UI behavior carry over between the two.

Field
Value
Application
ALIS (Alis Core / Alis Custom — Dyad Tech Private Limited automation POC)
Environment
customer-alis.dyadtech.com, build v4.1.19.5 (footer reads "Version Number: 4.1.19.5, Release Date: 07/03/2026")
URL
https://customer-alis.dyadtech.com
Credentials (this pass)
testqa1 / Welcome@1234 — confirmed unchanged and working across this entire session, contrary to an earlier assumption (raised mid-session) that credentials had changed. If login fails, don't assume the password rotated — check for a typo or a caps-lock/whitespace issue first.

Layout
A centered login card on a plain background, "dyad"-branded (not the Novatae/ALIS branding seen on the other UAT instance). The footer of the login page shows the build's version number and release date (see above) — a quick way to confirm which environment/build you're actually pointed at before doing any other verification.

Behavior confirmed this pass
- Successful login with testqa1/Welcome@1234 lands on the Follow Up list (`#/followup`) as the default post-login page — see `followup-list.md`.
- The top header (apps-grid icon, "ALIS" wordmark, search bar, user avatar, etc.) is present immediately after login and is consistent across every page of the app thereafter — see `header.md`.

Open items / to verify
- Behavior on a failed login attempt (error message wording, lockout behavior, rate limiting).
- Whether there's an SSO option on this login screen (Forgot Password exists — see Selectors below).
- Whether MFA/2FA is configured for this account or environment.
- Session timeout behavior (how long testqa1 stays logged in before being kicked back to this screen).
- Whether the post-login startup-message popup documented for the old novatae.com instance also appears here — NOT observed on this instance in a fresh-login pass (2026-09-24): login completed and landed directly on `#/followup` with no popup, no "Close" interaction needed. Treat as instance-specific behavior (novatae.com: popup present; dyadtech.com: not observed) rather than assuming it copies over — see login.page.ts's `login()` for how this is handled.

## Selectors
Captured live (2026-09-24) via the page's own accessibility tree — role/accessible-name/placeholder locators, per knowledge/conventions.md's priority order (role+name and label/placeholder rank above raw CSS, so these are preferred over the `#txtUserName`-style ids used in the framework's original sample, which predates this instance and wasn't re-verified here).

| Element | Selector | Notes |
|---|---|---|
| User Name field | `page.getByPlaceholder('User Name')` | `<input type="text">`, role=textbox, accessible name "User Name" |
| Password field | `page.getByPlaceholder('Password')` | `<input type="password">`, role=textbox, accessible name "Password" |
| Log In button | `page.getByRole('button', { name: 'Log In' })` | `type="submit"` |
| Forgot Password link | `page.getByRole('link', { name: 'Forgot Password?' })` | `href="#/forgotpassword"` |
| Open Resource Center button | `page.getByRole('button', { name: 'Open Resource Center' })` | bottom-left `?` icon |

## Auto-discovered (needs review)
- (agent appends here; engineer reviews and folds into sections above)

Data used to produce this document
Login performed with testqa1 / Welcome@1234 against `https://customer-alis.dyadtech.com` (v4.1.19.5) at the start of this session, and re-confirmed working (no credential change) partway through the same session after an initial assumption that it might have changed.