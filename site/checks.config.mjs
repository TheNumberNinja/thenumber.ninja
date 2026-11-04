/**
 * Site-specific settings for the accessibility and SEO checks in
 * `scripts/checks/`. The check code stays site-agnostic (it is copied from
 * withotto.app); anything that differs between sites belongs here.
 */

/** @type {import("./scripts/checks/lib/config.mjs").ChecksConfig} */
export default {
  site: "https://thenumber.ninja",
  distDir: "dist",
  pagesDir: "src/pages",
  // May not exist: v1's redirects move across at the switch-over.
  redirectsFile: "public/_redirects",
  sitemapIndex: "sitemap-index.xml",
  trailingSlash: "always",

  // Gitignored. The report and the build-time route map live here.
  outputDir: ".checks",
  baselineFile: "checks-baseline.json",

  // Findings merge across pages only when their element sits under one of
  // these roots. Order matters: the first root that contains the element wins.
  componentRoots: [
    {
      name: "header",
      selector: "body > header",
      source: "src/layouts/BaseLayout.astro",
    },
    {
      name: "footer",
      selector: "body > footer",
      source: "src/layouts/BaseLayout.astro",
    },
  ],

  // Third-party hosts no check may contact. None yet: the site loads no
  // third-party scripts.
  blockedHosts: [],

  // Fixed so a check never picks up a preview server already running on
  // astro preview's default (4321) or collides with withotto.app's checks
  // (4391).
  previewPort: 4392,

  exclusions: {
    // Routes no check reports on. Empty today.
    routes: [],
  },
};
