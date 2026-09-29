import type { Page } from '@playwright/test';

/**
 * Locator definitions for the New Insured / Create Submission form — sourced
 * from the "## Selectors" table in alis/knowledge/pages/new-insured-form.md.
 * Nothing but locators belongs here; actions live in create-submission.page.ts,
 * assertions in create-submission.test.ts.
 *
 * Several fields here use an id-based CSS locator instead of role+accessible
 * name. That's not an invented shortcut — new-insured-form.md's Selectors
 * table documents, per field, why role+name is ambiguous on this form (e.g.
 * four separate Yes/No/Unknown question groups, or eight dropdowns that all
 * expose the generic accessible name "Select") and gives the confirmed,
 * live-captured id for each. Every such getter below is flagged
 * <!-- fragile --> to match that table.
 */
export class CreateSubmissionLocators {
  constructor(private readonly page: Page) {}

  // ---------------------------------------------------------------------
  // Clearance Search sidebar → results screen (entry point for this page)
  // ---------------------------------------------------------------------

  /** <!-- fragile --> CORRECTED after a real test run hung here (Playwright's
   * default 30s test timeout was exceeded on exactly this click). The
   * previous `getByRole('button', { name: 'Clearance Search' })` locator was
   * wrong in a subtle way: there IS a real button with that exact accessible
   * name on the page — but it's the mode-toggle tab *inside* the offcanvas
   * search panel (only rendered/visible once the panel is already open), not
   * the icon on the left rail that opens it. Playwright matched that hidden
   * inner button and waited forever for it to become visible, since nothing
   * was ever clicking the actual trigger. Confirmed via DOM inspection: the
   * trigger icon itself (`<i class="bi bi-plus-circle-fill ...">`) has no
   * aria-label/title of its own — "Clearance Search" is a `title` attribute
   * on its `<li>` ancestor (three levels up), which does not contribute to
   * the button's accessible name, hence role+name could never legitimately
   * match the real trigger. This CSS locator targets the actual clickable
   * `<button>` inside that titled `<li>`. */
  get clearanceSearchButton() {
    return this.page.locator('li[title="Clearance Search"] button');
  }

  /** Matches the panel's "Search" button by its normalized text content. */
  get clearanceSearchPanelSearchButton() {
    return this.page.locator('xpath=//button[normalize-space(.)="Search"]');
  }

  /** `aria-label="Close"` on the panel's own × control (class `oc-close-btn`). */
  get clearanceSearchCloseButton() {
    return this.page.locator('xpath=//button[@aria-label="Close"]');
  }

  /** `id="BtnInsured"` — a real, stable id on this button (confirmed live);
   * prefer this over a text/role match. */
  get newInsuredButton() {
    return this.page.locator('#BtnInsured');
  }

  // ---------------------------------------------------------------------
  // Agency section
  // ---------------------------------------------------------------------

  /** <!-- fragile --> No id/name/aria-label on this input; typeaheadoptionfield
   * is the one stable attribute the typeahead component renders. */
  get agencyField() {
    return this.page.locator('input[typeaheadoptionfield="AgencySearchText"]');
  }

  /** Matches a suggestion row by its own agency-code badge (e.g. "(AGT007)"),
   * exact text — <!-- fragile --> deliberately NOT matched by agency name.
   * Confirmed live 2026-09-24: this form's near-duplicate agencies (see
   * new-insured-form.md's "near-identical matches" callout) can share the
   * exact same city/state/zip text, and a suggestion's name itself renders
   * duplicated across two nested spans — so matching by name/city text can
   * hit zero, or the wrong, row once more than one similar agency is
   * returned. The code badge is a single clean text node and is guaranteed
   * unique per agency; it stayed unique in a live check even with two
   * near-duplicate agencies showing at once, and clicking it selects the
   * correct row (the click bubbles to the row's own click handler). */
  agencySuggestionByCode(code: string) {
    return this.page.getByText(code, { exact: true });
  }

  get producerDropdown() {
    return this.page.locator('select[name="AgencyProducer"]');
  }

  get contactCsrDropdown() {
    return this.page.locator('#AgencyContactCSR');
  }

