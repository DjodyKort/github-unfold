import type { Target } from '../types';
import { hasControlLabelled, realClick } from '../helpers';

/**
 * "N hidden items" / "Load more…" pagination batches.
 *
 * Classic PR: a `form.js-ajax-pagination` whose `.ajax-pagination-btn` submit
 * loads the next batch (both timeline-scoped `/timeline_more_items` and
 * review-scoped `/more_threads`). React Issue Viewer: a `LoadMore-module` button.
 *
 * The engine calls this repeatedly (rate-limited) because each expansion can
 * reveal another batch.
 */
export const hiddenItemsPrTarget: Target = {
  id: 'hiddenItems.pr',
  category: 'hiddenItems',
  pages: ['pr'],
  description: 'Hidden-items / Load-more pagination on a classic PR page.',
  networkHeavy: true,
  sampleUrl: 'https://github.com/kubernetes/kubernetes/pull/129719',
  find(root) {
    // One button per form — a form carries both "N hidden items" and
    // "Load more…" submits, but submitting either loads the same next batch.
    const seenForms = new Set<Element>();
    const out: Element[] = [];
    for (const b of root.querySelectorAll('.ajax-pagination-btn')) {
      if ((b as HTMLButtonElement).disabled) continue;
      const form = b.closest('form');
      if (form) {
        if (seenForms.has(form)) continue;
        seenForms.add(form);
      }
      out.push(b);
    }
    return out;
  },
  isExpanded() {
    return false;
  },
  expand(el) {
    const form = el.closest('form');
    if (form && typeof (form as HTMLFormElement).requestSubmit === 'function') {
      (form as HTMLFormElement).requestSubmit(el as HTMLButtonElement);
    } else {
      realClick(el);
    }
  },
  driftHeuristic(root) {
    return hasControlLabelled(root, /(load more|hidden item)/i) ? true : null;
  },
};

export const hiddenItemsIssueTarget: Target = {
  id: 'hiddenItems.issue',
  category: 'hiddenItems',
  pages: ['issue'],
  description: 'Hidden-items / Load-more control on the React Issue Viewer.',
  networkHeavy: true,
  sampleUrl: 'https://github.com/rust-lang/rust/issues/20041',
  find(root) {
    const scoped = Array.from(root.querySelectorAll('[class*="LoadMore-module"] button, button[class*="LoadMore-module"]'));
    if (scoped.length > 0) return scoped.filter((b) => !(b as HTMLButtonElement).disabled);
    return Array.from(root.querySelectorAll('button')).filter(
      (b) => /load more|hidden item/i.test(b.textContent ?? '') && !(b as HTMLButtonElement).disabled,
    );
  },
  isExpanded() {
    return false;
  },
  expand(el) {
    realClick(el);
  },
  driftHeuristic(root) {
    return hasControlLabelled(root, /(load more|hidden item)/i) ? true : null;
  },
};
