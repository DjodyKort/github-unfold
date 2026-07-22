export const SHORTCUTS = [
  { keys: 'Alt + Shift + E', desc: 'Expand everything on the current page now' },
  { keys: 'Alt + Shift + U', desc: 'Toggle the GitHub Unfold panel' },
] as const;

export function Shortcuts() {
  return (
    <div className="gu-shortcuts">
      <table className="gu-table">
        <tbody>
          {SHORTCUTS.map((s) => (
            <tr key={s.keys}>
              <td>
                <kbd className="gu-kbd">{s.keys}</kbd>
              </td>
              <td>{s.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
