import type { Page } from '@playwright/test';

/**
 * Locator definitions for the Nexsure full-policy-lifecycle flow (Opportunities:
 * New wizard's Select Assignment/Select Product steps, the Opportunity Detail
 * header, Marketing tab + Manual Quote modal, Bind, and the Binding tab + In
 * Force Quote modal) — sourced from the prose descriptions in
 * nexsure/knowledge/pages/opportunities_new.md, opportunity_application_page.md,
 * opportunity_marketing_page.md, opportunuty_quote_info.md, and
 * opportunity_marketing_binding.md. Those docs have no selector table (unlike
 * create-client.md) — several selectors below are first-pass/best-effort and
 * marked `<!-- fragile -->`; nothing but locators belongs here, actions live in
 * policyLifecycle.page.ts, assertions in policyLifecycle.test.ts.
 */
export class PolicyLifecycleLocators {
  constructor(private readonly page: Page) {}

  // --- "Opportunities: New" wizard — shared ---

  get wizardNextButton() {
    return this.page.getByRole('button', { name: 'Next', exact: true });
  }

  /* <!-- fragile: no selector table for this screen --> */
  get wizardCreateOpportunityButton() {
    return this.page.getByRole('button', { name: 'Create Opportunity', exact: true });
  }

  // --- Step 2: "Select Assignment" grid ---

  /** The grid's placeholder "add new" row — a `.grid_row.addNewRow` whose
   * rowActions cell shows a plus-shaped icon; clicking it opens the row's five
   * dropdowns for editing (confirmed via live DOM dump — this screen has no
   * selector table in its knowledge doc). */
  get addAssignmentRowButton() {
    return this.page.locator('.grid_row.addNewRow .rowActions');
  }

  /* This grid has no per-cell label text (labels live only in the header row) —
   * columns are Primary(1) / Branch(2) / Name(3) / Department(4) / Unit(5) /
   * Responsibility(6) / Use Signature(7) / rowActions(8), confirmed via live DOM
   * dump (this screen has no selector table in its knowledge doc).
   *
   * Not scoped to `.editingRow`: confirmed live that when Branch/Department
   * already match the client's own inherited assignment, the row saves
   * instantly (no `.editingRow` state at all) with Name/Responsibility still
   * live, selectable dropdowns showing "Unassigned" — not plain text. Using
   * `.grid_row:not(.addNewRow)` instead matches the row in either state. */
  private get editingRow() {
    return this.page.locator('.grid_row.editingRow, .grid_row.altRow, .grid_row:not(.addNewRow)').last();
  }

  /** The Primary column's checkmark icon (`.grid_cell:nth-child(1)`) — shown as
   * already checked, but per live guidance needs an explicit click to actually
   * confirm the row as primary before Next will advance the wizard. */
  get assignmentRowPrimaryCheckmark() {
    return this.editingRow.locator('.grid_cell:nth-child(1), input[type="checkbox"]').first();
  }

  /* Each getter below targets the outer `.v-select` wrapper (not the inner
   * `.vs__dropdown-toggle`) — the wrapper is the shared ancestor of both the
   * search input and the (sibling, not descendant) `.vs__dropdown-menu`/listbox.
   * `.vs__dropdown-menu` is a GLOBAL class shared by every vue-select instance
   * on the page and a closed instance's menu can linger in the DOM — scoping
   * both the input and the option list to the same wrapper (see
   * policyLifecycle.page.ts's selectDropdownOption) is required, or a search
   * can silently read/click a *different*, stale dropdown's leftover options.
   * Confirmed via live DOM dump — this screen has no selector table. */
  get assignmentRowBranchToggle() {
    return this.editingRow.locator('.grid_cell:nth-child(2) .v-select');
  }

  get assignmentRowNameToggle() {
    return this.editingRow.locator('.grid_cell:nth-child(3) .v-select');
  }

  get assignmentRowDepartmentToggle() {
    return this.editingRow.locator('.grid_cell:nth-child(4) .v-select');
  }

  get assignmentRowResponsibilityToggle() {
    return this.editingRow.locator('.grid_cell:nth-child(6) .v-select');
  }

  /** Confirms (checkmark icon, the first of the two rowActions svgs) the
   * currently-open inline assignment row — the second svg is cancel/discard. */
  get confirmAssignmentRowButton() {
    return this.editingRow.locator('.grid_cell.rowActions svg').first();
  }

  // --- Step 3: "Select Product" ---

  get productToggle() {
    return this.page.getByRole('combobox', { name: /search for option/i })
      .or(this.page.locator('.v-select'))
      .or(this.page.getByRole('combobox'))
      .first();
  }

  lobCheckbox(lobText: string) {
    return this.page.locator(`label:has-text('${lobText}') input[type="checkbox"], .grid_row:has-text('${lobText}') input[type="checkbox"], .grid_cell:has-text('${lobText}') input[type="checkbox"]`)
      .or(this.page.getByRole('checkbox', { name: lobText }))
      .or(this.page.locator(`label:has-text('${lobText}')`))
      .or(this.page.locator(`text='${lobText}'`));
  }

