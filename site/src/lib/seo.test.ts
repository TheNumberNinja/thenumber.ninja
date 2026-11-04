import { describe, expect, it } from "vitest";
import { canonicalUrl, pageTitle } from "./seo";

const site = new URL("https://thenumber.ninja");

describe("pageTitle", () => {
  it("adds the site name", () => {
    expect(pageTitle("How we work")).toBe("How we work · The Number Ninja");
  });

  it("doesn't add the site name twice", () => {
    expect(pageTitle("How we work · The Number Ninja")).toBe(
      "How we work · The Number Ninja",
    );
  });
});

describe("canonicalUrl", () => {
  it("gives the home page with its trailing slash", () => {
    expect(canonicalUrl("/", site)).toBe("https://thenumber.ninja/");
  });

  it("keeps a path that already ends in a slash", () => {
    expect(canonicalUrl("/about/", site)).toBe("https://thenumber.ninja/about/");
  });

  it("adds the trailing slash when it's missing", () => {
    expect(canonicalUrl("/about", site)).toBe("https://thenumber.ninja/about/");
  });

  it("drops any query string or hash", () => {
    expect(canonicalUrl("/about/?ref=x#team", site)).toBe(
      "https://thenumber.ninja/about/",
    );
  });
});
