import type { Context } from "@netlify/functions";
import { describe, expect, it } from "vitest";
import handler, { config } from "./health";

// The function reads nothing from the context, so an empty one stands in.
const context = {} as Context;

async function get() {
  return handler(new Request("https://thenumber.ninja/api/health"), context);
}

describe("health function", () => {
  it("answers GET with 200 and an ok status as JSON", async () => {
    const response = await get();
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toMatch(/^application\/json/);
    expect(await response.json()).toEqual({ status: "ok" });
  });

  it("is never cached", async () => {
    const response = await get();
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("is kept out of search results while v2 is a preview", async () => {
    const response = await get();
    expect(response.headers.get("x-robots-tag")).toBe("noindex");
  });

  it("is served at /api/health for GET only", () => {
    expect(config.path).toBe("/api/health");
    expect(config.method).toEqual(["GET"]);
  });
});
