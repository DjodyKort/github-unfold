import { CATEGORIES, type CategoryId } from './categories';

export interface Settings {
  /** Master switch: expand automatically on page load. */
  autoExpand: boolean;
  /** Per-category enable/disable. */
  categories: Record<CategoryId, boolean>;
  /** Minimum delay between network-triggering clicks (Load more), in ms. */
  rateLimitMs: number;
  /** Safety cap on expand passes per navigation. */
  maxPasses: number;
}

export const DEFAULT_SETTINGS: Settings = {
  autoExpand: true,
  categories: Object.fromEntries(CATEGORIES.map((c) => [c.id, c.defaultOn])) as Record<
    CategoryId,
    boolean
  >,
  rateLimitMs: 400,
  maxPasses: 20,
};
