import { test, expect } from '../../../framework/fixtures';
import { getCredential } from '../../../framework/utils/env';
import { resolvePlaceholders } from '../../../framework/utils/dates';
import { LoginPage } from '../login/login.page';
import { CreateSubmissionPage } from '../create-submission/create-submission.page';
import type { AccountInformationInput, InsuredDetailsInput } from '../create-submission/create-submission.page';
import { AddQuotePage } from './add-quote.page';
import type { AddQuoteInput } from './add-quote.page';
import createSubmissionRawData from '../../knowledge/create-submission.json';
import addQuoteRawData from '../../knowledge/add-quote.json';

/**
 * Add Quote has no page of its own to land on directly — it's reached from
 * an existing Submission's page (see add-quote.md's Overview). Rather than
 * hardcode a specific submission number (which would only work as long as
 * that exact submission still exists in this environment, defeating the
 * point of a repeatable test — see conventions.md), this spec creates a
 * fresh Submission first, the same way create-submission.test.ts does, by
 * reusing CreateSubmissionPage's own already-verified methods. The
 * login/create-submission steps below intentionally mirror
 * create-submission.test.ts's own structure — each spec stays independently
 * runnable rather than depending on another spec's test having run first
 * (see conventions.md on spec independence).
 *
 * `{{TODAY}}`/`{{UNIQUE_NAME:...}}` placeholders are resolved the same way
 * create-submission.test.ts resolves them (framework/utils/dates.ts) — see
 * that spec for why.
 */
const submissionData = resolvePlaceholders(createSubmissionRawData);
const quoteData = resolvePlaceholders(addQuoteRawData);

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

      // await createSubmissionPage.expandAdditionalInformation();
      // const additionalInput: InsuredDetailsInput = {
      //   ...insuredInput,
      //   cityStateZipSearch: '',
      //   identificationType: submissionData.applicantInformation.identificationType as 'FEIN' | 'SSN' | null,
      //   isApplicantEmployedRetiredOrDisabled: submissionData.applicantInformation.isApplicantEmployedRetiredOrDisabled,
      //   bankruptcyJudgementRepossessionPastDue5Yrs:
      //     submissionData.applicantInformation.bankruptcyJudgementRepossessionPastDue5Yrs,
      //   isRollover: submissionData.applicantInformation.isRollover,
      //   hasSpouseOrCoApplicant: submissionData.applicantInformation.hasSpouseOrCoApplicant,
      //   notes: submissionData.applicantInformation.notes,
      // };
      // await createSubmissionPage.fillAdditionalInformation(additionalInput);

      const accountInput: AccountInformationInput = {
        office: submissionData.accountInformation.office,
        team: submissionData.accountInformation.team,
        // uwBroker: submissionData.accountInformation.uwBroker,
        // assistant: submissionData.accountInformation.assistant,
        // originatingUwBroker: submissionData.accountInformation.originatingUwBroker,
        // secondaryUw: submissionData.accountInformation.secondaryUw,
        // renewalQuoter: submissionData.accountInformation.renewalQuoter,
        // filingState: submissionData.accountInformation.filingState,
      };
      await createSubmissionPage.fillAccountInformation(accountInput);

      await createSubmissionPage.submit();
      await page.waitForTimeout(2000); // give the submission status badge a moment to render
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
  },
);