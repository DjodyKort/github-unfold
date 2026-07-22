import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(here, '..', 'fixtures');

/** Parse a captured fixture file into a detached DOM root. */
export function loadFixture(name: string): HTMLElement {
  const html = readFileSync(join(fixturesDir, name), 'utf8');
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const root = doc.getElementById('fixture-root');
  if (!root) throw new Error(`fixture ${name} has no #fixture-root`);
  return root;
}
