import type { NextRequest } from "next/server";
import { fetchPlacePhoto } from "@/lib/google-maps";

const SEGMENT = /^[A-Za-z0-9_-]{1,512}$/;

// Proxy ảnh Google Places để không lộ API key; lỗi thì trả ảnh mặc định
export async function GET(
  req: NextRequest,
  ctx: RouteContext<"/api/place-photo/[placeId]/[photoId]">,
) {
  const { placeId, photoId } = await ctx.params;
  const photo =
    SEGMENT.test(placeId) && SEGMENT.test(photoId)
      ? await fetchPlacePhoto(`places/${placeId}/photos/${photoId}`).catch(() => null)
      : null;

  if (!photo) return Response.redirect(new URL("/image-notfound.png", req.url), 302);

  return new Response(photo.body, {
    headers: {
      "Content-Type": photo.contentType,
      "Cache-Control": "public, max-age=604800, s-maxage=2592000, immutable",
    },
  });
}
