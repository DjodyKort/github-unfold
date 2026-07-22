import { detectPage } from '../selectors/page';
import { hasDrift, selfTest, type TargetReport } from './selfTest';

export interface Diagnostics {
  page: 'pr' | 'issue' | null;
  reports: TargetReport[];
  drift: boolean;
}

/** Run the live self-test against the current document. */
export function runDiagnostics(root: ParentNode = document): Diagnostics {
  const page = detectPage();
  if (!page) return { page: null, reports: [], drift: false };
  const reports = selfTest(root, page);
  return { page, reports, drift: hasDrift(reports) };
}
