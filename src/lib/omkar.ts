// Client tối giản cho Omkar Cloud Google Maps API (tìm địa điểm theo tên trên Google Maps).
// https://www.omkar.cloud/tools/google-maps-scraper — giới hạn 5 req/s, chỉ request 200 mới bị tính quota.

const OMKAR_SEARCH_URL = "https://google-maps-scraper.omkar.cloud/search";
const TIMEOUT_MS = 15_000;

export type OmkarPlace = {
  place_id: string | null;
  data_id: string | null;
  kgmid: string | null;
  name: string;
  description: string | null;
  address: string | null;
  detailed_address: {
    ward: string | null;
    street: string | null;
    city: string | null;
    state: string | null;
  } | null;
  coordinates: { latitude: number; longitude: number } | null;
  main_category: string | null;
  categories: string[] | null;
  rating: number | null;
  reviews: number | null;
  phone: string | null;
  website: string | null;
  workday_timing: string | null;
  link: string | null;
  business_status: string | null;
  is_permanently_closed: boolean | null;
};

export async function searchGoogleMaps({
  query,
  limit = 3,
}: {
  query: string;
  limit?: number;
}): Promise<OmkarPlace[]> {
  const apiKey = process.env.OMKAR_API_KEY;
  if (!apiKey) throw new Error("Thiếu biến môi trường OMKAR_API_KEY.");

  const params = new URLSearchParams({
    query,
    limit: String(limit),
    language: "vi",
    country_code: "vn",
  });

  const res = await fetch(`${OMKAR_SEARCH_URL}?${params}`, {
    headers: { "API-Key": apiKey },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!res.ok) {
    // Lỗi gateway có dạng { code, message } (vd: quota_exceeded, rate_limited, invalid_api_key)
    const body = (await res.json().catch(() => null)) as { code?: string; message?: string } | null;
    throw new Error(`Omkar ${res.status}: ${body?.code ?? ""} ${body?.message ?? ""}`.trim());
  }

  const data = (await res.json()) as { results?: OmkarPlace[] };
  return data.results ?? [];
}
