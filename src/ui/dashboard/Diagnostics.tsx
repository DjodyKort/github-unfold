import type { Diagnostics as DiagnosticsData } from '../../diagnostics/runner';
import type { TargetStatus } from '../../diagnostics/selfTest';

interface Props {
  data: DiagnosticsData;
  onRerun: () => void;
}

const STATUS_LABEL: Record<TargetStatus, string> = {
  ok: 'OK',
  drift: 'DRIFT',
  absent: 'not on page',
};

export function Diagnostics({ data, onRerun }: Props) {
  if (!data.page) {
    return (
      <div className="gu-diagnostics">
        <p className="gu-muted">Open a pull request or issue to run diagnostics.</p>
      </div>
    );
  }

  return (
    <div className="gu-diagnostics">
      <div className="gu-diag-head">
        <span className="gu-muted">
          Live self-test on this <strong>{data.page}</strong> page
        </span>
        <button className="gu-btn" onClick={onRerun}>
          Re-run
        </button>
      </div>

      {data.drift && (
        <div className="gu-alert" role="alert">
          A selector that should match this page found nothing — it has probably broken. The
          sentinel will open a fix.
        </div>
      )}

      <table className="gu-table">
        <thead>
          <tr>
            <th>Target</th>
            <th>Matched</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.reports.map((r) => (
            <tr key={r.id} className={`gu-status-${r.status}`}>
              <td>{r.id}</td>
              <td>{r.matched}</td>
              <td>
                <span className={`gu-badge gu-badge-${r.status}`}>{STATUS_LABEL[r.status]}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
