import type { Target } from '../types';
import { labelledbyText, realClick } from '../helpers';

/**
 * A comment minimized as off-topic / spam / abuse / duplicate / outdated.
 *
 * Two DOMs:
 *  - React Issue Viewer: an icon-only `button[data-component="IconButton"]`
 *    containing `.octicon-unfold`, accessibly labelled "show comment". The
 *    surrounding `CommentActions-module__…` class is a hashed CSS-module name and
 *    must NOT be relied on.
 *  - Classic PR: a `.js-minimizable-comment-group.minimized-comment` whose show
 *    control carries `.octicon-unfold` inside the minimize form.
 */
function unfoldButtons(root: ParentNode): Element[] {
  return Array.from(root.querySelectorAll('button')).filter((b) => {
    if (!b.querySelector('.octicon-unfold')) return false;
    // Exclude the review-thread "Show resolved" button, which shares the icon.
    if (b.closest('review-thread-collapsible')) return false;
    const label = labelledbyText(b) ?? b.textContent ?? '';
    return /show comment|show minimized|unminimize|show/i.test(label) || b.getAttribute('data-component') === 'IconButton';
  });
}

export const minimizedCommentsIssueTarget: Target = {
  id: 'minimizedComments.issue',
  category: 'minimizedComments',
  pages: ['issue'],
  description: 'Hidden/minimized comment on the React Issue Viewer ("show comment" unfold button).',
  sampleUrl: 'https://github.com/rust-lang/rust/issues/20041',
  find(root) {
    return unfoldButtons(root);
  },
  isExpanded() {
    // Once clicked the button is removed from the DOM, so a present button is
    // by definition not yet expanded.
    return false;
  },
  expand(el) {
    realClick(el);
  },
  // The "show comment" unfold button is exactly what find() targets, so there
  // is no independent in-page anchor; drift is covered by the sentinel.
  driftHeuristic() {
    return null;
  },
};

export const minimizedCommentsPrTarget: Target = {
  id: 'minimizedComments.pr',
  category: 'minimizedComments',
  pages: ['pr'],
  description: 'Hidden/minimized comment on a classic PR page.',
  sampleUrl: 'https://github.com/python/cpython/pull/148283',
  find(root) {
    return Array.from(
      root.querySelectorAll('.js-minimizable-comment-group.minimized-comment'),
    ).filter((g) => !!g.querySelector('.octicon-unfold, .js-comment-hide-minimize-form'));
  },
  isExpanded(el) {
    return !el.classList.contains('minimized-comment');
  },
  expand(el) {
    const toggle = el.querySelector('.octicon-unfold, .js-comment-hide-minimize-form button, summary');
    if (toggle) realClick(toggle);
  },
  driftHeuristic() {
    return null;
  },
};
