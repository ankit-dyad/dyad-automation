# Business Rules: Alis Core

Cross-page rules that don't belong to a single page's knowledge file — validation
logic, state machines, role-based behavior, etc. Keep entries short and link to the
page(s) they apply to.

## Format

```
### <Rule name>
- Applies to: <page(s)>
- Rule: <what must be true>
- Source: <who confirmed it / where it's documented, if not just observed in-app>
```

### Uploaded-batch invoices are frozen until the batch is posted (or deleted)

- Applies to: Payment screen — Upload tab (bulk payment file upload,
  `payment-upload.md`, `payment-upload-file-validation.md`), Batch List
  (`payment-batch-list.md`), Payment/Batch Setup (`payment-batch-setup.md`).
- Rule: After uploading a payment file on the Upload tab and clicking **Save
  Payment**, the system generates a batch number containing all the invoices
  selected in that file. Those invoices are then **frozen** — locked to that
  batch — and cannot be picked up by a different batch while they remain in
  it. Confirmed independently 2026-09-28: re-uploading a file with real
  `AGT003` invoices landed every row in Invalid Invoice with the exact reason
  `"Invoice is locked in Batch#39284"` — this is that freeze in action, not a
  bug.
- **This remediation is conditional — only follow it if the upload actually
  errors.** Confirmed directly by the user 2026-09-28: a subsequent upload of
  the same real-`AGT003` file, done manually in the user's own session, landed
  all 12 rows in **Valid Invoice** with **zero** in Invalid Invoice — i.e. the
  invoices were not locked this time, no error occurred, and no batch needed
  deleting. **Do not preemptively go delete a batch** — only do so when a
  file upload actually surfaces an `"Invoice is locked in Batch#<N>"` error
  for that specific batch number.
- **To unblock a locked invoice so it can be re-uploaded/re-selected** (only
  when the error above actually occurs): go to Payment > Batch List,
  search/filter for the blocking batch number named in the error (e.g.
  `39284`), select it, and click its **Del** (trash-can) icon. Once that
  batch is deleted, the invoice becomes available again for a fresh upload.
  This is a genuinely destructive, real write against production-looking
  data (deletes a real batch record) — see `payment-batch-list.md`'s Del
  column entry.
- Invoices are also released from the frozen state once the batch is
  **posted** (posting is the terminal action — not yet independently
  observed in this pass, see Open Items below). Deleting is the only
  confirmed unblock path so far.
- Source: Told directly by the user (a domain expert on this application);
  the freeze behavior itself independently confirmed 2026-09-28 via a live
  upload attempt. The delete-to-unblock remediation was told directly by the
  user with a live example (batch #39284), and the user gave explicit
  permission (2026-09-28) to delete it and re-upload — but the batch could
  not be located to act on; see Open Items.

## Open items / to verify

- What "posting" a batch looks like/does, and whether it's the same action as
  the "Prepare" or "Post NACHA" buttons already noted on the Batch List footer
  (`payment-batch-list.md`) — not yet confirmed.
- Whether this freeze/unfreeze behavior also applies to a batch created via
  the manual "Create Batch" → "Save & Select Invoice(s)" path documented in
  `payment-batch-setup.md`, or is specific to the file-upload path.
- **Batch #39284 is not locatable in the Batch List grid on this
  environment**, blocking the delete-to-unblock remediation from being
  exercised (confirmed 2026-09-28, after explicit user permission to delete
  it was given). Investigated exhaustively:
  - Scrolled the grid's full vertical range (ag-Grid virtualized row model,
    ~300 total rows loaded, batch numbers 35066–39293) via direct
    `scrollTop` manipulation on `.ag-body-viewport` (the only way to move
    this grid — see `payment-batch-list.md`'s scroll-gesture note, which
    covers horizontal; vertical needed the same JS-scrollTop-plus-dispatch
    approach). The list jumps directly from batch 39282 to 39288 — #39284 is
    not among the loaded rows at any scroll position.
  - Confirmed via the grid's own column "Filters" panel (Batch No column,
    typed "39284") — "No matches." Since ag-Grid's Set Filter scans the full
    in-memory row model (not just DOM-rendered rows), this is authoritative
    for whatever dataset the grid actually loaded, not just the visible
    viewport.
  - Ruled out the **Client Type** dropdown (Agency/Insured/Market/Finance/
    Underwriter/Association) as the cause — switching it does reload the
    grid (confirmed via changed Acct Eff/Entry dates and Bank GL values in
    the reloaded rows), but the **batch number range loaded is identical**
    under Agency and Insured (both start at 35066) — strong evidence this
    dropdown doesn't actually scope by client type at all, consistent with
    the already-flagged suspicion that the top filter row is largely
    non-functional (see `payment-batch-list.md`).
  - This matches the user's own manual screenshot from the same day, which
    also showed 39280/39281/39282/39288 but not 39284 when searching "3928"
    — i.e. this is not an automation artifact, the batch is equally
    unfindable through manual use of this screen.
  - Not yet tried: whether a different Entity/Company context (if one
    exists elsewhere in the app, separate from this Client Type dropdown)
    would surface it — no such switcher has been found yet.
  - **Status: no longer blocking.** Per the user (2026-09-28): the file no
    longer errors on upload at all — a subsequent manual upload of the same
    real-`AGT003` file landed all 12 rows in Valid Invoice with 0 in Invalid
    Invoice, so the invoices weren't locked this time and there was nothing
    to delete. The delete-to-unblock workflow is **conditional**, only for
    when a future upload actually surfaces an `"Invoice is locked in
    Batch#<N>"` error — the hunt for batch #39284 specifically is dropped,
    not because it was found, but because it's no longer needed.
- The delete-to-unblock remediation (search Batch List for the blocking batch
  number, select it, click Del) has still never been exercised by this
  automation, since no upload in this pass has hit the locked-invoice error —
  it remains documented but unexercised, to be automated only if/when that
  error is actually reproduced.
- **The Valid Invoice → Save Payment path is now automated and confirmed
  working** (2026-09-28, `alc_sc_payment_upload_save_payment.md`). One row in
  the fixture has a negative amount and gets rejected by an "Invalid
  Transactions" modal if selected (no batch created at all while it's
  included, even alongside 11 otherwise-valid rows) — deselecting it and
  saving the rest succeeds. Root-caused via the user's manual repro after two
  automated attempts that included the negative row got a misleadingly
  "successful-looking" `HTTP 200` with an empty body and created nothing —
  see `payment-upload-file-validation.md`'s Save Payment entry for the full
  story, including two further automation-only bugs (wrong checkbox element,
  redundant tab click) found and fixed while chasing a clean run, plus a
  timeout that had to be raised repeatedly (90s → 300s) to match this
  environment's run-to-run latency variance. This has now created real
  batches four times — **#39299** and **#39304** (deleted manually by the
  user afterward) and **#39306**/**#39308** (left in place) — each time
  freezing these 11 invoices per the rule above. A genuine re-run of this
  spec always needs whichever batch was created last deleted (or a different
  data set) first. As of 2026-09-28 that's **#39308**.
