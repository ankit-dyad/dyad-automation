import { test, expect } from '../../../framework/fixtures';
import { getCredential } from '../../../framework/utils/env';
import { takeScreenshot } from '../../../framework/utils/screenshot';
import { LoginPage } from '../login/login.page';
import { HeaderPage } from './header.page';

/**
 * From /alis/knowledge/pages/header.md: the header bar is present on every
 * authenticated page after login, so this reuses LoginPage's login() to get
 * there rather than re-implementing the login flow.
 */
test(
  'Alis: header is visible after login',
  {
    annotation: [
      { type: 'scenario', description: 'al_sc_header_visible' },
      { type: 'product', description: 'alis' },
    ],
  },
  async ({ page }, testInfo) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(
      getCredential('ALIS_UAT_USERNAME', 'alis', 'username'),
      getCredential('ALIS_UAT_PASSWORD', 'alis', 'password'),
    );
    await loginPage.closeStartupMessagePopupIfPresent();

    const headerPage = new HeaderPage(page);

    await test.step('Verify the header bar and its key elements are visible', async () => {
      await expect(headerPage.headerBarLocator).toBeVisible();
      await expect(headerPage.workspaceLinkLocator).toBeVisible();
      await expect(headerPage.searchTypeDropdownLocator).toBeVisible();
      await expect(headerPage.searchBoxLocator).toBeVisible();
      await expect(headerPage.userAvatarLocator).toBeVisible();

      await takeScreenshot(page, testInfo, 'header-verified');

      console.log('Header verified: logo, search, and avatar are all visible.');
    });

    await test.step('Verify the avatar dropdown opens and shows Profile / Change Password / Logout', async () => {
      await headerPage.openAvatarDropdown();

      await expect(headerPage.avatarDropdownProfileLinkLocator).toBeVisible();
      await expect(headerPage.avatarDropdownChangePasswordLinkLocator).toBeVisible();
      await expect(headerPage.avatarDropdownLogoutLinkLocator).toBeVisible();

      // Close the dropdown without logging out — this test only verifies the
      // menu's presence, it doesn't end the session.
      await page.keyboard.press('Escape');
      await expect(headerPage.avatarDropdownLogoutLinkLocator).not.toBeVisible();

      console.log('Avatar dropdown verified: Profile, Change Password, and Logout all present.');
    });
  },
);