import { CATEGORIES } from '../../settings/categories';
import type { Settings } from '../../settings/defaults';

interface Props {
  settings: Settings;
  onChange: (next: Settings) => void;
}

export function Controls({ settings, onChange }: Props) {
  return (
    <div className="gu-controls">
      <label className="gu-row gu-master">
        <input
          type="checkbox"
          checked={settings.autoExpand}
          onChange={(e) => onChange({ ...settings, autoExpand: e.target.checked })}
        />
        <span>
          <strong>Auto-expand on load</strong>
          <small>Expand everything automatically when a PR or issue opens.</small>
        </span>
      </label>

      <div className="gu-divider" />

      <fieldset className="gu-categories" disabled={!settings.autoExpand}>
        {CATEGORIES.map((cat) => (
          <label key={cat.id} className="gu-row">
            <input
              type="checkbox"
              checked={settings.categories[cat.id]}
              onChange={(e) =>
                onChange({
                  ...settings,
                  categories: { ...settings.categories, [cat.id]: e.target.checked },
                })
              }
            />
            <span>
              {cat.label}
              <small>{cat.help}</small>
            </span>
          </label>
        ))}
      </fieldset>
    </div>
  );
}
