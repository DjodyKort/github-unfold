import type { CategoryId } from '../settings/categories';

export type PageKind = 'pr' | 'issue';

/**
 * A single expandable target on a GitHub page.
 *
 * Every fragile piece of DOM knowledge in this project lives in a `Target`.
 * Each target is unit-tested against a saved fixture and checked live by the
 * drift sentinel, so a broken selector surfaces immediately (and the AI fixer
 * has one well-described thing to repair).
 */
export interface Target {
  /** Unique id, e.g. `resolvedThreads.pr`. */
  id: string;
  category: CategoryId;
  /** Which page layouts this target applies to. */
  pages: PageKind[];
  /** Human description — also fed to the AI fixer when a selector drifts. */
  description: string;
  /**
   * A link to a public GitHub page known to contain this target. Used by the
   * sentinel to load real DOM and by contributors to eyeball the markup.
   */
  sampleUrl: string;

  /** Find collapsed candidate elements within `root`. */
  find(root: ParentNode): Element[];
  /** True if the element is already expanded (skipped for idempotency). */
  isExpanded(el: Element): boolean;
  /** Expand one element. May be async when content is lazily fetched. */
  expand(el: Element): void | Promise<void>;
  /**
   * Does this category appear to exist on the page even though `find()`
   * returned nothing? Powers drift detection: a `true` here with zero matches
   * means our selector has probably broken. Return `null` when undeterminable.
   */
  driftHeuristic(root: ParentNode): boolean | null;
}
