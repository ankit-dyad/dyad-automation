---
product: alis_core
journey: payment-upload-to-remittance
pages: [login, payment-batch-list]
---

1. Log in to Alis Core with a standard agent (`ALIS_CORE_LOGIN_USER` /
   `ALIS_CORE_LOGIN_PASS`).
2. Navigate to the Accounting module's Payment screen, Batch List tab.
3. Read the first row's Batch No off the (unfiltered) grid.
4. Open the "Filters" side panel and expand the "Batch No" column's filter.
5. Search for that Batch No in the filter's own value-search box and select
   only that value.
6. Confirm the grid is now filtered to show only that batch number's row(s).
7. Clear the filter (search box + re-select all values).
8. Confirm the full, unfiltered grid is restored.

<!--
Source: "ALIS Accounting - Bulk Payment Upload to Remittance - End-to-End Test
Cases" PDF, checklist item #21, "Batch List - Search by Batch Number". See
alis_core/knowledge/pages/payment-batch-list.md's Selectors table (Filters
side-panel tab, per-column group header, value-search box, and value-checkbox
entries added while building this scenario).

The batch number searched is read live off the grid's own first row rather
than hardcoded, since this environment's batch data is real and changes over
time (see payment-batch-list.md's "Notable behavior": "don't assume row
order/count is stable run to run" — the specific Batch No isn't assumed
stable either, only that whichever one is first at run time exists and is
searchable).

Read-only: no Save/Delete/Approve/Prepare/Post NACHA/Create Batch click
anywhere in this suite — only the Filters panel's own search/select controls
are used, then cleared back to the default unfiltered state.
-->
