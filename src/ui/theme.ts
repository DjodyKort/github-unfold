/**
 * Design tokens for the extension UI (popup, options, in-page dashboard).
 *
 * Values mirror GitHub Primer so the UI feels native, and adapt to light/dark
 * via `prefers-color-scheme` plus GitHub's own `[data-color-mode]` attribute.
 * The rich dashboard (Phase 3) consumes these; kept here so there is one place
 * to restyle everything.
 */
export const THEME_CSS = `
:host, :root {
  --gu-font: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
  --gu-radius: 8px;
  --gu-space: 8px;

  --gu-bg: #ffffff;
  --gu-bg-subtle: #f6f8fa;
  --gu-fg: #1f2328;
  --gu-fg-muted: #59636e;
  --gu-border: #d1d9e0;
  --gu-accent: #0969da;
  --gu-ok: #1a7f37;
  --gu-warn: #9a6700;
  --gu-danger: #cf222e;
}

@media (prefers-color-scheme: dark) {
  :host, :root {
    --gu-bg: #0d1117;
    --gu-bg-subtle: #161b22;
    --gu-fg: #e6edf3;
    --gu-fg-muted: #9198a1;
    --gu-border: #3d444d;
    --gu-accent: #4493f8;
    --gu-ok: #3fb950;
    --gu-warn: #d29922;
    --gu-danger: #f85149;
  }
}

/* GitHub's explicit theme toggle wins over the OS preference. */
:root[data-color-mode="dark"], [data-color-mode="dark"] :host {
  --gu-bg: #0d1117;
  --gu-bg-subtle: #161b22;
  --gu-fg: #e6edf3;
  --gu-fg-muted: #9198a1;
  --gu-border: #3d444d;
  --gu-accent: #4493f8;
  --gu-ok: #3fb950;
  --gu-warn: #d29922;
  --gu-danger: #f85149;
}
`;
