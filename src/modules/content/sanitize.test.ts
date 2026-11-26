import { describe, expect, it } from "vitest";
import { assertBannerSize, assertSafeLink, sanitizeRichText } from "./sanitize";

describe("rich text sanitizer", () => {
  it("keeps safe markup and drops scripts and javascript links", () => {
    const clean = sanitizeRichText(
      `<p onclick="alert(1)">Hi</p><script>alert(1)</script><a href="javascript:alert(1)">x</a><a href="https://bumayed.ae">ok</a>`,
    );
    expect(clean).not.toContain("script");
    expect(clean).not.toContain("onclick");
    expect(clean).not.toContain("javascript:");
    expect(clean).toContain('href="https://bumayed.ae"');
    expect(clean).toContain("<p>");
  });

  it("accepts http links and rejects other schemes", () => {
    expect(assertSafeLink("https://bumayed.ae/cars")).toContain("https://");
    expect(assertSafeLink("")).toBeNull();
    expect(() => assertSafeLink("javascript:alert(1)")).toThrow("INVALID_LINK");
  });

  it("rejects banners outside the allowed pixel range", () => {
    expect(() => assertBannerSize(1200, 400)).not.toThrow();
    expect(() => assertBannerSize(100, 100)).toThrow("INVALID_BANNER_SIZE");
  });
});
