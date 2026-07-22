/**
 * The canonical list of expandable categories.
 *
 * This list is the single source of truth shared by the engine, the settings
 * store, the diagnostics dashboard, and the drift sentinel. Adding a category
 * here wires it through every layer.
 */
export const CATEGORIES = [
  {
    id: 'resolvedThreads',
    label: 'Resolved conversations',
    help: 'Auto-open review threads that were resolved.',
    defaultOn: true,
  },
  {
    id: 'outdatedThreads',
    label: 'Outdated conversations',
    help: 'Auto-open review threads marked as outdated.',
    defaultOn: true,
  },
  {
    id: 'minimizedComments',
    label: 'Hidden comments',
    help: 'Unfold comments minimized as off-topic, spam, abuse, duplicate or outdated.',
    defaultOn: true,
  },
  {
    id: 'hiddenItems',
    label: 'Hidden items / Load more',
    help: 'Load the "N hidden items" and "Load more" batches in long threads.',
    defaultOn: true,
  },
  {
    id: 'commitLists',
    label: 'Commit lists',
    help: 'Expand collapsed commit groups in the timeline.',
    defaultOn: true,
  },
  {
    id: 'oversizedDiffs',
    label: 'Oversized diffs',
    help: 'Load large/collapsed file diffs. Off by default — can be heavy.',
    defaultOn: false,
  },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]['id'];

export const CATEGORY_IDS: CategoryId[] = CATEGORIES.map((c) => c.id);
