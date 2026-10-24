import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['dist', 'playwright-report', 'test-results'] },
  {
    // Kill switch for the old Flutter build's service worker.
    files: ['public/**/*.js'],
    languageOptions: { globals: globals.serviceworker },
  },
  js.configs.recommended,
  ...tseslint.configs.strict,
  // The site itself is linted with the types: floating promises, impossible
  // conditions and unsafe casts are errors, not style.
  ...tseslint.configs.strictTypeChecked.map((c) => ({ ...c, files: ['src/**/*.{ts,tsx}'] })),
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      // Numbers in template strings and `() => setX(v)` are the idiom here.
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      '@typescript-eslint/no-confusing-void-expression': ['error', { ignoreArrowShorthand: true }],
      // Words are split into letters for animation; they are ASCII display caps.
      '@typescript-eslint/no-misused-spread': 'off',
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
    plugins: { 'react-hooks': reactHooks, 'jsx-a11y': jsxA11y },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.flatConfigs.recommended.rules,
    },
  },
  {
    files: ['*.config.{js,ts}', 'e2e/**', 'scripts/**'],
    languageOptions: { globals: globals.node },
  },
);
