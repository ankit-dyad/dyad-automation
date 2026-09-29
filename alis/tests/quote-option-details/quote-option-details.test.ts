import { test, expect } from '../../../framework/fixtures';
import type { Page } from '@playwright/test';
import { createRandomPolicyNumber } from '../../../framework/fixtures/factories';
import { getCredential } from '../../../framework/utils/env';
import { resolvePlaceholders } from '../../../framework/utils/dates';
import { takeScreenshot } from '../../../framework/utils/screenshot';
import { LoginPage } from '../login/login.page';
import { CreateSubmissionPage } from '../create-submission/create-submission.page';
import type { AccountInformationInput, InsuredDetailsInput } from '../create-submission/create-submission.page';
import { AddQuotePage } from '../add-quote/add-quote.page';
import type { AddQuoteInput } from '../add-quote/add-quote.page';
import { MarketSelectionPage } from '../market-selection/market-selection.page';
import type { MarketSelectionInput } from '../market-selection/market-selection.page';
import { AddEditRiskPage, openAddEditRisk } from '../add-edit-risk/add-edit-risk.page';
import type { LimitsAndDeductiblesInput, ClassificationInput } from '../add-edit-risk/add-edit-risk.page';
import { RateSummaryPage, openRateSummary } from '../rate-summary/rate-summary.page';
import { QuoteOptionDetailPage } from './quote-option-details.page';
import type { PremiumAdjustmentInput } from './quote-option-details.page';
import createSubmissionRawData from '../../knowledge/create-submission.json';
import addQuoteRawData from '../../knowledge/add-quote.json';
import addEditRiskRawData from '../../knowledge/add-edit-risk.json';
import termsFormsRawData from '../../knowledge/terms-forms.json';
import rateSummaryRawData from '../../knowledge/rate-summary.json';
import { RateSummaryExpectation } from './../rate-summary/rate-summary.page';
import { runStep } from '../../../framework/utils/reportSteps'; // ← fixed: was 'reportSteps'


