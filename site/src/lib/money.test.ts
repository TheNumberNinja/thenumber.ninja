import { describe, expect, it } from "vitest";
import { adjustmentText, pounds } from "./money";

describe("pounds", () => {
  it("drops pence on whole pounds", () => {
    expect(pounds(24500)).toBe("£245");
  });

  it("keeps pence when the figure has them", () => {
    expect(pounds(3675)).toBe("£36.75");
    expect(pounds(625)).toBe("£6.25");
  });

  it("groups thousands", () => {
    expect(pounds(120000)).toBe("£1,200");
  });
});

describe("adjustmentText", () => {
  it("words an increase as an addition", () => {
    expect(adjustmentText(1500)).toBe("add £15");
  });

  it("words a reduction as taking off", () => {
    expect(adjustmentText(-3500)).toBe("take off £35");
  });
});
