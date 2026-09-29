import type { Page } from '@playwright/test';
import { BasePage } from '../../../framework/pages/BasePage';
import { AddEditRiskLocators } from './add-edit-risk.locators';

/** Plain input shape for the Limits/Deductibles tab — the spec builds this
 * from alis/knowledge/add-edit-risk.json. Kept independent of the JSON's own
 * shape so this Page Object has no test-data knowledge of its own (see
 * BasePage's rules). Values are plain numeric strings, exactly as typed by
 * the codegen recording this was built from. */
export interface LimitsAndDeductiblesInput {
  generalAggregate: string;
  productsCompletedOperationsAggregate: string;
  personalAdvertisingInjury: string;
  eachOccurrence: string;
  damageToRentedPremises: string;
  medicalExpense: string;
  bodilyInjuryPropertyDamageDeductible: string;
  /** Raw `<select>` option value (e.g. "1"), not a visible label — see
   * add-edit-risk.locators.ts's deductibleBasisDropdown comment. */
  deductibleBasisValue: string;
}

/** Plain input shape for adding one General Liability classification.
 *
 * Rebuilt 2026-09-25 against a second, more complete codegen recording that
 * showed this screen's real flow: type a numeric class code into the
 * search field, click the resulting suggestion, then fill Premium
 * Code/Exposure/Min Premium — not the classCode/classDesc textbox pair this
 * project originally guessed at (see add-edit-risk.locators.ts's
 * classSuggestion() comment for the full story). */
export interface ClassificationInput {
  /** What's typed into the ClassNo type-ahead search field, e.g. "63010". */
  classCodeSearch: string;
  /** Substring of the suggestion row's own text to click after typing, e.g.
   * "(63010) Dwellings - 1 family". */
  suggestionText: string;
  /** Raw `<select>` option value for Premium Code (e.g. "T"), not a visible
   * label — same convention as deductibleBasisValue above. */
  premiumCodeValue: string;
  exposure: string;
  minPremium: string;
}

/**
 * Page Object for the Add/Edit Risk screen (`ALIS.RD`), opened in its own
 * browser tab from an existing option's Risk/Option Detail page (see
 * market-selection.page.ts for how an option is created). Actions only — no
 * assertions, no JSON imports, no test data (see BasePage's rules).
 *
 * Unlike every other Page Object in this project, this one is constructed
 * against the POPUP tab's own `Page`, not the main submission tab's — use
 * the standalone openAddEditRisk() helper below to get that `Page` first.
 *
 * <!-- fragile --> Built from two user-supplied Playwright codegen
 * recordings (2026-09-25). The first covered Limits/Deductibles and a first,
 * incomplete pass at Location/Classification; the second was a fuller,
 * cleaner recording that confirmed the Limits/Deductibles ids unchanged and
 * corrected the Location/Classification flow (a real suggestion-click step
 * this project's first build had missed). Everything below now matches the
 * second recording's literal steps. Obviously accidental noise in that
 * recording (a classification search field retyped three times with typo
 * corrections) was collapsed to its final value; nothing else was altered.
 */
export class AddEditRiskPage extends BasePage {
  private readonly locators: AddEditRiskLocators;

  constructor(page: Page) {
    super(page);
    this.locators = new AddEditRiskLocators(page);
  }

  /** Clicks the given coverage's tab within the Add/Edit Risk screen (e.g.
   * "COMMERCIAL GENERAL LIABILITY") — recorded as a plain `<li>` text match
   * in the FIRST codegen recording, not a role-based one, since this
   * screen's coverage tabs don't expose an accessible role/name the way
   * most of this app's other controls do.
   *
   * <!-- fragile --> Not called by default anywhere in this project's
   * add-edit-risk.test.ts — the second, more complete recording never shows
   * a coverage-tab click at all (see add-edit-risk.locators.ts's
   * coverageTab() comment for why). Kept here for a quote with more than one
   * coverage, where an explicit tab switch may turn out to be necessary. */
  async selectCoverage(label: string): Promise<void> {
    await this.click(this.locators.coverageTab(label));
  }

