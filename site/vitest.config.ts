/// <reference types="vitest/config" />
import { getViteConfig } from "astro/config";

// Astro's Vite config, so tests resolve the same aliases and plugins as the
// build. The test commands pass a directory (src/ or netlify/), and Vitest
// exits 1 when it finds no test files there: never set passWithNoTests.
export default getViteConfig({
  test: {
    include: ["**/*.test.ts"],
    exclude: ["node_modules/**", "dist/**", ".netlify/**"],
  },
});
