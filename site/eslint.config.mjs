// ESLint for .astro, .ts and the .mjs scripts. withotto.app has no ESLint;
// this site adds it so accessibility mistakes in markup fail before a build.
import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import astro from "eslint-plugin-astro";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig(
  {
    ignores: [
      "dist/",
      ".astro/",
      ".netlify/",
      "node_modules/",
      ".checks/",
      "scripts/checks/fixtures/",
    ],
  },
  js.configs.recommended,
  tseslint.configs.recommended,
  astro.configs.recommended,
  // The strict accessibility rules for .astro markup. eslint-plugin-astro
  // loads them from eslint-plugin-jsx-a11y-x, because the original
  // eslint-plugin-jsx-a11y doesn't support ESLint 10; never install both.
  astro.configs["jsx-a11y-strict"],
  {
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
);