  /** Fills the Limits/Deductibles tab's plain currency textboxes and the
   * Deductible Basis dropdown, then clicks ONLY the lower Save button — see
   * add-edit-risk.locators.ts's limitsAndDeductiblesSaveButton comment for
   * why the upper one must never be used on this screen.
   *
   * No tab-switch click happens first — both codegen recordings land
   * directly on this view when the popup opens (see
   * add-edit-risk.locators.ts's coverageTab()/limitsAndDeductiblesTab()
   * comments), so this method only waits for it to actually be visible
   * before typing. */
  async fillLimitsAndDeductibles(input: LimitsAndDeductiblesInput): Promise<void> {
    await this.waitForVisible(this.locators.limitsAndDeductiblesHeading, 15000);

    await this.enter(this.locators.generalAggregateField, input.generalAggregate);
    await this.enter(this.locators.productsCompletedOperationsAggregateField, input.productsCompletedOperationsAggregate);
    await this.enter(this.locators.personalAdvertisingInjuryField, input.personalAdvertisingInjury);
    await this.enter(this.locators.eachOccurrenceField, input.eachOccurrence);
    await this.enter(this.locators.damageToRentedPremisesField, input.damageToRentedPremises);
    await this.enter(this.locators.medicalExpenseField, input.medicalExpense);
    await this.enter(
      this.locators.bodilyInjuryPropertyDamageDeductibleField,
      input.bodilyInjuryPropertyDamageDeductible,
    );
    await this.select(this.locators.deductibleBasisDropdown, input.deductibleBasisValue);

    await this.click(this.locators.limitsAndDeductiblesSaveButton);
  }

  /** Adds one location under General Liability via "Copy Physical Address"
   * (auto-fills Address/City/State/Zip/Territory from the Insured's own
   * on-file address — see add-edit-risk.md for what this does and does not
   * reliably populate, e.g. County). Confirmed identical in both codegen
   * recordings. */
  async addLocationFromPhysicalAddress(): Promise<void> {
    await this.click(this.locators.locationClassificationTab);
    await this.waitForVisible(this.locators.locationsHeading, 15000);
    await this.click(this.locators.addLocationLink);
    await this.check(this.locators.copyPhysicalAddressCheckbox);
    await this.click(this.locators.saveButton);
  }

  /** Adds one General Liability classification against the just-saved
   * location — rebuilt 2026-09-25 to match the second codegen recording's
   * real flow: type the numeric class code, click the resulting suggestion
   * (this is what actually selects the classification — there are no
   * separate classCode/classDesc textboxes on this screen, unlike this
   * project's earlier guess), then fill in Premium Code, Exposure and Min
   * Premium and save. */

  async addClassification(input: ClassificationInput): Promise<void> {
    await this.page.waitForTimeout(2000);
    await this.click(this.locators.addClassificationsLink);

  // Real per-character keystrokes, not a plain fill() — this field's
  // suggestion dropdown is a legacy ASP.NET AJAX autocomplete that only
  // fires its lookup on actual keyup events per character, which fill()
  // never produces.
  await this.locators.classNameSearchField.click();
  await this.page.waitForTimeout(300);
  await this.locators.classNameSearchField.pressSequentially(input.classCodeSearch, { delay: 250 });

  const suggestion = this.locators.classSuggestion(input.suggestionText);
  await suggestion.waitFor({ state: 'visible', timeout: 10000 });
  await this.click(suggestion);
    await this.page.waitForTimeout(8000);
  await this.select(this.locators.premiumCodeDropdown, input.premiumCodeValue);
  await this.enter(this.locators.exposureField, input.exposure);
  await this.enter(this.locators.minPremiumField, input.minPremium);
  await this.click(this.locators.saveButton);
}
  /** Clicks the popup's own "Close & Apply" button — confirmed via codegen
   * as how this screen is actually exited. This saves/applies the Risk
   * changes back to the Quote/option; the recording never calls
   * `page.close()` on this tab, and its very next step continues on the
   * ORIGINAL submission tab, not a freshly-closed one. Use this instead of
   * closing the popup directly, or the Risk changes made above may not
   * actually get applied to the option. */
  async closeAndApply(): Promise<void> {
    await this.click(this.locators.closeAndApplyButton);
  }

  // -------------------------------------------------------------------
  // State getters / readers — exposed for the spec to assert on.
  // -------------------------------------------------------------------

  get generalLiabilityLocationSavedLocator() {
    return this.locators.generalLiabilityCellInLocationTable;
  }
}

/** Standalone helper, not a method on AddEditRiskPage: clicks the "Risk"
 * link on the ORIGINAL submission tab's Risk/Option Detail page and
 * captures the resulting popup tab, per add-edit-risk.md ("opens a new
 * browser tab running a separate, modern Angular application"). Callers
 * construct `new AddEditRiskPage(popup)` with the `Page` this returns — see
 * this file's own class comment for why. Confirmed identical (down to the
 * leading space in the link's accessible name) in both codegen recordings. */
export async function openAddEditRisk(originalPage: Page): Promise<Page> {
  const popupPromise = originalPage.waitForEvent('popup');
  await originalPage.getByRole('link', { name: ' Risk' }).click();
  const popup = await popupPromise;
  await popup.waitForLoadState();
  return popup;
}