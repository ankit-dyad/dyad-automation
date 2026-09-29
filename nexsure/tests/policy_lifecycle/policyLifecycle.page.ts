import type { Locator, Page } from '@playwright/test';
import { BasePage } from '../../../framework/pages/BasePage';
import { PolicyLifecycleLocators } from './policyLifecycle.locators';

/**
 * Page Object for the Nexsure full-policy-lifecycle flow, picking up right
 * after CreateClientPage's clickDone() — which, per
 * nexsure/knowledge/pages/assignment.md §5, redirects into a brand-new
 * "Opportunities: New" wizard (Select Client -> Select Assignment -> Select
 * Product) with the just-created client already selected. This page object
 * drives that wizard through to Create Opportunity, then the resulting
 * Opportunity Detail record's Marketing tab (Manual Quote) and Binding tab (Bind
 * / In Force). Built from opportunities_new.md, opportunity_application_page.md,
 * opportunity_marketing_page.md, opportunuty_quote_info.md, and
 * opportunity_marketing_binding.md.
 */
export class PolicyLifecyclePage extends BasePage {
  private readonly locators: PolicyLifecycleLocators;

  constructor(page: Page) {
    super(page);
    this.locators = new PolicyLifecycleLocators(page);
  }

  // --- Step 1: Select Client (client already selected via CreateClientPage) ---

  async clickNext(): Promise<void> {
    await this.click(this.locators.wizardNextButton);
  }

  // --- Step 2: Select Assignment ---

  /** Adds a new assignment row — Branch and Department arrive already filled,
   * inherited from the client's own Assignment step (see
   * createClientPage.selectBranch/selectDepartment in the test), and the row
   * auto-confirms instantly in that case (checkmark under Primary, no
   * `.editingRow` state, no separate confirm click needed or possible — see
   * confirmAssignmentRowButton's now-unused note). Name/Responsibility are left
   * at their "Unassigned" default here rather than edited on this row — live
   * confirmed that Next proceeds regardless (see assignment.md §4's documented
   * "validation display, not enforcement" pattern, which apparently extends to
   * this grid too). */
  async completeAssignmentStep(): Promise<void> {
    // 1. Wait until Step 2 is fully displayed and active
    await this.page.locator('strong:has-text("2. Select Assignment"), :text("2. Select Assignment")').first().waitFor({ state: 'visible', timeout: 10000 });

    // 2. Wait until the inherited assignment row is rendered and loaded
    await this.page.locator('.grid_row:not(.addNewRow)').first().waitFor({ state: 'visible', timeout: 10000 });
    await this.page.waitForLoadState('networkidle').catch(() => {});
    await this.page.waitForTimeout(1000);

    // 3. Dismiss any warning alert if already on screen
    const existingAlert = this.page.locator('.alertdialog');
    if (await existingAlert.isVisible().catch(() => false)) {
      await existingAlert.locator('img, button, .close').first().click().catch(() => {});
      await this.page.waitForTimeout(500);
    }

    // 4. Click Next to advance to Step 3
    await this.click(this.locators.wizardNextButton);

    // 5. If validation or warning alert appears, dismiss it and retry Next once
    const warning = this.page.locator('.alertdialog');
    if (await warning.isVisible({ timeout: 3000 }).catch(() => false)) {
      const closeImg = warning.locator('img, button, .close').first();
      if (await closeImg.isVisible().catch(() => false)) {
        await closeImg.click().catch(() => {});
      }
      await this.page.waitForTimeout(1000);
      await this.click(this.locators.wizardNextButton);
    }

    // 6. Wait until Step 3 is reached
    await this.locators.wizardCreateOpportunityButton
      .or(this.locators.lobFilterInput)
      .first()
      .waitFor({ state: 'visible', timeout: 15000 });
  }

