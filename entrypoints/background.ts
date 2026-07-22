import { defineBackground, browser } from '#imports';

export default defineBackground(() => {
  // First-run onboarding: open the dashboard so new users see what they got.
  browser.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
      void browser.runtime.openOptionsPage();
    }
  });
});
