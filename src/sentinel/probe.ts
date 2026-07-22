import { runDiagnostics } from '../diagnostics/runner';

/**
 * The sentinel probe. Bundled to an IIFE and injected into a live GitHub page,
 * it exposes the *exact same* self-test the in-browser dashboard runs — the
 * registry is the single source of truth for both.
 */
declare global {
  interface Window {
    __guRunDiagnostics: typeof runDiagnostics;
  }
}

window.__guRunDiagnostics = runDiagnostics;
