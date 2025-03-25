import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin'; // Import the TypeScript ESLint plugin

export default [
  { ignores: ['dist'] }, // Ignore dist folder
  js.configs.recommended, // Use recommended JavaScript rules
  
  // Apply rules directly for .ts and .tsx files
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      'react-hooks': reactHooks, // Use object format for plugins
      'react-refresh': reactRefresh,
      '@typescript-eslint': typescriptEslintPlugin, // Add TypeScript plugin
    },
    rules: {
      // Manually include the recommended rules for each plugin
      'react-hooks/rules-of-hooks': 'error', // Use React hooks rules
      'react-hooks/exhaustive-deps': 'warn', // Use exhaustive deps rule
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // Add other rules or modify them as needed
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      '@typescript-eslint/explicit-module-boundary-types': 'off', // Disable this rule if you don't want explicit types for functions
    },
  },
  // Apply Jest testing globals to test files
  {
    files: ['**/__tests__/**/*.{ts,tsx}', '**/*.test.{ts,tsx}'],
    languageOptions: {
      globals: {
        test: 'readonly', // Allow 'test' as a global variable
        expect: 'readonly', // Allow 'expect' as a global variable
        render: 'readonly', // Allow 'render' as a global variable
      },
    },
  },
];
