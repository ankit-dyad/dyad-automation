# Payment — Upload (Upload tab)

## Overview

This is the "Upload" tab of the **Payment** screen in the ALIS Accounting module
(`https://prod-alis-4-1-21.dyadtech.com/ALIS.Accounting/APP/#/payment`). It's the
bulk payment-upload entry point: set a batch header (Client Type, Acct Eff Date,
Entity, Bank GL), choose a payment Excel file, and upload it — the app then
splits rows into Valid/Invalid Invoice grids for review before saving.

The Payment screen has three tabs across the top: **Batch List** (default),
**ACH / EFT & Check**, and **Upload** (this one). Confirmed by direct
observation 2026-09-21, logged in as `qable1`, against real (not sample)
data.

## URL

`#/payment` (same route as Batch List — the "Upload" tab is a client-side tab
switch, not a separate route). Resolved against **`ALIS_CORE_ACCOUNTING_BASE_URL`**
(`https://prod-alis-4-1-21.dyadtech.com/ALIS.Accounting/APP/`, trailing slash
required) — **not** `ALIS_CORE_BASE_URL`/`PLAYWRIGHT_BASE_URL`, which point at
the BMS app (`https://prod-alis-4-1-21.dyadtech.com/ALIS.BMS/APP/`) and would
resolve this page's hash-only path to the wrong sub-app entirely. See
`alis_core/knowledge/app.md`'s Environments section and "Reaching this page"
below.

## Reaching this page

1. Log in via the BMS login page (`alis_core/knowledge/pages/login.md`) — the
   Accounting sub-app shares the same authenticated session (confirmed: after
   logging in at `.../ALIS.BMS/APP/#/login`, navigating directly to
   `.../ALIS.Accounting/APP/#/payment` lands on the Payment screen without a
   second login).
2. In the live app, the documented manual path is the hamburger/ChocoBox menu →
   "Accounting" (per the manual QA pass this automation is derived from).
   Automation instead navigates directly to the Accounting base URL — more
   reliable than driving the mega-menu, and produces the same authenticated
   state. The menu-click path itself is not exercised/automated.
3. Once on the Accounting app, the left icon rail exposes: Dashboard (`#/home`),
   Receipts (`#/receipt`), **Payments (`#/payment`)**, Adjustments
   (`#/adjustments`), Cash Listing (`#/cashlisting`), Check Register
   (`#/checkregister`), Account Detail (`#/searchaccountdetail`), Invoice
   Details (`#/searchinvoicedetail`), Follow Up (`#/followup`).
4. On the Payment screen, click the "Upload" tab (`#pills-Upload-tab`) to reach
   this page.

## Selectors

| Element | Selector | Notes |
|---|---|---|
| Upload tab button | `#pills-Upload-tab` | role=tab, name "Upload"; `.active` class when selected |
| Batch List tab button | `#pills-batch-tab` | role=tab, name "Batch List" |
| ACH/EFT & Check tab button | `#pills-ACHEFT-tab` | role=tab, name "ACH / EFT & Check" |
| Client Type dropdown | `#ddlClientTypeUpload` | native `<select>`; formcontrolname `ddlClientTypeUpload` |
| Acct Eff Date field | `input[bsdatepicker]` <!-- fragile --> | no `id`/`formcontrolname` in the rendered DOM; identified via the `bsdatepicker` directive attribute and its floating label text "Acct Eff Date". Only one such field on this tab. Value defaults to today (`MM/DD/YYYY`), opens a date-picker popup on click. |
| Entity dropdown | `#ddlEntityUpload` | native `<select>`; formcontrolname `ddlEntityUpload` |
| Bank GL dropdown | `#ddlBankGLUpload` | native `<select>`; formcontrolname `ddlBankGLUpload` |
| Choose Files control | `#fileuploadtab` | `input[type=file]`; formcontrolname `fileuploadtab`; rendered as a "Choose Files / No file chosen" control |
| Download (sample file) link | `a[href*="DownloadExcel/payment_upload_sample.xlsx"]` | text "Download"; downloads `payment_upload_sample.xlsx` |
| Upload button | `#pills-Upload button:has-text("Upload")` | `.btn.btn-primary`, submits the chosen file; scoped to the `#pills-Upload` tab-pane (there is no `<form>` wrapping these controls, and the tab button itself is also named "Upload") |
| Cancel button | `#pills-Upload button:has-text("Cancel")` | `.btn.btn-outline-secondary` |

## Actions

- Click the "Upload" tab to switch to this view from Batch List / ACH-EFT.
- Select a Client Type (Agency, Insured, Market, Finance).
- Set the Acct Eff Date via the date picker (or type a date).
- Select an Entity.
- Select a Bank GL account.
- Choose a local Excel file via "Choose Files".
- Click "Download" to get the sample template (`payment_upload_sample.xlsx`).
- Click "Upload" to submit the chosen file — confirmed via
  `payment-upload-file-validation.md`: this splits the file's rows into Valid
  Invoice / Invalid Invoice tabs for review, it does not by itself commit a
  batch (that happens via a further "Save Payment" step this pass never
  exercises — see `payment-batch-list.md`'s note that Create Batch performs a
  real write, same caution class).
