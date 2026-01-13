import dotenv from 'dotenv';

dotenv.config({
  path: `.env.${process.env.NODE_ENV || 'development'}`,
});

import {
  filterUnwantedNavigationElements,
  longDate,
  isoDate,
  toHtml,
  toHtmlInline,
  sample,
  slice,
  splitLines,
  stripHtml,
} from './config/filters/index.js';

import { tally, trafft } from './config/shortcodes/index.js';

import eleventyNavigationPlugin from '@11ty/eleventy-navigation';
import EleventyVitePlugin from '@11ty/eleventy-plugin-vite';
import markdownLib from './config/plugins/markdown.js';
export default function (eleventyConfig) {
  // Add shortcodes
  eleventyConfig.addShortcode('tally', tally);
  eleventyConfig.addShortcode('trafft', trafft);
  eleventyConfig.addShortcode('year', () => `${new Date().getFullYear()}`);

  // Set markdown library
  eleventyConfig.setLibrary('md', markdownLib);

  // Add plugins
  eleventyConfig.addPlugin(eleventyNavigationPlugin);
  eleventyConfig.addPlugin(EleventyVitePlugin, {
    viteOptions: {
      clearScreen: false,
      appType: 'mpa',
      build: {
        rollupOptions: {
          input: {
            app: 'assets/app.js',
            dashboard: 'assets/dashboard.js',
            upload: 'assets/upload.js',
          },
          output: {
            entryFileNames: 'assets/[name].js',
            chunkFileNames: 'assets/[name]-[hash].js',
            assetFileNames: assetInfo => {
              if (assetInfo.name.endsWith('.css')) {
                return 'assets/[name][extname]';
              }
              return 'assets/[name][extname]';
            },
          },
        },
      },
    },
  });

  // Copy static assets with performance optimizations
  eleventyConfig.addPassthroughCopy('public');
  eleventyConfig.addPassthroughCopy('src/assets/images');
  eleventyConfig.addPassthroughCopy('src/assets/fonts');
  // Copy assets for Vite to process from dist directory
  eleventyConfig.addPassthroughCopy('src/assets/app.js');
  eleventyConfig.addPassthroughCopy('src/assets/dashboard.js');
  eleventyConfig.addPassthroughCopy('src/assets/upload.js');
  eleventyConfig.addPassthroughCopy('src/assets/main.css');
  eleventyConfig.addPassthroughCopy('src/assets/css');
  eleventyConfig.addPassthroughCopy('src/assets/scripts');

  // Add custom filters
  eleventyConfig.addFilter('filterUnwantedNavigationElements', filterUnwantedNavigationElements);
  eleventyConfig.addFilter('longDate', longDate);
  eleventyConfig.addFilter('isoDate', isoDate);
  eleventyConfig.addFilter('toHtml', toHtml);
  eleventyConfig.addFilter('toHtmlInline', toHtmlInline);
  eleventyConfig.addFilter('sample', sample);
  eleventyConfig.addFilter('slice', slice);
  eleventyConfig.addFilter('splitLines', splitLines);
  eleventyConfig.addFilter('stripHtml', stripHtml);

  // Performance optimizations
  eleventyConfig.setServerOptions({
    // Show local network IP addresses for device testing
    showAllHosts: true,
  });

  // Add development-specific optimizations
  if (process.env.NODE_ENV === 'development') {
    eleventyConfig.setWatchThrottleWaitTime(100);
  }

  return {
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    dataTemplateEngine: 'njk',

    dir: {
      output: 'dist',
      input: 'src',
      includes: '_includes',
      layouts: '_layouts',
    },
  };
}
