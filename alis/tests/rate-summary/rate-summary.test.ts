import { test, expect } from '../../../framework/fixtures';
import { getCredential } from '../../../framework/utils/env';
import { resolvePlaceholders } from '../../../framework/utils/dates';
import { LoginPage } from '../login/login.page';
import { CreateSubmissionPage } from '../create-submission/create-submission.page';
import type { AccountInformationInput, InsuredDetailsInput } from '../create-submission/create-submission.page';
import { AddQuotePage } from '../add-quote/add-quote.page';
import type { AddQuoteInput } from '../add-quote/add-quote.page';
import { MarketSelectionPage } from '../market-selection/market-selection.page';
import type { MarketSelectionInput } from '../market-selection/market-selection.page';
import { AddEditRiskPage, openAddEditRisk } from '../add-edit-risk/add-edit-risk.page';
import type { LimitsAndDeductiblesInput, ClassificationInput } from '../add-edit-risk/add-edit-risk.page';
import { RateSummaryPage, openRateSummary } from './rate-summary.page';
import type { RateSummaryExpectation } from './rate-summary.page';
import createSubmissionRawData from '../../knowledge/create-submission.json';
import addQuoteRawData from '../../knowledge/add-quote.json';
import addEditRiskRawData from '../../knowledge/add-edit-risk.json';
import rateSummaryRawData from '../../knowledge/rate-summary.json';

/**
 * Rate Summary, like every feature since Market Selection, has no page of
 * its own to land on directly — it's opened from the option's Risk/Option
 * Detail page via the rate icon, which itself only exists once a market has
 * been attached and a Risk saved (see add-edit-risk.test.ts). Per this
 * project's standing decision to keep every screen as its own fully
 * separate feature, this spec chains the full prior flow from scratch —
 * Login → Create Submission → Add Quote → Market Selection → Add/Edit Risk
 * → Rate Summary.
 *
 * <!-- fragile --> Built from a user-supplied Playwright codegen recording
 * (2026-09-25), NOT independently live-verified — see rate-summary.page.ts
 * and rate-summary.locators.ts's own notes on which locators are still
 * exploratory. This could not be run live before delivery either: running
 * this suite means logging into a real environment, and entering login
 * credentials on the assistant's part isn't something done on the user's
 * behalf regardless of permission — see this project's own conversation
 * record. Treat a first real run of this feature as fully exploratory.
 *
 * Per alis/knowledge/rate-summary.json's own explicit "compareToDisplayed"
 * instruction: premium/rate FIGURES on this screen vary run to run (carrier
 * rating tables change over time) and must never be asserted as fixed
 * constants. This spec only verifies (a) the quote's identifying details
 * match what was actually entered earlier in the flow, (b) the classcode
 * this flow entered is the one shown, and (c) a Total Policy Premium figure
 * is actually displayed, in a valid currency format. The deeper
 * cross-checks rate-summary.json itself documents (Total Policy Premium ==
 * sum of Classcode Premiums; Final Rate == Prem Rate + Prod Rate; Classcode
 * Premium ≈ Exposure × Final Rate; the same figure reappearing on Quote
 * Option Detail's Premium tab after Close & Apply) are NOT implemented yet
 * — the codegen recording this was built from never clearly distinguished
 * which grid cell holds which of those individual figures (see
 * rate-summary.page.ts's own class comment), so implementing them now would
 * mean guessing a cell mapping rather than confirming one. That's flagged
 * here as follow-up work, not silently skipped.
 */

/** No separate market-selection.json — see market-selection.test.ts's own
 * note on why this lives under add-quote.json's `addMarketDetail` array
 * instead. */
const submissionData = resolvePlaceholders(createSubmissionRawData);
const quoteData = resolvePlaceholders(addQuoteRawData);
const marketData = quoteData.addMarketDetail[0];
const rateSummaryData = resolvePlaceholders(rateSummaryRawData);
const riskData = resolvePlaceholders(addEditRiskRawData);

/** Same short-label translation create-submission.test.ts uses — kept here
 * too since this spec drives CreateSubmissionPage directly. See that spec
 * for why the mapping exists. */
const APPLICANT_TYPE_LABELS: Record<string, string> = {
  Corporation: 'Corp.',
  Individual: 'Individual',
  'Joint Venture': 'Joint Venture',
  LLC: 'Llc',
  'Not For Profit Org.': 'Non Profit Org.',
  Other: 'Other',
  Partnership: 'Partnership',
};

