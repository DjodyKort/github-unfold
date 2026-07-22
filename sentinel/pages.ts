/**
 * Curated public GitHub pages the sentinel checks daily.
 *
 * Each `expect` lists the target ids verified (via live recon, 2026-07-22) to be
 * genuinely present on that page. The sentinel fails if any of them stops
 * matching — that is the drift signal the self-healing pipeline keys off.
 *
 * Pick long-stable, historical (merged/closed) PRs & issues so content churn
 * doesn't cause false positives. When GitHub content legitimately changes,
 * update this list — see MAINTENANCE.md.
 */
export interface CuratedPage {
  url: string;
  /** Target ids known to be present and expected to keep matching. */
  expect: string[];
}

export const CURATED_PAGES: CuratedPage[] = [
  {
    url: 'https://github.com/python/cpython/pull/148283',
    expect: ['resolvedThreads.pr', 'outdatedThreads.pr'],
  },
  {
    url: 'https://github.com/rust-lang/rust/issues/20041',
    expect: ['minimizedComments.issue', 'hiddenItems.issue'],
  },
  {
    url: 'https://github.com/kubernetes/kubernetes/pull/129719',
    expect: ['hiddenItems.pr', 'commitLists.pr'],
  },
];
