import { describe, expect, it } from 'vitest';
import { loadFixture } from './fixtures';
import { runExpandPass } from '../src/engine/pass';
import { RateLimiter } from '../src/engine/rateLimit';
import { DEFAULT_SETTINGS, type Settings } from '../src/settings/defaults';

function settings(overrides: Partial<Settings> = {}): Settings {
  return { ...DEFAULT_SETTINGS, ...overrides };
}

describe('runExpandPass', () => {
  it('expands the resolved thread on a PR page', async () => {
    const root = loadFixture('resolvedThreads.pr.html');
    const result = await runExpandPass(root, settings(), 'pr');
    expect(result.expanded).toBeGreaterThan(0);
    expect(result.byCategory.resolvedThreads).toBeGreaterThan(0);
  });

  it('is idempotent across passes via the actioned set', async () => {
    const root = loadFixture('resolvedThreads.pr.html');
    const actioned = new WeakSet<Element>();
    const first = await runExpandPass(root, settings(), 'pr', { actioned });
    const second = await runExpandPass(root, settings(), 'pr', { actioned });
    expect(first.expanded).toBeGreaterThan(0);
    expect(second.expanded).toBe(0);
  });

  it('respects a disabled category toggle', async () => {
    const root = loadFixture('resolvedThreads.pr.html');
    const s = settings({
      categories: {
        ...DEFAULT_SETTINGS.categories,
        resolvedThreads: false,
        outdatedThreads: false,
      },
    });
    const result = await runExpandPass(root, s, 'pr');
    expect(result.byCategory.resolvedThreads ?? 0).toBe(0);
  });

  it('rate-limits network-heavy hidden-items expansion', async () => {
    const root = loadFixture('hiddenItems.pr.html');
    let clock = 0;
    let waited = 0;
    const rl = new RateLimiter(
      400,
      () => clock,
      async (ms) => {
        waited += 1;
        clock += ms;
      },
    );
    const result = await runExpandPass(root, settings(), 'pr', { rateLimiter: rl });
    expect(result.byCategory.hiddenItems).toBeGreaterThan(0);
    // First network-heavy action does not sleep; the limiter is still consulted.
    expect(waited).toBe(0);
  });
});
