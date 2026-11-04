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
    // Node-only code: the check scripts, the functions and the config files.
    // Browser globals stay invalid here, so `window` in a script is an error.
    files: ["scripts/**", "netlify/**", "*.{js,mjs,cjs,ts}"],
    languageOptions: { globals: globals.node },
  },
  {
    // a11y.mjs passes functions to Playwright's page.evaluate, which run in the
    // browser page, so it also needs browser globals.
    files: ["scripts/checks/a11y.mjs"],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
  {
    // Astro components run their frontmatter in Node at build time and their
    // <script> tags in the browser, so src/ accepts both.
    files: ["src/**"],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    // The check scripts are copied from withotto.app, which has no ESLint.
    // Keep them identical to its copy rather than fix this rule's two hits.
    files: ["scripts/checks/**"],
    rules: { "preserve-caught-error": "off" },
  },
);
