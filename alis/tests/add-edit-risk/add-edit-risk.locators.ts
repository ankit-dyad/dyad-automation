import type { Page } from '@playwright/test';

/**
 * Locator definitions for the Add/Edit Risk screen — a separate Angular tab
 * (`ALIS.RD`) opened from an existing Quote/option's Risk/Option Detail page
 * (see add-edit-risk.md's Overview, and market-selection.md for how an
 * option is created in the first place).
 *
 * <!-- fragile --> Every locator below is taken VERBATIM from a
 * user-supplied Playwright codegen recording — per explicit instruction,
 * these are used exactly as Playwright itself generated them rather than
 * rewritten into role/label-based equivalents, because this screen is a
 * legacy ASP.NET WebForms app embedded in an iframe
 * (`ctl01_ContentPlaceHolder1_...`-style ids), and prior attempts at more
 * "semantic" locators on screens like this one have proven less reliable in
 * practice than the codegen's own recorded ids.
 *
 * This file was rebuilt 2026-09-25 against a SECOND, more complete codegen
 * recording (the first recording's Limits/Deductibles ids all carried over
 * unchanged; the Location/Classification section below was rewritten to
 * match this second recording exactly, including a classification
 * suggestion-click step the first recording never showed). That second
 * recording continues on past this screen into Rate Summary, Terms & Forms,
 * and Bind & Invoice — none of that is reflected here, since this file only
 * covers the Add/Edit Risk screen; those later screens are their own
 * not-yet-built features.
 */
export class AddEditRiskLocators {
  constructor(private readonly page: Page) {}

  /** The coverage tab within the new ALIS.RD tab (e.g. "COMMERCIAL GENERAL
   * LIABILITY") — a `<li>` matched by its own text, exactly as recorded in
   * the FIRST codegen recording.
   *
   * <!-- fragile --> Not clicked by add-edit-risk.page.ts's current
   * fillLimitsAndDeductibles() — the second, more complete codegen recording
   * this file was rebuilt from never shows a coverage-tab click at all; it
   * opens the popup already positioned on the Limits/Deductibles view (the
   * popup's own URL loads the "cgl" risk directly — see openAddEditRisk() in
   * add-edit-risk.page.ts) and fills fields immediately. Kept as a
   * documented alternative in case a quote with more than one coverage ever
   * needs an explicit tab switch. */
  coverageTab(label: string) {
    return this.page.locator('li').filter({ hasText: label });
  }

  /** All of this screen's actual form content lives inside this iframe. */
  get riskFrame() {
    return this.page.locator('iframe[name="riskIframe"]').contentFrame();
  }

  /** Confirms the Limits/Deductibles view is what's actually showing before
   * filling it — a soft precondition check matching the second codegen
   * recording's own `expect(...getByText('Limits/Deductibles Of')).toBeVisible()`,
   * not a control that gets clicked. */
  get limitsAndDeductiblesHeading() {
    return this.riskFrame.getByText('Limits/Deductibles Of');
  }

  /** <!-- fragile --> Not used by the current flow (see coverageTab's own
   * note on why no tab click happens) — kept as a documented alternative for
   * a screen that lands somewhere other than Limits/Deductibles by default. */
  get limitsAndDeductiblesTab() {
    return this.riskFrame.getByRole('link', { name: 'Limits/Deductibles' });
  }

  get locationClassificationTab() {
    return this.riskFrame.getByRole('link', { name: 'Location/Classification' });
  }

  // ---------------------------------------------------------------------
  // Limits/Deductibles tab fields — ids exactly as recorded, confirmed
  // identical across both codegen recordings.
  // ---------------------------------------------------------------------

  get generalAggregateField() {
    return this.riskFrame.locator('#ctl01_ContentPlaceHolder1_tbcgl_tbpnlLimDeduct_txtGenAgg');
  }

  get productsCompletedOperationsAggregateField() {
    return this.riskFrame.locator('#ctl01_ContentPlaceHolder1_tbcgl_tbpnlLimDeduct_txtProdComp');
  }

  get personalAdvertisingInjuryField() {
    return this.riskFrame.locator('#ctl01_ContentPlaceHolder1_tbcgl_tbpnlLimDeduct_txtPerAdv');
  }

  get eachOccurrenceField() {
    return this.riskFrame.locator('#ctl01_ContentPlaceHolder1_tbcgl_tbpnlLimDeduct_txtEachOcc');
  }

  get damageToRentedPremisesField() {
    return this.riskFrame.locator('#ctl01_ContentPlaceHolder1_tbcgl_tbpnlLimDeduct_txtDmg');
  }

  /** <!-- fragile --> Recorded only as a single click, no fill, in the FIRST
   * codegen recording — it doesn't make clear which checkbox/option this
   * corresponds to (add-edit-risk.md lists several Incl/Excl checkboxes on
   * this tab, e.g. Professional Limit's "Excl", pre-checked by default). The
   * second recording never touches this field at all. Exposed under its raw
   * id rather than a guessed semantic name; not driven by
   * add-edit-risk.page.ts's current fillLimitsAndDeductibles() — confirm
   * what this actually toggles before relying on it. */
  get td124() {
    return this.riskFrame.locator('#ctl01_ContentPlaceHolder1_tbcgl_tbpnlLimDeduct_Td124');
  }

  get medicalExpenseField() {
    return this.riskFrame.locator('#ctl01_ContentPlaceHolder1_tbcgl_tbpnlLimDeduct_txtMedExp');
  }

  get bodilyInjuryPropertyDamageDeductibleField() {
    return this.riskFrame.locator('#ctl01_ContentPlaceHolder1_tbcgl_tbpnlLimDeduct_txtprprtydamagebodilyinjryded');
  }

