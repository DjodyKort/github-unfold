import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

// Load the built MV3 extension into a real Chromium and verify zero-click
// expansion on a live PR that has resolved threads. Also captures README shots.
const EXT = resolve('.output/chrome-mv3');
const PR = 'https://github.com/python/cpython/pull/148283';
mkdirSync('docs/assets', { recursive: true });

const ctx = await chromium.launchPersistentContext('', {
  // Old headless can't load extensions; the new headless mode can.
  headless: false,
  args: [
    '--headless=new',
    `--disable-extensions-except=${EXT}`,
    `--load-extension=${EXT}`,
  ],
});

const page = await ctx.newPage();
page.on('console', (m) => {
  const t = m.text();
  if (t.includes('github-unfold')) console.log('  [page]', t);
});

// Baseline: resolved review threads start collapsed (body hidden).
await page.goto(PR, { waitUntil: 'domcontentloaded' });
const collapsedBefore = await page.evaluate(
  () =>
    Array.from(document.querySelectorAll('review-thread-collapsible[data-resolved="true"]')).filter(
      (e) => e.querySelector('[data-target="review-thread-collapsible.body"]')?.hasAttribute('hidden'),
    ).length,
);

// Let the content script's burst passes run.
await page.waitForTimeout(6000);

const openAfter = await page.evaluate(
  () =>
    Array.from(document.querySelectorAll('review-thread-collapsible[data-resolved="true"]')).filter(
      (e) => {
        const b = e.querySelector('[data-target="review-thread-collapsible.body"]');
        return b !== null && !b.hasAttribute('hidden');
      },
    ).length,
);

const widgetPresent = await page.evaluate(
  () => !!document.querySelector('github-unfold-ui'),
);

await page.screenshot({ path: 'docs/assets/pr-expanded.png', fullPage: false });

console.log(JSON.stringify({ collapsedBefore, openAfter, widgetPresent }, null, 2));

await ctx.close();

if (openAfter < 1 || !widgetPresent) {
  console.error('E2E FAILED: expected zero-click expansion and an injected widget.');
  process.exit(1);
}
console.log('E2E OK: zero-click expansion confirmed on a live PR.');
