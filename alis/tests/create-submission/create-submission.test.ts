import { test, expect } from '../../../framework/fixtures';
import { getCredential } from '../../../framework/utils/env';
import { resolvePlaceholders } from '../../../framework/utils/dates';
import { LoginPage } from '../login/login.page';
import { CreateSubmissionPage } from './create-submission.page';
import type { AccountInformationInput, InsuredDetailsInput } from './create-submission.page';
import rawData from '../../knowledge/create-submission.json';

/**
 * This entire test is driven by alis/knowledge/create-submission.json — no
 * field value below is hardcoded in this file. If the flow's data needs to
 * change (a different agency, applicant, office/team, etc.), edit the JSON;
 * this spec and create-submission.page.ts don't need to change. See
 * CLAUDE.md §3 / conventions.md for why the project is structured this way.
 *
 * `{{TODAY}}`, `{{TODAY+12M}}`, and `{{UNIQUE_NAME:...}}` placeholders in the
 * JSON are resolved once, at the top of the test, via resolvePlaceholders()
 * (framework/utils/dates.ts) — per the project's rule that dates always
 * resolve to the actual run date and Full Name is always uniquified to avoid
 * ALIS's duplicate-insured detection (see new-insured-form.md).
 */
const data = resolvePlaceholders(rawData);

/** This form's Applicant Type radios use short live labels ("Corp.") that
 * differ from create-submission.json's descriptive `applicantType` value
 * ("Corporation") — confirmed live 2026-09-24 that this instance only offers
 * 7 options (Corp., Individual, Joint Venture, Llc, Non Profit Org., Other,
 * Partnership), not the fuller list documented elsewhere in
 * new-insured-form.md. This map is the single place that translation lives. */
const APPLICANT_TYPE_LABELS: Record<string, string> = {
  Corporation: 'Corp.',
  Individual: 'Individual',
  'Joint Venture': 'Joint Venture',
  LLC: 'Llc',
  'Not For Profit Org.': 'Non Profit Org.',
  Other: 'Other',
  Partnership: 'Partnership',
};

/** The City/State/Zip type-ahead is searched by "City, ST" — this form's
 * suggestion list doesn't require (or reliably match on) the zip portion of
 * create-submission.json's combined `cityStateZip` string. */
function cityStateSearchTerm(cityStateZip: string): string {
  const [city, state] = cityStateZip.split(',');
  return `${city.trim()}, ${state.trim()}`;
}

