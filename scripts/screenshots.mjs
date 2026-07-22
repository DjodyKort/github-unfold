import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

// Load the built extension and screenshot every surface (options dashboard,
// popup, in-page panel) in light and dark, for the README and for eyeballing.
const EXT = resolve('.output/chrome-mv3');
const PR = 'https://github.com/python/cpython/pull/148283';
mkdirSync('docs/assets', { recursive: true });

const ctx = await chromium.launchPersistentContext('', {
  headless: false,
  args: ['--headless=new', `--disable-extensions-except=${EXT}`, `--load-extension=${EXT}`],
});

// Get the extension id from its service worker.
let [sw] = ctx.serviceWorkers();
if (!sw) sw = await ctx.waitForEvent('serviceworker', { timeout: 15000 });
const extId = new URL(sw.url()).host;
console.log('extension id:', extId);

async function shot(
  path,
  url,
  { dark = false, width = 420, height = 560, seedStats = false } = {},
) {
  const page = await ctx.newPage();
  await page.emulateMedia({ colorScheme: dark ? 'dark' : 'light' });
  await page.setViewportSize({ width, height });
  await page.goto(url, { waitUntil: 'load' });
  if (seedStats) {
    await page.evaluate(() =>
      chrome.storage.local.set({
        stats: {
          total: 128,
          byCategory: {
            resolvedThreads: 54,
            minimizedComments: 31,
            hiddenItems: 40,
            commitLists: 3,
          },
          today: 12,
          todayDate: new Date().toISOString().slice(0, 10),
        },
      }),
    );
    await page.reload({ waitUntil: 'load' });
  }
  await page.waitForTimeout(600);
  await page.screenshot({ path });
  await page.close();
}

const OPTIONS = `chrome-extension://${extId}/options.html`;
const POPUP = `chrome-extension://${extId}/popup.html`;

await shot('docs/assets/dashboard-light.png', OPTIONS, {
  width: 720,
  height: 620,
  seedStats: true,
});
await shot('docs/assets/dashboard-dark.png', OPTIONS, {
  dark: true,
  width: 720,
  height: 620,
  seedStats: true,
});
await shot('docs/assets/popup.png', POPUP, { width: 320, height: 220, seedStats: true });

// In-page panel open on a real PR.
const pr = await ctx.newPage();
await pr.goto(PR, { waitUntil: 'domcontentloaded' });
await pr.waitForTimeout(6000);
await pr.locator('.gu-launcher').click();
await pr.waitForTimeout(800);
await pr.screenshot({ path: 'docs/assets/panel-on-pr.png' });

// Diagnostics tab — the live self-test.
await pr.locator('.gu-tab', { hasText: 'Diagnostics' }).click();
await pr.waitForTimeout(400);
await pr.screenshot({ path: 'docs/assets/diagnostics.png' });
await pr.close();

await ctx.close();
console.log('screenshots written to docs/assets/');
