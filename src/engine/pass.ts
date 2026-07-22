import { targetsForPage } from '../selectors';
import type { PageKind } from '../selectors/types';
import type { Settings } from '../settings/defaults';
import type { RateLimiter } from './rateLimit';

export interface ExpandPassResult {
  expanded: number;
  byCategory: Record<string, number>;
}

export interface ExpandPassDeps {
  /** Throttle for `networkHeavy` targets. */
  rateLimiter?: RateLimiter;
  /**
   * Elements already actioned this navigation. Prevents re-clicking an element
   * whose `isExpanded()` can't confirm success (e.g. a Load-more button that
   * failed to load), which would otherwise loop.
   */
  actioned?: WeakSet<Element>;
}

/**
 * Run one expand pass over `root` for the given page.
 *
 * Idempotent: skips elements already expanded or already actioned this
 * navigation. Network-heavy targets are rate-limited.
 */
export async function runExpandPass(
  root: ParentNode,
  settings: Settings,
  page: PageKind,
  deps: ExpandPassDeps = {},
): Promise<ExpandPassResult> {
  const result: ExpandPassResult = { expanded: 0, byCategory: {} };

  for (const target of targetsForPage(page)) {
    if (!settings.categories[target.category]) continue;

    for (const el of target.find(root)) {
      if (deps.actioned?.has(el)) continue;
      if (target.isExpanded(el)) continue;

      if (target.networkHeavy && deps.rateLimiter) {
        await deps.rateLimiter.wait();
      }
      await target.expand(el);
      deps.actioned?.add(el);

      result.expanded += 1;
      result.byCategory[target.category] = (result.byCategory[target.category] ?? 0) + 1;
    }
  }

  return result;
}
