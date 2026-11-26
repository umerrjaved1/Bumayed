const ALLOWED = new Set(["p", "br", "strong", "em", "ul", "ol", "li", "h2", "h3", "a"]);

/** Strip scripts, event handlers, and non-http links before storing or rendering. */
export function sanitizeRichText(input: string): string {
  let html = input.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");
  html = html.replace(/on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  html = html.replace(/javascript:/gi, "");
  html = html.replace(/<\/?([a-z0-9]+)([^>]*)>/gi, (full, rawTag: string, attrs: string) => {
    const tag = rawTag.toLowerCase();
    if (!ALLOWED.has(tag)) return "";
    if (tag === "br") return "<br>";
    const close = full.startsWith("</");
    if (tag === "a") {
      if (close) return "</a>";
      const href = /href\s*=\s*"([^"]+)"/i.exec(attrs)?.[1] ?? "";
      if (!/^https?:\/\//i.test(href)) return "";
      return `<a href="${href}" rel="noopener noreferrer">`;
    }
    return close ? `</${tag}>` : `<${tag}>`;
  });
  return html.trim();
}

export function assertSafeLink(url: string | null | undefined): string | null {
  if (!url || url.trim() === "") return null;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("INVALID_LINK");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("INVALID_LINK");
  }
  return parsed.toString();
}

/** Optional dimension check when the uploader supplies pixel size. */
export function assertBannerSize(width?: number | null, height?: number | null) {
  if (width == null && height == null) return;
  if (
    width == null ||
    height == null ||
    width < 600 ||
    width > 2400 ||
    height < 200 ||
    height > 900
  ) {
    throw new Error("INVALID_BANNER_SIZE");
  }
}
