import type { PageKind, Target } from './types';

/**
 * The selector registry.
 *
 * Populated in Phase 1 from live Playwright recon. Kept deliberately empty in
 * the scaffold so the engine, diagnostics and tests can import a stable shape.
 */
export const TARGETS: Target[] = [];

export function targetsForPage(page: PageKind): Target[] {
  return TARGETS.filter((t) => t.pages.includes(page));
}

export * from './types';
export { detectPage } from './page';
