export function Onboarding() {
  return (
    <div className="gu-onboarding">
      <p>
        <strong>GitHub Unfold</strong> opens everything GitHub hides on pull
        requests and issues — resolved &amp; outdated conversations, hidden
        comments, and "N hidden items" batches — automatically, as the page loads.
      </p>
      <ol className="gu-steps">
        <li>Open any PR or issue. Collapsed content expands on its own.</li>
        <li>Use the panel to turn categories on or off.</li>
        <li>
          The <strong>Diagnostics</strong> tab shows a live self-test. A red
          <span className="gu-badge gu-badge-drift"> DRIFT</span> badge means
          GitHub changed its markup and a selector needs repair — the sentinel
          opens a fix automatically.
        </li>
      </ol>
    </div>
  );
}
