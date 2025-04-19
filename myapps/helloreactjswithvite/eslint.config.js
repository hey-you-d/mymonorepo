import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin'; // Import the TypeScript ESLint plugin
import typescriptEslintParser from '@typescript-eslint/parser'; // Import the TypeScript parser

export default [
  { ignores: ['dist'] }, // Ignore dist folder
  js.configs.recommended, // Use recommended JavaScript rules
  
  // Apply rules directly for .ts and .tsx files
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptEslintParser, // Specify the TypeScript parser
      parserOptions: {
        //project: './tsconfig.json',
        ecmaVersion: 6,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
          modules: true,
        },
      },
      globals: {
        jest: 'readonly',  // Allow 'jest' as a global variable
        describe: 'readonly',  // Allow 'describe' as a global variable
        beforeEach: 'readonly',  // Allow 'beforeEach' as a global variable
        it: 'readonly',  // Allow 'it' as a global variable
        expect: 'readonly',  // Allow 'expect' as a global variable
        document: 'readonly',
        fetch: 'readonly',
        global: 'readonly',
        console: 'readonly',
        module: 'readonly',
        HTMLButtonElement: 'readonly',
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
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', "argsIgnorePattern": "^_" }],
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
