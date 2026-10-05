import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

/**
 * Environment variable helpers. Every credential and base URL in this framework is
 * referenced by env var name only — see /knowledge/conventions.md and each
 * product's <product>/knowledge/app.md. Nothing here ever hardcodes a secret.
 *
 * Deliberately does NOT import framework/utils/registry.ts (which pulls in the
 * `yaml`/`gray-matter` packages) — this file stays dependency-light since specs
 * import it directly for credential resolution.
 */

const REPO_ROOT = resolve(__dirname, '../..');
const knowledgeDir = (product: string) => join(REPO_ROOT, product, 'knowledge');

export function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable "${name}". Set it in your shell/CI ` +
        `secrets. See <product>/knowledge/app.md for the variable names a product ` +
        `expects.`,
    );
  }
  return value;
}

export function getOptionalEnv(name: string, fallback?: string): string | undefined {
  return process.env[name] ?? fallback;
}

/**
 * Resolves a credential: the named env var wins if set (so CI/shared environments
 * can always override without touching a file); otherwise falls back to
 * `credentials[0][field]` in <product>/knowledge/data.json, so a local run works
 * from what's already documented there with no exports needed. Throws if neither
 * source has it.
 */
export function getCredential(envVarName: string, product: string, field: 'username' | 'password'): string {
  const fromEnv = process.env[envVarName];
  if (fromEnv) return fromEnv;

  const dataPath = join(knowledgeDir(product), 'data.json');
  if (existsSync(dataPath)) {
    const data = JSON.parse(readFileSync(dataPath, 'utf-8'));
    const value = data?.credentials?.[0]?.[field];
    if (typeof value === 'string' && value) return value;
  }

  throw new Error(
    `Missing credential: set "${envVarName}" in your shell/CI, or add ` +
      `credentials[0].${field} to ${product}/knowledge/data.json.`,
  );
}
