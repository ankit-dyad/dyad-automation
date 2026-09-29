---
product: alis
journey: login
pages: [login]
---

1. Navigate to the ALIS login page (`ALIS_UAT_BASE_URL`).
2. Enter the username (`ALIS_UAT_USERNAME`) into the User Name field.
3. Enter the password (`ALIS_UAT_PASSWORD`) into the Password field.
4. Click the "Log In" button.
5. Confirm the user is logged in successfully.

<!--
Derived from alis/knowledge/pages/login.md. Two open items from that file still
block turning this into a generated spec:
  - No reliable "logged in" assertion is documented yet (post-login landing
    page/route, a nav element, a welcome header, etc.) — step 5 needs that before
    agents/generator-agent.ts can produce a real assertion for it.
  - alis/knowledge/registry.yaml has no "login" entry yet, so `pages: [login]`
    can't be resolved by the generator agent until one is added.
-->
