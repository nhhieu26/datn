/** Lấy url ảnh bìa từ cột Json `coverImage` ({url, fileId}). */
export function coverUrlOf(coverImage: unknown): string {
  const url = (coverImage as { url?: unknown } | null)?.url;
  return typeof url === "string" ? url : "/image-notfound.png";
}
