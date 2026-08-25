import globals from 'globals';

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'graphify-out/**', 'index.html', 'data/btp_maroc_*.html']
  },
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        VOCAB_DATA: 'readonly',
        PLAN_TASKS: 'readonly',
        READING_DOCS: 'readonly',
        WRITING_TEMPLATES: 'readonly',
        GRAMMAR_LESSONS: 'readonly'
      }
    },
    rules: {
      'no-empty': ['error', { allowEmptyCatch: false }],
      'no-unused-vars': ['warn', { args: 'none', caughtErrors: 'all' }],
      'no-undef': 'error',
      eqeqeq: ['warn', 'smart'],
      'prefer-const': 'warn',
      'no-var': 'error',
      'no-implicit-globals': 'warn',
      'no-eval': 'error',
      'no-implied-eval': 'error'
    }
  },
  {
    files: ['tools/**/*.mjs'],
    languageOptions: {
      globals: {
        ...globals.node
      }
    }
  },
  {
    files: ['sw.js'],
    languageOptions: {
      sourceType: 'script',
      globals: {
        ...globals.serviceworker
      }
    }
  },
  {
    // Browser-global modules exposed on window for inline handlers (legacy pattern)
    files: ['src/**/*.js'],
    rules: {
      'no-implicit-globals': 'off'
    }
  }
];
