import type { Page } from '@playwright/test';

/**
 * Locator definitions for the Quote Option Detail screen — Risk / Premium /
 * Terms & Forms / Additional Interest / Other Details tabs — see
 * knowledge/pages/quote-option-details.md's Overview. Reached from the
 * Quote tab's option row by clicking the option's premium amount link
 * (e.g. "$79,347.00 →"); opens in the SAME tab (not a popup, unlike
 * Add/Edit Risk and Rate Summary), so this class is constructed against the
 * same `page` the rest of the flow already uses.
 *
 * <!-- fragile --> Built from a user-supplied Playwright codegen recording
 * (2026-09-25) that, per explicit instruction, only exercised ONE form
 * deletion (ticked, deleted, confirmed) and one deletion CANCEL (ticked,
 * clicked Delete Form, then clicked Cancel instead of Ok) — not the full
 * 10-form bulk delete this feature actually needs. The codegen's own
 * per-row checkbox ids (`#ag-1571-input`, `#ag-1747-input`) are ag-Grid's
 * own internal, per-session row-instance ids — confirmed NOT stable across
 * runs (same category of issue as Rate Summary's per-run expand-icon id) —
 * so they are NOT reproduced here; every row/checkbox locator below is
 * built from the row's own Form No. text instead, matching this project's
 * established row-scoping pattern (see market-selection.locators.ts's
 * marketRowCheckbox()). None of this has been independently live-verified.
 * 
 * 
 */

   
export class QuoteOptionDetailLocators {
  constructor(private readonly page: Page) {this.page = page;}  

  /** The option row's own premium amount link on the Quote tab (e.g.
   * "$77,760.00 →") — matched by pattern, not a literal amount, since the
   * premium varies run to run (same reasoning as rate-summary.locators.ts's
   * totalPremiumText). The codegen recording's own literal example kept a
   * trailing space in the accessible name ("$77,760.00 "); `getByRole`'s
   * name option normalizes whitespace, so this pattern doesn't need to
   * reproduce that exactly. */
  get optionPremiumLink() {
    return this.page.getByRole('link', { name: /^\$[\d,]+\.\d{2}/ });
  }

  /** The page heading once Quote Option Detail opens — also a dynamic
   * dollar amount, per the codegen recording's own literal example
   * (`getByRole('heading', { name: '$77,760.00' })`). */
  get premiumHeading() {
    return this.page.getByRole('heading', { name: /^\$[\d,]+\.\d{2}$/ });
  }

  /** Soft confirmation the page actually landed here — matches the tab
   * strip's own combined text exactly as the codegen recorded it. */
  get tabStripText() {
    return this.page.getByText('Risk Premium Terms & Forms');
  }

  // ---------------------------------------------------------------------
  // Risk tab (default)
  // ---------------------------------------------------------------------

  /** The coverage heading with its premium in brackets (e.g.
   * "COMMERCIAL GENERAL LIABILITY [ $79,347.00 ]") — matched on the
   * coverage name alone (a substring match), since the bracketed premium is
   * the same run-to-run-varying figure as everywhere else on this screen. */
  coverageHeading(coverageName: string) {
    return this.page.getByRole('heading', { name: coverageName }).first();
  }

  /** Read-only Limit/Deductible table cells, matched by their own visible
   * text — mirrors exactly what was entered on Add/Edit Risk's
   * Limits/Deductibles tab (confirmed field-for-field by a prior live pass,
   * per quote-option-details.md's Risk tab section). */
  limitDeductibleCell(text: string) {
    return this.page.getByRole('cell', { name: text, exact: true });
  }

  // ---------------------------------------------------------------------
  // Premium tab
  // ---------------------------------------------------------------------

  get premiumTab() {
    return this.page.getByRole('tab', { name: ' Premium' });
  }

  /** "Rated Premium : $<amount>" — dynamic figure, matched by pattern. */
  get ratedPremiumHeading() {
    return this.page.getByRole('heading', { name: /Rated Premium\s*:\s*\$[\d,]+\.\d{2}/ });
  }