  async addAssignment(assignment?: {
    branch?: string;
    department?: string;
    employee?: string;
    responsibility?: string;
  }): Promise<void> {
    const existingRows = this.page.locator('.grid_row:not(.addNewRow)');
    const count = await existingRows.count().catch(() => 0);

    if (count > 0) {
      // Row already inherited from client creation and saved.
      // If any row is accidentally in edit mode, cancel it.
      const cancelBtn = this.page.locator('.grid_row .rowActions svg').nth(1);
      if (await cancelBtn.isVisible().catch(() => false)) {
        await cancelBtn.click().catch(() => {});
      }
      return;
    }

    if (await this.locators.addAssignmentRowButton.isVisible().catch(() => false)) {
      await this.click(this.locators.addAssignmentRowButton);
    }
    if (assignment?.branch && await this.locators.assignmentRowBranchToggle.isVisible().catch(() => false)) {
      await this.selectDropdownOption(this.locators.assignmentRowBranchToggle, assignment.branch);
    }
    if (assignment?.department && await this.locators.assignmentRowDepartmentToggle.isVisible().catch(() => false)) {
      await this.selectDropdownOption(this.locators.assignmentRowDepartmentToggle, assignment.department);
    }
    if (assignment?.employee && await this.locators.assignmentRowNameToggle.isVisible().catch(() => false)) {
      await this.selectDropdownOption(this.locators.assignmentRowNameToggle, assignment.employee);
    }
    if (assignment?.responsibility && await this.locators.assignmentRowResponsibilityToggle.isVisible().catch(() => false)) {
      await this.selectDropdownOption(this.locators.assignmentRowResponsibilityToggle, assignment.responsibility);
    }
    if (await this.locators.confirmAssignmentRowButton.isVisible().catch(() => false)) {
      await this.click(this.locators.confirmAssignmentRowButton);
    }
    if (await this.locators.assignmentRowPrimaryCheckmark.isVisible().catch(() => false)) {
      await this.click(this.locators.assignmentRowPrimaryCheckmark);
    }
  }

  // --- Step 3: Select Product ---

  async selectProduct(product: string): Promise<void> {
    await this.selectDropdownOption(this.locators.productToggle, product);
  }

  /** Line(s) of Business list is scoped to whatever's already on the Opportunity
   * (Product-dependent) — filter, then check the matching option (see
   * opportunities_new.md's Flat View / Filter notes). */
  async selectLineOfBusiness(lob: string): Promise<void> {
    const filterInput = this.locators.lobFilterInput;
    if (await filterInput.isVisible().catch(() => false)) {
      await this.enter(filterInput, lob);
      await this.page.waitForTimeout(600);
    }
    const checkbox = this.locators.lobCheckbox(lob).first();
    await this.waitForVisible(checkbox);
    await this.click(checkbox);
    await this.page.waitForTimeout(500);
  }

  async clickCreateOpportunity(): Promise<void> {
    const createOppBtn = this.locators.wizardCreateOpportunityButton;
    if (await createOppBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await this.click(createOppBtn);
      return;
    }
    // If Skip Retail Agent was toggled off, Next is shown instead
    const nextBtn = this.locators.wizardNextButton;
    if (await nextBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      const skipToggle = this.page.getByText('Skip Retail Agent').or(this.page.locator('label:has-text("Skip Retail Agent")'));
      if (await skipToggle.isVisible().catch(() => false)) {
        await this.click(skipToggle);
        await this.page.waitForTimeout(500);
      }
      if (await createOppBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await this.click(createOppBtn);
        return;
      }
      // Otherwise advance to Step 4 and click Create Opportunity there
      await this.click(nextBtn);
      await this.page.waitForTimeout(1000);
      const closePopover = this.page.locator('.popover .close, .modal .close, button.close, [aria-label="Close"], .dialog_close').first();
      if (await closePopover.isVisible({ timeout: 2000 }).catch(() => false)) {
        await closePopover.click().catch(() => {});
      }
      await this.waitForVisible(createOppBtn, 10000);
      await this.click(createOppBtn);
    }
  }

  // --- Opportunity Detail ---

