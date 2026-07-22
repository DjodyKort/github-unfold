import { describe, expect, it } from 'vitest';
import { loadFixture } from './fixtures';
import { resolvedThreadsTarget, outdatedThreadsTarget } from '../src/selectors/targets/reviewThreads';
import { minimizedCommentsIssueTarget } from '../src/selectors/targets/minimizedComments';
import { hiddenItemsPrTarget, hiddenItemsIssueTarget } from '../src/selectors/targets/hiddenItems';
import { commitListsTarget } from '../src/selectors/targets/commitLists';

/**
 * Each selector is asserted against the real DOM captured from GitHub. When
 * GitHub changes its markup, one of these fails first — that is the signal the
 * whole self-healing pipeline keys off.
 */

describe('resolvedThreads.pr', () => {
  const root = loadFixture('resolvedThreads.pr.html');

  it('finds the collapsed resolved thread', () => {
    expect(resolvedThreadsTarget.find(root).length).toBeGreaterThan(0);
  });

  it('reports it as not yet expanded', () => {
    const el = resolvedThreadsTarget.find(root)[0]!;
    expect(resolvedThreadsTarget.isExpanded(el)).toBe(false);
  });

  it('flags the category as present for drift detection', () => {
    expect(resolvedThreadsTarget.driftHeuristic(root)).toBe(true);
  });
});

describe('outdatedThreads.pr', () => {
  const root = loadFixture('resolvedThreads.pr.html');

  it('finds the outdated thread via its Outdated label', () => {
    expect(outdatedThreadsTarget.find(root).length).toBeGreaterThan(0);
  });
});

describe('minimizedComments.issue', () => {
  const root = loadFixture('minimizedComments.issue.html');

  it('finds the "show comment" unfold button', () => {
    expect(minimizedCommentsIssueTarget.find(root).length).toBeGreaterThan(0);
  });

  it('never treats a present unfold button as already expanded', () => {
    const el = minimizedCommentsIssueTarget.find(root)[0]!;
    expect(minimizedCommentsIssueTarget.isExpanded(el)).toBe(false);
  });
});

describe('hiddenItems.pr', () => {
  const root = loadFixture('hiddenItems.pr.html');

  it('finds the ajax-pagination load-more button', () => {
    expect(hiddenItemsPrTarget.find(root).length).toBeGreaterThan(0);
  });

  it('flags the category as present', () => {
    expect(hiddenItemsPrTarget.driftHeuristic(root)).toBe(true);
  });
});

describe('hiddenItems.issue', () => {
  const root = loadFixture('hiddenItems.issue.html');

  it('finds the React LoadMore button', () => {
    expect(hiddenItemsIssueTarget.find(root).length).toBeGreaterThan(0);
  });
});

describe('commitLists.pr', () => {
  const root = loadFixture('commitLists.pr.html');

  it('finds the condensed commit group', () => {
    expect(commitListsTarget.find(root).length).toBeGreaterThan(0);
  });
});
