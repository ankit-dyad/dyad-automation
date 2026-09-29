import { randomUUID } from 'node:crypto';

/**
 * Test data factories. Per /knowledge/conventions.md, no test file may hardcode a
 * policy number, customer ID, claim number, or other environment-specific value —
 * everything comes from here, generated (or checked out) fresh per run so tests can
 * be parallelized and run repeatedly without colliding on shared fixtures.
 *
 * These generate synthetic, self-contained data today. If/when a product needs test
 * data seeded through a real API or test-data service (e.g. to check out a policy
 * that must already exist), extend the relevant factory's `create()` to call that
 * service instead of `fakeXxx()` — callers don't need to change.
 */

function runId(): string {
  return randomUUID().slice(0, 8);
}

function fakeDigits(length: number): string {
  let out = '';
  for (let i = 0; i < length; i++) out += Math.floor(Math.random() * 10);
  return out;
}

export interface Applicant {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string; // YYYY-MM-DD
}

export interface PolicyRef {
  policyNumber: string;
  product: string;
  lineOfBusiness: string;
}

export interface ClaimRef {
  claimNumber: string;
  policyNumber: string;
}

export interface ClientProfile {
  clientName: string;
  streetAddress: string;
  city: string;
  zip: string;
  contactLastName: string;
}

/** Generates a unique, non-colliding synthetic applicant for one test run. */
export function createApplicant(overrides: Partial<Applicant> = {}): Applicant {
  const id = runId();
  return {
    firstName: `Test${id}`,
    lastName: 'Automation',
    email: `qa.${id}@example.test`,
    phone: `555${fakeDigits(7)}`,
    dob: '1990-01-01',
    ...overrides,
  };
}

/** Generates a unique synthetic policy reference — never a real/shared policy number. */
export function createPolicyRef(
  product: string,
  lineOfBusiness: string,
  overrides: Partial<PolicyRef> = {},
): PolicyRef {
  return {
    policyNumber: `AUTOMATION-${product.toUpperCase()}-${fakeDigits(9)}`,
    product,
    lineOfBusiness,
    ...overrides,
  };
}

/** Generates a unique synthetic claim reference tied to a policy. */
export function createClaimRef(policyNumber: string, overrides: Partial<ClaimRef> = {}): ClaimRef {
  return {
    claimNumber: `AUTOMATION-CLM-${fakeDigits(9)}`,
    policyNumber,
    ...overrides,
  };
}

/** Generates a unique synthetic client profile — a fresh name each run so a
 * "find a client" search reliably comes up with no match (a stale, reused name
 * would find a previously-created client instead). Tenant config data (branch,
 * department, etc.) that goes with client creation is real business data, not
 * synthetic — it lives in <product>/knowledge/data.json instead. */
export function createClientProfile(overrides: Partial<ClientProfile> = {}): ClientProfile {
  const id = runId();
  return {
    clientName: `Automation Client ${id}`,
    streetAddress: `${fakeDigits(3)} Automation Way`,
    city: 'Springfield',
    zip: fakeDigits(5),
    contactLastName: `Automation${id}`,
    ...overrides,
  };
}

/**
 * Tracks records a test created so they can be released/cleaned up afterward — the
 * "checkout" half of the factory pattern. Call `.track()` as you create data and
 * `.releaseAll()` in teardown (the `testData` fixture in ./index.ts does this
 * automatically). Wire `onRelease` to a real cleanup API call when one exists.
 */
export class TestDataRegistry {
  private created: { kind: string; ref: unknown; onRelease?: () => Promise<void> }[] = [];

  track<T>(kind: string, ref: T, onRelease?: () => Promise<void>): T {
    this.created.push({ kind, ref, onRelease });
    return ref;
  }

  async releaseAll(): Promise<void> {
    for (const item of this.created.splice(0)) {
      await item.onRelease?.();
    }
  }
}
