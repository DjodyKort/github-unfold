import { storage } from '#imports';
import { DEFAULT_SETTINGS, type Settings } from './defaults';

const settingsItem = storage.defineItem<Settings>('sync:settings', {
  fallback: DEFAULT_SETTINGS,
});

export async function getSettings(): Promise<Settings> {
  const stored = await settingsItem.getValue();
  return mergeWithDefaults(stored);
}

export async function setSettings(next: Settings): Promise<void> {
  await settingsItem.setValue(next);
}

export function watchSettings(cb: (next: Settings) => void): () => void {
  return settingsItem.watch((next: Settings | null) => cb(mergeWithDefaults(next)));
}

/**
 * Guards against a stored blob written by an older version that predates a
 * newly added category — missing keys fall back to their defaults.
 */
function mergeWithDefaults(stored: Settings | null): Settings {
  if (!stored) return DEFAULT_SETTINGS;
  return {
    ...DEFAULT_SETTINGS,
    ...stored,
    categories: { ...DEFAULT_SETTINGS.categories, ...stored.categories },
  };
}
