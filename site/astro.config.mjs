import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import icon from "astro-icon";
import sitemap from "@astrojs/sitemap";

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
  ],
  image: {
    responsiveStyles: true,
    layout: "constrained",
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
