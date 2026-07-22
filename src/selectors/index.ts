import type { PageKind, Target } from './types';
import { resolvedThreadsTarget, outdatedThreadsTarget } from './targets/reviewThreads';
import { minimizedCommentsIssueTarget, minimizedCommentsPrTarget } from './targets/minimizedComments';
import { hiddenItemsPrTarget, hiddenItemsIssueTarget } from './targets/hiddenItems';
import { commitListsTarget } from './targets/commitLists';

/**
 * The selector registry — the single fragile surface of the project.
 *
 * Each entry is unit-tested against a fixture in `fixtures/` and checked live by
 * the drift sentinel. When GitHub changes its markup, exactly one entry here
 * needs repair (which the AI fixer targets).
 */
export const TARGETS: Target[] = [
  resolvedThreadsTarget,
  outdatedThreadsTarget,
  minimizedCommentsPrTarget,
  minimizedCommentsIssueTarget,
  hiddenItemsPrTarget,
  hiddenItemsIssueTarget,
  commitListsTarget,
];

export function targetsForPage(page: PageKind): Target[] {
  return TARGETS.filter((t) => t.pages.includes(page));
}

export function targetById(id: string): Target | undefined {
  return TARGETS.find((t) => t.id === id);
}

export * from './types';
export { detectPage } from './page';
