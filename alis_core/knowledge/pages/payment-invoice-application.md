# Payment — Invoice Application picker ("Save & Select Invoice(s)")

## Overview

This is the screen that opens after filling in the batch header (Client Type,
Client, Payee, etc. — see `payment-batch-setup.md`) and clicking **Save &
Select Invoice(s)**. It replaces the whole page (not a modal) with a full-screen
"Invoices" view, header-banded in maroon, for picking which outstanding
invoices/vouchers this payment batch pays against. Belongs to the Payment
screen of the ALIS Accounting module, reached via Payments → Batch List →
Create Batch → fill header → Save & Select Invoice(s).

Confirmed: clicking Save & Select Invoice(s) does persist the header fields
entered (Client AGT003, Payee, address, etc.) — the batch stays open here for
picking invoices, but was not exercised further (no invoice was selected/paid
in this pass).

## Layout (left to right, top to bottom)

**Top banner:**
- "Invoices" label, top-left, on its own maroon bar.
- Top-right: **"Batch # : 39288, Transaction : Payment"** text, then **Close**
  button (outlined) and **Save** button (solid maroon) — these two apply to
  the whole Invoices screen, not a specific row.

**Filter row 1:**
- **Quick Search** — free-text field, placeholder "Quick Search..".
- **Based On** — dropdown, defaults to "Acct Eff Date". Options observed:
  Acct Eff Date, Due Date, Invoice Date.
- **From Date** / **To Date** — date range, defaulted to a wide window (e.g.
  03/21/2026 to 09/21/2026 — six months back from today to today).
- **Client** — read-only-looking field, pre-filled with the batch's Client
  code (AGT003), green border. A small "×" clear icon and a search/magnifier
  icon sit at its right edge.

**Filter row 2:**
- **Billing Method** — multi-select dropdown, showing one chip by default:
  "Agency Bill ×". Other options (via the "..." picker, not opened to avoid
  changing selection): Direct Bill to Company, Direct Bill to Insured, Direct
  Bill to Lien Holder.
- A row of checkboxes to the right of Billing Method: **Binding** (checked),
  **Brokerage** (checked), **Paid** (unchecked), **Receivable Vouchers**
  (unchecked), **Payable Vouchers** (checked), **A/R Paid** (unchecked),
  **Financed** (unchecked).

**Action row:**
- **Search** — dark maroon button, left-aligned.
- **Select All** / **UnSelect All** — outlined buttons next to Search.
- **Top-Up Selection** — outlined button next to those (purpose not verified —
  see Open Items).
- **Excel** (icon: downward-arrow-into-tray) — right-aligned, exports the grid.

**Grid**, columns left to right:
- Checkbox column (select row / select-all in header).
- **Invoice Code** — e.g. "INV112258", "INV112258-R" (a reversal/credit of the
  first, shown directly below it), "INV112204-03", etc.
- **Invoice Amt** — dollar amount, shown in parentheses for what look like
  negative/payable amounts (e.g. "($1,085.74)"), plain positive for others
  (e.g. "$1,085.74" for the "-R" reversal row).
- **Due Amt** — dollar amount, same parenthetical-negative convention.
- **Current Payment** — a dark maroon "cell button" per row showing "$0.00" —
  looks clickable/editable inline (not exercised, to avoid entering a payment
  amount).
- **Write-Off** — same styling/convention as Current Payment, "$0.00".
- **Revise Due** — dollar amount, recalculated due amount (initially equal to
  Due Amt since no payment/write-off has been entered).
- **Action** — three icon-only buttons per row: a green **"+"** circle, a
  **refresh/loop** icon, and a **calendar** icon. None labeled with text or a
  tooltip observed — exact functions unverified (see Open Items).

**Right-edge vertical tabs:** **Columns** and **Filters**, same as the Batch
List grid.

**Footer bar:**
- **Current Payment Amt : 0, Write-Off Amt : 0** — running totals across the
  grid, bottom-right.

## Dropdown / filter options observed

- **Based On**: Acct Eff Date, Due Date, Invoice Date.
- **Billing Method** (multi-select): Agency Bill (default/selected), Direct
  Bill to Company, Direct Bill to Insured, Direct Bill to Lien Holder.
- **Checkboxes**: Binding, Brokerage, Paid, Receivable Vouchers, Payable
  Vouchers, A/R Paid, Financed. Defaults on load: Binding, Brokerage, and
  Payable Vouchers checked; the rest unchecked.

## Notable behavior

- The grid loaded with results immediately on opening this screen (six invoice
  rows for AGT003), without needing to click **Search** first — Search is
  presumably for re-running the query after changing filters, not required to
  see an initial result set.
- Row "INV112258" and "INV112258-R" appear paired — a negative invoice amount
  immediately followed by its positive reversal of the same amount — worth
  keeping in mind when asserting on grid contents (don't assume every code is
  unique/net-positive).
- The per-row **Current Payment** / **Write-Off** amounts render as solid
  maroon buttons rather than plain numbers or input boxes, suggesting clicking
  one opens an inline edit or a small entry popup rather than being directly
  typable — not exercised.

## Open items / to verify

- What **Top-Up Selection** does.
- What the three per-row Action icons (+, refresh/loop, calendar) do —
  genuinely unlabeled, not guessed at here.
- What clicking a **Current Payment** or **Write-Off** cell does (inline edit
  vs. popup) and how it affects Revise Due / the footer totals.
- What **Save** (top-right) actually commits — presumably the selected
  invoices/payment amounts into the batch — not exercised, since it would
  apply a real payment against these invoices.
- What **Close** does to the in-progress batch (#39288) — does it keep the
  batch open/editable on the Batch List for later, or discard the
  session-only "Save & Select Invoice(s)" state? Not exercised.
- Whether the "×" and magnifier icons next to the Client field let you change
  which client's invoices are shown from this screen, or are purely
  decorative/no-op since Client is otherwise read-only here.

## Correction to earlier test-data assumption

Earlier documentation (`alis_core/knowledge/data.json`,
`alis_core/knowledge/app.md`) recorded AGT003 as resolving to "Dyad Tech DC"
based on notes from an earlier manual QA pass. On this login (`qable1`) and
this Bank GL (110201 - Bank of America), typing `AGT003` into the Client field
autocompletes to and resolves as **"THOMAS HARRISON ASSOCIATES"** (New York,
NY 10002), not "Dyad Tech DC" — confirmed directly by selecting it and seeing
Payee/Address auto-fill. This may mean the AGT003 → Dyad Tech DC mapping was
specific to a different bank account, login, or environment than the one used
in this pass — that assumption should not be carried forward into further
`alis_core` knowledge files without re-confirming which agent code actually
maps to "Dyad Tech DC" under this login.
