// Client tối giản cho Google Places API (New) — Text Search.
// https://developers.google.com/maps/documentation/places/web-service/text-search

const SEARCH_TEXT_URL = "https://places.googleapis.com/v1/places:searchText";
const TIMEOUT_MS = 10_000;

const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.addressComponents",
  "places.location",
  "places.rating",
  "places.userRatingCount",
  "places.googleMapsUri",
  "places.primaryTypeDisplayName",
  "places.businessStatus",
  "places.regularOpeningHours.weekdayDescriptions",
  "places.editorialSummary",
  "places.websiteUri",
  "places.nationalPhoneNumber",
  "places.photos.name",
].join(",");

type LocalizedText = { text: string; languageCode?: string };

export type GooglePlace = {
  id: string;
  displayName?: LocalizedText;
  formattedAddress?: string;
  addressComponents?: { longText?: string; shortText?: string; types?: string[] }[];
  location?: { latitude: number; longitude: number };
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  primaryTypeDisplayName?: LocalizedText;
  businessStatus?: "OPERATIONAL" | "CLOSED_TEMPORARILY" | "CLOSED_PERMANENTLY";
  regularOpeningHours?: { weekdayDescriptions?: string[] };
  editorialSummary?: LocalizedText;
  websiteUri?: string;
  nationalPhoneNumber?: string;
  photos?: { name: string }[];
};

export async function searchPlacesText({
  textQuery,
  includedType,
  pageSize = 5,
}: {
  textQuery: string;
  includedType?: string;
  pageSize?: number;
}): Promise<GooglePlace[]> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) throw new Error("Thiếu biến môi trường GOOGLE_MAPS_API_KEY.");

  const res = await fetch(SEARCH_TEXT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": FIELD_MASK,
    },
    body: JSON.stringify({
      textQuery,
      ...(includedType ? { includedType } : {}),
      pageSize,
      languageCode: "vi",
      regionCode: "VN",
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      error?: { status?: string; message?: string };
    } | null;
    throw new Error(
      `Google Places ${res.status}: ${body?.error?.status ?? ""} ${body?.error?.message ?? ""}`.trim(),
    );
  }

  const data = (await res.json()) as { places?: GooglePlace[] };
  return data.places ?? [];
}

const PHOTO_MAX_WIDTH_PX = 400;

/**
 * Tải ảnh Google Places theo mã ảnh (`places/{placeId}/photos/{photoId}`).
 * Trả về null nếu ảnh không còn tồn tại (mã ảnh có thể hết hạn).
 */
export async function fetchPlacePhoto(
  name: string,
): Promise<{ body: ArrayBuffer; contentType: string } | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) throw new Error("Thiếu biến môi trường GOOGLE_MAPS_API_KEY.");

  const res = await fetch(
    `https://places.googleapis.com/v1/${name}/media?maxWidthPx=${PHOTO_MAX_WIDTH_PX}`,
    { headers: { "X-Goog-Api-Key": apiKey }, signal: AbortSignal.timeout(TIMEOUT_MS) },
  );
  if (!res.ok) return null;
  return {
    body: await res.arrayBuffer(),
    contentType: res.headers.get("content-type") ?? "image/jpeg",
  };
}
