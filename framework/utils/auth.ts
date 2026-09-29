import { getRequiredEnv } from './env';

/**
 * Minimal contract every product's LoginPage Page Object must satisfy so this helper
 * can drive it generically. Keeps auth logic (which env vars to read) out of Page
 * Objects, and keeps Page Objects free of environment/credential concerns — per the
 * Page Object rules in /knowledge/conventions.md.
 */
export interface LoginPageLike {
  goto(): Promise<void>;
  login(username: string, password: string): Promise<void>;
}

/**
 * Logs in via the given Page Object using credentials read from the named
 * environment variables. Never call this with literal credentials — always route
 * through env vars documented in <product>/knowledge/app.md.
 *
 * Example:
 *   const loginPage = new NexsureLoginPage(page);
 *   await loginAs(loginPage, 'NEXSURE_LOGIN_USER', 'NEXSURE_LOGIN_PASS');
 */
export async function loginAs(
  loginPage: LoginPageLike,
  userEnvVar: string,
  passEnvVar: string,
): Promise<void> {
  const username = getRequiredEnv(userEnvVar);
  const password = getRequiredEnv(passEnvVar);

  await loginPage.goto();
  await loginPage.login(username, password);
}
