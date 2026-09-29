---
product: alis_core
journey: login
pages: [login]
---

1. Navigate to the Alis Core login page (`ALIS_CORE_BASE_URL`).
2. Enter the username (`ALIS_CORE_LOGIN_USER`) into the User Name field.
3. Enter the password (`ALIS_CORE_LOGIN_PASS`) into the Password field.
4. Click the "Log In" button.
5. Confirm the user is logged in successfully (navigated away from `#/login`).

<!--
Derived from alis_core/knowledge/pages/login.md, mirroring alis/scenarios/al_sc_login.md.
One open item still blocks the "logged in" assertion in step 5 from being more
specific than "left #/login": the exact post-login landing route (and whether a
startup message popup appears, as it does on alis/ UAT) has not yet been
confirmed against this environment with real credentials. Update this scenario
and alis_core/tests/login/login.test.ts's assertion once that's known.
-->
