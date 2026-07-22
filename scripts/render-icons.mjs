import { chromium } from 'playwright';
import { readFileSync, mkdirSync } from 'node:fs';

// ImageMagick has no SVG renderer here, so render the icon with Chromium.
const svg = readFileSync('assets/icon.svg', 'utf8');
mkdirSync('public/icon', { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 1 });

for (const size of [16, 32, 48, 96, 128]) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(
    `<!doctype html><html><body style="margin:0">
       <div style="width:${size}px;height:${size}px">${svg.replace(/width="128"/, `width="${size}"`).replace(/height="128"/, `height="${size}"`)}</div>
     </body></html>`,
    { waitUntil: 'load' },
  );
  await page.locator('svg').screenshot({ path: `public/icon/${size}.png`, omitBackground: true });
}

await browser.close();
console.log('rendered icons: 16 32 48 96 128');
