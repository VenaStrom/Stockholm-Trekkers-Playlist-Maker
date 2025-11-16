import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig } from "eslint/config";

export default defineConfig([
  js.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  {
    files: ["**/*.{ts,tsx}"],
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
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooks as any,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/consistent-type-imports": "off",
      "@typescript-eslint/no-import-type-side-effects": "error",
      "@typescript-eslint/consistent-type-definitions": "off"
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    files: ["scripts/**/*.ts"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        global: "readonly",
        setImmediate: "readonly",
        clearImmediate: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
      },
    },
    rules: {
      "no-console": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "src-tauri/target/**",
      "src-tauri/gen/**",
      "*.config.js",
      "*.config.ts",
      "vite.config.ts",
      "tailwind.config.js",
      "**/*.d.ts",
    ],
  }
]);
