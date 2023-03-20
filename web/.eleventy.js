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
  calendly
} = require('./config/shortcodes/index.js')

const {
  getServicesForList,
} = require('./config/collections/index')

const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const eleventyRssPlugin = require("@11ty/eleventy-plugin-rss");
const markdownLib = require('./config/plugins/markdown.js');

module.exports = eleventyConfig => {
  eleventyConfig.addShortcode('airtable', airtable);
  eleventyConfig.addShortcode('tally', tally);
  eleventyConfig.addShortcode('calendly', calendly);
  eleventyConfig.addShortcode('year', () => `${new Date().getFullYear()}`);

  // 	--------------------- Custom collections -----------------------
  eleventyConfig.addCollection('servicesList', getServicesForList);

  eleventyConfig.setLibrary('md', markdownLib);

  eleventyConfig.addPlugin(eleventyNavigationPlugin);
  eleventyConfig.addPlugin(eleventyRssPlugin);

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
    'src/assets/css/',
    'src/assets/fonts/',
    'src/assets/images/',
    'src/assets/libs/',
    'src/assets/scripts/'
  ].forEach(path => eleventyConfig.addPassthroughCopy(path));

  [
    {'src/assets/_headers': '/_headers'},
    {'src/assets/_redirects': '/_redirects'},
    {'src/assets/documents/': '/documents/'},
    {'src/assets/images/favicon/*': '/'},
    {'src/assets/robots.txt': '/robots.txt'},
  ].forEach(rule => eleventyConfig.addPassthroughCopy(rule));

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