  // ---------------------------------------------------------------------
  // Insured section
  // ---------------------------------------------------------------------

  applicantTypeRadio(label: string) {
    return this.page.getByRole('radio', { name: label });
  }

  get fullNameField() {
    return this.page.getByRole('textbox', { name: 'Full Name' });
  }

  get alternateDbaField() {
    return this.page.getByRole('textbox', { name: 'Alternate/DBA' });
  }

  /** <!-- fragile --> No id, no accessible name exposed despite the visible
   * "Mailing Address" floating label — `name` attribute is the only hook. */
  get mailingAddressField() {
    return this.page.locator('input[name="MailAddressLine1"]');
  }

  get mailingAddress2Field() {
    return this.page.getByRole('textbox', { name: 'Mailing Address2' });
  }

  /** <!-- fragile --> Scoped by id to avoid ambiguity with the physical-address
   * equivalent (#adrPhyCityStateZip), which stays hidden while "Physical is
   * Same as Mailing Address" is checked. */
  get cityStateZipField() {
    return this.page.locator('//input[@id="adrMailCityStateZip"]');
  }

  cityStateZipSuggestion(labelText: string) {
    return this.page.getByText(labelText, { exact: false });
  }

  get physicalSameAsMailingCheckbox() {
    return this.page.getByRole('checkbox', { name: 'Physical is Same as Mailing Address' });
  }

  /** <!-- fragile --> Two elements share this accessible name on this form;
   * `.first()` is the one confirmed to expand Additional Information. */
  get addMoreInformationButton() {
    return this.page.getByRole('button', { name: 'Add More Information' }).first();
  }

  // ---------------------------------------------------------------------
  // Additional Information section
  // ---------------------------------------------------------------------

  /** Read-only, system-assigned — assertion target only. Never fill this. */
  get insuredCodeField() {
    return this.page.getByRole('textbox', { name: 'Insured Code' });
  }

  get occupationField() {
    return this.page.getByRole('textbox', { name: 'Occupation' });
  }

  /** <!-- fragile --> No accessible name exposed. */
  get employerField() {
    return this.page.locator('#Employer');
  }

  get coField() {
    return this.page.getByRole('textbox', { name: 'C/O' });
  }

  /** <!-- fragile --> No accessible name exposed. Plain text entry (e.g.
   * "02/02/2000") is accepted — no date-picker interaction required. */
  get dateOfBirthField() {
    return this.page.locator('#BirthDt');
  }

  /** The Insured's own email — distinct from Insured Contact Detail's email
   * field further down the form (same visible label, different section). */
  get emailField() {
    return this.page.getByRole('textbox', { name: 'Email' });
  }

  get phoneField() {
    return this.page.getByRole('textbox', { name: 'Phone' });
  }

  /** Distinct from Insured Contact Detail's "Ext" field (different label
   * text, different section). */
  get extnField() {
    return this.page.getByRole('textbox', { name: 'Extn' });
  }

  get faxField() {
    return this.page.getByRole('textbox', { name: 'Fax' });
  }

  get websiteField() {
    return this.page.getByRole('textbox', { name: 'Website' });
  }

  get feinRadio() {
    return this.page.getByRole('radio', { name: 'FEIN' });
  }

  get ssnRadio() {
    return this.page.getByRole('radio', { name: 'SSN' });
  }

  /** <!-- fragile --> No accessible name exposed; masked (password-style) input. */
  get feinSsnValueField() {
    return this.page.locator('#txtFEIN');
  }

  get showFeinSsnCheckbox() {
    return this.page.getByRole('checkbox', { name: 'Show FEIN/SSN' });
  }

  /** <!-- fragile --> All four Yes/No/Unknown question groups on this form
   * share the plain accessible names "Yes"/"No"/"Unknown" — ids disambiguate.
   * Confirmed live via label[for] lookup, see new-insured-form.md. */
  // get employedRetiredDisabledYes() {
  //   return this.page.locator('#1RetiredStatusId');
  // }
  // get employedRetiredDisabledNo() {
  //   return this.page.locator('//input[@id="2RetiredStatusId"]');
  // }


