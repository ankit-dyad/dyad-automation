import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

/**
 * Writes back into a product's knowledge/data.json — the counterpart to
 * getCredential()/data.json reads in env.ts, but for tests that need to persist
 * something they just created (e.g. a freshly created client's name) so a later
 * test can read it back the same way it reads any other data.json field.
 */

const REPO_ROOT = resolve(__dirname, '../..');
const dataPath = (product: string) => join(REPO_ROOT, product, 'knowledge', 'data.json');

/** Merges `value` into the top-level `key` of `<product>/knowledge/data.json`. */
export function saveProductData(product: string, key: string, value: Record<string, unknown>): void {
  const path = dataPath(product);
  const data = JSON.parse(readFileSync(path, 'utf-8'));
  data[key] = { ...data[key], ...value };
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}
