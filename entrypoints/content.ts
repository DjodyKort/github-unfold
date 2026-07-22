import { defineContentScript } from '#imports';
import { getSettings } from '../src/settings/storage';
import { runExpandPass } from '../src/engine';
import { detectPage } from '../src/selectors/page';

export default defineContentScript({
  matches: ['https://github.com/*'],
  runAt: 'document_idle',
  async main() {
    const page = detectPage();
    if (!page) return;

    const settings = await getSettings();
    console.info('[github-unfold] loaded on', page, 'page; auto:', settings.autoExpand);

    // Phase 2 replaces this one-shot pass with the full MutationObserver +
    // SPA-navigation engine. For now it proves the settings → engine wiring.
    if (settings.autoExpand) {
      const result = await runExpandPass(document, settings);
      if (result.expanded > 0) {
        console.info('[github-unfold] expanded', result.expanded, result.byCategory);
      }
    }
  },
});
