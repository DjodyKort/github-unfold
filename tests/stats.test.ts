import { describe, expect, it } from 'vitest';
import { applyBatch, type Stats } from '../src/stats/store';

const base: Stats = { total: 0, byCategory: {}, today: 0, todayDate: '' };

describe('applyBatch', () => {
  it('accumulates totals and per-category counts', () => {
    const jan1 = new Date(2026, 0, 1, 10);
    const s = applyBatch(base, { resolvedThreads: 2, hiddenItems: 1 }, jan1);
    expect(s.total).toBe(3);
    expect(s.byCategory.resolvedThreads).toBe(2);
    expect(s.byCategory.hiddenItems).toBe(1);
    expect(s.today).toBe(3);
    expect(s.todayDate).toBe('2026-01-01');
  });

  it('adds to the same-day counter', () => {
    const t = new Date(2026, 0, 1, 10);
    const a = applyBatch(base, { resolvedThreads: 2 }, t);
    const b = applyBatch(a, { resolvedThreads: 3 }, new Date(2026, 0, 1, 14));
    expect(b.today).toBe(5);
    expect(b.total).toBe(5);
  });

  it('rolls the daily counter over at local midnight but keeps the all-time total', () => {
    const a = applyBatch(base, { resolvedThreads: 4 }, new Date(2026, 0, 1, 23));
    const b = applyBatch(a, { resolvedThreads: 1 }, new Date(2026, 0, 2, 0, 30));
    expect(b.today).toBe(1);
    expect(b.todayDate).toBe('2026-01-02');
    expect(b.total).toBe(5);
  });

  it('is a no-op for an empty batch', () => {
    const a = applyBatch(base, {}, new Date(2026, 0, 1));
    expect(a).toBe(base);
  });
});
