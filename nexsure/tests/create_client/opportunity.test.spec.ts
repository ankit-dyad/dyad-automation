import { test, expect } from '@playwright/test';

// TesboLocsy — Auto-generated Playwright test
// Preview generated: 25/09/2026, 21:17:09
// Pages: 10  |  Locators: 55
// Locator type: XPath  |  Asserts: toBeVisible

test('End-to-End Flow', async ({ page }) => {

  // ───────────────────────────────────────────────────────
  // NEXSURE - DYAD, INC. - THE LEADER IN INSURANCE TECHNOLOGY AND AUTOMATION.
  await page.goto(`https://loginjmiqa.nexsure.com/Authentication/`);
  await page.waitForLoadState();
  
  // usernameInput  [TextInput]
  const usernameInput = page.locator(`xpath=//input[@id='DefaultContent_txtLoginName' and @name='ctl00$DefaultContent$txtLoginName']`);
  await expect(usernameInput).toBeVisible();
  await usernameInput.fill(`dyad.automation.7772&0724`);
  
  // passwordInput  [PasswordInput]
  const passwordInput = page.locator(`xpath=//input[@id='DefaultContent_txtPassword' and @name='ctl00$DefaultContent$txtPassword']`);
  await expect(passwordInput).toBeVisible();
  await passwordInput.fill(`!Dyad0001`);
  
  // ctl00DefaultcontentBtnloginButton  [Button]
  const ctl00DefaultcontentBtnloginButton = page.locator(`xpath=//input[@id='DefaultContent_btnLogin' and @name='ctl00$DefaultContent$btnLogin']`);
  await expect(ctl00DefaultcontentBtnloginButton).toBeVisible();
  await ctl00DefaultcontentBtnloginButton.click();
  
  // ───────────────────────────────────────────────────────
  // Nexsure
  await page.goto(`https://jmiqaweb01.nexsure.com/nexui/#/home`);
  await page.waitForLoadState();
  
  // goodEveningDyad7772  [Div]
  const goodEveningDyad7772 = page.locator(`xpath=//div[normalize-space(.)="Good Evening, Dyad 7772!"]`);
  await expect(goodEveningDyad7772).toHaveText(`Good Evening, Dyad 7772!`);
  
  // enterSearchKeywordsInput  [TextInput]
  const enterSearchKeywordsInput = page.locator(`xpath=//input[@placeholder="Enter search keywords"]`);
  await expect(enterSearchKeywordsInput).toBeVisible();
  await enterSearchKeywordsInput.fill(`Automation Client fd9a29f5`);
  
  // searchButton  [Button]
  const searchButton = page.locator(`xpath=//*[@id="PendoSearchGuide"]`);
  await expect(searchButton).toBeVisible();
  await expect(searchButton).toHaveText(`Search`);
  await searchButton.click();
  
  // ───────────────────────────────────────────────────────
  // Search > Clients
  await page.goto(`https://jmiqaweb01.nexsure.com/nexui/#/entity_search/client`);
  await page.waitForLoadState();
  
  // carriersLink  [Link]
  const carriersLink = page.locator(`xpath=//a[@href="#/entity_search/carrier"]`);
  await expect(carriersLink).toBeVisible();
  await expect(carriersLink).toHaveText(`Carriers`);
  
  // ───────────────────────────────────────────────────────
  // Search > Carriers
  await page.goto(`https://jmiqaweb01.nexsure.com/nexui/#/entity_search/carrier`);
  await page.waitForLoadState();
  
  // addNewButton  [Button]
  const addNewButton = page.locator(`xpath=//button[normalize-space(.)="Add New"]`);
  await expect(addNewButton).toBeVisible();
  await expect(addNewButton).toHaveText(`Add New`);
  await addNewButton.click();
  
  // ───────────────────────────────────────────────────────
  // New Client
  await page.goto(`https://jmiqaweb01.nexsure.com/nexui/#/client/new?LocAddress=&LocCity=&LocZip=&LocState=0&LocStateCode=null&ClientName=Automation%20Client%20fd9a29f5&ClientType=A&PhoneNumber=&BranchId=-1&LocName=&eid=6`);
  await page.waitForLoadState();
  
  // personalButton  [Button]
  const personalButton = page.locator(`xpath=//button[normalize-space(.)="Personal"]`);
  await expect(personalButton).toBeVisible();
  await expect(personalButton).toHaveText(`Personal`);
  await personalButton.click();
  
  // selectloadingInput  [SearchInput]
  const selectloadingInput = page.locator(`xpath=//*[@id='vs3__combobox']/div[1]/input`);
  await expect(selectloadingInput).toBeVisible();
  await selectloadingInput.fill(``);
  
  // homeOffice  [Clickable]
  const homeOffice = page.locator(`xpath=//*[@id="vs3__option-1"]`);
  await expect(homeOffice).toBeVisible();
  
  // input  [TextInput]
  const input = page.locator(`xpath=//div[contains(@class,'span4')]/div/div/input`);
  await expect(input).toBeVisible();
  await input.fill(`326 E 7th St`);
  
  // 326East7thStreetLeadvilleCoUsa  [Clickable]
  const _26East7thStreetLeadvilleCoUsa = page.locator(`xpath=//div[normalize-space(.)="326 East 7th Street, Leadville, CO, USA"]`);
  await expect(_26East7thStreetLeadvilleCoUsa).toBeVisible();
  
  // addressVerified  [Span]
  const addressVerified = page.locator(`xpath=//div[contains(@class,'section_title')]/span[2]/span`);
  await expect(addressVerified).toHaveText(`Address Verified`);
  
  // nextButton  [Button]
  const nextButton = page.locator(`xpath=//button[normalize-space(.)="Next"]`);
  await expect(nextButton).toBeVisible();
  await expect(nextButton).toHaveText(`Next`);
  await nextButton.click();
  
  // nextButton  [Button]
  const nextButton2 = page.locator(`xpath=//button[normalize-space(.)="Next"]`);
  await expect(nextButton2).toBeVisible();
  await expect(nextButton2).toHaveText(`Next`);
  await nextButton2.click();
  
  // saveButton  [Button]
  const saveButton = page.locator(`xpath=//button[normalize-space(.)="Save"]`);
  await expect(saveButton).toBeVisible();
  await expect(saveButton).toHaveText(`Save`);
  await saveButton.click();
  
  // saveButton  [Button]
  const saveButton2 = page.locator(`xpath=//button[normalize-space(.)="Save"]`);
  await expect(saveButton2).toBeVisible();
  await expect(saveButton2).toHaveText(`Save`);
  await saveButton2.click();
  
  // nextButton  [Button]
  const nextButton3 = page.locator(`xpath=//button[normalize-space(.)="Next"]`);
  await expect(nextButton3).toBeVisible();
  await expect(nextButton3).toHaveText(`Next`);
  await nextButton3.click();
  
  // nextButton  [Button]
  const nextButton4 = page.locator(`xpath=//button[normalize-space(.)="Next"]`);
  await expect(nextButton4).toBeVisible();
  await expect(nextButton4).toHaveText(`Next`);
  await nextButton4.click();
  
  // selectloadingInput  [SearchInput]
  const selectloadingInput2 = page.locator(`xpath=//*[@id='vs7__combobox']/div[1]/input`);
  await expect(selectloadingInput2).toBeVisible();
  await selectloadingInput2.fill(``);
  
  // 25Branch  [Clickable]
  const _5Branch = page.locator(`xpath=//*[@id="vs7__option-0"]`);
  await expect(_5Branch).toBeVisible();
  
  // selectloadingInput  [SearchInput]
  const selectloadingInput3 = page.locator(`xpath=//*[@id='vs8__combobox']/div[1]/input`);
  await expect(selectloadingInput3).toBeVisible();
  await selectloadingInput3.fill(``);
  
  // alliedHealth  [Clickable]
  const alliedHealth = page.locator(`xpath=//*[@id="vs8__option-2"]`);
  await expect(alliedHealth).toBeVisible();
  
  // unassignedloadingInput  [SearchInput]
  const unassignedloadingInput = page.locator(`xpath=//*[@id='vs10__combobox']/div[1]/input`);
  await expect(unassignedloadingInput).toBeVisible();
  await unassignedloadingInput.fill(``);
  
  // accountExecutive  [Clickable]
  const accountExecutive = page.locator(`xpath=//*[@id="vs10__option-1"]`);
  await expect(accountExecutive).toBeVisible();
  
  // unassignedloadingInput  [SearchInput]
  const unassignedloadingInput2 = page.locator(`xpath=//*[@id='vs11__combobox']/div[1]/input`);
  await expect(unassignedloadingInput2).toBeVisible();
  await unassignedloadingInput2.fill(``);
  
  // automationDyadqa25  [Clickable]
  const automationDyadqa25 = page.locator(`xpath=//*[@id="vs11__option-1"]`);
  await expect(automationDyadqa25).toBeVisible();
  
  // doneButton  [Button]
  const doneButton = page.locator(`xpath=//button[normalize-space(.)="Done"]`);
  await expect(doneButton).toBeVisible();
  await expect(doneButton).toHaveText(`Done`);
  await doneButton.click();
  
  // doneButton  [Button]
  const doneButton2 = page.locator(`xpath=//button[normalize-space(.)="Done"]`);
  await expect(doneButton2).toBeVisible();
  await expect(doneButton2).toHaveText(`Done`);
  await doneButton2.click();
  
  // doneButton  [Button]
  const doneButton3 = page.locator(`xpath=//button[normalize-space(.)="Done"]`);
  await expect(doneButton3).toBeVisible();
  await expect(doneButton3).toHaveText(`Done`);
  await doneButton3.click();
  
  // ───────────────────────────────────────────────────────
  // Client > Overview
  await page.goto(`https://jmiqaweb01.nexsure.com/nexui/#/entity_console/6/17539/home`);
  await page.waitForLoadState();
  
  // opportunitiesLink  [Link]
  const opportunitiesLink = page.locator(`xpath=//a[@href="#/entity_console/6/17539/opportunities"]`);
  await expect(opportunitiesLink).toBeVisible();
  await expect(opportunitiesLink).toHaveText(`Opportunities`);
  
  // ───────────────────────────────────────────────────────
  // Client > Opportunities
  await page.goto(`https://jmiqaweb01.nexsure.com/nexui/#/entity_console/6/17539/opportunities`);
  await page.waitForLoadState();
  
  // newButton  [Button]
  const newButton = page.locator(`xpath=//div[contains(@class,'page_header')]/div[2]/div[2]/button`);
  await expect(newButton).toBeVisible();
  await expect(newButton).toHaveText(`New`);
  await newButton.click();
  
  // newButton  [Button]
  const newButton2 = page.locator(`xpath=//div[contains(@class,'page_header')]/div[2]/div[2]/button`);
  await expect(newButton2).toBeVisible();
  await expect(newButton2).toHaveText(`New`);
  await newButton2.click();
  
  // ───────────────────────────────────────────────────────
  // Client > Opportunities
  await page.goto(`https://jmiqaweb01.nexsure.com/nexui/#/entity_console/6/17539/opportunities/new`);
  await page.waitForLoadState();
  
  // nextButton  [Button]
  const nextButton5 = page.locator(`xpath=//button[normalize-space(.)="Next"]`);
  await expect(nextButton5).toBeVisible();
  await expect(nextButton5).toHaveText(`Next`);
  await nextButton5.click();
  
  // loadingInput  [SearchInput]
  const loadingInput = page.locator(`xpath=//input[contains(@class,'vs__search')]`);
  await expect(loadingInput).toBeVisible();
  await loadingInput.fill(``);
  
  // x100_commercialLines  [Clickable]
  const x100CommercialLines = page.locator(`xpath=//span[normalize-space(.)="X100_Commercial Lines"]`);
  await expect(x100CommercialLines).toBeVisible();
  
  // searchForLobsInput  [TextInput]
  const searchForLobsInput = page.locator(`xpath=//input[@placeholder="Search for LOBs"]`);
  await expect(searchForLobsInput).toBeVisible();
  await searchForLobsInput.fill(`126`);
  
  // x100_generalLiability126  [Div]
  const x100GeneralLiability126 = page.locator(`xpath=//div[contains(@class,'lobList')]/div`);
  await expect(x100GeneralLiability126).toBeVisible();
  
  // x100_generalLiability126  [Clickable]
  const x100GeneralLiability1262 = page.locator(`xpath=//span[normalize-space(.)="X100_General Liability (126)"]`);
  await expect(x100GeneralLiability1262).toBeVisible();
  
  // objectObjectCheckbox  [Checkbox]
  const objectObjectCheckbox = page.locator(`xpath=//div[contains(@class,'lobList')]/div/label/input`);
  await expect(objectObjectCheckbox).toBeVisible();
  await objectObjectCheckbox.check();
  
  // x100_generalLiability126  [Clickable]
  const x100GeneralLiability1263 = page.locator(`xpath=//span[normalize-space(.)="X100_General Liability (126)"]`);
  await expect(x100GeneralLiability1263).toBeVisible();

  // checkbox_display  [Clickable]
  const checkboxDisplay = page.locator(`xpath=//div[contains(@class,'lobList')]/div/label/div`);
  await expect(checkboxDisplay).toBeVisible();
  
  
  // checkbox_display  [Clickable]
  const checkboxDisplay2 = page.locator(`xpath=//div[contains(@class,'d-flex')]/div[1]/label/div`);
  await expect(checkboxDisplay2).toBeVisible();
  
  // inputCheckbox  [Checkbox]
  const inputCheckbox = page.locator(`xpath=//div[contains(@class,'d-flex')]/div[1]/label/input`);
  await expect(inputCheckbox).toBeVisible();
  await inputCheckbox.check();
  
  // createOpportunityButton  [Button]
  const createOpportunityButton2 = page.locator(`xpath=//button[normalize-space(.)="Create Opportunity"]`);
  await expect(createOpportunityButton2).toBeVisible();
  await expect(createOpportunityButton2).toHaveText(`Create Opportunity`);
  await createOpportunityButton2.click();
  
  // ───────────────────────────────────────────────────────
  // Client > Opportunities
  await page.goto(`https://jmiqaweb01.nexsure.com/nexui/#/entity_console/6/17539/opportunities/1463`);
  await page.waitForLoadState();
  
  // opportunitiesLink  [Link]
  const opportunitiesLink2 = page.locator(`xpath=//a[normalize-space(.)="Opportunities:"]`);
  await expect(opportunitiesLink2).toHaveText(`Opportunities:`);
  
  // 25Branch  [Span]
  const _5Branch2 = page.locator(`xpath=//span[normalize-space(.)="2.5 branch"]`);
  await expect(_5Branch2).toHaveText(`2.5 branch`);
  
  // dyadqa25Automation  [Span]
  const dyadqa25Automation = page.locator(`xpath=//div[contains(@class,'labelValueSection')]/div[2]/div/span/span`);
  await expect(dyadqa25Automation).toHaveText(`DyadQA2.5 Automation`);
  
  // x100_generalLiability126  [Div]
  const x100GeneralLiability1264 = page.locator(`xpath=//div[contains(@class,'sectionTitle')]`);
  await expect(x100GeneralLiability1264).toHaveText(`X100_General Liability (126)`);
  
});