test(
  'Alis: create a new Insured and Submission from Clearance Search',
  {
    annotation: [
      { type: 'scenario', description: 'al_sc_create_submission' },
      { type: 'product', description: 'alis' },
    ],
  },
  async ({ page }) => {
    // This flow fills 20+ fields across three form sections, including two
    // type-aheads that each need a real wait for suggestions to render, plus
    // several cascading dropdowns — Playwright's 30s default test timeout is
    // comfortably too short for it end-to-end (confirmed: a real run failed
    // at the very first post-login click because login + popup-check alone
    // had already consumed most of that budget). 120s gives this test real
    // headroom instead of racing the clock from the first step.
    test.setTimeout(120_000);

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(
      getCredential('ALIS_UAT_USERNAME', 'alis', 'username'),
      getCredential('ALIS_UAT_PASSWORD', 'alis', 'password'),
    );

    // Confirms login actually completed (and gives a much clearer failure
    // than a downstream "button never appeared" if it didn't) before doing
    // anything that depends on being logged in — same check login.test.ts
    // makes on its own.
    await expect(page).toHaveURL(/#\/followup/, { timeout: 20000 });
    await loginPage.closeStartupMessagePopupIfPresent();


    const createSubmissionPage = new CreateSubmissionPage(page);

    await test.step('Open the New Insured form via Clearance Search', async () => {
      await createSubmissionPage.openNewInsuredForm();
    });

    await page.waitForTimeout(1000);
    await test.step('Select the Agency', async () => {
      // Not listed as its own field under applicantInformation in the JSON —
      // see create-submission.json's `agencyNote` for why it lives at the
      // top level instead.
      await createSubmissionPage.selectAgency(data.agency);
    });

    await test.step('Fill Insured details', async () => {
      const applicantTypeLabel = APPLICANT_TYPE_LABELS[data.applicantInformation.applicantType];
      if (!applicantTypeLabel) {
        throw new Error(
          `No known form label for applicantType "${data.applicantInformation.applicantType}" — ` +
            `add it to APPLICANT_TYPE_LABELS in this test.`,
        );
      }
      await createSubmissionPage.selectApplicantType(applicantTypeLabel);

      const insuredInput: InsuredDetailsInput = {
        applicantType: applicantTypeLabel,
        fullName: data.applicantInformation.fullName,
        mailingAddress: data.applicantInformation.mailingAddress,
        mailingAddress2: data.applicantInformation.mailingAddress2,
        cityStateZipSearch: cityStateSearchTerm(data.applicantInformation.cityStateZip),
        physicalAddressSameAsMailing: data.applicantInformation.physicalAddressSameAsMailing,
        occupation: data.applicantInformation.occupation,
        co: data.applicantInformation.co,
        dateOfBirth: data.applicantInformation.dateOfBirth,
        email: data.applicantInformation.email,
        phone: data.applicantInformation.phone,
        ext: data.applicantInformation.ext,
        fax: data.applicantInformation.fax,
      };
      await createSubmissionPage.fillInsuredDetails(insuredInput);
    });

    await test.step('Expand Additional Information and fill it in', async () => {
      await createSubmissionPage.expandAdditionalInformation();

      const additionalInput: InsuredDetailsInput = {
        applicantType: data.applicantInformation.applicantType,
        fullName: data.applicantInformation.fullName,
        mailingAddress: data.applicantInformation.mailingAddress,
        cityStateZipSearch: '',
        physicalAddressSameAsMailing: data.applicantInformation.physicalAddressSameAsMailing,
        occupation: data.applicantInformation.occupation,
        co: data.applicantInformation.co,
        dateOfBirth: data.applicantInformation.dateOfBirth,
        email: data.applicantInformation.email,
        phone: data.applicantInformation.phone,
        ext: data.applicantInformation.ext,
        fax: data.applicantInformation.fax,
        identificationType: data.applicantInformation.identificationType as 'FEIN' | 'SSN' | null,
       // isApplicantEmployedRetiredOrDisabled: data.applicantInformation.isApplicantEmployedRetiredOrDisabled,
        //bankruptcyJudgementRepossessionPastDue5Yrs:
          //data.applicantInformation.bankruptcyJudgementRepossessionPastDue5Yrs,
        //isRollover: data.applicantInformation.isRollover,
       //hasSpouseOrCoApplicant: data.applicantInformation.hasSpouseOrCoApplicant,
        notes: data.applicantInformation.notes,
      };
      await createSubmissionPage.fillAdditionalInformation(additionalInput);
    });
    
    await test.step('Fill Account Information', async () => {
      const accountInput: AccountInformationInput = {
        office: data.accountInformation.office,
        team: data.accountInformation.team,
       // uwBroker: data.accountInformation.uwBroker,
      //  assistant: data.accountInformation.assistant,
       // originatingUwBroker: data.accountInformation.originatingUwBroker,
       // secondaryUw: data.accountInformation.secondaryUw,
       // renewalQuoter: data.accountInformation.renewalQuoter,
        filingState: data.accountInformation.filingState,
      };
      await createSubmissionPage.fillAccountInformation(accountInput);
    });

    await test.step('Create the Submission and verify the confirmation screen', async () => {
      await createSubmissionPage.submit();

      // create-submission.json's expectedSubmissionSummary is an assertion
      // target, not input data — Submission Number, dates, and Insured Code
      // differ on every run, so this asserts shape/consistency rather than
      // exact literals (per the project's stated rule for this section).
      await expect(page).toHaveURL(/#\/underwriting\/submission/);
      await page.waitForTimeout(5000);
      await expect(
  createSubmissionPage.submissionStatusBadgeLocator(data.expectedSubmissionSummary.status),).toBeVisible();

    //   const submissionNumber = await createSubmissionPage.getSubmissionNumber();
    //   console.log(`Submission created: ${submissionNumber} for Insured "${data.applicantInformation.fullName}".`);
    // });
   });
  },
);
