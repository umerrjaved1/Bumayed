/**
 * Social video URL handling (playbook §9.4):
 * one Instagram / YouTube / TikTok URL per listing. Provider-supported
 * embeds where allowed; otherwise a safe external "Watch on" link.
 * Never download, proxy or host third-party videos.
 */

export type VideoProvider = "youtube" | "instagram" | "tiktok";

export type ParsedVideo = {
  provider: VideoProvider;
  /** iframe-src when the provider supports embedding, else null → link out */
  embedUrl: string | null;
  watchUrl: string;
};

export function parseVideoUrl(raw: string): ParsedVideo | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, "").replace(/^m\./, "");

  // YouTube: watch?v=, youtu.be/, /shorts/
  if (host === "youtube.com" || host === "youtu.be") {
    const id =
      host === "youtu.be"
        ? url.pathname.slice(1).split("/")[0]
        : (url.searchParams.get("v") ??
          url.pathname.match(/\/shorts\/([^/?]+)/)?.[1]);
    if (!id) return null;
    return {
      provider: "youtube",
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
      watchUrl: raw,
    };
  }

  // Instagram: /p/ or /reel/ — provider-supported /embed
  if (host === "instagram.com") {
    const match = url.pathname.match(/\/(p|reel)\/([^/?]+)/);
    if (!match) return null;
    return {
      provider: "instagram",
      embedUrl: `https://www.instagram.com/${match[1]}/${match[2]}/embed`,
      watchUrl: raw,
    };
  }

  // TikTok: embed requires their JS SDK → external link fallback
  if (host === "tiktok.com") {
    if (!url.pathname.includes("/video/")) return null;
    return { provider: "tiktok", embedUrl: null, watchUrl: raw };
  }

  return null;
}
