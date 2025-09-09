import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default defineConfig([
  {
    name: 'app/files-to-lint',
    files: ['**/*.{js,mjs,jsx,vue}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**', '.vscode/**']),

  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },

  // New configuration for Netlify functions
  {
    name: 'netlify/functions',
    files: ['netlify/functions/**/*.js'], // Target all JS files in netlify/functions
    languageOptions: {
      globals: {
        ...globals.node, // Add Node.js globals
      },
      ecmaVersion: 2022, // Ensure modern JS features are recognized
      sourceType: 'commonjs', // Netlify functions often use CommonJS modules
    },
    rules: {
      'no-unused-vars': 'off', // Disable no-unused-vars for Netlify functions
      // You might want to add specific rules for Node.js environment here
      // For example, if you want to disallow console.log in production
      // 'no-console': 'warn',
    },
  },

  // Configuration for Vitest test files
  {
    name: 'vitest/tests',
    files: ['**/*.test.js'],
    languageOptions: {
      globals: {
        ...globals.vitest, // Add Vitest globals (describe, it, expect, vi, etc.)
      },
    },
  },

  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  skipFormatting,
])