- Click "Cancel" to reset the form — not exercised.

## Dropdown options observed

- **Client Type** (`#ddlClientTypeUpload`): Agency, Insured, Market, Finance.
  Narrower than the Batch List tab's Client Type filter (which also offers
  Underwriter and Association) — don't assume the option sets are identical
  across tabs on this screen.
- **Entity** (`#ddlEntityUpload`): Dyad Inc (default), Dyad Tech DC, Dyad Tech
  com, DYAD.
- **Bank GL** (`#ddlBankGLUpload`): same 12-account list as the Batch List tab's
  Bank GL filter (110203 - BANK OF CLAIM (default — see Edge Cases below),
  110201 - Bank of America, 110202 - Royal Bank of Scotland, 110603 - City
  National Bank, 120102 - City National Bank, 520602 - Bank of New York
  Mellon, 120101 - Bank of AMEX, 110701 - BNPP-1, 110702 - Bank of America-1,
  110602 - Bank of Texas, 140201 - Bank of California, 110101 - Bank of
  America).

## Expected Outcomes

- All four header fields (Client Type, Acct Eff Date, Entity, Bank GL) accept
  the entered/selected values without a validation error, and the "Choose
  Files"/"Download"/"Upload"/"Cancel" controls are present and enabled
  (matches the PDF test scenario "Payment Upload - Batch Setup": *"Upload tab
  loads ... all batch header fields accept the entered/selected values"*).
- Uploading a real file splits rows into "Valid Invoice" / "Invalid Invoice"
  tabs per the PDF's next test scenario — confirmed and automated, see
  `payment-upload-file-validation.md`.

## Edge Cases / Known Quirks

- **Changing Client Type *or* Entity asynchronously reloads and resets the
  Bank GL dropdown.** Confirmed by direct observation, twice: an earlier pass
  of this file (2026-09-18) confirmed Entity does this; a later live
  network-request trace (2026-09-21) confirmed **Client Type does too** —
  changing either field fires `POST
  .../ALIS.Accounting/API/api/AcctCommon/GetBankList`, and once that response
  lands, Bank GL is reset to its list's first option — silently overwriting
  any Bank GL value selected before the response arrived. The reset only
  happens when the field's value actually *changes* (confirmed: re-selecting
  an already-current value fires no change event and no reload) — but this
  environment's actual default Client Type/Entity/Bank GL values are **not
  reliably fixed** across sessions (observed `110203 - BANK OF CLAIM` in one
  session, `110201 - Bank of America` already selected in another, with
  Client Type similarly varying) — don't assume a specific default without
  checking it live first, and don't assume selecting "AGENCY"/"Dyad Inc" is a
  no-op just because it was one in a prior session.
  `page.waitForLoadState('networkidle')` is **not** a reliable signal for
  waiting out the reload — it can resolve before the `GetBankList` request
  even starts. The reliable pattern: before changing Client Type or Entity,
  check whether the value is actually changing; if so, register
  `page.waitForResponse(url => url.includes('/AcctCommon/GetBankList'))`
  around the selection and await it before touching Bank GL. The first
  automation pass of this page only guarded Entity, not Client Type, and
  didn't await Client Type's own reload before selecting Bank GL — which is
  what caused an intermittent, order-dependent failure (Bank GL ending up
  reset after the fact) the first few times this was run.
- The PDF source for this flow (`ALIS Core Test Case flow of payment.pdf`) was
  recorded against `preprod-alisblue.dyadtech.com` and additionally lists a
  "Cost Center" field on this Upload tab. That field does **not** exist on this
  environment/version (`prod-alis-4-1-21`, app version 4.1.21.5) — confirmed by
  direct DOM inspection (only Client Type / Acct Eff Date / Entity / Bank GL are
  present). Treat "Cost Center" as environment-specific to preprod-alisblue,
  not part of this page's automated coverage, unless/until re-confirmed here.
- The Acct Eff Date field has no `id`/`formcontrolname` in the rendered DOM
  (Angular strips it) — the `[bsdatepicker]` attribute selector is a
  genuine framework directive, not an invented/auto-generated class, but is
  still flagged `<!-- fragile -->` per conventions.md since it's a CSS
  attribute selector rather than role/label.
- This is a real production-looking environment (see `payment-batch-list.md`) —
  clicking "Upload" for real creates real Valid/Invalid Invoice results (see
  `payment-upload-file-validation.md`). The real-`AGT003`-data file's outcome
  depends on current invoice-lock state, not fixed — see that file's Overview.
  The Entity mismatch noted there (default "Dyad Inc" not matching) is fixed
  by selecting **Entity = "Dyad Tech DC"** before uploading, matching
  `data.json`'s `testEntities[0].entityName` for the `AGT003` reference
  entity. The further "Save Payment" write is now exercised — see
  `alc_sc_payment_upload_save_payment.md`.

## Auto-discovered (needs review)
- (agent appends here; engineer reviews and folds into sections above)
