import { test, expect } from '../../../framework/fixtures';
import type { Page } from '@playwright/test';
import { createRandomPolicyNumber } from '../../../framework/fixtures/factories';
import { getCredential } from '../../../framework/utils/env';
import { resolvePlaceholders } from '../../../framework/utils/dates';
import { takeScreenshot } from '../../../framework/utils/screenshot';
import { downloadPdfBuffer, getPdfPageText } from '../../../framework/utils/pdf';
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
    let page2: Page;
    let riskPopup: Page;
    let ratePopup: Page;
    let randomPolicyNumber: string;

    const loginPage = new LoginPage(page);
    const createSubmissionPage = new CreateSubmissionPage(page);
    const addQuotePage = new AddQuotePage(page);
    const marketSelectionPage = new MarketSelectionPage(page);
    const quoteOptionDetailPage = new QuoteOptionDetailPage(page);
    let addEditRiskPage: AddEditRiskPage;
    let rateSummaryPage: RateSummaryPage;
    let rateExpectation: RateSummaryExpectation;
    let initialCount: number;
    let presentFormNos: string[] = [];

    await test.step('Log in to Alis', async () => {
      await loginPage.goto();
      await loginPage.login(
        getCredential('ALIS_UAT_USERNAME', 'alis', 'username'),
        getCredential('ALIS_UAT_PASSWORD', 'alis', 'password'),
      );
      await expect(page).toHaveURL(/#\/followup/, { timeout: 20000 });
      await loginPage.closeStartupMessagePopupIfPresent();
      await takeScreenshot(page, testInfo, '01-login-successful');
    });

    await test.step('Open New Insured form from Clearance Search', async () => {
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
      await takeScreenshot(page, testInfo, '02-new-insured-form-open');
    });

    await test.step('Fill Insured details and Account Information', async () => {
      const applicantTypeLabel = APPLICANT_TYPE_LABELS[submissionData.applicantInformation.applicantType];
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
      await takeScreenshot(page, testInfo, '03-insured-details-filled');
    });

    await test.step('Submit Submission and verify Underwriting status', async () => {
      await createSubmissionPage.submit();
      await page.waitForTimeout(5000); // give the submission status badge a moment to render
      await expect(page).toHaveURL(/#\/underwriting\/submission/);
      await expect(
        createSubmissionPage.submissionStatusBadgeLocator(submissionData.expectedSubmissionSummary.status),
      ).toBeVisible();
      await takeScreenshot(page, testInfo, '04-submission-created');
    });

    await test.step('Open Add Quote modal', async () => {
      await addQuotePage.open();
      await takeScreenshot(page, testInfo, '05-add-quote-modal-open');
    });

    await test.step('Fill Coverage, COB, and Filing State in Add Quote', async () => {
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
      await takeScreenshot(page, testInfo, '06-quote-details-submitted');
    });

    await test.step('Attach a Market and verify the resulting option', async () => {
      const marketInput: MarketSelectionInput = {
        marketCompany: marketData.marketCompany,
      };
      await marketSelectionPage.attachMarket(marketInput);
      const optionRow = marketSelectionPage.optionRowLocator(marketData.marketCompany);
      await expect(optionRow).toBeVisible();
      await expect(optionRow).toContainText('Unbound');
      await takeScreenshot(page, testInfo, '07-market-attached-unbound');
    });

    await test.step('Open Add/Edit Risk popup and fill Limits & Deductibles', async () => {
      riskPopup = await openAddEditRisk(page);
      addEditRiskPage = new AddEditRiskPage(riskPopup);

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
      await takeScreenshot(riskPopup, testInfo, '08-risk-limits-deductibles-filled');
    });

    await test.step('Add Location from Physical Address', async () => {
      await addEditRiskPage.addLocationFromPhysicalAddress();
      await takeScreenshot(riskPopup, testInfo, '09-risk-location-added');
    });

    await test.step('Add Classification to Risk and Close & Apply', async () => {
      const classificationInput: ClassificationInput = {
        classCodeSearch: riskData.classification.classCodeSearch,
        suggestionText: riskData.classification.suggestionText,
        premiumCodeValue: riskData.classification.premiumCodeValue,
        exposure: riskData.classification.exposure,
        minPremium: riskData.classification.minPremium,
      };
      await addEditRiskPage.addClassification(classificationInput);
      await takeScreenshot(riskPopup, testInfo, '10-risk-classification-added');
      await addEditRiskPage.closeAndApply();
    });

    await test.step('Open Rate Summary and verify the quote identity', async () => {
      ratePopup = await openRateSummary(page);
      await ratePopup.waitForLoadState('domcontentloaded');
      rateSummaryPage = new RateSummaryPage(ratePopup);
      const today = new Date();
      const oneYearOut = new Date(today);
      oneYearOut.setFullYear(today.getFullYear() + 1);

      rateExpectation = {
        namedInsured: submissionData.applicantInformation.fullName,
        effectiveDateSubstring: formatMonthDayYear(today),
        expirationDateSubstring: formatMonthDayYear(oneYearOut),
        riskCompany: marketData.riskCo,
        classcode: riskData.classification.classCodeSearch,
        exposureFormatted: Number(riskData.classification.exposure).toLocaleString(),
        premiumCode: riskData.classification.premiumCodeValue,
      };
      await rateSummaryPage.verifyQuoteIdentity(rateExpectation);
      await takeScreenshot(ratePopup, testInfo, '11-rate-summary-identity');
    });

    await test.step('Verify Classcode Breakdown and Total Premium in Rate Summary', async () => {
      await rateSummaryPage.expandClasscodeBreakdown(rateExpectation.classcode);
      await expect(rateSummaryPage.classcodeCellLocator(rateExpectation.classcode)).toBeVisible();
      await expect(rateSummaryPage.exposureCellLocator(rateExpectation.exposureFormatted)).toBeVisible();
      await expect(rateSummaryPage.premiumCodeCellLocator(rateExpectation.premiumCode)).toBeVisible();

      const totalPremiumText = await rateSummaryPage.readTotalPremiumText();
      expect(totalPremiumText).toMatch(/^\$[\d,]+\.\d{2}$/);
      await takeScreenshot(ratePopup, testInfo, '12-rate-summary-breakdown');
      await rateSummaryPage.close();
    });

    await test.step('Verify the Risk tab reflects what was entered', async () => {
      await quoteOptionDetailPage.open();
      await expect(quoteOptionDetailPage.coverageHeadingLocator(quoteData.coverage)).toBeVisible();
      await takeScreenshot(page, testInfo, '13-quote-option-risk-tab');
    });

    await test.step('Verify and apply adjustments on Premium tab', async () => {
      await quoteOptionDetailPage.goToPremiumTab();

      const ratedPremiumText = await quoteOptionDetailPage.readRatedPremiumText();
      expect(ratedPremiumText).toMatch(/\$[\d,]+\.\d{2}/);
      console.log(`Quote Option Detail's Premium tab shows: ${ratedPremiumText}`);

      const premiumInput: PremiumAdjustmentInput = {
        triaTypeValue: termsFormsData.premiumAdjustment.triaTypeValue,
        grossCommOption: termsFormsData.premiumAdjustment.grossCommOption,
        agentCommOption: termsFormsData.premiumAdjustment.agentCommOption,
      };
      await quoteOptionDetailPage.applyPremiumAdjustment(premiumInput);
      await takeScreenshot(page, testInfo, '14-quote-option-premium-adjusted');
    });

    await test.step('Check and delete candidate forms on Terms & Forms tab', async () => {
      await quoteOptionDetailPage.goToTermsAndFormsTab();
      initialCount = await quoteOptionDetailPage.readFormsCount();
      console.log(`Initial Forms count: ${initialCount}`);
      const candidateFormNos: string[] = termsFormsData.shouldBeRemoved.forms.map((f: { formNo: string }) => f.formNo);
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
      await takeScreenshot(page, testInfo, '15-terms-forms-deleted');
    });

    await test.step('Verify remaining Forms count and save', async () => {
      const finalCount = await quoteOptionDetailPage.readFormsCount();
      console.log(`Final Forms count: ${finalCount}`);
      const expectedCount = initialCount - presentFormNos.length;
      console.log(`Expected remaining forms count (${initialCount} initial - ${presentFormNos.length} deleted): ${expectedCount}`);
      expect(finalCount).toBe(expectedCount);
      await quoteOptionDetailPage.save();
      await takeScreenshot(page, testInfo, '16-terms-forms-saved');
    });

    await test.step('Bind and Invoice policy with dynamic policy number', async () => {
      randomPolicyNumber = createRandomPolicyNumber('POL');
      console.log(`Binding policy with dynamic policy number: ${randomPolicyNumber}`);
      await quoteOptionDetailPage.bindAndInvoice(randomPolicyNumber);
      await takeScreenshot(page, testInfo, '17-bind-and-invoice-submitted');
    });

    await test.step('Open Review Policy and verify Schedule of Forms', async () => {
      page1 = await quoteOptionDetailPage.openReviewPolicy();
      await page1.waitForLoadState('domcontentloaded');
      await expect(page1).toHaveTitle(/Policy Generation/);
      await expect(page1.getByText('Schedule of Forms').first()).toBeVisible();

      const expectedForms: { formNo: string; formName: string }[] = termsFormsData.shouldBePresent.forms;
      const verifiedFormNos: string[] = [];
      for (const form of expectedForms) {
        await expect(page1.getByText(form.formNo).first()).toBeVisible();
        verifiedFormNos.push(form.formNo);
      }
      console.log(`Verified all ${verifiedFormNos.length} forms present on Review Policy page: ${verifiedFormNos.join(', ')}`);
      await takeScreenshot(page1, testInfo, '18-review-policy-forms-verified');
    });

    await test.step('Fill Missing Details (MEP Dollar and Percentage)', async () => {
      await quoteOptionDetailPage.clickContinueOnReviewPolicy(page1);

      await expect(page1.getByText('Missing Details').first()).toBeVisible({ timeout: 30000 });

      const mepDollar = termsFormsData.missingValues?.minimumEarnedPremiumDollar ?? '525.5';
      const mepPercentage = termsFormsData.missingValues?.minimumEarnedPremiumPercentage ?? '13';
      await quoteOptionDetailPage.fillMissingValues(page1, mepDollar, mepPercentage);
      await takeScreenshot(page1, testInfo, '19-missing-details-filled');
    });

    await test.step('Generate and open Recipient Copy PDF', async () => {
      await quoteOptionDetailPage.clickContinueOnReviewPolicy(page1);
      page2 = await quoteOptionDetailPage.openRecipientCopyPdf(page1, 'Insured');
      await takeScreenshot(page1, testInfo, '20-recipient-copy-opened');
    });

    await test.step('Navigate to PDF Page 23 and capture screenshot', async () => {
      await quoteOptionDetailPage.jumpToPdfPage(page2, '23');
      await page2.waitForTimeout(3000);

      // Verify the PDF viewer navigated to page 23
      const viewerPage = await quoteOptionDetailPage.getPdfCurrentPageNumber(page2);
      if (viewerPage) {
        expect(viewerPage).toBe('23');
      }
      await takeScreenshot(page2, testInfo, '21-policy-pdf-page-23');
    });

    await test.step('Extract and verify PDF page 23 content', async () => {
      const mapDollar = termsFormsData.missingValues?.minimumEarnedPremiumDollar ?? '525.5';
      const mapPercentage = termsFormsData.missingValues?.minimumEarnedPremiumPercentage ?? '13';

      console.log('Downloading PDF to verify page 23 content...');
      const pdfBuffer = await downloadPdfBuffer(page2);
      const page23Text = await getPdfPageText(pdfBuffer, 23);
      console.log(`Page 23 extracted text length: ${page23Text.length}`);

      // 1. Verify Policy Number (with resilience for potential multi-line wrapping in the template box)
      const compactPageText = page23Text.replace(/\s+/g, '');
      const compactPolicyNumber = randomPolicyNumber.replace(/\s+/g, '');
      expect(compactPageText).toContain(compactPolicyNumber);

      // 2. Verify Form S013 title and form number
      // Template has "MINIMUM EARNED PREMIUM EN   DORSEMENT"
      expect(page23Text).toMatch(/MINIMUM\s+EARNED\s+PREMIUM/i);
      expect(page23Text).toContain('S013');

      // 3. Verify Minimum Earned Premium Dollar and Percentage values entered in Missing Details
      expect(page23Text).toContain(mapDollar);
      expect(page23Text).toContain(mapPercentage);

      // 4. Verify the Minimum Earned Premium retention clause text
      expect(page23Text).toMatch(/there will be a minimum earned premium retained by us/i);
      expect(page23Text).toMatch(/\$\s*or\s*%\s*of the premium for this insurance,\s*whichever is greater/i);
      console.log('Successfully verified all required content on Page 23 of the PDF.');
      await takeScreenshot(page2, testInfo, '22-pdf-page-23-verified');
    });
  },
);