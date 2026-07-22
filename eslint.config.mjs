import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: [
      'node_modules',
      '.output',
      '.wxt',
      '.sentinel',
      'docs',
      'public',
      'coverage',
      'assets',
    ],
  },
  js.configs.recommended,
  // Non-type-aware TS rules — no TS program needed (robust across TS versions).
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // TypeScript already resolves globals/undefined names; no-undef is
      // redundant here and doesn't understand the DOM lib.
      'no-undef': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    // Node-side tooling scripts. `document`/`window` appear inside Playwright
    // `page.evaluate` callbacks, which execute in the browser, not Node.
    files: ['scripts/**/*.mjs', '*.config.{ts,mjs}'],
    languageOptions: {
      globals: {
        process: 'readonly',
        console: 'readonly',
        URL: 'readonly',
        document: 'readonly',
        window: 'readonly',
        chrome: 'readonly',
      },
    },
  },
  prettier,
);
