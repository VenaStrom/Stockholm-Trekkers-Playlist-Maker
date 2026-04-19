import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import type { Config } from "eslint/config";
import { defineConfig, globalIgnores } from "eslint/config";

const commonRules: Config["rules"] = {
  "prefer-const": "warn",
  "@typescript-eslint/no-unused-vars": [
    "error",
    {
      "args": "all",
      "argsIgnorePattern": "^_",
      "caughtErrors": "all",
      "caughtErrorsIgnorePattern": "^_",
      "destructuredArrayIgnorePattern": "^_",
      "varsIgnorePattern": "^_",
      "ignoreRestSiblings": true,
    },
  ],
  "@typescript-eslint/no-unsafe-argument": "warn",
  "@typescript-eslint/no-unsafe-assignment": "warn",
  "@typescript-eslint/no-unsafe-call": "warn",
  "@typescript-eslint/no-unsafe-return": "error",
  "@typescript-eslint/no-unsafe-member-access": "warn",
  "@typescript-eslint/no-unsafe-enum-comparison": "warn",
  "@typescript-eslint/no-non-null-assertion": "warn",
  "@typescript-eslint/no-confusing-non-null-assertion": "error",
  "@typescript-eslint/require-await": "warn",
  "@typescript-eslint/no-misused-promises": "warn",
  "@typescript-eslint/no-floating-promises": "warn",
  "@typescript-eslint/no-unnecessary-type-assertion": "warn",
  "@typescript-eslint/only-throw-error": "warn",
  "@typescript-eslint/switch-exhaustiveness-check": "warn",
  "@typescript-eslint/consistent-type-imports": "warn",
  "@typescript-eslint/consistent-type-exports": "warn",
  "@typescript-eslint/consistent-type-definitions": ["warn", "type"],
  "@typescript-eslint/ban-ts-comment": "error",
  "@typescript-eslint/prefer-nullish-coalescing": ["warn", { ignorePrimitives: { string: true, boolean: true } }],
  "@typescript-eslint/prefer-optional-chain": "warn",
  "@typescript-eslint/restrict-template-expressions": "warn",
  "@typescript-eslint/no-base-to-string": "warn",
  "@typescript-eslint/use-unknown-in-catch-callback-variable": "error",
  "@typescript-eslint/consistent-type-assertions": "error",
  "@typescript-eslint/no-for-in-array": "error",
  "@/no-useless-assignment": "warn",
  "eqeqeq": ["error", "smart"],
  "semi": ["error", "always"],
  "comma-dangle": ["error", "always-multiline"], // Would be nice but not tweakable enough
  "no-extra-boolean-cast": "off",
};

export default defineConfig([
  { // App linting
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    name: "app src/",
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/set-state-in-render": "warn",
      "react-hooks/immutability": "warn", // This should probably be a warning but the current recipe pipeline is dependant on it :sweat_smile:
      ...commonRules,
    },
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: process.cwd(),
      },
    },
  },
  { // Script linting
    extends: [
      ...tseslint.configs.recommendedTypeChecked,
    ],
    name: "scripts scripts/",
    files: ["scripts/**/*.{ts,tsx}", "*.ts"],
    rules: {
      ...commonRules,
    },
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: process.cwd(),
      },
    },
  },
  globalIgnores([
    "node_modules/**",
    "src-tauri/**",
    "**/*.js",
    "**/*.cjs",
    "**/*.mjs",
    "out/**/*",
    "dist/**/*",
    "build/**/*",
    "ignore/**/*",
  ]),
]);
