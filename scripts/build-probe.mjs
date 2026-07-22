import { build } from 'esbuild';
import { mkdirSync } from 'node:fs';

// Bundle the sentinel probe (registry + selfTest) into a browser IIFE that the
// Playwright sentinel injects into live GitHub pages.
mkdirSync('.sentinel', { recursive: true });

await build({
  entryPoints: ['src/sentinel/probe.ts'],
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: 'chrome120',
  outfile: '.sentinel/probe.global.js',
  logLevel: 'info',
});
