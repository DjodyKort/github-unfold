import { useEffect, useState } from 'react';
import { getSettings, setSettings, watchSettings } from '../settings/storage';
import type { Settings } from '../settings/defaults';
import { getStats, watchStats, type Stats } from '../stats/store';

export function useSettings(): [Settings | null, (next: Settings) => void] {
  const [settings, setLocal] = useState<Settings | null>(null);
  useEffect(() => {
    getSettings().then(setLocal);
    return watchSettings(setLocal);
  }, []);
  return [settings, (next) => void setSettings(next)];
}

export function useStats(): Stats | null {
  const [stats, setLocal] = useState<Stats | null>(null);
  useEffect(() => {
    getStats().then(setLocal);
    return watchStats(setLocal);
  }, []);
  return stats;
}
