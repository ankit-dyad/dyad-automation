# Remittance Advice (Remittance Download As)

## Overview

A dropdown button on the Check Register screen (`check-register.md`) footer
that generates and downloads a Remittance Advice document for the selected
batch row(s), in one of three formats. Confirmed by direct observation
2026-09-21, logged in as `qable1`, on approved batch #39054 (with the user's
explicit permission to trigger a real file download).

Matches the PDF test scenario "Check Register - Remittance Advice".

## URL

No separate route — same `#/checkregister` screen as `check-register.md`.

## Reaching this page

1. Reach the Check Register screen (`check-register.md`).
2. Select one or more row checkboxes.
3. Click the **Remittance Download As** dropdown toggle and choose a format.

## Selectors

| Element | Selector | Notes |
|---|---|---|
| Remittance Download As toggle | `#pills-cashlisting button:has-text("Remittance Download As")` | Bootstrap dropdown toggle, `data-bs-toggle="dropdown"`; no `id` |
| Dropdown menu | `#pills-cashlisting .dropdown-menu` (scoped to the toggle's parent) | Opens on toggle click |
| PDF option | `.dropdown-menu a:has-text("PDF")` | `<a class="dropdown-item">`, no `href` — JS click handler |
| Excel Data Only option | `.dropdown-menu a:has-text("Excel Data Only")` | Same pattern |
| Excel Format option | `.dropdown-menu a:has-text("Excel Format")` | Same pattern |
| Row checkbox | same ag-Grid row-selection checkbox pattern as `check-register.md` | At least one row must be selected before choosing a format — confirmed: clicking a format option with no row selected fires no network request at all |

## Actions

- Select row checkbox(es).
- Open the Remittance Download As dropdown and choose PDF, Excel Data Only,
  or Excel Format to generate and download that format for the selected
  row(s).

## Confirmed network behavior

Choosing any of the three formats fires (confirmed for PDF and Excel Data
Only; Excel Format not individually re-verified but presumed identical
mechanism):

1. `POST .../AcctCommon/GetReportingApiToken` — obtains a short-lived token
   for the reporting API.
2. `POST .../ALIS.Accounting/ReportAPI/API/api/Report/GetCheckRegisterRemittanceAdvice`
   — generates the document. All three format options appear to hit this
   **same** endpoint (format is presumably a request-body parameter, not
   reflected in the URL — the exact parameter was not captured in this pass,
   since request bodies weren't inspected).

Both calls returned `200`; no batch/check status change was observed as a
side effect (unlike Print Check's flow, this is a read/generate action, not a
state-mutating one).

## Expected Outcomes

- Confirmed live 2026-09-30: filenames are date-stamped, not batch/check-
  number-stamped as an earlier pass assumed - `RemittanceAdvice_<YYYYMMDD>.pdf`
  for PDF, `RemittanceAdvice_<YYYYMMDD>.xls` (legacy .xls, not .xlsx) for both
  "Excel Data Only" and "Excel Format" (same filename for both options).
- Confirmed live 2026-09-30 via `pypdf` text extraction on a real download:
  the PDF shows "***** Remittance Advice *****" as its title, a "Printed On"
  timestamp, Bank Name, Payee, Check No. ("TBD" observed - a placeholder,
  not a bug), Date, Amount, and a policy detail row (Policy No., Insured
  Name, Type, Acct Eff Dt). Matches the PDF checklist's expected content.
  Cell-by-cell parity between the PDF and Excel version is not automated -
  would need a new PDF-parsing (`pypdf` is available in this repo's Python
  environment, used ad hoc during this exploration, but not wired into the
  committed Playwright/TS suite) and legacy-.xls-parsing dependency.

## Edge Cases / Known Quirks

- Requires an explicit row selection first — the button itself is never
  disabled (confirmed `disabled: false` even with zero rows selected), so a
  script that forgets to select a row first will click through the dropdown
  without error but trigger no actual generation.
- Downloading any file (including via this flow) is a real-world action —
  this page's exploration required explicit user permission before it was
  exercised; automation built from this page should do the same before
  running against a live environment for the first time, or route the
  download through Playwright's `page.on('download', ...)`/`waitForEvent('download')`
  handling rather than assuming a filesystem side effect.

## Auto-discovered (needs review)
- (agent appends here; engineer reviews and folds into sections above)
