import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  srcDir: '.',
  manifest: {
    name: 'GitHub Unfold',
    description:
      'Zero-click expander for collapsed GitHub PR/issue comments and conversations, with live drift detection.',
    permissions: ['storage'],
    host_permissions: ['https://github.com/*'],
  },
});
