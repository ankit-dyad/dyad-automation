# Batch List — PDF Export

## Overview

The Batch List grid's **PDF** icon column (`i[title="PDF Export"]`) exports a
batch's transaction data as a PDF. Confirmed by direct observation
2026-09-28, logged in as `qable1`. Matches the PDF test scenario "PDF
Generation (payment)".

Unlike a typical file-download link, this is API-driven: clicking the icon
POSTs to a report endpoint that returns the PDF's bytes as a base64 string
embedded directly in a JSON response, and the Angular app converts that into
a client-side download itself. No new browser tab opens and no confirmation
dialog appears — the whole thing happens without any visible UI change other
than the file landing wherever the browser saves downloads.

## URL

Same as `payment-batch-list.md` — `#/payment`, Batch List tab, resolved
against `ALIS_CORE_ACCOUNTING_BASE_URL`.

## Reaching this page

Reach the Payment screen's Batch List tab (`payment-batch-list.md`) and
locate any batch row.

## Selectors

| Element | Selector | Notes |
|---|---|---|
| PDF icon | `#pills-batch .ag-pinned-right-cols-container [col-id="3"] i[title="PDF Export"]` | Pinned right-hand action column, same row-duplication caveat as `payment-batch-list.md` — scope to the pinned-right container, not center |

## Actions

- Click a batch row's PDF icon to export that batch's transaction data as a
  PDF.

## Expected Outcomes

- Clicking it fires `POST
  .../ALIS.Accounting/ReportAPI/API/api/Report/GetViewBatchTranPDF`, which
  responds `200` with a JSON body containing the PDF's bytes as a base64
  string (the response starts, once decoded, with the standard PDF magic
  bytes `%PDF-`). Confirmed for batch #35066.
- No modal, dialog, or new tab appears — the app converts the response into a
  file download by itself, client-side.

## Edge Cases / Known Quirks

- **This is not a `Content-Disposition` file download** — the PDF bytes
  arrive as base64 text inside an ordinary JSON API response, not as the
  response body of a navigable/downloadable URL. Automation therefore
  verifies this action by asserting on that network response (status +
  non-empty base64 body decoding to valid PDF magic bytes), not by trying to
  intercept a real Playwright `download` event or inspect a file on disk —
  neither would necessarily fire/exist for this client-side-constructed-blob
  pattern.
- Confirmed read-only from the server's perspective (a `GetView...` report
  endpoint) — clicking it repeatedly is safe to automate, unlike this
  screen's Del/Create Batch/Save Payment actions.

## Auto-discovered (needs review)
- (agent appends here; engineer reviews and folds into sections above)
