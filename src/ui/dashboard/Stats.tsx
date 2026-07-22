import { CATEGORIES } from '../../settings/categories';
import type { Stats as StatsData } from '../../stats/store';

interface Props {
  stats: StatsData;
}

export function Stats({ stats }: Props) {
  return (
    <div className="gu-stats">
      <div className="gu-stat-tiles">
        <div className="gu-tile">
          <span className="gu-tile-num">{stats.total}</span>
          <span className="gu-tile-label">expanded all-time</span>
        </div>
        <div className="gu-tile">
          <span className="gu-tile-num">{stats.today}</span>
          <span className="gu-tile-label">today</span>
        </div>
      </div>

      <table className="gu-table">
        <tbody>
          {CATEGORIES.map((cat) => (
            <tr key={cat.id}>
              <td>{cat.label}</td>
              <td className="gu-num">{stats.byCategory[cat.id] ?? 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