  get bankruptcyYes() {
    return this.page.locator('#1BankruptcyStatusId');
  }
  get bankruptcyNo() {
    return this.page.locator('#2BankruptcyStatusId');
  }
  get bankruptcyUnknown() {
    return this.page.locator('#3BankruptcyStatusId');
  }

  /** Only two options — no Unknown. */
  get rolloverYes() {
    return this.page.locator('#1RolloverStatusId');
  }
  get rolloverNo() {
    return this.page.locator('#2RolloverStatusId');
  }

  get coApplicantYes() {
    return this.page.locator('#1rblYes');
  }
  get coApplicantNo() {
    return this.page.locator('#2rblYes');
  }
  get coApplicantUnknown() {
    return this.page.locator('#3rblYes');
  }

  get notesField() {
    return this.page.getByRole('textbox', { name: 'Notes' });
  }

  get insuredContactDetailToggle() {
    return this.page.getByRole('button', { name: 'Insured Contact Detail' });
  }

  // ---------------------------------------------------------------------
  // Account Information section — all id-based: every dropdown here shares
  // the generic accessible name "Select" (or its currently-selected value),
  // so role+name alone can't tell them apart. See new-insured-form.md.
  // ---------------------------------------------------------------------

  /** Set this FIRST, before Team/any personnel dropdown. */
  get officeDropdown() {
    return this.page.locator('#_officeCode');
  }

  /** Set right after Office. Re-verify after filling City/State/Zip — that
   * field's type-ahead has been observed to silently reset Team back to
   * "Select" even after it was already set. */
  get teamDropdown() {
    return this.page.locator('//select[@name="TeamCode"]');
  }

  get uwBrokerDropdown() {
    return this.page.locator('//select[@id="ddlUWBroker"]');
  }

  get assistantDropdown() {
    return this.page.locator('#ddlAssistant');
  }

  get originatingUwBrokerDropdown() {
    return this.page.locator('#ddlOriginatingUW');
  }

  /** <!-- fragile --> Its option list renders names with doubled internal
   * spaces (e.g. "Chirag  Choksi") — normalize whitespace before matching. */
  get secondaryUwDropdown() {
    return this.page.locator('#ddlSecUW');
  }

  /** <!-- fragile --> Same doubled-space quirk as Secondary UW. */
  get renewalQuoterDropdown() {
    return this.page.locator('#ddlRenewalQuoter');
  }

  /** <!-- fragile --> The DOM id itself has the typo "Filling" (not "Filing")
   * — confirmed live, not a documentation error. Can auto-resolve from the
   * City/State/Zip selection; only override if it doesn't already match. */
  get filingStateDropdown() {
    return this.page.locator('#ddlFillingState');
  }

  get createSubmissionButton() {
    return this.page.getByRole('button', { name: 'Create Submission' });
  }

  // ---------------------------------------------------------------------
  // Post-submit confirmation (the resulting #/underwriting/submission page)
  // ---------------------------------------------------------------------

  get submissionNumberLink() {
    return this.page.getByRole('link', { name: /^SUB\d+/ }).first();
  }

  /** <!-- fragile --> Class-based; text reads "Submission Created" on success. */
  /** User-verified 2026-09-24 (exact match on the badge's own text) — replaces
 * an earlier, unverified class-based guess (`span.badge.bg-success-subtle`).
 * Takes the expected status text as a parameter (from
 * create-submission.json's `expectedSubmissionSummary.status`) rather than
 * hardcoding "Submission Created", so this stays JSON-driven. */
submissionStatusBadge(statusText: string) {
  return this.page.locator(`xpath=//span[normalize-space(.)="${statusText}"]`);
}

  /** Confirmed live: the just-created Insured's Full Name appears verbatim in
   * the top banner of the resulting submission page, next to the Submission
   * Number. Takes the resolved name as a parameter since it's per-run unique
   * (see framework/utils/dates.ts's UNIQUE_NAME placeholder). */
  insuredNameInBanner(fullName: string) {
    return this.page.getByText(fullName, { exact: true }).first();
  }
}