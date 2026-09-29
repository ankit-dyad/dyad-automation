---
product: nexsure
journey: login
pages: [login]
---

1. Navigate to the Nexsure sign-in page (`NEXSURE_BASE_URL`).
2. Enter the username (`NEXSURE_LOGIN_USER`) into the username field.
3. Enter the password (`NEXSURE_LOGIN_PASS`) into the password field.
4. Click the "Sign in" button.
5. Confirm the user lands on the dashboard (`#/`, greeting heading visible).

<!--
Derived from nexsure/knowledge/pages/login.md. This page has no native <form> and
document.title stays "Nexsure" on both the sign-in and dashboard screens — the URL
hash and the greeting heading are the only reliable "logged in" signals (see that
file's Expected Outcomes / Edge Cases).
-->
