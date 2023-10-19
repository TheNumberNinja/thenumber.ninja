require('dotenv').config({
  path: `.env.${process.env.NODE_ENV || 'development'}`
})

const {
  getMostRecentUpdatedDate,
  filterUnwantedNavigationElements,
  longDate,
  isoDate,
  toHtml,
  toHtmlInline,
  readingTime,
  sample,
  slice,
  splitLines,
  stripHtml
} = require('./config/filters/index.js');

const {
  airtable,
  tally,
  trafft,
} = require('./config/shortcodes/index.js')

const {
  getServicesForList,
} = require('./config/collections/index')

const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const eleventyRssPlugin = require("@11ty/eleventy-plugin-rss");
const markdownLib = require('./config/plugins/markdown.js');
const slinkity = require('slinkity')

module.exports = eleventyConfig => {
  eleventyConfig.addShortcode('airtable', airtable);
  eleventyConfig.addShortcode('tally', tally);
  eleventyConfig.addShortcode('trafft', trafft);
  eleventyConfig.addShortcode('year', () => `${new Date().getFullYear()}`);

  // 	--------------------- Custom collections -----------------------
  eleventyConfig.addCollection('servicesList', getServicesForList);

  eleventyConfig.setLibrary('md', markdownLib);

  eleventyConfig.addPlugin(eleventyNavigationPlugin);
  eleventyConfig.addPlugin(eleventyRssPlugin);
  eleventyConfig.addPlugin(slinkity.plugin, slinkity.defineConfig({
    // optional: use slinkity.defineConfig
    // for some handy autocomplete in your editor
  }));

  /**
   * Why copy the /public directory?
   *
   * Slinkity uses Vite (https://vitejs.dev) under the hood for processing styles and JS resources
   * This tool encourages a /public directory for your static assets like social images
   * To ensure this directory is discoverable by Vite, we copy it to our 11ty build output like so:
   */
  eleventyConfig.addPassthroughCopy('public')

  // 	---------------------  Custom filters -----------------------
  eleventyConfig.addFilter('getMostRecentUpdatedDate', getMostRecentUpdatedDate);
  eleventyConfig.addFilter('filterUnwantedNavigationElements', filterUnwantedNavigationElements);
  eleventyConfig.addFilter('longDate', longDate);
  eleventyConfig.addFilter('isoDate', isoDate);
  eleventyConfig.addFilter('toHtml', toHtml);
  eleventyConfig.addFilter('toHtmlInline', toHtmlInline);
  eleventyConfig.addFilter('readingTime', readingTime);
  eleventyConfig.addFilter('sample', sample);
  eleventyConfig.addFilter('slice', slice);
  eleventyConfig.addFilter('splitLines', splitLines);
  eleventyConfig.addFilter('stripHtml', stripHtml);

  // 	--------------------- Passthrough File Copy -----------------------
  [
    'src/assets',
  ].forEach(path => eleventyConfig.addPassthroughCopy(path));

  return {
    // Pre-process *.md, *.html and global data files files with: (default: `liquid`)
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    dataTemplateEngine: 'njk',

    dir: {
      output: 'dist',
      input: 'src',
      includes: '_includes',
      layouts: '_layouts'
    }
  }
}