  /** A genuine native `<select>` — confirmed by testing-process-notes.md's
   * own note distinguishing it from Agent Comm %'s custom dropdown below.
   * `selectOption('3')` in the codegen recording is a raw option value, not
   * a visible label (unconfirmed which visible TRIA Type '3' corresponds
   * to — same caution as Add/Edit Risk's deductibleBasisDropdown). */
  get triaTypeDropdown() {
    return this.page.getByLabel('TRIA Type', { exact: true });
  }

  /** <!-- fragile --> Gross Comm % and Agent Comm % are BOTH custom
   * dropdowns on this screen (not native `<select>`s) — confirmed live for
   * Agent Comm % by testing-process-notes.md's "Agent Comm % is a custom
   * dropdown" note, and the codegen recording drives Gross Comm % the exact
   * same way (click the field, click its own "Toggle Dropdown" button,
   * click the desired option in the resulting overlay). The codegen
   * recording distinguishes the two fields' toggle buttons only by
   * position (`.nth(1)` for Gross Comm %, `.nth(2)` for Agent Comm %) since
   * neither toggle button has its own distinguishing accessible name — this
   * is inherently fragile if the page ever renders another "Toggle
   * Dropdown" button earlier on the tab; confirm the nth() indices on a
   * real run. */
  get toggleDropdownButtons() {
    return this.page.getByRole('button', { name: 'Toggle Dropdown' });
  }

  dropdownOverlayOption(label: string) {
    return this.page.getByRole('link', { name: label });
  }

  /** Bottom action bar's page-level Save — per quote-option-details.md,
   * shares the action bar with Generate Quote/Generate Indication/Proceed
   * to Bind/Bind & Invoice; scoped by its own exact accessible name since
   * none of those other buttons are also literally named "Save". */
  get saveButton() {
    return this.page.getByRole('button', { name: 'Save', exact: true });
  }

  // ---------------------------------------------------------------------
  // Terms & Forms tab
  // ---------------------------------------------------------------------

  get termsAndFormsTab() {
    return this.page.getByRole('tab', { name: ' Terms & Forms' });
  }

  /** "Forms [Count: N]" — per quote-option-details.md and
   * testing-process-notes.md Rule 10, this heading is the ONLY trustworthy
   * source of the grid's true row count; the grid itself is virtualized and
   * a manual/visual scroll-through can under-count. Matched by pattern;
   * rate-summary.page.ts-style text parsing (extract the digits) is done by
   * the caller, not here, per BasePage's no-assertions rule. */
  get formsCountHeading() {
    return this.page.getByText(/Forms\s*\[\s*Count:\s*\d+\s*\]/);
  }

  /** A form's own grid row, matched by its Form No. text — NOT by the
   * codegen recording's own per-session `#ag-####-input` checkbox ids (see
   * this class's own top-of-file comment for why those aren't reusable).
   * <!-- fragile --> Whether the row's own accessible name actually
   * includes the Form No. text (the way Market Selection's grid rows do)
   * is unconfirmed for this specific ag-Grid instance — confirm on a real
   * run; if it doesn't, this will need to fall back to `hasText` instead of
   * `getByRole('row', { name })`. */
  formRow(formNo: string) {
    const pattern = new RegExp(formNo.trim().replace(/\s+/g, '[\\s\\u00a0]*'), 'i');
    return this.page
      .locator('.ag-row', { hasText: pattern })
      .or(this.page.getByRole('row', { name: pattern }))
      .first();
  }

  /** The row's own Delete checkbox, scoped within formRow() */
  formDeleteCheckbox(formNo: string) {
    return this.formRow(formNo)
      .locator('input[type="checkbox"]')
      .or(this.formRow(formNo).getByRole('checkbox'))
      .or(this.formRow(formNo).locator('.ag-checkbox-input'))
      .first();
  }

  /** A form's Form No. cell — handles non-breaking spaces & extra whitespace */
  formNoCell(formNo: string) {
    const pattern = new RegExp(formNo.trim().replace(/\s+/g, '[\\s\\u00a0]*'), 'i');
    return this.page
      .locator('.ag-cell', { hasText: pattern })
      .or(this.page.getByRole('gridcell', { name: pattern }))
      .first();
  }