  async goToMarketingTab(): Promise<void> {
    await this.page.waitForTimeout(1000);
    const tab = this.locators.marketingTabLink().first();
    if (await tab.isVisible().catch(() => false)) {
      await this.click(tab);
      await this.page.waitForTimeout(1000);
    }
  }

  async goToBindingTab(): Promise<void> {
    await this.page.waitForTimeout(1000);
    const tab = this.locators.bindingTabLink().first();
    if (await tab.isVisible().catch(() => false)) {
      await this.click(tab);
      await this.page.waitForTimeout(1000);
    }
  }

  // --- Marketing tab: Manual Quote ---

  async openManualQuote(): Promise<void> {
    await this.click(this.locators.manualQuoteButton);
    await this.page.waitForTimeout(1000);
    // Identify opened quote popup by its header text and Issuing Carrier field:
    await this.page.getByText('Manual Quote').first().waitFor({ state: 'visible', timeout: 15000 });
    await this.page.getByText(/Issuing Carrier/i).first().waitFor({ state: 'visible', timeout: 15000 });
  }

  async fillManualQuote(opts: { issuingCarrier: string; lineOfBusiness: string }): Promise<void> {
    await this.selectDropdownOption(this.locators.issuingCarrierToggle, opts.issuingCarrier);
    const lobInput = this.locators.linesOfBusinessField;
    const currentVal = await lobInput.inputValue().catch(() => '');
    if (!currentVal || currentVal === 'Select') {
      await this.click(lobInput);
      await this.page.waitForTimeout(500);
      const lobOption = this.locators.manualQuoteModal
        .locator(`label:has-text('${opts.lineOfBusiness}'), input[type="checkbox"], li:has-text('${opts.lineOfBusiness}')`)
        .first();
      if (await lobOption.isVisible().catch(() => false)) {
        await this.click(lobOption);
        await this.page.waitForTimeout(500);
      }
      await this.locators.manualQuoteModal.locator('button:has-text("Save")').first().focus().catch(() => {});
    }
  }

  async saveQuote(): Promise<void> {
    await this.page.waitForTimeout(1000);
    const saveBtn = this.locators.saveQuoteButton;
    await saveBtn.waitFor({ state: 'visible', timeout: 15000 });
    await saveBtn.click({ force: true });
    await saveBtn.waitFor({ state: 'hidden', timeout: 30000 }).catch(() => {});
    await this.page.locator('.dynamicModal, [role="dialog"]').filter({ hasText: 'Manual Quote' }).waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
    await this.page.locator('.spinner, .loading, .v-spinner').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
    await this.page.waitForTimeout(1000);
  }

  // --- Bind ---

  async openQuoteRowMenu(carrierName?: string): Promise<void> {
    await this.page.waitForTimeout(1000);
    const menuBtn = this.locators.quoteRowMenuButtonFor(carrierName);
    await menuBtn.waitFor({ state: 'visible', timeout: 15000 });
    await menuBtn.click({ force: true });
    await this.page.waitForTimeout(1000);
  }

  async clickBind(): Promise<void> {
    await this.page.waitForTimeout(1000);
    await this.locators.bindMenuItem.waitFor({ state: 'visible', timeout: 8000 });
    await this.locators.bindMenuItem.click({ force: true });
    await this.page.waitForTimeout(1000);
    await this.page.getByText('In Force Quote').first().waitFor({ state: 'visible', timeout: 15000 });
  }

  /** Cancels out of the "In Force Quote" modal that Bind opens — per
   * opportunity_marketing_binding.md §6.1, the bind request itself (Status ->
   * "Bind Requested", Stage -> "Binding") is not gated on finalizing this modal,
   * so it's safe to cancel here and finish the actual In Force confirmation
   * later, on the Binding tab. */
  async cancelModal(): Promise<void> {
    await this.page.waitForTimeout(1000);
    await this.locators.cancelModalButton.click({ force: true });
    await this.page.getByText('In Force Quote').first().waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
    await this.page.waitForTimeout(1000);
  }

  // --- Binding tab: In Force ---

