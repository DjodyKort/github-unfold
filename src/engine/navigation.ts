/**
 * Fire `onNavigate` whenever GitHub moves to a new page.
 *
 * GitHub navigates without full reloads via Turbo and its "soft nav" system,
 * and also mutates the URL through the History API. We listen to all of the
 * known events and patch `pushState`/`replaceState` so the engine re-runs on
 * every in-app navigation, not just the first hard load.
 *
 * Returns a disposer that removes every listener and restores History.
 */
export function onNavigate(cb: () => void, target: Window = window): () => void {
  const events = [
    'turbo:load',
    'turbo:render',
    'turbo:visit',
    'pjax:end',
    'soft-nav:end',
    'popstate',
  ];
  for (const e of events) target.addEventListener(e, cb);

  const history = target.history;
  const origPush = history.pushState;
  const origReplace = history.replaceState;

  history.pushState = function patchedPush(this: History, ...args: Parameters<History['pushState']>) {
    const r = origPush.apply(this, args);
    cb();
    return r;
  };
  history.replaceState = function patchedReplace(this: History, ...args: Parameters<History['replaceState']>) {
    const r = origReplace.apply(this, args);
    cb();
    return r;
  };

  return () => {
    for (const e of events) target.removeEventListener(e, cb);
    history.pushState = origPush;
    history.replaceState = origReplace;
  };
}