function cityStateSearchTerm(cityStateZip: string): string {
  const [city, state] = cityStateZip.split(',');
  return `${city.trim()}, ${state.trim()}`;
  
}

function formatMonthDayYear(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${mm}/${dd}/${date.getFullYear()}`;
}
test(
  'Alis: add a Quote to a freshly created Submission',
  {
    annotation: [
      { type: 'scenario', description: 'al_sc_add_quote' },
      { type: 'product', description: 'alis' },
    ],
  },
  async ({ page }) => {
    // Create Submission alone already needs 120s (see create-submission.test.ts);
    // Add Quote's own type-aheads and confirm dialogs need real headroom on
    // top of that.
    test.setTimeout(180_000);

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(
      getCredential('ALIS_UAT_USERNAME', 'alis', 'username'),
      getCredential('ALIS_UAT_PASSWORD', 'alis', 'password'),
    );
    await expect(page).toHaveURL(/#\/followup/, { timeout: 20000 });
    await loginPage.closeStartupMessagePopupIfPresent();

    const createSubmissionPage = new CreateSubmissionPage(page);

    await test.step('Create a fresh Submission (setup for Add Quote)', async () => {
      await createSubmissionPage.openNewInsuredForm();
      await createSubmissionPage.selectAgency(submissionData.agency);

      const applicantTypeLabel = APPLICANT_TYPE_LABELS[submissionData.applicantInformation.applicantType];
      if (!applicantTypeLabel) {
        throw new Error(
          `No known form label for applicantType "${submissionData.applicantInformation.applicantType}" — ` +
            `add it to APPLICANT_TYPE_LABELS in this test.`,
        );
      }
      await createSubmissionPage.selectApplicantType(applicantTypeLabel);

      const insuredInput: InsuredDetailsInput = {
        applicantType: applicantTypeLabel,
        fullName: submissionData.applicantInformation.fullName,
        mailingAddress: submissionData.applicantInformation.mailingAddress,
        mailingAddress2: submissionData.applicantInformation.mailingAddress2,
        cityStateZipSearch: cityStateSearchTerm(submissionData.applicantInformation.cityStateZip),
        physicalAddressSameAsMailing: submissionData.applicantInformation.physicalAddressSameAsMailing,
        occupation: submissionData.applicantInformation.occupation,
        co: submissionData.applicantInformation.co,
        dateOfBirth: submissionData.applicantInformation.dateOfBirth,
        email: submissionData.applicantInformation.email,
        phone: submissionData.applicantInformation.phone,
        ext: submissionData.applicantInformation.ext,
        fax: submissionData.applicantInformation.fax,
      };
      await createSubmissionPage.fillInsuredDetails(insuredInput);


      const accountInput: AccountInformationInput = {
        office: submissionData.accountInformation.office,
        team: submissionData.accountInformation.team,
    
      };
      await createSubmissionPage.fillAccountInformation(accountInput);

      await createSubmissionPage.submit();
      await page.waitForTimeout(5000); // give the submission status badge a moment to render
      await expect(page).toHaveURL(/#\/underwriting\/submission/);
      await expect(
        createSubmissionPage.submissionStatusBadgeLocator(submissionData.expectedSubmissionSummary.status),
      ).toBeVisible();
    });

    const addQuotePage = new AddQuotePage(page);

    await test.step('Open Add Quote', async () => {
      await addQuotePage.open();
    });

    await test.step('Fill Coverage, COB, and Filing State', async () => {
      // Proposed Effective/Proposed Expiry are deliberately left at the
      // modal's own defaults — see AddQuoteInput's own comment and
      // add-quote.md's "Correction/callout" for why.
      const quoteInput: AddQuoteInput = {
        coverage: quoteData.coverage,
        cob: quoteData.cob,
        product: quoteData.product,
        operation: quoteData.operation,
        filingState: quoteData.filingState,
        term: quoteData.term,
      };
      await addQuotePage.fill(quoteInput);
      await addQuotePage.submit();

    });

    const marketSelectionPage = new MarketSelectionPage(page);

    await test.step('Attach a Market and verify the resulting option', async () => {

      const marketInput: MarketSelectionInput = {
            marketCompany: marketData.marketCompany,
      };
      await marketSelectionPage.attachMarket(marketInput);
      const optionRow = marketSelectionPage.optionRowLocator(marketData.marketCompany);
      await expect(optionRow).toBeVisible();
      await expect(optionRow).toContainText('Unbound');
    });

    await test.step('Open Add/Edit Risk and enter Limits/Deductibles', async () => {
      const riskPopup = await openAddEditRisk(page);
      const addEditRiskPage = new AddEditRiskPage(riskPopup);

      // selectCoverage() is NOT called here — the codegen recording this
      // step is built from never clicks a coverage tab; the popup already
      // opens positioned on Limits/Deductibles for the CGL risk. See
      // add-edit-risk.page.ts's selectCoverage() comment.

      const limitsInput: LimitsAndDeductiblesInput = {
        generalAggregate: riskData.limitsAndDeductibles.generalAggregate,
        productsCompletedOperationsAggregate: riskData.limitsAndDeductibles.productsCompletedOperationsAggregate,
        personalAdvertisingInjury: riskData.limitsAndDeductibles.personalAdvertisingInjury,
        eachOccurrence: riskData.limitsAndDeductibles.eachOccurrence,
        damageToRentedPremises: riskData.limitsAndDeductibles.damageToRentedPremises,
        medicalExpense: riskData.limitsAndDeductibles.medicalExpense,
        bodilyInjuryPropertyDamageDeductible: riskData.limitsAndDeductibles.bodilyInjuryPropertyDamageDeductible,
        deductibleBasisValue: riskData.limitsAndDeductibles.deductibleBasisValue,
      };
      await addEditRiskPage.fillLimitsAndDeductibles(limitsInput);

      await addEditRiskPage.addLocationFromPhysicalAddress();
      const classificationInput: ClassificationInput = {
        classCodeSearch: riskData.classification.classCodeSearch,
        suggestionText: riskData.classification.suggestionText,
        premiumCodeValue: riskData.classification.premiumCodeValue,
        exposure: riskData.classification.exposure,
        minPremium: riskData.classification.minPremium,
      };
      await addEditRiskPage.addClassification(classificationInput);

      // Close & Apply — not riskPopup.close() — per the codegen recording:
      // this is what actually saves/applies the Risk changes back to the
      // option. See add-edit-risk.page.ts's closeAndApply() comment.
      await addEditRiskPage.closeAndApply();
    });



    await test.step('Open Rate Summary and verify the quote identity', async () => {
      const ratePopup = await openRateSummary(page);
      await ratePopup.waitForLoadState('domcontentloaded');
     // await page.waitForTimeout(180000); // give the rate summary a moment to render
      const rateSummaryPage = new RateSummaryPage(ratePopup);
      const today = new Date();
      const oneYearOut = new Date(today);
      oneYearOut.setFullYear(today.getFullYear() + 1);

      const expectation: RateSummaryExpectation = {
        namedInsured: submissionData.applicantInformation.fullName,
        effectiveDateSubstring: formatMonthDayYear(today),
        expirationDateSubstring: formatMonthDayYear(oneYearOut),
        riskCompany: marketData.riskCo,
        classcode: riskData.classification.classCodeSearch,
        exposureFormatted: Number(riskData.classification.exposure).toLocaleString(),
        premiumCode: riskData.classification.premiumCodeValue,
      };
      await rateSummaryPage.verifyQuoteIdentity(expectation);

      await rateSummaryPage.expandClasscodeBreakdown(expectation.classcode);
      await expect(rateSummaryPage.classcodeCellLocator(expectation.classcode)).toBeVisible();
      await expect(rateSummaryPage.exposureCellLocator(expectation.exposureFormatted)).toBeVisible();
      await expect(rateSummaryPage.premiumCodeCellLocator(expectation.premiumCode)).toBeVisible();

      // Never asserted against a fixed value — see this file's own
      // top-of-file comment and rate-summary.json's "compareToDisplayed"
      // instruction. Only that SOME valid currency figure is displayed.
      const totalPremiumText = await rateSummaryPage.readTotalPremiumText();
      expect(totalPremiumText).toMatch(/^\$[\d,]+\.\d{2}$/);
      console.log(
        `Rate Summary for classcode "${expectation.classcode}" shows Total Policy Premium ${totalPremiumText} ` +
          `(rate-summary.json's reference sample from a prior pass: ` +
          `$${rateSummaryData.referenceSample.totalPolicyPremium.toFixed(2)} — informational only, not asserted).`,
      );

      await rateSummaryPage.close();
    });
  },
);