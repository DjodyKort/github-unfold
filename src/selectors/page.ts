import type { PageKind } from './types';

/**
 * Detect whether the current location is a PR or an issue page.
 *
 * PR conversation/files pages are still classic server-rendered markup; issue
 * pages have migrated to the React "Issue Viewer" SPA. The two need different
 * selectors, so the engine keys off this.
 */
export function detectPage(pathname: string = location.pathname): PageKind | null {
  if (/^\/[^/]+\/[^/]+\/pull\/\d+/.test(pathname)) return 'pr';
  if (/^\/[^/]+\/[^/]+\/issues\/\d+/.test(pathname)) return 'issue';
  return null;
}