  get lobFilterInput() {
    return this.page.getByPlaceholder('Search for LOBs');
  }

  // --- Opportunity Detail header ---

  get opportunityStatusText() {
    return this.page.locator(".form_group:has-text('Status')").first();
  }

  get opportunityStageText() {
    return this.page.getByText(/^(Application|Marketing|Binding)$/).first();
  }

  marketingTabLink() {
    return this.page.getByRole('tab', { name: /Marketing/i })
      .or(this.page.locator('.stepper, .tab_navigation, nav, .tabs').getByText(/Marketing/i))
      .or(this.page.getByText('2. Marketing'))
      .or(this.page.getByText('Marketing', { exact: true }));
  }

  bindingTabLink() {
    return this.page.getByRole('tab', { name: /Binding/i })
      .or(this.page.locator('.stepper, .tab_navigation, nav, .tabs').getByText(/Binding/i))
      .or(this.page.getByText('3. Binding'))
      .or(this.page.getByText('Binding', { exact: true }));
  }

  // --- Marketing tab ---

  get manualQuoteButton() {
    return this.page.getByRole('button', { name: 'Manual Quote', exact: true });
  }

  get quotesGridRow() {
    return this.page.locator('.grid_row:not(.headerRow):not(.header_row):not(.addNewRow), [role="row"]:not(.headerRow)');
  }

  // --- Manual Quote modal ---

  get manualQuoteModal() {
    return this.page.locator('div, section, article')
      .filter({ has: this.page.getByRole('button', { name: 'Save', exact: true }) })
      .filter({ hasText: 'Manual Quote' })
      .filter({ hasText: 'Issuing Carrier' })
      .last();
  }

  get issuingCarrierToggle() {
    return this.page.getByText(/Issuing Carrier/i)
      .locator('..')
      .locator('[role="combobox"], .v-select')
      .first()
      .or(this.manualQuoteModal.getByRole('combobox').first());
  }

  get linesOfBusinessField() {
    return this.page.getByText(/Lines of Business/i)
      .locator('..')
      .locator('input')
      .first()
      .or(this.manualQuoteModal.locator('input').nth(1));
  }

  get quoteStatusToggle() {
    return this.page.getByText(/Quote Status/i)
      .locator('..')
      .locator('[role="combobox"], .v-select')
      .first()
      .or(this.manualQuoteModal.getByRole('combobox').nth(1));
  }

  get saveQuoteButton() {
    return this.page.getByRole('button', { name: 'Save', exact: true });
  }

  // --- Quote row actions (Bind) ---

  quoteRowMenuButtonFor(carrierName?: string) {
    const row = carrierName ? this.quotesGridRow.filter({ hasText: carrierName }).first() : this.quotesGridRow.first();
    return row.locator('.action_context, [aria-label="menu"], svg.fa-bars, .rowActions, .grid_cell:last-child').first();
  }

  get quoteRowMenuButton() {
    return this.quoteRowMenuButtonFor();
  }

  get bindMenuItem() {
    return this.page.getByText(/^Bind$/i)
      .or(this.page.locator(':text-is("Bind")'))
      .or(this.page.getByRole('menuitem', { name: /bind/i }))
      .first();
  }

  // --- "In Force Quote" modal (opened by both BIND and "In Force Policy") ---

  get inForceQuoteModal() {
    return this.page.locator('div, section, article')
      .filter({ hasText: 'In Force Quote' })
      .filter({ has: this.page.getByRole('button', { name: /In Force|Cancel/ }) })
      .last();
  }

  get billingCarrierToggle() {
    return this.page.getByText(/Billing Carrier/i)
      .locator('..')
      .locator('[role="combobox"], .v-select')
      .first()
      .or(this.inForceQuoteModal.getByRole('combobox').first());
  }

  get inForceConfirmButton() {
    return this.inForceQuoteModal.getByRole('button', { name: 'In Force', exact: true })
      .or(this.page.getByRole('button', { name: 'In Force', exact: true })).first();
  }

  get cancelModalButton() {
    return this.inForceQuoteModal.getByRole('button', { name: 'Cancel', exact: true })
      .or(this.page.getByRole('button', { name: 'Cancel', exact: true })).first();
  }

  // --- Binding tab ---

  get inForcePolicyButton() {
    return this.page.getByRole('button', { name: /In Force Policy/i })
      .or(this.page.getByText(/In Force Policy/i))
      .first();
  }

  // --- Toasts / error surface ---

  get errorToast() {
    return this.page.getByText(/unexpected error occurred/i);
  }

  // --- Policies tab & Grid (Phases 6–10) ---

  get policiesTabLink() {
    return this.page.getByRole('tab', { name: 'Policies' })
      .or(this.page.getByText('POLICIES', { exact: true }))
      .or(this.page.locator("a[href*='/policies']"));
  }

