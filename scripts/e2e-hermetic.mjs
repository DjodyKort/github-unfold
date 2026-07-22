import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Hermetic extension E2E: no live GitHub. Serve a captured fixture under a
// github.com PR URL via route interception, load the real built extension, and
// assert it finds and clicks the collapsed thread open. A tiny inline stub
// stands in for GitHub's Catalyst controller (revealing the body on toggle),
// so this proves OUR code end-to-end and runs deterministically in CI.
const EXT = resolve('.output/chrome-mv3');
const fragment = readFileSync('fixtures/resolvedThreads.pr.html', 'utf8');

const pageHtml = `<!doctype html>
<html><head><meta charset="utf-8"><title>PR</title></head>
<body>
  ${fragment}
  <script>
    // Stub for GitHub's Catalyst toggle: reveal the thread body on toggle click.
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action*="review-thread-collapsible#toggle"]');
      if (!btn) return;
      const host = btn.closest('review-thread-collapsible');
      const body = host && host.querySelector('[data-target="review-thread-collapsible.body"]');
      if (body) body.removeAttribute('hidden');
    });
  </script>
</body></html>`;

const ctx = await chromium.launchPersistentContext('', {
  headless: false,
  args: ['--headless=new', `--disable-extensions-except=${EXT}`, `--load-extension=${EXT}`],
});

await ctx.route('https://github.com/**', (route) =>
  route.fulfill({ contentType: 'text/html', body: pageHtml }),
);

const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));

await page.goto('https://github.com/python/cpython/pull/148283', { waitUntil: 'domcontentloaded' });

const bodyHiddenBefore = await page.evaluate(
  () =>
    document
      .querySelector(
        'review-thread-collapsible[data-resolved="true"] [data-target="review-thread-collapsible.body"]',
      )
      ?.hasAttribute('hidden') ?? null,
);

// Let the content script's burst passes run.
await page.waitForTimeout(4000);

const result = await page.evaluate(() => ({
  widgetPresent: !!document.querySelector('github-unfold-ui'),
  bodyHiddenAfter: document
    .querySelector(
      'review-thread-collapsible[data-resolved="true"] [data-target="review-thread-collapsible.body"]',
    )
    ?.hasAttribute('hidden'),
}));

await ctx.close();

console.log(JSON.stringify({ bodyHiddenBefore, ...result, pageErrors: errors }, null, 2));

const ok = bodyHiddenBefore === true && result.bodyHiddenAfter === false && result.widgetPresent;
if (!ok) {
  console.error('HERMETIC E2E FAILED: extension did not click the collapsed thread open.');
  process.exit(1);
}
console.log('HERMETIC E2E OK: extension expanded the collapsed thread (deterministic).');
