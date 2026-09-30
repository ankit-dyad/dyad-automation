import { test } from '@playwright/test';
import type { Locator, Page, TestInfo } from '@playwright/test';

/** One element to visually highlight and content-validate before the
 * step's screenshot is taken. `label` identifies it in the "content
 * validation" log (e.g. "Valid Invoice tab", "Batch No cell") — pick
 * something a reader would recognize, not the raw selector. */
export interface HighlightTarget {
  label: string;
  locator: Locator;
}

const HIGHLIGHT_MARKER_ATTR = 'data-report-highlight';

/**
 * `testInfo.attach()`'s `name` argument becomes part of the actual file
 * Playwright writes under `reports/html/data/` — confirmed live 2026-09-28:
 * an em-dash (—, U+2014) anywhere in that name produces a file this report
 * server's static file handler then 404s on when the browser requests it
 * (on Windows), even though the file genuinely exists on disk — a
 * plain-ASCII-named file in the same directory serves fine. Every
 * screenshot/log/content-validation attachment in every report in this repo
 * was silently unreadable in the browser because of this (step titles
 * routinely contain "—", and every attachment name here is built from one).
 * Strips it (and a few of the same "fancy Unicode punctuation" family, on
 * the same suspicion) down to plain ASCII before it ever reaches
 * `testInfo.attach()`. This only affects the attachment *name* — the step
 * `title` Playwright shows in the UI, and any `—` inside `log`/prose text
 * (file *content*, not a *filename*), are completely unaffected.
 */
function sanitizeAttachmentName(name: string): string {
  return name
    .replace(/[‒-―−]/g, '-') // em/en dash family, minus sign -> hyphen
    .replace(/[‘’]/g, "'") // curly single quotes -> straight
    .replace(/[“”]/g, '"'); // curly double quotes -> straight
}

/**
 * A `test.step()` wrapper that makes the HTML report self-explanatory without
 * having to open a trace: every step gets a human-readable log line (what
 * was searched for / uploaded / confirmed, including the specific values
 * involved — not just the static step title) and a full-page screenshot
 * taken right after the step's action/assertions complete, both attached so
 * they render inline in the Playwright HTML report under that step.
 *
 * `log` is evaluated *after* `action()` resolves, so it can describe the
 * actual runtime value involved (e.g. the real batch number found), not just
 * the static step title. Pass a plain string when there's nothing dynamic to
 * report, or a callback returning one build from `action()`'s result.
 *
 * `highlight` names the specific element(s) this step actually validated.
 * Each one gets a visible colored outline box drawn directly into the page
 * (so it shows up in the screenshot below) and has its live `textContent`
 * read and attached as a "content validation" log — a second, independent
 * record of what was actually on screen, distinct from `log`'s prose
 * summary. An element that can't be found/read is recorded as such rather
 * than silently skipped, so a report reader can tell "validated, text was
 * X" apart from "couldn't even locate this element".
 *
 * Confirmed live 2026-09-28: this does NOT use Playwright's own
 * `locator.highlight()` — that API only supports one highlighted element at
 * a time (calling it a second time silently replaces the first box, it
 * doesn't add a second one; confirmed by counting the DOM node it injects
 * across multiple calls), so any step passing more than one `highlight`
 * target would have shown only its last one. Draws independent boxes via a
 * plain `getBoundingClientRect()`-positioned overlay `<div>` per target
 * instead, so every target in the array stays visible simultaneously.
 *
 * Passes `box: true` to `test.step()` (confirmed supported live 2026-09-30 —
 * this repo pins Playwright ^1.62, well past the 1.42 introduction of this
 * option): without it, the HTML report nests every raw Playwright action
 * this step performs internally (`Fill "qable1" locator('#txtUserName')`,
 * `Click locator(...)`, `Wait for selector`, ...) directly under the step,
 * which is fine for an engineer debugging a failure but unreadable noise for
 * a non-engineer stakeholder skimming the report. `box: true` collapses all
 * of that out of both the report tree and failure stack traces, leaving just
 * the clean narrative title plus the log/screenshot/content-validation
 * attachments this function already builds — a report a stakeholder can read
 * top to bottom without ever expanding a step.
 */
export async function reportedStep<T>(
  page: Page,
  testInfo: TestInfo,
  title: string,
  action: () => Promise<T>,
  log?: string | ((result: T) => string),
  highlight?: HighlightTarget | HighlightTarget[],
): Promise<T> {
  return test.step(
    title,
    async () => {
      const result = await action();
      const safeTitle = sanitizeAttachmentName(title);

      const logText = typeof log === 'function' ? log(result) : log;
      if (logText) {
        await testInfo.attach(`${safeTitle} - log`, { body: logText, contentType: 'text/plain' });
      }

      const targets = highlight ? (Array.isArray(highlight) ? highlight : [highlight]) : [];
      if (targets.length > 0) {
        const lines: string[] = [];
        for (const { label, locator } of targets) {
          try {
            const text = (await locator.textContent({ timeout: 5_000 }))?.trim();
            lines.push(`${label}: "${text ?? ''}"`);
            await locator.evaluate((el, attr) => {
              // Avoids referencing the bare `document`/`window` globals
              // directly — this repo's tsconfig has no "dom" lib, but
              // Playwright's own `evaluate()` typings still supply full
              // Element/Node types for `el` and anything reachable from it
              // (e.g. `el.ownerDocument`), so routing through that instead
              // of the ambient global keeps this typechecking cleanly.
              const doc = el.ownerDocument;
              const rect = el.getBoundingClientRect();
              const box = doc.createElement('div');
              box.setAttribute(attr, 'true');
              Object.assign(box.style, {
                position: 'fixed',
                left: `${rect.left}px`,
                top: `${rect.top}px`,
                width: `${rect.width}px`,
                height: `${rect.height}px`,
                border: '3px solid #ff3366',
                boxShadow: '0 0 0 2px rgba(255, 51, 102, 0.35)',
                zIndex: '2147483647',
                pointerEvents: 'none',
                boxSizing: 'border-box',
              });
              doc.body.appendChild(box);
            }, HIGHLIGHT_MARKER_ATTR);
          } catch {
            lines.push(`${label}: (could not read - not found or not attached)`);
          }
        }
        await testInfo.attach(`${safeTitle} - content validation`, {
          body: lines.join('\n'),
          contentType: 'text/plain',
        });
      }

      const screenshot = await page.screenshot({ fullPage: true });
      await testInfo.attach(`${safeTitle} - screenshot`, { body: screenshot, contentType: 'image/png' });

      if (targets.length > 0) {
        await page
          .locator(`[${HIGHLIGHT_MARKER_ATTR}]`)
          .evaluateAll((elements) => elements.forEach((el) => el.remove()))
          .catch(() => {});
      }

      return result;
    },
    { box: true },
  );
}