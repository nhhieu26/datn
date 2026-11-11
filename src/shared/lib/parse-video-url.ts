export type ParsedVideo =
  | { kind: "youtube"; embedUrl: string; videoId: string }
  | { kind: "vimeo" | "file"; embedUrl: string };

const YOUTUBE_ID = /^[\w-]{11}$/;

export function parseVideoUrl(
  raw: string | null | undefined,
): ParsedVideo | null {
  const value = raw?.trim();
  if (!value) return null;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;

  const host = url.hostname.replace(/^(www\.|m\.)/, "");

  if (
    host === "youtu.be" ||
    host === "youtube.com" ||
    host === "youtube-nocookie.com"
  ) {
    let id: string | null = null;
    if (host === "youtu.be") id = url.pathname.slice(1).split("/")[0];
    else if (url.pathname === "/watch") id = url.searchParams.get("v");
    else {
      const m = url.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]{11})/);
      id = m?.[1] ?? null;
    }
    if (!id || !YOUTUBE_ID.test(id)) return null;
    return {
      kind: "youtube",
      videoId: id,
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`,
    };
  }

  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const m = url.pathname.match(/\/(\d+)(?:\/|$)/);
    if (!m) return null;
    return {
      kind: "vimeo",
      embedUrl: `https://player.vimeo.com/video/${m[1]}?autoplay=1`,
    };
  }

  if (/\.(mp4|webm|ogg)$/i.test(url.pathname)) {
    return { kind: "file", embedUrl: url.toString() };
  }

  return null;
}
