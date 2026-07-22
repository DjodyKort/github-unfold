import type { Target } from '../types';
import { realClick } from '../helpers';

/**
 * A condensed/collapsed commit group in the PR timeline
 * (`.TimelineItem--condensed`). Expanding reveals the individual commits.
 */
export const commitListsTarget: Target = {
  id: 'commitLists.pr',
  category: 'commitLists',
  pages: ['pr'],
  description: 'Collapsed commit group in the PR timeline.',
  sampleUrl: 'https://github.com/kubernetes/kubernetes/pull/129719',
  find(root) {
    return Array.from(root.querySelectorAll('.TimelineItem--condensed')).filter(
      (el) => !!el.querySelector('.octicon-unfold, [aria-expanded="false"], summary'),
    );
  },
  isExpanded(el) {
    const control = el.querySelector('[aria-expanded]');
    if (control) return control.getAttribute('aria-expanded') === 'true';
    const details = el.querySelector('details');
    return !!details && details.hasAttribute('open');
  },
  expand(el) {
    const toggle = el.querySelector(
      '[aria-expanded="false"], .octicon-unfold, summary, button',
    );
    if (toggle) realClick(toggle);
  },
  driftHeuristic(root) {
    return root.querySelector('.TimelineItem--condensed') ? true : null;
  },
};
