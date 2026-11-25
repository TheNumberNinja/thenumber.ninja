import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import icon from "astro-icon";
import sitemap from "@astrojs/sitemap";
import checksConfig from "./checks.config.mjs";
import { holdingPages } from "./src/data/holding.ts";
import routeSources from "./scripts/checks/lib/route-sources-integration.mjs";

// https://astro.build/config
export default defineConfig({
  site: "https://thenumber.ninja",
  // v1's URLs end in a slash; keeping them means existing links still work at
  // the switch-over.
  trailingSlash: "always",
  output: "static",
  integrations: [
    mdx(),
    // Holding pages are noindex, so they stay out of the sitemap.
    sitemap({
      filter: (page) =>
        !Object.keys(holdingPages).some(
          (slug) => new URL(page).pathname === `/${slug}/`,
        ),
    }),
    icon(),
    // Lets the checks report a content entry's own file as the source of its
    // findings. It does nothing until a page emits the route map
    // (src/pages/checks-route-sources.json.ts in withotto.app), which comes
    // with the first content collection that has entries.
    routeSources({ outputDir: checksConfig.outputDir }),
  ],
  image: {
    responsiveStyles: true,
    layout: "constrained",
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
