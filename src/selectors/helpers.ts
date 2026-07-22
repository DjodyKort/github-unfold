/** Shared low-level DOM helpers for selector targets. */

/** The accessible label text a `button[aria-labelledby]` points at, if any. */
export function labelledbyText(el: Element): string | null {
  const id = el.getAttribute('aria-labelledby');
  if (!id) return null;
  const ownerDoc = el.ownerDocument;
  const target = ownerDoc.getElementById(id.split(/\s+/)[0]!);
  return target?.textContent?.trim() ?? null;
}

/** Dispatch a trusted-like click that Catalyst / React both honor. */
export function realClick(el: Element): void {
  (el as HTMLElement).dispatchEvent(
    new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: el.ownerDocument.defaultView,
    }),
  );
}

/**
 * Best-effort visibility check. Uses `hidden`/inline `display:none` up the tree,
 * which is deterministic in both real browsers and the test DOM (unlike layout,
 * which the test DOM doesn't compute).
 */
export function isProbablyVisible(el: Element): boolean {
  // In a real browser, `checkVisibility` accounts for CSS-class-based hiding
  // (e.g. GitHub hides the "Show resolved" button via a class once a thread is
  // expanded) — essential to avoid a false drift signal after auto-expansion.
  const withCheck = el as Element & { checkVisibility?: () => boolean };
  if (typeof withCheck.checkVisibility === 'function') {
    return withCheck.checkVisibility();
  }
  // Fallback for the test DOM, which computes no layout: inspect `hidden` and
  // inline `display:none` up the tree.
  let node: Element | null = el;
  while (node) {
    if (node.hasAttribute('hidden')) return false;
    const style = (node as HTMLElement).style;
    if (style && style.display === 'none') return false;
    node = node.parentElement;
  }
  return true;
}

/**
 * True if a visible `<button>`/`<summary>` whose accessible text matches `re`
 * exists — a stable secondary anchor for drift detection, independent of the
 * fragile class our `find()` relies on.
 */
export function hasControlLabelled(root: ParentNode, re: RegExp): boolean {
  return Array.from(root.querySelectorAll('button, summary')).some((el) => {
    if (!isProbablyVisible(el)) return false;
    return re.test((el.textContent ?? '').trim());
  });
}
