/**
 * Titles and canonical URLs for the base layout. Shared rule 11: titles carry
 * the site name, and canonicals come from the layout, built from the page's
 * real path, never set by hand on a page.
 */

export const SITE_NAME = "The Number Ninja";

// Matches v1's `{{ title }} · The Number Ninja` (web/src/_layouts/base.njk).
const TITLE_SUFFIX = ` · ${SITE_NAME}`;

/** The page's title with the site name after it, added once. */
export function pageTitle(title: string): string {
  return title.endsWith(TITLE_SUFFIX) ? title : `${title}${TITLE_SUFFIX}`;
}

/**
 * The absolute canonical URL for a path, ending in "/" as every URL on the site
 * does (`trailingSlash: "always"`), with any query string or hash dropped.
 */
export function canonicalUrl(path: string, site: URL): string {
  const url = new URL(path, site);
  const pathname = url.pathname.endsWith("/")
    ? url.pathname
    : `${url.pathname}/`;
  return new URL(pathname, site).toString();
}
