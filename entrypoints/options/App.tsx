import { useSettings, useStats } from '../../src/ui/hooks';
import { Dashboard } from '../../src/ui/dashboard/Dashboard';
import { DEFAULT_SETTINGS } from '../../src/settings/defaults';
import '../../src/ui/theme.css';
import '../../src/ui/dashboard/dashboard.css';

export function App() {
  const [settings, setSettings] = useSettings();
  const stats = useStats();

  return (
    <div className="gu-dashboard">
      <header className="gu-dash-header">
        <h1>GitHub Unfold</h1>
        <p>Auto-expand collapsed comments &amp; conversations on GitHub.</p>
      </header>
      <Dashboard
        settings={settings ?? DEFAULT_SETTINGS}
        onChangeSettings={setSettings}
        stats={stats ?? { total: 0, byCategory: {}, today: 0, todayDate: '' }}
        tabs={['controls', 'stats', 'shortcuts', 'help']}
      />
    </div>
  );
}
