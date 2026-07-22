import { test, expect } from '@playwright/test';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { CURATED_PAGES } from './pages';
import type { Diagnostics } from '../src/diagnostics/runner';

const PROBE = readFileSync('.sentinel/probe.global.js', 'utf8');

/**
 * The drift sentinel. Injects the exact in-browser self-test into live GitHub
 * pages and asserts every expected selector still matches. A failure here is
 * what triggers the AI self-healing job. Per-page drift is written to
 * `.sentinel/report.json` for the healer to read.
 */
const drifted: Array<{ url: string; targetId: string; reason: string }> = [];

test.afterAll(() => {
  mkdirSync('.sentinel', { recursive: true });
  writeFileSync('.sentinel/report.json', JSON.stringify({ drifted }, null, 2));
});

for (const page of CURATED_PAGES) {
  test(`selectors hold on ${page.url}`, async ({ page: pw }) => {
    await pw.goto(page.url, { waitUntil: 'domcontentloaded' });
    // Let the React/Turbo content settle.
    await pw.waitForTimeout(3500);
    await pw.addScriptTag({ content: PROBE });

    const diag = (await pw.evaluate(() => window.__guRunDiagnostics(document))) as Diagnostics;

    const byId = new Map(diag.reports.map((r) => [r.id, r]));

    // The authoritative drift signal: a target known (curated) to be present on
    // this page that no longer matches. This is precise and false-positive-free
    // because we only assert categories we verified are genuinely there — it is
    // exactly what the self-healing job acts on.
    let pageDrifted = false;
    for (const id of page.expect) {
      const report = byId.get(id);
      if (!report || report.matched === 0) {
        pageDrifted = true;
        drifted.push({
          url: page.url,
          targetId: id,
          reason: report ? 'expected present but 0 matches' : 'target not evaluated on page',
        });
      }
    }

    // On drift, save the fresh page DOM so the self-healing job can re-derive
    // the selector against GitHub's new markup.
    if (pageDrifted) {
      mkdirSync('.sentinel', { recursive: true });
      const safe = page.url.replace(/[^a-z0-9]+/gi, '_');
      writeFileSync(`.sentinel/dom-${safe}.html`, await pw.content());
    }

    for (const id of page.expect) {
      const report = byId.get(id);
      expect(report, `target ${id} not evaluated on ${page.url}`).toBeTruthy();
      expect(
        report!.matched,
        `target ${id} found nothing on ${page.url} — selector likely broken`,
      ).toBeGreaterThan(0);
    }
  });
}
