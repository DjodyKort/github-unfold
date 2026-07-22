import { useEffect, useState } from 'react';
import { getSettings, setSettings, watchSettings } from '../../src/settings/storage';
import type { Settings } from '../../src/settings/defaults';

export function App() {
  const [settings, setLocal] = useState<Settings | null>(null);

  useEffect(() => {
    getSettings().then(setLocal);
    return watchSettings(setLocal);
  }, []);

  async function toggleAuto() {
    if (!settings) return;
    await setSettings({ ...settings, autoExpand: !settings.autoExpand });
  }

  return (
    <div className="gu-popup">
      <h1>GitHub Unfold</h1>
      <p>Auto-expand collapsed comments & conversations.</p>
      {settings && (
        <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 12, fontSize: 13 }}>
          <input type="checkbox" checked={settings.autoExpand} onChange={toggleAuto} />
          Auto-expand on load
        </label>
      )}
    </div>
  );
}
