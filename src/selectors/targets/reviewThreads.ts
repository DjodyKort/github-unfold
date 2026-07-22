import type { Target } from '../types';
import { hasControlLabelled, realClick } from '../helpers';

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

function bodyOf(el: Element): Element | null {
  return el.querySelector('[data-target="review-thread-collapsible.body"]');
}

function isOpen(el: Element): boolean {
  // Actual DOM state: the body loses its `hidden` attribute once expanded. This
  // is reliable regardless of whether the custom element reflects an `.open`
  // property.
  const body = bodyOf(el);
  if (body) return !body.hasAttribute('hidden');
  return (el as CollapsibleEl).open === true;
}

function open(el: Element): void {
  // Click the toggle the way a user would — the Catalyst controller wired to
  // `click:review-thread-collapsible#toggle` is what actually reveals (and
  // lazily fetches) the thread body. Setting `.open` does not invoke it.
  const toggle = el.querySelector(
    '.review-thread-show-text, [data-action*="review-thread-collapsible#toggle"]',
  );
  if (toggle) {
    realClick(toggle);
    return;
  }
  const c = el as CollapsibleEl;
  if (typeof c.open === 'boolean') c.open = true;
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
    // A visible "Show resolved" control means a collapsed thread is present; if
    // find() returned nothing for it, our element selector has drifted. The
    // control disappears once expanded, so this doesn't fire on success.
    return hasControlLabelled(root, /^show resolved$/i) ? true : null;
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
  // Outdated threads share the resolved element and "Show resolved" control;
  // there is no independent, false-positive-free in-page signal, so drift for
  // this target is covered authoritatively by the sentinel's curated pages.
  driftHeuristic() {
    return null;
  },
};
