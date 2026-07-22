import { defineContentScript } from '#imports';
import { ExpandController } from '../src/engine';
import { detectPage } from '../src/selectors/page';

export default defineContentScript({
  matches: ['https://github.com/*'],
  runAt: 'document_idle',
  async main() {
    // The controller re-checks the page on every SPA navigation, so we start it
    // even when the first-loaded URL isn't a PR/issue.
    const controller = await ExpandController.create({
      onExpanded(result, page) {
        console.info('[github-unfold] expanded', result.expanded, 'on', page, result.byCategory);
      },
    });
    controller.start();

    if (detectPage()) {
      console.info('[github-unfold] active on', detectPage(), 'page');
    }
  },
});
