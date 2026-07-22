import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS } from '../src/settings/defaults';
import { CATEGORIES, CATEGORY_IDS } from '../src/settings/categories';

describe('settings defaults', () => {
  it('has a default toggle for every category', () => {
    for (const id of CATEGORY_IDS) {
      expect(DEFAULT_SETTINGS.categories).toHaveProperty(id);
      expect(typeof DEFAULT_SETTINGS.categories[id]).toBe('boolean');
    }
    expect(Object.keys(DEFAULT_SETTINGS.categories)).toHaveLength(CATEGORIES.length);
  });

  it('enables auto-expand by default', () => {
    expect(DEFAULT_SETTINGS.autoExpand).toBe(true);
  });

  it('keeps the expensive oversized-diff category off by default', () => {
    expect(DEFAULT_SETTINGS.categories.oversizedDiffs).toBe(false);
  });

  it('uses sane safety limits', () => {
    expect(DEFAULT_SETTINGS.rateLimitMs).toBeGreaterThan(0);
    expect(DEFAULT_SETTINGS.maxPasses).toBeGreaterThan(0);
  });
});
