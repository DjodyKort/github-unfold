# Maintenance — the self-healing loop

GitHub changes its DOM a few times a year, which breaks selector-based tools.
This project is built so that breakage is **detected precisely** and **fixed by
AI**, not by hand. Three layers:

## 1. Every selector is unit-tested

`src/selectors/targets/*.ts` is the single fragile surface. Each `Target` is
asserted against a real captured fixture in `fixtures/` by `tests/selectors.test.ts`.
A selector that stops matching its fixture fails `npm test` immediately.

## 2. Live drift detection

- **In-browser:** the dashboard's Diagnostics tab runs the same `selfTest` on the
  page you're viewing. When a target that should match finds nothing, the floating
  launcher shows a **red drift badge**. Heuristics are deliberately conservative
  (scoped to visible, stable secondary anchors) so the badge doesn't cry wolf.
- **Sentinel (authoritative):** `.github/workflows/sentinel.yml` runs daily. It
  injects the exact same `selfTest` (bundled by `scripts/build-probe.mjs`) into a
  curated set of real public PRs/issues (`sentinel/pages.ts`) and asserts every
  category known to be present still matches. This is false-positive-free because
  it only checks categories verified to exist on each page.

Run it locally:

```bash
npm run sentinel
```

On drift it writes `.sentinel/report.json` (`{ url, targetId, reason }[]`) and
`.sentinel/dom-<url>.html` (GitHub's current markup) for the fixer to work from.

## 3. AI self-heal

When the sentinel fails, the `heal` job invokes the **Claude Code Action** to read
the drift report + captured DOM, fix the selector, regenerate the fixture, run
`npm test` and `npm run sentinel` until both pass, and open a `[FIX]` PR. You
review and merge.

### One-time setup (required for auto-heal)

The healer authenticates with a **Claude subscription**, not a metered API key:

1. Generate a long-lived token locally:
   ```bash
   claude setup-token
   ```
2. Add it as a repo secret named `CLAUDE_CODE_OAUTH_TOKEN`
   (Settings → Secrets and variables → Actions → New repository secret).
3. Install the Claude GitHub App on the repo: https://github.com/apps/claude
   (needs Contents, Issues, Pull requests permissions).

Until this is done, the sentinel still detects and reports drift (the `sentinel`
job is read-only and needs no secret) — only the automatic fix PR is gated on it.

### Local fallback

Prefer not to run the AI fixer in CI? `tools/sentinel-local.sh` runs the sentinel
and, on drift, drives the local `claude` CLI (your subscription) to fix and open a
PR. Wire it into cron/launchd.

## Keeping the curated pages current

`sentinel/pages.ts` points at long-stable historical PRs/issues. If GitHub content
legitimately changes (a thread gets unresolved, a comment deleted) a page may stop
containing a category and the sentinel will report it. Swap in a fresh page that
contains the category and update its `expect` list.
