import { readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parse as parseYaml } from 'yaml';
import matter from 'gray-matter';

/**
 * registry.yaml is the single index used for retrieval. No fuzzy search, no
 * embeddings — every lookup here is a direct path resolution against a product's
 * registry entry. Used by generator-agent.ts (and available to triage-agent.ts /
 * scripts) so there is exactly one place that knows how to go from
 * `product + page name` -> knowledge file on disk.
 *
 * Each product owns its own knowledge base at `<product>/knowledge/` (see
 * CLAUDE.md §2) — there is no single shared knowledge root anymore, so every path
 * below is built from the product name, not a constant.
 */

const REPO_ROOT = resolve(__dirname, '../..');

export interface RegistryEntry {
  page: string;
  file: string;
  journeys: string[];
  last_verified: string | null;
  app_version?: string;
}

export interface KnowledgeSelector {
  element: string;
  selector: string;
  notes?: string;
}

export interface KnowledgePage {
  entry: RegistryEntry;
  absPath: string;
  reviewed: boolean;
  lastVerified: string | null;
  body: string;
  /** Parsed rows of the "## Selectors" table, in file order. */
  selectors: KnowledgeSelector[];
  /** Raw trimmed text of the "## URL" section. */
  url: string;
}

/** Extracts the raw text of a single `## Heading` section from a page body. */
export function extractSection(body: string, heading: string): string {
  const lines = body.split('\n');
  const idx = lines.findIndex((l) => l.trim() === heading);
  if (idx === -1) return '';
  let end = lines.length;
  for (let i = idx + 1; i < lines.length; i++) {
    if (lines[i].startsWith('## ')) {
      end = i;
      break;
    }
  }
  return lines.slice(idx + 1, end).join('\n').trim();
}

/**
 * Pulls just the "## Selectors" table out of a page's markdown body and parses its
 * rows. This is the ONLY source of truth generator-agent.ts is allowed to pull
 * selectors from — never a guess, never a different section.
 */
export function parseSelectorsTable(body: string): KnowledgeSelector[] {
  const lines = body.split('\n');
  const headingIdx = lines.findIndex((l) => l.trim() === '## Selectors');
  if (headingIdx === -1) return [];
  let endIdx = lines.length;
  for (let i = headingIdx + 1; i < lines.length; i++) {
    if (lines[i].startsWith('## ')) {
      endIdx = i;
      break;
    }
  }
  const section = lines.slice(headingIdx + 1, endIdx).join('\n');
  const rows: KnowledgeSelector[] = [];
  for (const line of section.split('\n')) {
    const cells = line
      .split('|')
      .map((c) => c.trim())
      .filter((_, i, arr) => !(i === 0 && arr[0] === '') && !(i === arr.length - 1 && arr[arr.length - 1] === ''));
    if (cells.length < 2) continue;
    const [element, selectorRaw, notes] = cells;
    if (!element || element.toLowerCase() === 'element') continue; // header row
    if (/^-+$/.test(element.replace(/\s/g, ''))) continue; // separator row
    const selector = selectorRaw.replace(/^`|`$/g, '').trim();
    if (!selector) continue;
    rows.push({ element, selector, notes: notes || undefined });
  }
  return rows;
}

/** Finds a selector row by element name — case-insensitive, whitespace-trimmed. */
export function findSelector(page: KnowledgePage, elementName: string): KnowledgeSelector | undefined {
  const norm = (s: string) => s.trim().toLowerCase();
  return page.selectors.find((s) => norm(s.element) === norm(elementName));
}

function registryPath(product: string): string {
  return join(knowledgeDir(product), 'registry.yaml');
}

/** Loads and parses a product's registry.yaml. Returns [] if the product has no entries yet. */
export function loadRegistry(product: string): RegistryEntry[] {
  const path = registryPath(product);
  if (!existsSync(path)) {
    throw new Error(`No registry.yaml for product "${product}" at ${path}`);
  }
  const raw = readFileSync(path, 'utf-8');
  const parsed = parseYaml(raw);
  return Array.isArray(parsed) ? (parsed as RegistryEntry[]) : [];
}

/**
 * Resolves a single page name to its knowledge file for a product, via the registry
 * only. Throws (rather than guessing) if the page isn't registered — generator and
 * explorer agents are expected to stop and flag this, not fall back to search.
 */
export function resolvePage(product: string, pageName: string): KnowledgePage {
  const registry = loadRegistry(product);
  const entry = registry.find((e) => e.page === pageName);
  if (!entry) {
    throw new Error(
      `Page "${pageName}" is not registered for product "${product}" in ` +
        `${registryPath(product)}. Run the explorer agent or add the entry (and the ` +
        `knowledge file) by hand before generating tests against it.`,
    );
  }
  const absPath = join(knowledgeDir(product), entry.file);
  if (!existsSync(absPath)) {
    throw new Error(
      `Registry entry for "${pageName}" points at ${absPath}, which doesn't exist.`,
    );
  }
  const raw = readFileSync(absPath, 'utf-8');
  const { data, content } = matter(raw);
  return {
    entry,
    absPath,
    reviewed: data.reviewed === true,
    lastVerified: data.last_verified ?? entry.last_verified ?? null,
    body: content,
    selectors: parseSelectorsTable(content),
    url: extractSection(content, '## URL'),
  };
}

/** Resolves every page a scenario references, in one call. */
export function resolvePages(product: string, pageNames: string[]): KnowledgePage[] {
  return pageNames.map((name) => resolvePage(product, name));
}

export function knowledgeDir(product: string): string {
  return join(REPO_ROOT, product, 'knowledge');
}

export function pagesDir(product: string): string {
  return join(knowledgeDir(product), 'pages');
}
