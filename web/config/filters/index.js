import markdownLib from '../plugins/markdown.js';
import _ from 'lodash';
import { throwIfNotType } from '../utils/index.js';
import { DateTime } from 'luxon';

const toHtml = markdownString => {
  return markdownLib.render(markdownString);
};

const toHtmlInline = markdownString => {
  return markdownLib.renderInline(markdownString);
};

const sample = (collection, size = 1) => {
  return _.sampleSize(collection, size);
};

const slice = (collection, start, end) => {
  return _.slice(collection, start, end);
};

const longDate = dateString => {
  throwIfNotType(dateString, 'string');

  return DateTime.fromISO(dateString).toFormat('d LLLL yyyy');
};

const isoDate = dateObj => {
  throwIfNotType(dateObj, 'Date');

  return DateTime.fromJSDate(dateObj).toISODate();
};

const stripHtml = str => {
  throwIfNotType(str, 'string');
  return str.replace(/<[^>]+>/g, '');
};

/**
 * Navigation elements with an `order` less than zero should not be displayed in the navigation.
 * They are present because they are required for breadcrumb generation.
 */
const filterUnwantedNavigationElements = listOfNavigationObjects => {
  return _.filter(listOfNavigationObjects, nav => nav.order >= 0);
};

// source: https://github.com/bnijenhuis/bnijenhuis-nl/blob/main/.eleventy.js
const splitLines = (input, maxCharLength) => {
  const parts = input.split(' ');
  return parts.reduce(function (acc, cur) {
    if (!acc.length) {
      return [cur];
    }

    const lastOne = acc[acc.length - 1];

    if (lastOne.length + cur.length > maxCharLength) {
      return [...acc, cur];
    }

    acc[acc.length - 1] = lastOne + ' ' + cur;

    return acc;
  }, []);
};

export {
  filterUnwantedNavigationElements,
  toHtml,
  toHtmlInline,
  isoDate,
  longDate,
  sample,
  slice,
  splitLines,
  stripHtml,
};
