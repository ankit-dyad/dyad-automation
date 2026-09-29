import { test, expect } from '../../../framework/fixtures';
import { takeScreenshot } from '../../../framework/utils/screenshot';
import { waitForDomReady } from '../../../framework/utils/waits';

test('test', async ({ page, testData }, testInfo) => {
  test.setTimeout(900000); // full 10-phase policy lifecycle, including ~4.3min of built-in hardcoded waits
  const clientName = testData.clientProfile().clientName;
  let screenshotNumber = 0;
  const capture = async (name: string) => {
    screenshotNumber += 1;
    await takeScreenshot(page, testInfo, `${String(screenshotNumber).padStart(2, '0')}-${name}`);
  };
  const waitAfterAction = async () => {
    await waitForDomReady(page);
    await page.waitForTimeout(1000);
  };
  const formatDate = (d: Date) =>
    `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowFormatted = formatDate(tomorrow);

  await page.goto('https://jmiqaweb01.nexsure.com/nexui/#/');
  await waitAfterAction();
  await page.locator('input[type="text"]').click();
  await waitAfterAction();
  await page.locator('input[type="text"]').fill('dyad.automation.7772&0724');
  await waitAfterAction();
  await page.locator('input[type="password"]').click();
  await waitAfterAction();
  await page.locator('input[type="password"]').click();
  await waitAfterAction();
  await page.locator('input[type="password"]').fill('!Dyad0001');
  await waitAfterAction();
  await page.getByRole('button', { name: 'Sign in' }).click();
  await waitAfterAction();
  await expect(page).toHaveURL(/#\//, { timeout: 30000 });
  await capture('logged-in');
  await page.getByText('Home').click();
  await waitAfterAction();
  const opportunitiesLink = page.getByRole('link', { name: 'Opportunities' });
  await expect(opportunitiesLink).toBeVisible({ timeout: 30000 });
  await opportunitiesLink.click();
  await waitAfterAction();
  await expect(page).toHaveURL(/#\/opportunities/, { timeout: 30000 });
  await capture('opportunities-open');
  await page.getByRole('button', { name: 'New' }).first().click();
  await waitAfterAction();
  await page.getByRole('textbox', { name: 'Name, Email, Phone, SSN, FEIN' }).click();
  await waitAfterAction();
  await page.getByRole('textbox', { name: 'Name, Email, Phone, SSN, FEIN' }).fill(clientName);
  await waitAfterAction();
  await page.locator('#findClientPopover').getByRole('button', { name: 'New Client' }).click();
  await waitAfterAction();
  await page.getByRole('button', { name: 'Personal' }).click();
  await waitAfterAction();
  await capture('new-client-wizard-open');
  await page.getByRole('textbox').nth(3).click();
  await waitAfterAction();
  await page.locator('#vs6__combobox').getByLabel('SelectLoading...').click();
  await waitAfterAction();
  await page.getByRole('option', { name: 'Home Office' }).click();
  await waitAfterAction();
  await page.getByRole('textbox').nth(3).click();
  await waitAfterAction();
  await page.getByRole('textbox').nth(3).fill('326 E 7th St');
  await waitAfterAction();
  await page.getByText('East 7th Street, Leadville, CO, USA').click();
  await waitAfterAction();
  await expect(page.getByText('Address Verified')).toBeVisible();
  await capture('address-verified');
  await page.getByRole('button', { name: 'Next' }).click();
  await waitAfterAction();
  await capture('client-info-complete');
  await page.getByRole('textbox').nth(2).click();
  await waitAfterAction();
  await page.getByRole('textbox').nth(2).fill('Test');
  await waitAfterAction();
  await page.getByRole('button', { name: 'Save' }).click();
  await waitAfterAction();
  await page.getByRole('button', { name: 'Next' }).click();
  await waitAfterAction();
  await page.locator('#vs10__combobox').getByLabel('SelectLoading...').click();
  await waitAfterAction();
  await page.getByRole('option', { name: '2.5 branch' }).click();
  await waitAfterAction();
  await page.getByText('Select').click();
  await waitAfterAction();
  await page.getByRole('option', { name: 'Allied Health' }).click();
  await waitAfterAction();
  await page.locator('#vs13__combobox').getByLabel('UnassignedLoading...').click();
  await waitAfterAction();
  await page.getByRole('option', { name: 'Account Executive' }).click();
  await waitAfterAction();
  await page.locator('#vs14__combobox').getByLabel('UnassignedLoading...').click();
  await waitAfterAction();
  await page.getByRole('option', { name: 'Automation, DyadQA2.5' }).click();
  await waitAfterAction();
  const doneButton = page.getByRole('button', { name: 'Done', exact: true });
  await expect(doneButton).toBeEnabled();
  await doneButton.click();
  await waitAfterAction();
  await capture('client-assignment-complete');
  const policyWizardNext = page.getByRole('button', { name: 'Next', exact: true });
  await expect(policyWizardNext).toBeVisible({ timeout: 30000 });
  await policyWizardNext.click();
  await waitAfterAction();
  await expect(page.locator('strong').filter({ hasText: '2. Select Assignment' })).toBeVisible({ timeout: 30000 });
  await capture('policy-assignment-step');
  const assignmentRow = page.locator('.grid_row.addNewRow .rowActions');
  if (await assignmentRow.isVisible().catch(() => false)) {
    await assignmentRow.click();
    await waitAfterAction();
  }
  const policyAssignmentRow = page.locator('.grid_row:not(.addNewRow)').last();
  await expect(policyAssignmentRow).toContainText('2.5 branch');
  await waitAfterAction();
  await expect(policyAssignmentRow).toContainText('Allied Health');
  await waitAfterAction();
  await expect(policyAssignmentRow).toContainText('Account Executive');
  await waitAfterAction();
  await expect(policyAssignmentRow).toContainText('DyadQA2.5 Automation');
  await waitAfterAction();
  await page.getByText('Back Next').click();
  await waitAfterAction();
  await page.getByRole('button', { name: 'Next' }).click();
  await waitAfterAction();
  await page.getByRole('combobox', { name: 'Search for option' }).first().click();
  await waitAfterAction();
  await page.getByText('X100_Commercial Lines').click();
  await waitAfterAction();
  await page.getByRole('textbox', { name: 'Search for LOBs' }).click();
    await page.waitForTimeout(30000);
  await page.getByRole('textbox', { name: 'Search for LOBs' }).fill('126');
  await waitAfterAction();
  const generalLiability = page.getByRole('checkbox', { name: 'X100_General Liability (126)', exact: true });
  await generalLiability.check();
  await waitAfterAction();
  await expect(generalLiability).toBeChecked();
  await capture('product-and-lob-selected');
  const createOpportunityButton = page.getByRole('button', { name: 'Create Opportunity', exact: true });
  await expect(createOpportunityButton).toBeEnabled();
  await createOpportunityButton.click();
    await page.waitForTimeout(50000);
  await expect(page.locator('#appWrapper')).toContainText('2.5 branch');
  await expect(page.locator('#appWrapper')).toContainText('DyadQA2.5 Automation');
  await expect(page.locator('#appWrapper')).toContainText('X100_General Liability (126)');
  await capture('opportunity-created');
  await page.getByText('Marketing').click();
  await waitAfterAction();
  await page.getByRole('button', { name: 'Manual Quote' }).click();
  await waitAfterAction();
  await page.getByLabel('SelectLoading...').click();
  await waitAfterAction();
  await page.getByRole('option', { name: 'AAA Carrier' }).click();
  await waitAfterAction();
  await page.locator('//div[@class="ddl-business-type"]').click();
  await waitAfterAction();
  await page.locator('//div[@class="cursor-pointer business-type-item"]').click();
  await waitAfterAction();
  await page.locator('(//div[@class="modal_footer"]//button[@nex-id="nex_button"])[1]').click();
  await waitAfterAction();
  await expect(page.locator('#appWrapper')).toContainText('Annotation', { timeout: 30000 });
  await capture('manual-quote-created');
  await page.getByText('Binding').click();
  await waitAfterAction();
  await page.getByLabel('NoneLoading...').click();
  await waitAfterAction();
  await page.getByText('1. Application').click();
  await waitAfterAction();
  await page.getByText('Marketing').click();
  await waitAfterAction();
  await page.locator('.rowExpandIcon > path').click();
  await waitAfterAction();
  await expect(page.locator('#appWrapper')).toContainText('Coverage');
  await expect(page.locator('#appWrapper')).toContainText('Billing Info');
  await expect(page.locator('#appWrapper')).toContainText('Portal Settings');
  await page.getByText('Billing Info').click();
  await waitAfterAction();
  await page.locator('.toggle_outside').click();
  await waitAfterAction();
  await page.getByText('$').nth(2).click();
  await waitAfterAction();
  await page.getByText('$').nth(2).click();
  await waitAfterAction();
  await page.getByText('$').nth(3).click();
  await waitAfterAction();
  await page.getByRole('textbox').nth(2).fill('$10.00');
  await waitAfterAction();
  await page.locator('.grid_cell.rowActions > svg').first().click();
  await waitAfterAction();
  await page.locator('.actionAnnotationIcon').click();
  await waitAfterAction();
  await page.getByText('Bind', { exact: true }).click();
  await waitAfterAction();
  await capture('bind-requested');
  const bindingPolicyRow = page.locator('.grid_row').filter({ hasText: 'In Force Policy' }).last();
  await bindingPolicyRow.getByText('Billing Info', { exact: true }).click();
  await waitAfterAction();
  await expect(page.getByText('Billing Information', { exact: true })).toBeVisible();
  const premiumFinanceField = page.getByText('Premium Finance Company', { exact: true }).locator('..').getByRole('combobox');
  await premiumFinanceField.click();
  await waitAfterAction();
  await page.getByRole('option', { name: 'None', exact: true }).click();
  await waitAfterAction();
  await page.getByRole('button', { name: /Save Billing Info/i }).click();
  await waitAfterAction();
  await page.keyboard.press('Escape');
  await waitAfterAction();
  await expect(page.getByRole('alertdialog')).toHaveCount(0);
  await capture('binding-billing-info-saved');
  await page.getByRole('button', { name: 'In Force Policy (0 of 0)' }).click();
  await waitAfterAction();

  // Billing Carrier
  const billingCarrierField = page
    .locator('.form_group', { hasText: 'Billing Carrier' })
    .locator('.vs__dropdown-toggle');
  await billingCarrierField.waitFor({ state: 'visible' });
  await billingCarrierField.click();

  await waitAfterAction();
  // Billing Carrier Select AAA Carrier
  const aaaCarrierOption = page.getByRole('option', { name: 'AAA Carrier', exact: true });
  await aaaCarrierOption.waitFor({ state: 'visible' });
  await aaaCarrierOption.click();
    
  const roleField = page.locator('.v-select').filter({ hasText: 'Account Executive' }).last();
  if (await roleField.isVisible({ timeout: 3000 }).catch(() => false)) {
    await roleField.click();
    await waitAfterAction();
    await page.getByRole('option', { name: 'Account Executive', exact: true }).click();
    await waitAfterAction();
  }
  const primaryAssignmentField = page.locator('.v-select').filter({ hasText: 'Automation, DyadQA2.5' }).last();
  if (await primaryAssignmentField.isVisible({ timeout: 3000 }).catch(() => false)) {
    await primaryAssignmentField.click();
    await waitAfterAction();
    await page.getByRole('option', { name: 'Automation, DyadQA2.5', exact: true }).click();
    await waitAfterAction();
  }
  await capture('in-force-modal-ready');
  const inForceButton = page.getByRole('button', { name: 'In Force', exact: true });
  await expect(inForceButton).toBeEnabled();
  await inForceButton.click();
  await page.waitForTimeout(180000);
  
  await waitAfterAction();
  await capture('in-force-submitted');
  // const alreadyOnEntityConsole = await page
  //   .locator('#entity_console')
  //   .isVisible({ timeout: 5000 })
  //   .catch(() => false);
  // if (!alreadyOnEntityConsole) {
  //   // A slow In Force submission can auto-redirect straight to the entity console
  //   // before this runs — only do the manual link-based navigation when it hasn't.
  //   const clientEntityLink = page.getByRole('link', { name: clientName, exact: true }).first();
  //   const clientEntityHref = await clientEntityLink.getAttribute('href');
  //   if (!clientEntityHref) {
  //     throw new Error('The current client entity link did not expose a navigation href.');
  //   }
  //   await page.goto(new URL(clientEntityHref, page.url()).toString());
  //   await waitAfterAction();
  // }

  
  // inForce  [Clickable]
  const inForce = page.locator(`xpath=//div[contains(@class,'grid_row')]/div[2]/div`);
  await expect(inForce).toHaveText(`IN FORCE`);
  //await page.locator('//a[normalize-space(.)="POLICIES(1)"]').click();
  await waitAfterAction();
  await page.locator('//div[contains(@class,"policyNumberRow")]/div/div').click();
  
  await waitAfterAction();

  await capture('in-force-policy-open');
  const endorseButton = page.locator(`xpath=//button[normalize-space(.)="Endorse"]`);
  await expect(endorseButton).toBeVisible();
  await expect(endorseButton).toHaveText(`Endorse`);
  await endorseButton.click();
  await waitAfterAction();

  // formControlInput  [TextInput]
  const formControlInput = page.locator(`xpath=//div[contains(@class,'form_group')]/input`);
  await expect(formControlInput).toBeVisible();
  await formControlInput.fill(`Automation testing`);
  
  // createEndorsementButton  [Button]
  const createEndorsementButton = page.locator(`xpath=//button[normalize-space(.)="Create Endorsement"]`);
  await expect(createEndorsementButton).toBeVisible();
  await expect(createEndorsementButton).toHaveText(`Create Endorsement`);
  await createEndorsementButton.click();
  await waitAfterAction();
  await page.getByRole('button', { name: 'Create Endorsement', exact: true }).click();
  await waitAfterAction();
  await expect(page.locator('#entity_console')).toContainText('Pending Endorsement', { timeout: 30000 });
  await capture('pending-endorsement');
  await page.getByRole('button', { name: 'Post' }).click();
  await waitAfterAction();
  await page.locator('button').filter({ hasText: /^Post$/ }).click();
  await waitAfterAction();
  await capture('endorsement-posted');
  await page.getByRole('button', { name: 'Service' }).click();
  await waitAfterAction();
  await page.getByRole('option', { name: 'Edit', exact: true }).click();
  await waitAfterAction();
  await expect(page.getByText('Edit Policy', { exact: true })).toBeVisible({ timeout: 30000 });
  const editDateField = page.locator(".form_group:has-text('Effective Date') input");
  await editDateField.fill(tomorrowFormatted);
  await waitAfterAction();
  await editDateField.press('Tab');
  await waitAfterAction();
  await expect(editDateField).toHaveValue(tomorrowFormatted);
  await page.getByRole('button', { name: 'Generate Edit' }).click();
  await waitAfterAction();
  await expect(page.locator('#entity_console')).toContainText('Pending Edit');
  await capture('pending-edit');
  await page.getByRole('button', { name: 'Post' }).click();
  await waitAfterAction();
  await page.getByRole('button', { name: 'Service' }).click();
  await waitAfterAction();
  await page.getByRole('option', { name: 'Renewal', exact: true }).click();
  await waitAfterAction();
  await expect(page.locator('#PendoRenewPolicyGuide')).toContainText('Renew Policy');
  await page.getByRole('button', { name: 'Create Renewal Policy' }).click();
  await waitAfterAction();
  await expect(page.locator('#entity_console')).toContainText('Future');
  await expect(page.locator('#entity_console')).toContainText('In Force');
  await capture('renewal-created');
  await page.getByRole('button', { name: 'In Force' }).click();
  await waitAfterAction();
  await expect(page.locator('#appWrapper')).toContainText('Policy In Forced Successfully');
  await capture('renewal-in-force');
  await expect(page.locator('div').filter({ hasText: /^Policy In Forced Successfully$/ }).nth(1)).toBeVisible();
  await page.getByRole('button', { name: 'Go to Policy' }).click();
  await waitAfterAction();
  await expect(page.locator('#entity_console')).toContainText('In Force');
  await page.getByRole('button', { name: 'Service' }).click();
  await waitAfterAction();
  await page.getByRole('option', { name: 'Cancellation', exact: true }).click();
  await waitAfterAction();
  await page.locator('#vs45__combobox').getByLabel('SelectLoading...').click();
  await waitAfterAction();
  await page.getByRole('option', { name: 'Insured Request' }).click();
  await waitAfterAction();
  await page.getByLabel('SelectLoading...').click();
  await waitAfterAction();
  await page.getByRole('option', { name: 'Flat' }).click();
  await waitAfterAction();
  await page.getByLabel('Insured RequestLoading...').click();
  await waitAfterAction();
  await page.getByRole('option', { name: 'Non-Payment' }).click();
  await waitAfterAction();
  await page.getByRole('button', { name: 'Generate Cancellation' }).click();
  await waitAfterAction();
  //await page.goto('https://jmiqaweb01.nexsure.com/nexui/#/entity_console/6/17452/policies/summary/3765/0/pi-detail/overview');
  await waitAfterAction();
  await expect(page.getByText('OPP-001402Pending Cancellation')).toBeVisible();
  await expect(page.locator('#entity_console')).toContainText('Pending Cancellation');
  await capture('pending-cancellation');
  await expect(page.locator('#entity_console')).toContainText('09/24/2026');
  await page.getByRole('button', { name: 'Post' }).click();
  await waitAfterAction();
  await page.getByLabel('SelectLoading...').click();
  await waitAfterAction();
  await page.getByRole('option', { name: 'Appointment' }).click();
  await waitAfterAction();
  await page.locator('textarea').click();
  await waitAfterAction();
  await page.locator('div').filter({ hasText: 'OK Cancel' }).nth(5).click();
  await waitAfterAction();
  await page.getByRole('button', { name: 'OK' }).click();
  await waitAfterAction();
  await expect(page.locator('#entity_console')).toContainText('Cancelled');
  await capture('policy-cancelled');
  await page.getByRole('link', { name: 'Policies', exact: true }).click();
  await waitAfterAction();
  await page.getByLabel('Active and FutureLoading...').click();
  await waitAfterAction();
  await page.getByRole('option', { name: 'Historical' }).click();
  await waitAfterAction();
  await expect(page.locator('#entity_console')).toContainText('Cancelled');
  await page.getByText('RenewPackageX100_General').click();
  await waitAfterAction();
  await expect(page.locator('#entity_console')).toMatchAriaSnapshot(`
    - button "Print":
      - img
      - text: ""
    - button "Reinstate":
      - img
      - text: ""
    - button "Rewrite":
      - img
      - text: ""
    `);
  await capture('historical-policy-verified');
 
 
});