  /** <!-- fragile --> ag-Grid's own scrollable viewport element — a
   * standard ag-Grid CSS class, but not independently confirmed against
   * this specific app instance. Used to scroll the virtualized grid in
   * small increments (per testing-process-notes.md Rule 10's own guidance
   * that large mouse-wheel scrolls get "stuck" and silently skip rows) —
   * see quote-option-detail.page.ts's scrollGridUntilVisible(). */
  get formsGridViewport() {
    return this.page.locator('.ag-body-viewport');
  }

  get deleteFormButton() {
    return this.page.getByRole('button', { name: 'Delete Form' });
  }

  /** Same generic `.modal-content` + heading-scoped confirm pattern as
   * market-selection.locators.ts's confirmCreateOptionDialogButton() —
   * this app reuses this dialog shape everywhere a destructive/confirming
   * action needs a yes/no. */
  confirmDialogButton(label: 'Cancel' | 'Ok') {
    return this.page
      .locator('.modal-content', { has: this.page.getByRole('heading', { name: 'Please Confirm' }) })
      .getByRole('button', { name: label });
  }

  // Reorder forms modal
get reorderFormsButton() {
  return this.page.getByRole('button', { name: 'Reorder forms' });
}

get reorderFormsDialog() {
  return this.page.locator('div').filter({ hasText: /^Forms$/ });
}

get reorderFormsHeader() {
  return this.reorderFormsDialog.getByText(/^Forms$/);
}

reorderFormRow(formNo: string) {
  return this.reorderFormsDialog.locator('.ag-row', { hasText: formNo });
}

reorderFormDeleteIcon(formNo: string) {
  return this.reorderFormRow(formNo).locator('.bi');
}

get reorderFormsSaveButton() {
  return this.reorderFormsDialog.getByRole('button', { name: 'Save' });
}

get reorderFormsViewport() {
  return this.reorderFormsDialog.locator('.ag-body-viewport');
}

get formCheckboxL380() {
  return this.page.locator('//div[@comp-id="1601"]');
}

get formCheckboxL501() {
  return this.page.locator('//div[@comp-id="1585"]');
}

get formCheckboxL601() {
  return this.page.locator('//div[@comp-id="1553"]');
}

get formCheckboxS902() {
  return this.page.locator('//div[@comp-id="1521"]');
}

get formCheckboxE001() {
  return this.page.locator('//div[@comp-id="1513"]');
}

get formCheckbox2141() {
  return this.page.locator('#ag-2141-input');
}

get formCheckbox2093() {
  return this.page.locator('#ag-2093-input');
}

get formCheckbox2261() {
  return this.page.locator('#ag-2261-input');
}

get formCheckbox2422() {
  return this.page.locator('#ag-2422-input');
}

get formCheckbox2405() {
  return this.page.locator('#ag-2405-input');
}


  get confirmationMessage() {
    return this.page.getByText('Please ConfirmAre you sure');
  }

  get okButton() {
    return this.page.getByRole('button', {
      name: 'Ok',
    });
  }

  get cancelButton() {
    return this.page.getByRole('button', {
      name: 'Cancel',
    });
  }

  // ---------------------------------------------------------------------
  // Bind & Invoice
  // ---------------------------------------------------------------------

  get bindAndInvoiceButton() {
    return this.page.getByRole('button', { name: 'Bind & Invoice' });
  }

  get policyNumberRadio() {
    return this.page.getByRole('radio', { name: 'Policy Number' });
  }

  get manualRadio() {
    return this.page.getByRole('radio', { name: 'Manual' });
  }

  get policyNumberInput() {
    return this.page.getByRole('textbox', { name: 'Policy Number' });
  }

  get proceedModalButton() {
    return this.page.getByRole('button', { name: 'Proceed', exact: true });
  }

  get policyLink() {
    return this.page.getByRole('link', { name: 'Policy', exact: true });
  }

  get reviewPolicyButton() {
    return this.page.getByRole('button', { name: 'Review Policy' });
  }
}