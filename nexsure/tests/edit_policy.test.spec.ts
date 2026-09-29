import { test, expect } from '../../framework/fixtures';
import { getCredential } from '../../framework/utils/env';
import { takeScreenshot } from '../../framework/utils/screenshot';
import { waitForDomReady, waitForVisible } from '../../framework/utils/waits';
import nexsureData from '../knowledge/data.json';

test('test', async ({ page }, testInfo) => {
  test.setTimeout(900000); // full 10-phase policy lifecycle, including ~4.3min of built-in hardcoded waits
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
  await page.locator('input[type="text"]').fill(getCredential('NEXSURE_LOGIN_USER', 'nexsure', 'username'));
  await waitAfterAction();
  await page.locator('input[type="password"]').click();
  await waitAfterAction();
  await page.locator('input[type="password"]').click();
  await waitAfterAction();
  await page.locator('input[type="password"]').fill(getCredential('NEXSURE_LOGIN_PASS', 'nexsure', 'password'));
  await waitAfterAction();
  await page.getByRole('button', { name: 'Sign in' }).click();
  await waitAfterAction();
  await expect(page).toHaveURL(/#\//, { timeout: 30000 });
  await capture('logged-in');

  // enterSearchKeywordsInput  [TextInput]
  const clientName = 'Automation Client 95dafb24';
  const enterSearchKeywordsInput = page.locator(`xpath=//input[@placeholder="Enter search keywords"]`);
  await waitForVisible(enterSearchKeywordsInput, 30000);
  await expect(enterSearchKeywordsInput).toBeVisible();
  await waitAfterAction();
  await enterSearchKeywordsInput.fill(clientName);
  await capture('search-keywords-entered');

  // searchButton  [Button]
  const searchButton = page.locator(`xpath=//*[@id="PendoSearchGuide"]`);
  await waitForVisible(searchButton, 30000);
  await expect(searchButton).toBeVisible();
  await expect(searchButton).toHaveText(`Search`);
  await waitAfterAction();
  await searchButton.click();
  await capture('search-clicked');

  // ────────────────────────────────────────────────────────────────────────────────────

  // automationClient48fd405b  [Clickable]
  const automationClient48fd405b = page.locator(`xpath=//span[contains(@class,'highlighted')]`);
  await waitForVisible(automationClient48fd405b, 30000);
  await expect(automationClient48fd405b).toBeVisible();
  await capture('search-results-highlighted');

  // automationClient48fd405bpersonal  [Clickable]
  const automationClient = page.locator(`xpath=//div[normalize-space()='Automation Client 95dafb24']`);
  await waitForVisible(automationClient, 30000);
  await expect(automationClient).toBeVisible();
  await waitAfterAction();
  await automationClient.click();
  await capture('client-opened');
  

  // policiesLink  [Link]
  const policiesLink = page.locator(`//a[contains(.,'POLICIES')]`);
  await waitForVisible(policiesLink, 60000);
  await expect(policiesLink).toBeVisible();
  await waitAfterAction();
  await policiesLink.click();
  await capture('policies-tab-opened');

// aaaCarrier  [Clickable]
  const aaaCarrier = page.locator(`xpath=//div[contains(@class,'grid_cell')]/div[1]/span[2]`);
  await waitForVisible(aaaCarrier, 30000);
  await expect(aaaCarrier).toHaveText(`AAA Carrier`);

  
  // path  [Clickable]
  const path = page.locator(`xpath=//span[contains(@class, "nex_context_menu_item_label") and normalize-space(.)="Edit"]`);
  await waitForVisible(path, 30000);
  await expect(path).toBeVisible();
  await path.click();
  
  
  // formControlInput  [TextInput]
  const formControlInput = page.locator(`xpath=//div[contains(@class,'form_group')]/input`);
  await waitForVisible(formControlInput, 30000);
  await expect(formControlInput).toBeVisible();
  await formControlInput.fill(`Edited`);
  
  // generateEditButton  [Button]
  const generateEditButton = page.locator(`xpath=//button[normalize-space(.)="Generate Edit"]`);
  await waitForVisible(generateEditButton, 30000);
  await expect(generateEditButton).toBeVisible();
  await generateEditButton.click();
  
    // addMessageButton  [Button]
  const addMessageButton = page.locator(`xpath=//button[normalize-space(.)="Add Message"]`);
  await waitForVisible(addMessageButton, 30000);
  await expect(addMessageButton).toBeVisible();
  await expect(addMessageButton).toHaveText(`Add Message`);
  await addMessageButton.click();

  // enterMessageContentHereField  [TextArea]
  const enterMessageContentHereField = page.locator(`xpath=//textarea[@placeholder="Enter message content here..."]`);
  await waitForVisible(enterMessageContentHereField, 30000);
  await expect(enterMessageContentHereField).toBeVisible();
  await enterMessageContentHereField.fill(`Testing`);
  
  // saveButton  [Button]
  const saveButton = page.locator(`xpath=//button[normalize-space(.)="Save"]`);
  await waitForVisible(saveButton, 30000);
  await expect(saveButton).toBeVisible();
  await expect(saveButton).toHaveText(`Save`);
  await saveButton.click();


  // testing  [Span]
  const testing = page.locator(`xpath=//span[normalize-space(.)="Testing"]`);
  await expect(testing).toHaveText(`Testing`);
  
  // messagesaddMessageeditedPolicytesting  [Div]
  const messagesaddMessageeditedPolicytesting = page.locator(`xpath=//div[contains(@class,'panels')]/div[2]/div[1]/div`);
  await waitForVisible(messagesaddMessageeditedPolicytesting, 30000);
  await expect(messagesaddMessageeditedPolicytesting).toBeVisible();
  await test.info().attach(`messagesaddMessageeditedPolicytesting`, { body: await messagesaddMessageeditedPolicytesting.screenshot(), contentType: 'image/png' });
  
  // postButton  [Button]
  const postButton = page.locator(`xpath=//button[normalize-space(.)="Post"]`);
  await waitForVisible(postButton, 30000);
  await expect(postButton).toBeVisible();
  await expect(postButton).toHaveText(`Post`);
  await postButton.click();

    // automationClient95dafb24  [Span]
  const automationClient95dafb24 = page.locator(`xpath=//div[contains(@class,'entity_name')]/h1/span`);
  await waitForVisible(automationClient95dafb24, 30000);
  await expect(automationClient95dafb24).toHaveText(`Automation Client 95dafb24`);

  await test.info().attach(`messagesaddMessageeditedPolicytesting`, { body: await messagesaddMessageeditedPolicytesting.screenshot(), contentType: 'image/png' });
  const policyInfo = page.locator(`xpath=//div[contains(@class,'policy_info')]`);
  await waitForVisible(policyInfo, 30000);
  await expect(policyInfo).toBeVisible();
  await test.info().attach(`policy_info`, { body: await policyInfo.screenshot(), contentType: 'image/png' });
  });