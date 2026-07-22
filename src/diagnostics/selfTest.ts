import { targetsForPage } from '../selectors';
import type { PageKind } from '../selectors/types';

export type TargetStatus = 'ok' | 'drift' | 'absent';

export interface TargetReport {
  id: string;
  category: string;
  matched: number;
  expectedByHeuristic: boolean | null;
  status: TargetStatus;
}

/**
 * Run every registered target against the current DOM and classify each:
 *  - `ok`      matched at least one element
 *  - `drift`   matched nothing but the heuristic says the category is present
 *              (our selector has probably broken)
 *  - `absent`  matched nothing and the category genuinely isn't on this page
 *
 * This is the same signal shown live in the dashboard and asserted by the
 * sentinel in CI.
 */
export function selfTest(root: ParentNode, page: PageKind): TargetReport[] {
  return targetsForPage(page).map((t) => {
    const matched = t.find(root).length;
    const expectedByHeuristic = t.driftHeuristic(root);
    let status: TargetStatus;
    if (matched > 0) status = 'ok';
    else if (expectedByHeuristic === true) status = 'drift';
    else status = 'absent';
    return { id: t.id, category: t.category, matched, expectedByHeuristic, status };
  });
}

export function hasDrift(reports: TargetReport[]): boolean {
  return reports.some((r) => r.status === 'drift');
}
