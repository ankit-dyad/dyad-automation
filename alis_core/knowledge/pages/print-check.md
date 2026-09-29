# Print Check

## Status: blocked — opens a separate client application

Confirmed by direct observation 2026-09-21, logged in as `qable1`: clicking
**Print Check** on the Check Register screen (`check-register.md`) does
**not** open an in-page Bootstrap modal like every other popup documented so
far in this app (`batch-transaction-detail-popup.md`,
`check-summary-popup.md`). Instead it fires
`GET .../ALIS.Common/API/ModuleNavigation/NavigateToClientApplication?ApplicationName=PrintCheck&Argument=Parameters=<BatchNo>~...&IsTokenRequires=true`
— the same "navigate to a separate client application in a new
tab/window" pattern documented as blocking automation for **Agency Bank
Setup** (see `alis_core/knowledge/app.md`'s Status section). This
automation's browser tooling cannot drive a tab/window opened this way (new
tabs only open from a genuine user click, never from automation input), so
the actual Print Check popup's fields and behavior (Total Check(s) count,
Next Available Check Number, Override New Check Numbers / Use Spoiled Check
Numbers radios, Print All / Print Selected, per the PDF's "Check Register -
Print Check" test scenarios) are **not confirmed** on this environment.

Matches the PDF test scenarios "Check Register - Print Check" (all four
sub-scenarios: popup header/grid, Total Check(s)/Next Available Check Number,
Override/Use Spoiled radios, Print All).

## Reaching this point (confirmed)

1. Reach the Check Register screen (`check-register.md`).
2. Set Check Status to **Approved** (`#ddlCheckStatus`) and Search — this
   swaps the footer action button from "Approve" to **Print Check**
   (`#btnPrint`; confirmed via live DOM — a real `id`, not the earlier
   trailing-space-`id` pattern seen on some tab buttons).
3. Select a row's checkbox.
4. Click Print Check.

## Confirmed network behavior

Clicking Print Check fires (in order, all successful, all read-only —
confirmed no state-changing write call fires from this click alone):

1. `POST .../Checkregister/GetNextCheck`
2. `GET .../ModuleNavigation/NavigateToClientApplication?ApplicationName=PrintCheck&Argument=Parameters=<BatchNo>~-123~272~REFUND_PST_AGENCY~WRITEOFF_PST_AGENCY~453~1~ACUD_DEV_ENV&IsTokenRequires=true`

The second call returns a URL/token for the separate PrintCheck client
application; no new tab was observed to actually open in this pass (the
browser tooling silently blocked it), and the originating batch's status was
not observed to change — this click, on its own, is not itself the "commit"
action per the PDF's description (the popup's own Print All/Print Selected is
described as the further, actual print-and-assign-check-numbers step).

## Open items

- The Print Check popup's actual fields, layout, and selectors — entirely
  unconfirmed. Needs either: a way to drive the separate PrintCheck
  application's window, or a teammate to manually walk through it and share
  screenshots/HTML.
- Whether `NavigateToClientApplication` alone ever mutates anything
  server-side (e.g. reserving a check number) even without the popup being
  interacted with further — not confirmed; treat as a real-world/consequential
  action and don't script around the new-tab block to force it open.

## Auto-discovered (needs review)
- (agent appends here; engineer reviews and folds into sections above)