  /** A native `<select>` — recorded as `selectOption('1')` in both codegen
   * recordings, a raw option value, not a visible label (add-edit-risk.md
   * documents this same dropdown as not behaving like a normal clickable one
   * in this build). */
  get deductibleBasisDropdown() {
    return this.riskFrame.locator('#ctl01_ContentPlaceHolder1_tbcgl_tbpnlLimDeduct_rdPerEach');
  }

  /** <!-- fragile --> The LOWER of this tab's two Save buttons, per
   * add-edit-risk.md's own CAUTION section: clicking the UPPER Save (the
   * one that saves the embedded Additional Insured panel) risked a real
   * browser/tab freeze in a prior pass. This id is the one confirmed to
   * produce the "Limits/deductibles saved Successfully" toast, and matches
   * both codegen recordings exactly — never substitute a different Save
   * button on this tab. */
  get limitsAndDeductiblesSaveButton() {
    return this.riskFrame.locator('#ctl01_ContentPlaceHolder1_tbcgl_tbpnlLimDeduct_btnGlLimDedSave');
  }

  // ---------------------------------------------------------------------
  // Location/Classification tab — this section rewritten 2026-09-25 to
  // match the second codegen recording exactly (see this class's own
  // top-of-file comment).
  // ---------------------------------------------------------------------

  /** Soft precondition check that the Location/Classification view actually
   * rendered — matches the second recording's own
   * `expect(...getByText('Locations')).toBeVisible()` exactly (a plain text
   * match, not a role-based cell lookup like this project's earlier,
   * unverified guess). */
  get locationsHeading() {
    return this.riskFrame.getByText('Locations');
  }

  get addLocationLink() {
    return this.riskFrame.getByRole('link', { name: 'Add Location' });
  }

  get copyPhysicalAddressCheckbox() {
    return this.riskFrame.getByRole('checkbox', { name: 'Copy Physical Address' });
  }

  /** <!-- fragile --> Generic `Save` button, reused for BOTH the Add
   * Location save and the Add Classification save — confirmed by the second
   * codegen recording, which clicks a `getByRole('button', { name: 'Save' })`
   * with this exact same accessible name at both points in the flow. Safe
   * because only one Save button is visible/relevant at a time (Location's
   * own save panel closes before Add Classifications is opened). */
  get saveButton() {
    return this.riskFrame.getByRole('button', { name: 'Save' });
  }

  get addClassificationsLink() {
    return this.riskFrame.getByRole('link', { name: 'Add Classifications' });
  }

  /** Scope for confirming the Location grid saved under General Liability
   * before adding a classification against it. This project's own
   * additional verification, not sourced from either codegen recording —
   * harmless and doesn't conflict with anything either recording shows. */
  get locationTable() {
    return this.riskFrame.locator('#ctl01_ContentPlaceHolder1_tbcgl_tbpnlLocation_Table1');
  }

  get generalLiabilityCellInLocationTable() {
    return this.locationTable.getByRole('cell', { name: 'General Liability' });
  }

  /** The Classification type-ahead SEARCH field (id says "ClassNo", but
   * it's the search box) — confirmed identical id across both recordings.
   * The FIRST recording typed a full description string directly with no
   * suggestion click; the SECOND recording (this rebuild's source of truth
   * for this section) types a short numeric code ("63010") and then DOES
   * click a resulting suggestion — see classSuggestion() below. */
  get classNameSearchField() {
    return this.riskFrame.locator('//input[@id="ctl01_ContentPlaceHolder1_tbcgl_tbpnlLocation_txtGLClassNo"]');
  }

  /** The type-ahead suggestion row clicked after typing into
   * classNameSearchField — e.g. `classSuggestion('(63010) Dwellings - 1 family')`.
   * This is the click step the earlier build of this feature was missing:
   * the first codegen recording never showed it, so add-edit-risk.page.ts's
   * addClassification() previously filled classCode/classDesc fields
   * directly instead (guessed ids, `txtGLClasscode`/`txtGLClassDesc`, that
   * never actually appear in either recording). The second recording shows
   * plainly that clicking this suggestion is the real step — it's what
   * populates the Premium Code / Exposure / Min Premium fields below, not a
   * pair of separate classCode/classDesc textboxes. `text` should be a
   * substring of the suggestion's own text (getByText matches
   * case-insensitive substrings by default), matching how the codegen
   * recording itself only captured a shortened version of the full label. */
  classSuggestion(text: string) {
    return this.riskFrame.getByText(text);
  }

  /** A native `<select>` — recorded as `selectOption('T')`, a raw option
   * value, not a visible label (same pattern as deductibleBasisDropdown). */
  get premiumCodeDropdown() {
    return this.riskFrame.locator('#ctl01_ContentPlaceHolder1_tbcgl_tbpnlLocation_ddlPremCode');
  }

  get exposureField() {
    return this.riskFrame.locator('#ctl01_ContentPlaceHolder1_tbcgl_tbpnlLocation_txtExposure');
  }

  get minPremiumField() {
    return this.riskFrame.locator('#ctl01_ContentPlaceHolder1_tbcgl_tbpnlLocation_txtMinPrem');
  }

  /** The popup tab's OWN "Close & Apply" button — lives outside
   * riskFrame, on `page1` itself in the codegen recording
   * (`await page1.getByRole('button', { name: ' Close & Apply' }).click();`),
   * not inside the iframe like every other control on this screen. This is
   * how the recording actually exits Add/Edit Risk: it never calls
   * `page.close()` — clicking this button is what saves/applies the Risk
   * changes back to the Quote/option (the very next recorded step happens
   * back on the ORIGINAL tab, not a freshly-closed one). See
   * add-edit-risk.page.ts's closeAndApply(). */
  get closeAndApplyButton() {
    return this.page.getByRole('button', { name: ' Close & Apply' });
  }
}