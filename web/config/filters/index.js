const markdownLib = require('../plugins/markdown')
const _ = require('lodash')
const {throwIfNotType} = require('../utils')
const {DateTime} = require('luxon')

const toHtml = markdownString => {
  return markdownLib.render(markdownString)
}

const toHtmlInline = markdownString => {
  return markdownLib.renderInline(markdownString)
}

const sample = (collection, size = 1) => {
  return _.sampleSize(collection, size)
}

const slice = (collection, start, end) => {
  return _.slice(collection, start, end)
}

const longDate = (dateString) => {
  throwIfNotType(dateString, 'string')

  return DateTime
    .fromISO(dateString)
    .toFormat('d LLLL yyyy')
}

const isoDate = (dateObj) => {
  throwIfNotType(dateObj, 'Date')

  return DateTime
    .fromJSDate(date)
    .toISODate()
}

const stripHtml = str => {
  throwIfNotType(str, 'string')
  return str.replace(/<[^>]+>/g, '')
}

const readingTime = str => {
  throwIfNotType(str, 'string')
  const text = stripHtml(str)
  const wordsPerMinute = 180
  const readingTime = text.split(' ').length / wordsPerMinute
  return _.round(readingTime)
}

/**
 * Navigation elements with an `order` less than zero should not be displayed in the navigation.
 * They are present because they are required for breadcrumb generation.
 */
const filterUnwantedNavigationElements = (listOfNavigationObjects) => {
  return _.filter(listOfNavigationObjects, (nav) => nav.order >= 0)
}

const getMostRecentUpdatedDate = (postsCollection) => {
  const ordered = _.sortBy(postsCollection, '_updatedAt')
  const mostRecentPost = _.last(ordered)

  // There should always be a post but fall back to the current date and time if there are none in
  // the collection
  return mostRecentPost ? mostRecentPost._updatedAt : new Date().toISOString()
}

// source: https://github.com/bnijenhuis/bnijenhuis-nl/blob/main/.eleventy.js
const splitLines = (input, maxCharLength) => {
  const parts = input.split(' ');
  return parts.reduce(function(acc, cur) {
    if (!acc.length) {
      return [cur];
    }

    let lastOne = acc[acc.length - 1];

    if (lastOne.length + cur.length > maxCharLength) {
      return [...acc, cur];
    }

    acc[acc.length - 1] = lastOne + ' ' + cur;

    return acc;
  }, []);
};

module.exports = {
  getMostRecentUpdatedDate,
  filterUnwantedNavigationElements,
  toHtml,
  toHtmlInline,
  isoDate,
  longDate,
  readingTime,
  sample,
  slice,
  splitLines,
  stripHtml
}