  policyRow(policyNumber?: string) {
    if (policyNumber) {
      return this.page.locator('.grid_row', { hasText: policyNumber });
    }
    return this.page.locator('.grid_row').first();
  }

  policyRowExpandCaret(policyNumber?: string) {
    return this.policyRow(policyNumber).locator('.expand_caret, [aria-label="expand"], .row_expand, svg').first();
  }

  policyRowMenuButtonFor(policyNumber?: string) {
    return this.policyRow(policyNumber).locator('.action_context, [aria-label="menu"], button:has-text("≡")').first();
  }

  get servicingToolbar() {
    return this.page.locator('.servicing_actions, .servicing_toolbar, .action_bar:has-text("Servicing")');
  }

  get servicingEndorseButton() {
    return this.page.getByRole('button', { name: 'Endorse', exact: true })
      .or(this.page.getByRole('menuitem', { name: 'Endorse', exact: true }))
      .or(this.page.getByText('Endorse', { exact: true }));
  }

  get servicingEditButton() {
    return this.page.getByRole('button', { name: 'Edit', exact: true })
      .or(this.page.getByRole('menuitem', { name: 'Edit', exact: true }))
      .or(this.page.getByText('Edit', { exact: true }));
  }

  get servicingRenewButton() {
    return this.page.getByRole('button', { name: 'Renew', exact: true })
      .or(this.page.getByRole('menuitem', { name: 'Renew', exact: true }))
      .or(this.page.getByText('Renew', { exact: true }));
  }

  get servicingCancelButton() {
    return this.page.getByRole('button', { name: /Cancel Policy|Cancel/i })
      .or(this.page.getByRole('menuitem', { name: /Cancel/i }))
      .or(this.page.getByText('Cancel Policy', { exact: true }));
  }

  // --- Phase 6: Endorsement Form & Pending Record ---

  get desiredEffectiveDateInput() {
    return this.page.locator(".form_group:has-text('Desired Effective') input")
      .or(this.page.getByLabel(/Desired Effective/i));
  }

  get endorsementDescriptionInput() {
    return this.page.locator(".form_group:has-text('Description') input")
      .or(this.page.getByLabel(/Description/i));
  }

  get endorsementNotesTextarea() {
    return this.page.locator(".form_group:has-text('Notes') textarea")
      .or(this.page.getByLabel(/Notes/i));
  }

  get createEndorsementButton() {
    return this.page.getByRole('button', { name: 'Create Endorsement', exact: true });
  }

  get pendingEndorsementBadge() {
    return this.page.getByText('PENDING ENDORSEMENT', { exact: true })
      .or(this.page.locator('.status_badge:has-text("PENDING ENDORSEMENT")'));
  }

  get postEndorsementButton() {
    return this.page.getByRole('button', { name: 'Post', exact: true });
  }

  get submitEndorsementButton() {
    return this.page.getByRole('button', { name: 'Submit', exact: true });
  }

  get abortEndorsementButton() {
    return this.page.getByRole('button', { name: /Abort Pending Endorsement|Abort/i });
  }

  // --- Phase 7: Policy Edit ---

  get createEditButton() {
    return this.page.getByRole('button', { name: /Create Edit|Save/i });
  }

  get postEditButton() {
    return this.page.getByRole('button', { name: 'Post', exact: true });
  }

  // --- Phase 8: Renewal ---

  get createRenewalButton() {
    return this.page.getByRole('button', { name: /Create Renewal|Renew/i });
  }

  get postRenewalButton() {
    return this.page.getByRole('button', { name: 'Post', exact: true });
  }

  // --- Phase 9: Cancellation ---

  get cancellationReasonToggle() {
    return this.page.locator(".form_group:has-text('Cancellation Reason') .v-select, .form_group:has-text('Reason') .v-select");
  }

  get cancellationMethodToggle() {
    return this.page.locator(".form_group:has-text('Cancellation Method') .v-select, .form_group:has-text('Method') .v-select");
  }

  get cancellationStatusToggle() {
    return this.page.locator(".form_group:has-text('Status') .v-select");
  }

  get createCancellationButton() {
    return this.page.getByRole('button', { name: /Create Cancellation|Cancel Policy/i });
  }

  get postCancellationButton() {
    return this.page.getByRole('button', { name: 'Post', exact: true });
  }

  get cancelledStatusBadge() {
    return this.page.getByText('CANCELLED', { exact: true })
      .or(this.page.locator('.status_badge:has-text("CANCELLED")'));
  }

  // --- Phase 10: Rewrite ---

  get rewritePrimaryStateToggle() {
    return this.page.locator(".form_group:has-text('Primary State') .v-select, .form_group:has-text('State') .v-select");
  }

  get createRewriteButton() {
    return this.page.getByRole('button', { name: /Create Rewrite|Rewrite/i });
  }

  get postRewriteButton() {
    return this.page.getByRole('button', { name: 'Post', exact: true });
  }
}

