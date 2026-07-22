# Contributing

## Setup

```bash
npm install
npm run dev        # dev browser with the extension loaded (HMR)
```

## Checks (run before pushing)

```bash
npm run compile    # type-check
npm test           # unit tests — every selector vs its fixture
npm run build      # production build
npm run sentinel   # live drift check against real GitHub pages
```

CI runs `compile`, `test`, and `build` on every PR.

## Project shape

- `src/selectors/targets/*.ts` — the selector registry, one file per category.
  **All fragile DOM knowledge lives here.** Everything else is stable.
- `fixtures/*.html` — real DOM captured from GitHub; the unit tests assert each
  selector against these.
- `src/engine/` — MutationObserver + SPA-nav controller, rate-limited passes.
- `src/ui/` — the Shadow-DOM dashboard (Controls / Diagnostics / Stats / …).
- `sentinel/` — the daily live drift check; see [`MAINTENANCE.md`](./MAINTENANCE.md).

## Adding a category

1. Add it to `src/settings/categories.ts`.
2. Add a `Target` in a new `src/selectors/targets/*.ts` and register it in
   `src/selectors/index.ts`.
3. Capture a fixture into `fixtures/`, document it in `SELECTORS.md`, and assert
   it in `tests/selectors.test.ts`.
4. If it's genuinely present on a curated page, add it to that page's `expect`
   list in `sentinel/pages.ts`.

## Fixing selector drift

Usually you don't — the sentinel opens an AI fix PR (see `MAINTENANCE.md`). To do
it by hand: `npm run sentinel` writes `.sentinel/report.json` and
`.sentinel/dom-*.html` (GitHub's current markup); update the target + fixture
until `npm test` and `npm run sentinel` pass.
