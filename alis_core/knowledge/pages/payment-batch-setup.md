# Payment — Batch Setup Form (Payment tab)

## Overview

This is the "Payment" tab inside the **Payment** screen of the ALIS Accounting
module (`https://prod-alis-4-1-21.dyadtech.com/ALIS.Accounting/APP/#/payment`).
It's the form used to define a single payment batch header before selecting the
invoices/vouchers to pay against it. It's reached by clicking **Create Batch**
from the "Batch List" tab of the same Payment screen, which immediately creates
a new batch record (assigns a Batch # right away — see the "Notable behavior"
callout below) and switches to this "Payment" tab, pre-filled and ready for the
rest of the header fields.

The Payment screen as a whole has four tabs across the top: **Batch List**,
**Payment** (this one — only appears/becomes active once a batch is in
progress), **ACH / EFT & Check**, and **Upload**. Those other three are not
covered by this document.

## Layout (left to right, top to bottom)

**Row 1:**
- **Client Type** — dropdown, pre-filled to whatever was selected on Batch List
  before "Create Batch" was clicked.
- **Client** — free-text field, empty by default. Bordered in red/orange,
  suggesting it's a required field not yet satisfied.
- **Payee** — free-text field, empty by default.
- **Acct Eff Date** — date field, pre-filled to today's date (bordered green,
  suggesting a satisfied/required-and-filled field).
- **Bank GL** — read-only-looking field showing the bank account selected on
  Batch List (e.g. "110201 - Bank of America"), bordered green.

**Row 2:**
- **Payment Mode** — dropdown, defaults to "Check".
- **Address-1** — free-text field, empty.
- **Address-2** — free-text field, empty.
- **City/state/zip** — free-text field, empty.
- **Reference** — free-text field, empty.
- **Description** — free-text field, empty.

**Row 3 (action row):**
- **Save & Select Invoice(s)** — dark maroon primary button, left-aligned. Presumed
  next step: save this header and move to picking which invoices/vouchers this
  batch pays (not exercised — see Open Items).
- **Clear** — outlined secondary button next to it. Presumed to reset the form
  fields (not exercised).
- **Export To Excel** (icon: a downward-arrow-into-tray glyph, labeled "Excel") —
  right-aligned, on the same row. Presumed to export something related to this
  batch/form to Excel (not exercised — unclear whether it exports the (empty)
  form, or something else, since no invoices are selected yet).

**Footer bar (bottom of the whole Payment screen, not just this tab):**
- Left: **"Batch # : <number>"** — shows the batch number just created (e.g.
  "39288").
- Middle: **"Total Payment Amount : <amount>"** — shows a running total (0.0 for
  a freshly created, empty batch).
- Right: **"← Back to Batches"** button — dark maroon, returns to the Batch List
  tab.

## Dropdown options observed

- **Client Type**: Agency, Insured, Market, Finance, Underwriter, Association.
  (Same option set as the Batch List tab's Client Type filter.)
- **Payment Mode**: Check, Wire, ACH, Cash, Credit Card, Debit Card, Finance
  Check, AMEX CC, Swift, ECheck, Others.

No checkboxes are present on this form.

## Notable behavior

- **"Create Batch" is not a dialog/preview — it's a real, immediate write.**
  Clicking it on the Batch List tab creates an actual batch record server-side
  right away (a toast confirms "Batch — Batch in Process" and a real Batch #
  is assigned) and navigates straight into this Payment tab for that new batch.
  There's no intermediate "are you sure" or draft state — anyone exploring this
  screen should expect that clicking Create Batch always leaves a new batch
  behind, even if nothing else is ever filled in or saved.
- The Client/Payee/Address fields are visually marked (red/orange border) as
  needing input, while the date and Bank GL fields inherited from Batch List are
  marked green — a plain-language "still needs your input vs. already
  satisfied" visual cue, not a validation error message.

## Open items / to verify

- What happens after clicking **Save & Select Invoice(s)** — presumably an
  invoice/voucher picker for this batch, not yet seen.
- What **Clear** actually resets, and whether it affects the already-created
  batch record or just the on-screen fields.
- What **Export To Excel** produces on this specific tab (an empty batch
  header, or something else) — not exercised.
- Whether **Client** and **Payee** are truly required (their red/orange border
  suggests validation) and what happens if "Save & Select Invoice(s)" is
  clicked without them — not exercised, since exercising it would submit data.
- Whether a batch created this way (with nothing else filled in) can later be
  deleted cleanly from the Batch List tab the same way batch #39285 was in
  earlier manual testing — not re-verified in this pass for batch #39288 (left
  as-is per instruction, not deleted).
