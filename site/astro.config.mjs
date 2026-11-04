import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import icon from "astro-icon";
import sitemap from "@astrojs/sitemap";
import checksConfig from "./checks.config.mjs";
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
    // No filter: with every page filtered out the integration writes no
    // sitemap at all, which the SEO check blocks on. The noindex placeholder
    // home page stays listed until real pages replace it.
    sitemap(),
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
