import { chromium } from 'playwright';
import { mkdirSync, readdirSync, renameSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { execFileSync } from 'node:child_process';

// Record the extension auto-expanding a real PR, then render a GIF for the
// README. Two panes of the same story: collapsed → (zero clicks) → expanded.
const EXT = resolve('.output/chrome-mv3');
const PR = 'https://github.com/python/cpython/pull/148283';
const outDir = resolve('.demo');
mkdirSync(outDir, { recursive: true });
mkdirSync('docs/assets', { recursive: true });

const ctx = await chromium.launchPersistentContext('', {
  headless: false,
  args: ['--headless=new', `--disable-extensions-except=${EXT}`, `--load-extension=${EXT}`],
  viewport: { width: 1000, height: 720 },
  recordVideo: { dir: outDir, size: { width: 1000, height: 720 } },
});

const page = await ctx.newPage();
// Pause auto-expand briefly so the video opens on the collapsed state.
await page.addInitScript(() => {
  // no-op placeholder to keep timing deterministic
});
await page.goto(PR, { waitUntil: 'domcontentloaded' });

// Scroll to a resolved thread so the expansion is on-screen.
await page.evaluate(() => {
  const el = document.querySelector('review-thread-collapsible[data-resolved="true"]');
  el?.scrollIntoView({ block: 'center' });
});
await page.waitForTimeout(4500); // let the auto-expand happen on camera
await page.evaluate(() => {
  const el = document.querySelector('review-thread-collapsible[data-resolved="true"]');
  el?.scrollIntoView({ block: 'center' });
});
await page.waitForTimeout(2500);

await page.close();
const video = await page.video()?.path();
await ctx.close();

// Pick the produced webm.
const webm =
  video ??
  join(
    outDir,
    readdirSync(outDir).find((f) => f.endsWith('.webm')),
  );
const stable = join(outDir, 'demo.webm');
renameSync(webm, stable);

// webm -> high-quality GIF via a shared palette.
const palette = join(outDir, 'palette.png');
const fps = 12;
const width = 900;
execFileSync('ffmpeg', [
  '-y',
  '-i',
  stable,
  '-vf',
  `fps=${fps},scale=${width}:-1:flags=lanczos,palettegen=stats_mode=diff`,
  palette,
]);
execFileSync('ffmpeg', [
  '-y',
  '-i',
  stable,
  '-i',
  palette,
  '-lavfi',
  `fps=${fps},scale=${width}:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=3`,
  'docs/assets/demo.gif',
]);

console.log('wrote docs/assets/demo.gif');
