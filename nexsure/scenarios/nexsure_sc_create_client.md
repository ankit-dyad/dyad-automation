---
product: nexsure
journey: create-client
pages: [login, create-client]
---

1. Log in as a standard agent user (`NEXSURE_LOGIN_USER` / `NEXSURE_LOGIN_PASS`).
2. From the Opportunities list, click "New" to start a new opportunity.
3. On the Select Client step, search for a client name that doesn't exist yet.
4. Confirm the search comes up with "No Results Found" and click "New Client".
5. Step 1 (Client Info): pick Personal as the Client Type, pick a Location Type,
   fill in the address block, and click Next.
6. If prompted that the address can't be verified, continue anyway.
7. Step 2 (Client Contacts): fill in the auto-opened Add Contact modal's Last Name,
   save it, and click Next.
8. Step 3 (Assignment): pick a Branch and Department, then click Done.
9. Confirm the new client now appears as the opportunity's selected client
   (`Client: <name>(P)` summary card).

<!--
Derived from nexsure/knowledge/pages/create-client.md — the only documented entry
point into client creation. Live-verified 2026-09-17 against the jmiqaweb01 QA
tenant: this persists a real client record, so the client name must be unique per
run (see framework/fixtures/factories.ts's createClientProfile()) or the search
would find a stale match instead of "No Results Found". Branch/Department/Location
Type/State are real tenant configuration data, not per-run synthetic values — see
nexsure/knowledge/data.json's "createClient" section and create-client.md's Edge
Cases for why these specific options were picked.
-->
