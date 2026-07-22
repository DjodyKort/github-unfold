import { browser } from '#imports';
import { useSettings, useStats } from '../../src/ui/hooks';

export function App() {
  const [settings, setSettings] = useSettings();
  const stats = useStats();

  return (
    <div className="gu-popup">
      <h1>GitHub Unfold</h1>
      <p>Auto-expand collapsed comments &amp; conversations.</p>

      {settings && (
        <label className="gu-popup-toggle">
          <input
            type="checkbox"
            checked={settings.autoExpand}
            onChange={(e) => setSettings({ ...settings, autoExpand: e.target.checked })}
          />
          Auto-expand on load
        </label>
      )}

      {stats && (
        <p className="gu-popup-stat">
          Expanded <strong>{stats.total}</strong> items · <strong>{stats.today}</strong> today
        </p>
      )}

      <a
        className="gu-popup-link"
        href="#"
        onClick={(e) => {
          e.preventDefault();
          browser.runtime.openOptionsPage();
        }}
      >
        Open dashboard →
      </a>
    </div>
  );
}