  async openInForcePolicy(): Promise<void> {
    await this.page.waitForTimeout(1000);
    await this.locators.inForcePolicyButton.click({ force: true });
    await this.page.waitForTimeout(1000);
    await this.page.getByText('In Force Quote').first().waitFor({ state: 'visible', timeout: 15000 });
  }

  async selectBillingCarrier(billingCarrier: string): Promise<void> {
    await this.selectDropdownOption(this.locators.billingCarrierToggle, billingCarrier);
  }

  /** Confirms In Force — per opportunity_marketing_binding.md §6.7, this
   * reproducibly errors in the QA tenant (server error, e.g. #260782741) while
   * still advancing the Opportunity's header Status to "Bound". Callers should
   * assert on that documented failure mode rather than assuming success. */
  async confirmInForce(): Promise<void> {
    await this.page.waitForTimeout(1000);
    await this.locators.inForceConfirmButton.click({ force: true });
    await this.page.waitForTimeout(1000);
  }

  /** Opens a vue-select dropdown by clicking its own search input directly
   * (clicking the outer `.vs__dropdown-toggle` div proved unreliable — see
   * live-run notes in policyLifecycle.locators.ts), types the option text to
   * filter (several of these lists — e.g. the assignment grid's Name roster —
   * are long/virtualized and won't render an unfiltered match into the DOM at
   * all), then clicks the matching option. `wrapper` must be the `.v-select`
   * container (not just the toggle) so the option list — a sibling of the
   * toggle, not a descendant — is scoped to *this* instance and not some other
   * (possibly stale/closed) vue-select's leftover `.vs__dropdown-menu`. */
  private async selectDropdownOption(wrapper: Locator, optionText: string): Promise<void> {
    await this.page.waitForTimeout(1000); // 1 sec wait before action
    const searchInput = wrapper.locator('input.vs__search, input[role="searchbox"], input').first();
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.click({ force: true }).catch(() => searchInput.focus());
      await this.page.waitForTimeout(500);
      await searchInput.fill(optionText);
      await this.page.waitForTimeout(1000);
    } else {
      await wrapper.click({ force: true });
      await this.page.waitForTimeout(1000);
    }
    const option = this.page.locator('.vs__dropdown-menu li, .vs__dropdown-option, [role="option"]')
      .filter({ hasText: optionText })
      .first();
    await option.waitFor({ state: 'visible', timeout: 10000 });
    await this.page.waitForTimeout(1000); // 1 sec wait before selecting option
    await option.click({ force: true });
    await this.page.waitForTimeout(1000); // 1 sec wait after selecting option
  }

  // --- Policies tab & Servicing (Phases 6–10) ---

  async goToPoliciesTab(): Promise<void> {
    await this.click(this.locators.policiesTabLink);
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async expandPolicyRow(policyNumber?: string): Promise<void> {
    const row = this.locators.policyRow(policyNumber);
    await this.click(row);
  }

  async openServicingAction(action: 'Endorse' | 'Edit' | 'Renew' | 'Cancel', policyNumber?: string): Promise<void> {
    await this.expandPolicyRow(policyNumber);
    if (action === 'Endorse') {
      await this.click(this.locators.servicingEndorseButton);
    } else if (action === 'Edit') {
      await this.click(this.locators.servicingEditButton);
    } else if (action === 'Renew') {
      await this.click(this.locators.servicingRenewButton);
    } else if (action === 'Cancel') {
      await this.click(this.locators.servicingCancelButton);
    }
  }

  // --- Phase 6: Endorsement ---

  async fillEndorsementForm(opts?: { desiredEffective?: string; description?: string; notes?: string }): Promise<void> {
    if (opts?.desiredEffective && await this.locators.desiredEffectiveDateInput.isVisible().catch(() => false)) {
      await this.enter(this.locators.desiredEffectiveDateInput, opts.desiredEffective);
    }
    if (opts?.description && await this.locators.endorsementDescriptionInput.isVisible().catch(() => false)) {
      await this.enter(this.locators.endorsementDescriptionInput, opts.description);
    }
    if (opts?.notes && await this.locators.endorsementNotesTextarea.isVisible().catch(() => false)) {
      await this.enter(this.locators.endorsementNotesTextarea, opts.notes);
    }
    await this.click(this.locators.createEndorsementButton);
    await this.waitForVisible(this.locators.pendingEndorsementBadge);
  }

  async postEndorsement(): Promise<void> {
    await this.click(this.locators.postEndorsementButton);
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  // --- Phase 7: Policy Edit ---

  async createPolicyEdit(): Promise<void> {
    if (await this.locators.createEditButton.isVisible().catch(() => false)) {
      await this.click(this.locators.createEditButton);
    }
  }

  async postPolicyEdit(): Promise<void> {
    if (await this.locators.postEditButton.isVisible().catch(() => false)) {
      await this.click(this.locators.postEditButton);
    }
  }

  // --- Phase 8: Renewal ---

  async createRenewal(): Promise<void> {
    if (await this.locators.createRenewalButton.isVisible().catch(() => false)) {
      await this.click(this.locators.createRenewalButton);
    }
  }

  async postRenewal(): Promise<void> {
    if (await this.locators.postRenewalButton.isVisible().catch(() => false)) {
      await this.click(this.locators.postRenewalButton);
    }
  }

  // --- Phase 9: Cancellation ---

  async fillCancellationForm(opts: { reason: string; method: string; status?: string }): Promise<void> {
    if (await this.locators.cancellationReasonToggle.isVisible().catch(() => false)) {
      await this.selectDropdownOption(this.locators.cancellationReasonToggle, opts.reason);
    }
    if (await this.locators.cancellationMethodToggle.isVisible().catch(() => false)) {
      await this.selectDropdownOption(this.locators.cancellationMethodToggle, opts.method);
    }
    if (opts.status && await this.locators.cancellationStatusToggle.isVisible().catch(() => false)) {
      await this.selectDropdownOption(this.locators.cancellationStatusToggle, opts.status);
    }
    if (await this.locators.createCancellationButton.isVisible().catch(() => false)) {
      await this.click(this.locators.createCancellationButton);
    }
  }

  async postCancellation(): Promise<void> {
    if (await this.locators.postCancellationButton.isVisible().catch(() => false)) {
      await this.click(this.locators.postCancellationButton);
    }
  }

  // --- Phase 10: Rewrite ---

  async fillRewriteForm(opts: { primaryState: string }): Promise<void> {
    if (await this.locators.rewritePrimaryStateToggle.isVisible().catch(() => false)) {
      await this.selectDropdownOption(this.locators.rewritePrimaryStateToggle, opts.primaryState);
    }
    if (await this.locators.createRewriteButton.isVisible().catch(() => false)) {
      await this.click(this.locators.createRewriteButton);
    }
  }

  async postRewrite(): Promise<void> {
    if (await this.locators.postRewriteButton.isVisible().catch(() => false)) {
      await this.click(this.locators.postRewriteButton);
    }
  }

  /** Exposed for the spec to assert on — assertions belong in the test, not here. */
  get opportunityStatusLocator() {
    return this.locators.opportunityStatusText;
  }

  get quotesGridRowLocator() {
    return this.locators.quotesGridRow;
  }

  get inForcePolicyButtonLocator() {
    return this.locators.inForcePolicyButton;
  }

  get errorToastLocator() {
    return this.locators.errorToast;
  }

  get policiesTabLinkLocator() {
    return this.locators.policiesTabLink;
  }

  policyRowLocator(policyNumber?: string) {
    return this.locators.policyRow(policyNumber);
  }

  get pendingEndorsementBadgeLocator() {
    return this.locators.pendingEndorsementBadge;
  }

  get postEndorsementButtonLocator() {
    return this.locators.postEndorsementButton;
  }

  get cancelledStatusBadgeLocator() {
    return this.locators.cancelledStatusBadge;
  }
}

