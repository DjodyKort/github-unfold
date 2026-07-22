/** Shared low-level DOM helpers for selector targets. */

/** Case-insensitive test for whether `root` contains any of the given phrases. */
export function pageContainsText(root: ParentNode, phrases: string[]): boolean {
  const host = (root as Element).textContent ?? (root as Document).body?.textContent ?? '';
  const hay = host.toLowerCase();
  return phrases.some((p) => hay.includes(p.toLowerCase()));
}

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
    new MouseEvent('click', { bubbles: true, cancelable: true, view: el.ownerDocument.defaultView }),
  );
}
