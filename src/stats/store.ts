import { storage } from '#imports';
import type { CategoryId } from '../settings/categories';

export interface Stats {
  /** Total elements expanded, all time. */
  total: number;
  /** Per-category all-time totals. */
  byCategory: Partial<Record<CategoryId, number>>;
  /** Count for the current local day. */
  today: number;
  /** ISO date (YYYY-MM-DD) the `today` counter belongs to. */
  todayDate: string;
}

const EMPTY: Stats = { total: 0, byCategory: {}, today: 0, todayDate: '' };

const statsItem = storage.defineItem<Stats>('local:stats', { fallback: EMPTY });

function localDate(now: Date = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

/**
 * Fold a batch of per-category expansions into the running stats, rolling the
 * daily counter over at local midnight.
 */
export function applyBatch(
  stats: Stats,
  byCategory: Record<string, number>,
  now: Date = new Date(),
): Stats {
  const added = Object.values(byCategory).reduce((a, b) => a + b, 0);
  if (added === 0) return stats;

  const date = localDate(now);
  const sameDay = stats.todayDate === date;
  const next: Stats = {
    total: stats.total + added,
    byCategory: { ...stats.byCategory },
    today: (sameDay ? stats.today : 0) + added,
    todayDate: date,
  };
  for (const [cat, n] of Object.entries(byCategory)) {
    const key = cat as CategoryId;
    next.byCategory[key] = (next.byCategory[key] ?? 0) + n;
  }
  return next;
}

export async function getStats(): Promise<Stats> {
  return statsItem.getValue();
}

export async function recordExpansion(byCategory: Record<string, number>): Promise<void> {
  const current = await statsItem.getValue();
  await statsItem.setValue(applyBatch(current, byCategory));
}

export function watchStats(cb: (s: Stats) => void): () => void {
  return statsItem.watch((s) => cb(s ?? EMPTY));
}