const submissionData = resolvePlaceholders(createSubmissionRawData);
const quoteData = resolvePlaceholders(addQuoteRawData);
const marketData = quoteData.addMarketDetail[0];
const rateSummaryData = resolvePlaceholders(rateSummaryRawData);
const riskData = resolvePlaceholders(addEditRiskRawData);
const termsFormsData = resolvePlaceholders(termsFormsRawData);

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
  async ({ page }, testInfo) => {
    test.setTimeout(360_000);
    let page1: Page;

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(
      getCredential('ALIS_UAT_USERNAME', 'alis', 'username'),
      getCredential('ALIS_UAT_PASSWORD', 'alis', 'password'),
    );

    await expect(page).toHaveURL(/#\/followup/, { timeout: 20000 });
    await loginPage.closeStartupMessagePopupIfPresent();
    const createSubmissionPage = new CreateSubmissionPage(page);
    const addQuotePage = new AddQuotePage(page);
    const marketSelectionPage = new MarketSelectionPage(page);

    await runStep(page, testInfo, 'Create a fresh Submission (setup for Add Quote)', async (ctx) => {
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
      await ctx.verify('Redirected to the submission page', () =>
        expect(page).toHaveURL(/#\/underwriting\/submission/),
      );
      await ctx.verify('Submission status badge is visible', () =>
        expect(
          createSubmissionPage.submissionStatusBadgeLocator(submissionData.expectedSubmissionSummary.status),
        ).toBeVisible(),
      );
    });

    await runStep(page, testInfo, 'Open Add Quote', async () => {
      await addQuotePage.open();
    });

    await runStep(page, testInfo, 'Fill Coverage, COB, and Filing State', async () => {
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

    await runStep(page, testInfo, 'Attach a Market and verify the resulting option', async (ctx) => {

      const marketInput: MarketSelectionInput = {
        marketCompany: marketData.marketCompany,
      };
      await marketSelectionPage.attachMarket(marketInput);
      const optionRow = marketSelectionPage.optionRowLocator(marketData.marketCompany);
      await ctx.verify('Option row is visible', () => expect(optionRow).toBeVisible());
      await ctx.verify('Option row shows Unbound', () => expect(optionRow).toContainText('Unbound'));
    });

    await runStep(page, testInfo, 'Open Add/Edit Risk and enter Limits/Deductibles', async () => {
      const riskPopup = await openAddEditRisk(page);
      const addEditRiskPage = new AddEditRiskPage(riskPopup);

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
      await addEditRiskPage.closeAndApply();
    });

    await runStep(page, testInfo, 'Open Rate Summary and verify the quote identity', async (ctx) => {
      const ratePopup = await openRateSummary(page);
      await ratePopup.waitForLoadState('domcontentloaded');
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
      await ctx.verify('Classcode cell is visible', () =>
        expect(rateSummaryPage.classcodeCellLocator(expectation.classcode)).toBeVisible(),
      );
      await ctx.verify('Exposure cell is visible', () =>
        expect(rateSummaryPage.exposureCellLocator(expectation.exposureFormatted)).toBeVisible(),
      );
      await ctx.verify('Premium code cell is visible', () =>
        expect(rateSummaryPage.premiumCodeCellLocator(expectation.premiumCode)).toBeVisible(),
      );

      const totalPremiumText = await rateSummaryPage.readTotalPremiumText();
      await ctx.verify('Total premium is formatted as currency', () =>
        expect(totalPremiumText).toMatch(/^\$[\d,]+\.\d{2}$/),
      );

      await rateSummaryPage.close();
    });

    const quoteOptionDetailPage = new QuoteOptionDetailPage(page);

    await runStep(page, testInfo, 'Verify the Risk tab reflects what was entered', async (ctx) => {
      await quoteOptionDetailPage.open();
      await ctx.verify('Coverage heading is visible', () =>
        expect(quoteOptionDetailPage.coverageHeadingLocator(quoteData.coverage)).toBeVisible(),
      );
    });

    await runStep(page, testInfo, 'Verify and apply the Premium tab', async (ctx) => {
      await quoteOptionDetailPage.goToPremiumTab();

      const ratedPremiumText = await quoteOptionDetailPage.readRatedPremiumText();
      await ctx.verify('Rated premium is formatted as currency', () =>
        expect(ratedPremiumText).toMatch(/\$[\d,]+\.\d{2}/),
      );
      console.log(`Quote Option Detail's Premium tab shows: ${ratedPremiumText}`);

      const premiumInput: PremiumAdjustmentInput = {
        triaTypeValue: termsFormsData.premiumAdjustment.triaTypeValue,
        grossCommOption: termsFormsData.premiumAdjustment.grossCommOption,
        agentCommOption: termsFormsData.premiumAdjustment.agentCommOption,
      };
      await quoteOptionDetailPage.applyPremiumAdjustment(premiumInput);
    });

    await runStep(page, testInfo, 'Verify and delete Terms & Forms', async (ctx) => {
      await quoteOptionDetailPage.goToTermsAndFormsTab();
      const initialCount = await quoteOptionDetailPage.readFormsCount();
      console.log(`Initial Forms count: ${initialCount}`);
      const candidateFormNos: string[] = termsFormsData.shouldBeRemoved.forms.map((f: { formNo: string }) => f.formNo);
      const presentFormNos: string[] = [];
      for (const formNo of candidateFormNos) {
        const present = await quoteOptionDetailPage.isFormPresent(formNo);
        console.log(`  "should be removed" form ${formNo}: ${present ? 'present' : 'not present this pass'}`);
        if (present) {
          presentFormNos.push(formNo);
        }
      }
      if (presentFormNos.length > 0) {
        console.log(`Deleting ${presentFormNos.length} forms: ${presentFormNos.join(', ')}`);
        await quoteOptionDetailPage.deleteForms(presentFormNos);
      } else {
        console.log('No specified forms were present for deletion.');
      }
      await page.waitForTimeout(5000);
      const finalCount = await quoteOptionDetailPage.readFormsCount();
      console.log(`Final Forms count: ${finalCount}`);
      const expectedCount = initialCount - presentFormNos.length;
      console.log(`Expected remaining forms count (${initialCount} initial - ${presentFormNos.length} deleted): ${expectedCount}`);
      await ctx.verify(`Remaining forms count matches expected (${expectedCount})`, () =>
        expect(finalCount).toBe(expectedCount),
      );
      await quoteOptionDetailPage.save();
    });

    await runStep(page, testInfo, 'Bind and Invoice policy', async () => {
      const randomPolicyNumber = createRandomPolicyNumber('POL');
      console.log(`Binding policy with dynamic policy number: ${randomPolicyNumber}`);
      await quoteOptionDetailPage.bindAndInvoice(randomPolicyNumber);
    });

    await runStep(page, testInfo, 'Review policy generation', async (ctx) => {
      page1 = await quoteOptionDetailPage.openReviewPolicy();
      await ctx.verify('Policy Generation heading is visible', () =>
        expect(page1.getByRole('heading', { name: 'Policy Generation' })).toBeVisible(),
      );

      const expectedForms: { formNo: string; formName: string }[] = termsFormsData.shouldBePresent.forms;
      const verifiedFormNos: string[] = [];
      await ctx.verify('All expected forms are visible on Review Policy page', async () => {
        for (const form of expectedForms) {
          await expect(page1.getByText(form.formNo)).toBeVisible();
          verifiedFormNos.push(form.formNo);
        }
      });
      console.log(`Verified all ${verifiedFormNos.length} forms present on Review Policy page: ${verifiedFormNos.join(', ')}`);

      await quoteOptionDetailPage.clickContinueOnReviewPolicy(page1);
await page.waitForTimeout(2000); // give the "Missing Details" cell a moment to render
      await ctx.verify('Missing Details cell is visible', () =>
        expect(page1.getByRole('cell', { name: 'Missing Details', exact: true })).toBeVisible(),
      );

      const mepDollar = termsFormsData.missingValues?.minimumEarnedPremiumDollar ?? '525.5';
      const mepPercentage = termsFormsData.missingValues?.minimumEarnedPremiumPercentage ?? '13';
      await quoteOptionDetailPage.fillMissingValues(page1, mepDollar, mepPercentage);
      await quoteOptionDetailPage.clickContinueOnReviewPolicy(page1);

    });

    // await runStep(page, testInfo, 'View and Verify PDF content page', async () => {
    //   const page2 = await quoteOptionDetailPage.openRecipientCopyPdf(page1, 'Insured');
    //   await quoteOptionDetailPage.jumpToPdfPage(page2, '23');
    //   const pdfPages = await extractGeneratedPdfText(page2);

// const policyNumberPages = findTokenAcrossPagesIgnoringLineWrap(pdfPages, bindInvoiceData.policyNumber);
// console.log(`Policy Number found on PDF page(s): ${policyNumberPages.join(', ') || 'NONE'}`);
// expect(
//   policyNumberPages.length,
//   `Expected Policy Number "${bindInvoiceData.policyNumber}" to appear somewhere in the generated PDF.`,
// ).toBeGreaterThan(0);

// const dollarPages = findTextAcrossPages(pdfPages, `$${termsFormsData.missingValuesS013?.dollarValue ?? '525.5'}`);
// const percentPages = findTextAcrossPages(pdfPages, `${termsFormsData.missingValuesS013?.percentValue ?? '13'} %`);
// console.log(`Missing Values dollar figure found on page(s): ${dollarPages.join(', ') || 'NONE'}`);
// console.log(`Missing Values percent figure found on page(s): ${percentPages.join(', ') || 'NONE'}`);
// expect(dollarPages.length, 'Expected the Minimum Earned Premium dollar value to appear in the PDF.').toBeGreaterThan(0);
// expect(percentPages.length, 'Expected the Minimum Earned Premium percent value to appear in the PDF.').toBeGreaterThan(0);
    //   await page2.waitForTimeout(3000);
    //   await takeScreenshot(page2, testInfo, 'policy-pdf-page-23');
    // });
  },
);
