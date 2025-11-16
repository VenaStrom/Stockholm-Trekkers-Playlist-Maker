import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores([
    "**/src-tauri/**",
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
  ]),
  {
    settings: { "react": { version: "detect" }, },
  },
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.browser },
  },
  tseslint.configs.recommended,
  tseslint.configs.eslintRecommended,
  pluginReact.configs.flat["recommended"],
  pluginReact.configs.flat["jsx-runtime"],
  // Custom rules for TS files
  {
    files: ["**/*.{ts,mts,cts,tsx}"],
    rules: {
      // No unused vars
      '@typescript-eslint/no-unused-vars': ['warn', { 'argsIgnorePattern': '^_', 'varsIgnorePattern': '^_', 'caughtErrorsIgnorePattern': '^_' }],

      // No explicit any
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
]);
