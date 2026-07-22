# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/), and the project aims to follow
semantic versioning.

## [Unreleased]

### Added

- Zero-click auto-expansion of resolved & outdated review threads, minimized/hidden
  comments, "N hidden items" / Load-more batches, and commit lists on GitHub PRs
  and issues.
- Correct 2026 `review-thread-collapsible` handling (the resolved-thread fix other
  tools missed after GitHub's April 2026 UI change).
- Rich in-page Shadow-DOM dashboard: Controls, live **Diagnostics** (self-test with
  a drift badge), Stats, Shortcuts, About. Popup + options dashboard.
- Engine: MutationObserver + SPA-navigation hooks, rate-limited idempotent passes.
- Self-healing pipeline: a daily Playwright sentinel checks live GitHub and, on
  drift, opens an AI fix PR (Claude Code Action, subscription OAuth).
- Keyboard shortcuts: `Alt+Shift+E` (expand now), `Alt+Shift+U` (toggle panel).
- First-run onboarding (opens the dashboard on install).

### Tooling

- ESLint + Prettier, Node 20/22 test matrix with coverage, Chrome + Firefox builds,
  a hermetic extension E2E, CodeQL, and Dependabot.
