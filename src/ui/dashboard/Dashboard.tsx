import { useState, type ReactNode } from 'react';
import type { Settings } from '../../settings/defaults';
import type { Stats as StatsData } from '../../stats/store';
import type { Diagnostics as DiagnosticsData } from '../../diagnostics/runner';
import { Controls } from './Controls';
import { Diagnostics } from './Diagnostics';
import { Stats } from './Stats';
import { Shortcuts } from './Shortcuts';
import { Onboarding } from './Onboarding';

export type TabId = 'controls' | 'diagnostics' | 'stats' | 'shortcuts' | 'help';

interface Props {
  settings: Settings;
  onChangeSettings: (next: Settings) => void;
  stats: StatsData;
  /** Live diagnostics — only supplied by the in-page surface. */
  diagnostics?: DiagnosticsData;
  onRerunDiagnostics?: () => void;
  /** Which tabs to render, in order. */
  tabs?: TabId[];
}

const TAB_LABEL: Record<TabId, string> = {
  controls: 'Controls',
  diagnostics: 'Diagnostics',
  stats: 'Stats',
  shortcuts: 'Shortcuts',
  help: 'About',
};

export function Dashboard({
  settings,
  onChangeSettings,
  stats,
  diagnostics,
  onRerunDiagnostics,
  tabs = ['controls', 'diagnostics', 'stats', 'shortcuts', 'help'],
}: Props) {
  const [active, setActive] = useState<TabId>(tabs[0] ?? 'controls');
  const driftFlag = diagnostics?.drift ?? false;

  const panels: Record<TabId, ReactNode> = {
    controls: <Controls settings={settings} onChange={onChangeSettings} />,
    diagnostics: diagnostics ? (
      <Diagnostics data={diagnostics} onRerun={onRerunDiagnostics ?? (() => {})} />
    ) : (
      <p className="gu-muted">Live diagnostics run on GitHub PR and issue pages.</p>
    ),
    stats: <Stats stats={stats} />,
    shortcuts: <Shortcuts />,
    help: <Onboarding />,
  };

  return (
    <div className="gu-dashboard-body">
      <nav className="gu-tabs" role="tablist">
        {tabs.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={active === t}
            className={`gu-tab ${active === t ? 'gu-tab-active' : ''}`}
            onClick={() => setActive(t)}
          >
            {TAB_LABEL[t]}
            {t === 'diagnostics' && driftFlag && <span className="gu-dot" aria-label="drift" />}
          </button>
        ))}
      </nav>
      <div className="gu-tabpanel" role="tabpanel">
        {panels[active]}
      </div>
    </div>
  );
}
