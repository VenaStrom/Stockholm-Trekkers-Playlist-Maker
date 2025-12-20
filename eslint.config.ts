// @ts-check

import { defineConfig, globalIgnores } from "eslint/config";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default defineConfig([
  tseslint.configs.recommendedTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  reactRefresh.configs.vite,
  reactHooks.configs.flat.recommended,

  // Src folder
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
    },
    plugins: {
      "react": reactPlugin,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },

  // Scripts folder
  {
    files: ["scripts/**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2024,
      parser: tseslint.parser,
      parserOptions: {
        project: "./scripts/tsconfig.json",
      },
    },
  },

  // General rules 
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/consistent-type-imports": "off",
      "@typescript-eslint/no-import-type-side-effects": "error",
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/prefer-optional-chain": "warn",
      "@typescript-eslint/require-await": "warn",
      "@typescript-eslint/prefer-nullish-coalescing": "warn",
    },
  },

  // JavaScript files
  {
    files: ["**/*.js"],
    extends: [tseslint.configs.disableTypeChecked],
  },

  globalIgnores([
    "dist/**",
    "node_modules/**",
    "src-tauri/**",
    "src/prisma/generated/**",
    "*.config.js",
    "*.config.ts",
    "**/*.d.ts",
  ]),
]);
