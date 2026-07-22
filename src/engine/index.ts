import { targetsForPage } from '../selectors';
import { detectPage } from '../selectors/page';
import type { Settings } from '../settings/defaults';

export interface ExpandPassResult {
  expanded: number;
  byCategory: Record<string, number>;
}

/**
 * Run a single expand pass over `root` for the detected page.
 *
 * Idempotent: elements already expanded are skipped. The full engine
 * (MutationObserver, SPA-nav hooks, retry/backoff for lazy content, and
 * rate-limiting of network-triggering clicks) is built in Phase 2 on top of
 * this primitive.
 */
export async function runExpandPass(
  root: ParentNode,
  settings: Settings,
): Promise<ExpandPassResult> {
  const page = detectPage();
  const result: ExpandPassResult = { expanded: 0, byCategory: {} };
  if (!page) return result;

  for (const target of targetsForPage(page)) {
    if (!settings.categories[target.category]) continue;
    for (const el of target.find(root)) {
      if (target.isExpanded(el)) continue;
      await target.expand(el);
      result.expanded += 1;
      result.byCategory[target.category] =
        (result.byCategory[target.category] ?? 0) + 1;
    }
  }
  return result;
}
