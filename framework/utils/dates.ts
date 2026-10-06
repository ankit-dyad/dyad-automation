/**
 * Date/placeholder resolution for JSON-driven test data. Per conventions.md's
 * "no hardcoded... environment-specific values, use the factories" rule, files
 * like alis/knowledge/create-submission.json never write a literal date or a
 * fixed applicant name — they write placeholders ('{{TODAY}}',
 * '{{TODAY+12M}}', '{{UNIQUE_NAME:Base Name}}') and a spec resolves them once,
 * at run time, via `resolvePlaceholders()` below, before driving the Page
 * Object with the result. This keeps the JSON file the single source of
 * truth: changing a flow's data means editing the JSON, not the test code.
 */

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/** Formats a Date as MM/DD/YYYY — the format this app's date fields use
 * (confirmed live against alis/knowledge/pages/new-insured-form.md's captured
 * Proposed Effective/Expiry values). */
export function formatMMDDYYYY(date: Date): string {
  return `${pad2(date.getMonth() + 1)}/${pad2(date.getDate())}/${date.getFullYear()}`;
}

/** Today's date, formatted MM/DD/YYYY. */
export function todayMMDDYYYY(): string {
  return formatMMDDYYYY(new Date());
}

/** Today + N months, formatted MM/DD/YYYY — matches this app's term-calculated
 * expiry behavior (e.g. a 12-month term's Proposed Expiry). */
export function todayPlusMonthsMMDDYYYY(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return formatMMDDYYYY(d);
}

/** A per-run timestamp suffix, e.g. "09240945" (MMDDHHmm). This is the
 * documented workaround for ALIS's duplicate-insured detection — see
 * new-insured-form.md's "Duplicate-insured detection" section: keep a stable,
 * human-readable base name and append this so every run's Full Name is
 * unique, rather than picking a wholly new name each time. */
export function runSuffixMMDDHHmm(date = new Date()): string {
  return `${pad2(date.getMonth() + 1)}${pad2(date.getDate())}${pad2(date.getHours())}${pad2(date.getMinutes())}`;
}

const TODAY_PLUS_PATTERN = /^\{\{TODAY\+(\d+)M\}\}$/;
const UNIQUE_NAME_PATTERN = /^\{\{UNIQUE_NAME:(.*)\}\}$/;

/**
 * Deep-walks a JSON-shaped value (as imported from a knowledge/*.json file)
 * and resolves every string that matches a known placeholder, leaving
 * everything else untouched. Every `{{UNIQUE_NAME:Base}}` occurrence for the
 * same base name resolves to the SAME value within one call — important
 * because create-submission.json uses the placeholder twice (the input Full
 * Name and the expected-summary assertion target) and both must match.
 *
 * Call this once per test, immediately after importing the JSON — never
 * resolve placeholders ad hoc inside a Page Object or partway through a test.
 */
export function resolvePlaceholders<T>(data: T): T {
  const uniqueNameCache = new Map<string, string>();

  function resolveUniqueName(base: string): string {
    if (!uniqueNameCache.has(base)) {
      uniqueNameCache.set(base, `${base} ${runSuffixMMDDHHmm()}`);
    }
    return uniqueNameCache.get(base)!;
  }

  function resolveValue(value: string): string {
    if (value === '{{TODAY}}') return todayMMDDYYYY();

    const plusMatch = value.match(TODAY_PLUS_PATTERN);
    if (plusMatch) return todayPlusMonthsMMDDYYYY(Number(plusMatch[1]));

    const nameMatch = value.match(UNIQUE_NAME_PATTERN);
    if (nameMatch) return resolveUniqueName(nameMatch[1]);

    return value;
  }

  function walk(node: unknown): unknown {
    if (typeof node === 'string') return resolveValue(node);
    if (Array.isArray(node)) return node.map(walk);
    if (node !== null && typeof node === 'object') {
      const out: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
        out[key] = walk(value);
      }
      return out;
    }
    return node;
  }

  return walk(data) as T;
}