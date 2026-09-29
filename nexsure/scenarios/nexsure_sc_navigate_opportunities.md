---
product: nexsure
journey: navigate-opportunities
pages: [header, opportunities]
---

1. Log in to Nexsure (`NEXSURE_LOGIN_USER` / `NEXSURE_LOGIN_PASS`).
2. Open the global header's Home menu.
3. Click "Opportunities".
4. Confirm the Opportunities list loads (`#/opportunities` hash, "New" button visible).

<!--
Derived from nexsure/knowledge/pages/header.md (Home menu -> Opportunities) and
nexsure/knowledge/pages/opportunities.md (list landing signals). The Home/Profile/
Organization/Help triggers render as plain `generic` elements, not ARIA buttons —
use header.md's documented CSS fallback (`.dropdownMenuWrapper.menuTarget`, 1st of
4) rather than getByRole('button'). Same nav already used by
nexsure/tests/create_client/createClient.page.ts's goto().
-->
