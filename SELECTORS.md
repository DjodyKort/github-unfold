# Selector map

The fragile surface, documented. Every entry maps to a `Target` in
`src/selectors/` and a golden fixture in `fixtures/`. Captured live via Playwright
on **2026-07-22**.

GitHub renders two very different DOMs:

- **Classic** (PR conversation/files): server-rendered, Catalyst custom elements,
  semantic classes and `data-action` hooks — **stable**.
- **React Issue Viewer** (standalone issues): CSS-Modules **hashed** classnames that
  regenerate per deploy — anchor only on `data-testid`, `data-component`, octicon SVG
  classes, or accessible text. **Never hardcode a `*-module__*__hash` class.**

| Category          | Page  | Primary anchor                                                                                                  | Expand action                                | Drift heuristic                                                        | Fixture                                                            |
| ----------------- | ----- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------ |
| resolvedThreads   | pr    | `review-thread-collapsible[data-resolved="true"]`                                                               | set `.open = true` (2026 custom-element API) | any `review-thread-collapsible` present but 0 with resolved-and-closed | `resolvedThreads.pr.html`                                          |
| outdatedThreads   | pr    | `review-thread-collapsible` with an `Outdated` `.Label`                                                         | set `.open = true`                           | text "Show resolved"/"Outdated" present but 0 matches                  | (shares fixture)                                                   |
| minimizedComments | issue | `button[data-component="IconButton"]` containing `.octicon-unfold`, labelled "show comment"                     | click the button                             | page text "marked this as"/"hidden" but 0 unfold buttons               | `minimizedComments.issue.html`                                     |
| minimizedComments | pr    | `.js-minimizable-comment-group.minimized-comment` → `.js-comment-hide-minimize-form` / `.octicon-unfold` toggle | click the show control                       | minimized-comment marker present, 0 matches                            | (classic — captured when a live minimized PR comment is available) |
| hiddenItems       | pr    | `form.js-ajax-pagination` → `.ajax-pagination-btn`                                                              | submit the form (loop until gone)            | "N hidden items"/"Load more" text present, 0 matches                   | `hiddenItems.pr.html`                                              |
| hiddenItems       | issue | `[class*="LoadMore-module"]` button                                                                             | click (loop until gone)                      | "Load more"/"hidden item" text present, 0 matches                      | `hiddenItems.issue.html`                                           |
| commitLists       | pr    | `.TimelineItem--condensed` collapsed commit group                                                               | click its expand control                     | condensed group present, 0 expandable                                  | `commitLists.pr.html`                                              |
| oversizedDiffs    | pr    | `.js-diff-load button` / `load-diff-button` (**off by default**)                                                | click                                        | —                                                                      | (deferred; opt-in)                                                 |

## Notes & gotchas

- **Lazy content.** A resolved thread's body is a `hidden` `<div data-target="review-thread-collapsible.body">` holding an `<include-fragment data-deferred-content-url=…>`. Setting `.open` (or dispatching a real click) triggers the fetch; merely removing `hidden` leaves a spinner. The engine must set `.open`/click, then let the fragment resolve.
- **`.octicon-unfold` is shared.** It appears on both the classic "Show resolved" button and the React "show comment" button. Disambiguate by page kind + container, not by the icon alone.
- **Pagination loops.** "Load more" reveals more "Load more"; the engine submits repeatedly with rate-limiting until none remain (each submit is a real network request).
- **`data-resolved` covers outdated too.** There is no separate outdated component — outdated threads are the same element plus an `Outdated` `.Label`.
