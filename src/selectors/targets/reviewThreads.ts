import type { Target } from '../types';
import { pageContainsText, realClick } from '../helpers';

/**
 * A resolved/outdated review thread on a classic PR page.
 *
 * GitHub replaced the old `<details>` element with a `<review-thread-collapsible>`
 * custom element in April 2026 (the change that broke every older tool). The
 * element exposes an `open` boolean property; setting it triggers the lazy
 * `<include-fragment>` fetch of the thread body. We set `.open` and, as a
 * fallback for environments without the custom-element upgrade, dispatch a real
 * click on the toggle button.
 */
interface CollapsibleEl extends Element {
  open?: boolean;
}

function findThreads(root: ParentNode): Element[] {
  return Array.from(root.querySelectorAll('review-thread-collapsible'));
}

function isOpen(el: Element): boolean {
  const c = el as CollapsibleEl;
  if (typeof c.open === 'boolean') return c.open;
  // Fixture / no-upgrade fallback: the show button is hidden once expanded.
  const body = el.querySelector('[data-target="review-thread-collapsible.body"]');
  return !!body && !body.hasAttribute('hidden');
}

function open(el: Element): void {
  const c = el as CollapsibleEl;
  if (typeof c.open === 'boolean') {
    c.open = true;
    return;
  }
  const toggle = el.querySelector(
    '.review-thread-show-text, [data-action*="review-thread-collapsible#toggle"]',
  );
  if (toggle) realClick(toggle);
}

export const resolvedThreadsTarget: Target = {
  id: 'resolvedThreads.pr',
  category: 'resolvedThreads',
  pages: ['pr'],
  description:
    'Resolved review conversation collapsed behind "Show resolved" (2026 <review-thread-collapsible> custom element).',
  sampleUrl: 'https://github.com/python/cpython/pull/148283',
  find(root) {
    return findThreads(root).filter(
      (el) => el.getAttribute('data-resolved') === 'true' && !isOpen(el),
    );
  },
  isExpanded: isOpen,
  expand: open,
  driftHeuristic(root) {
    if (findThreads(root).length > 0) return true;
    if (pageContainsText(root, ['Show resolved', 'Hide resolved'])) return true;
    return null;
  },
};

export const outdatedThreadsTarget: Target = {
  id: 'outdatedThreads.pr',
  category: 'outdatedThreads',
  pages: ['pr'],
  description:
    'Outdated review conversation (same <review-thread-collapsible> element carrying an "Outdated" label).',
  sampleUrl: 'https://github.com/python/cpython/pull/148283',
  find(root) {
    return findThreads(root).filter((el) => {
      if (isOpen(el)) return false;
      const labels = Array.from(el.querySelectorAll('.Label'));
      return labels.some((l) => /outdated/i.test(l.textContent ?? ''));
    });
  },
  isExpanded: isOpen,
  expand: open,
  driftHeuristic(root) {
    if (pageContainsText(root, ['Outdated'])) {
      return findThreads(root).length > 0 ? true : null;
    }
    return null;
  },
};
