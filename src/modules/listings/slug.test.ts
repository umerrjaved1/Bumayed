import { describe, expect, it } from "vitest";
import { slugifyTitle } from "./slug";

describe("slugifyTitle", () => {
  it("builds a url-safe slug with a short suffix", () => {
    const slug = slugifyTitle("Nissan Patrol Platinum V8");
    expect(slug.startsWith("nissan-patrol-platinum-v8-")).toBe(true);
    expect(slug.length).toBeGreaterThan(20);
  });
});
