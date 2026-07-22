import { defineContentScript, createShadowRootUi } from '#imports';
import { createRoot, type Root } from 'react-dom/client';
import { createElement, useState } from 'react';
import { ExpandController } from '../src/engine';
import { getSettings } from '../src/settings/storage';
import { runExpandPass } from '../src/engine/pass';
import { detectPage } from '../src/selectors/page';
import { recordExpansion } from '../src/stats/store';
import { Widget } from '../src/ui/inPage/Widget';
import '../src/ui/theme.css';
import '../src/ui/dashboard/dashboard.css';
import '../src/ui/inPage/widget.css';

export default defineContentScript({
  matches: ['https://github.com/*'],
  cssInjectionMode: 'ui',
  runAt: 'document_idle',
  async main(ctx) {
    const controller = await ExpandController.create({
      onExpanded(result) {
        void recordExpansion(result.byCategory);
      },
    });
    controller.start();

    // Imperative bridge so keyboard shortcuts can drive the React widget.
    let togglePanel: () => void = () => {};

    async function expandNow() {
      const page = detectPage();
      if (!page) return;
      const settings = await getSettings();
      const result = await runExpandPass(document, settings, page);
      if (result.expanded > 0) void recordExpansion(result.byCategory);
    }

    function WidgetHost() {
      const [openSignal, setOpenSignal] = useState(0);
      togglePanel = () => setOpenSignal((n) => n + 1);
      return createElement(Widget, { onExpandNow: () => void expandNow(), openSignal });
    }

    const ui = await createShadowRootUi(ctx, {
      name: 'github-unfold-ui',
      position: 'inline',
      anchor: 'body',
      append: 'last',
      onMount(container): Root {
        const root = createRoot(container);
        root.render(createElement(WidgetHost));
        return root;
      },
      onRemove(root) {
        root?.unmount();
      },
    });
    ui.mount();

    window.addEventListener('keydown', (e) => {
      if (!e.altKey || !e.shiftKey) return;
      if (e.code === 'KeyE') {
        e.preventDefault();
        void expandNow();
      } else if (e.code === 'KeyU') {
        e.preventDefault();
        togglePanel();
      }
    });
  },
});
