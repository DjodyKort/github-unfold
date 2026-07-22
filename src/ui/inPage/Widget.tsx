import { useCallback, useEffect, useState } from 'react';
import { useSettings, useStats } from '../hooks';
import { runDiagnostics, type Diagnostics as DiagnosticsData } from '../../diagnostics/runner';
import { Dashboard } from '../dashboard/Dashboard';
import { DEFAULT_SETTINGS } from '../../settings/defaults';

/** Window event the content script dispatches to toggle the panel (keyboard shortcut). */
export const TOGGLE_EVENT = 'gu:toggle-panel';

interface Props {
  /** Fires when the user asks to expand everything now. */
  onExpandNow: () => void;
}

export function Widget({ onExpandNow }: Props) {
  const [settings, setSettings] = useSettings();
  const stats = useStats();
  const [open, setOpen] = useState(false);
  const [diag, setDiag] = useState<DiagnosticsData>(() => runDiagnostics());

  const refresh = useCallback(() => setDiag(runDiagnostics()), []);

  const toggle = useCallback(() => {
    setOpen((o) => !o);
    refresh();
  }, [refresh]);

  // Subscribe to the external toggle signal (setState happens in the callback,
  // not synchronously in the effect body).
  useEffect(() => {
    const handler = () => toggle();
    window.addEventListener(TOGGLE_EVENT, handler);
    return () => window.removeEventListener(TOGGLE_EVENT, handler);
  }, [toggle]);

  const drift = diag.drift;

  return (
    <div className="gu-widget">
      {open && (
        <section className="gu-panel" aria-label="GitHub Unfold">
          <header className="gu-panel-head">
            <span className="gu-panel-title">GitHub Unfold</span>
            <div className="gu-panel-actions">
              <button className="gu-btn" onClick={onExpandNow}>
                Expand now
              </button>
              <button className="gu-iconbtn" aria-label="Close" onClick={() => setOpen(false)}>
                ×
              </button>
            </div>
          </header>
          <Dashboard
            settings={settings ?? DEFAULT_SETTINGS}
            onChangeSettings={setSettings}
            stats={stats ?? { total: 0, byCategory: {}, today: 0, todayDate: '' }}
            diagnostics={diag}
            onRerunDiagnostics={refresh}
          />
        </section>
      )}

      <button
        className={`gu-launcher ${drift ? 'gu-launcher-drift' : ''}`}
        onClick={toggle}
        aria-label={drift ? 'GitHub Unfold — selector drift detected' : 'GitHub Unfold'}
        title={drift ? 'A selector has broken — click for diagnostics' : 'GitHub Unfold'}
      >
        <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden="true" fill="currentColor">
          <path d="m8.177.677 2.896 2.896a.25.25 0 0 1-.177.427H8.75v1.25a.75.75 0 0 1-1.5 0V4H5.104a.25.25 0 0 1-.177-.427L7.823.677a.25.25 0 0 1 .354 0ZM7.25 10.75a.75.75 0 0 1 1.5 0V12h2.146a.25.25 0 0 1 .177.427l-2.896 2.896a.25.25 0 0 1-.354 0l-2.896-2.896A.25.25 0 0 1 5.104 12H7.25v-1.25Z" />
        </svg>
        {drift && <span className="gu-launcher-badge" aria-hidden="true" />}
        {!drift && stats && stats.today > 0 && (
          <span className="gu-launcher-count">{stats.today}</span>
        )}
      </button>
    </div>
  );
}
