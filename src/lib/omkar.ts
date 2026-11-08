// Client tối giản cho Omkar Cloud Google Maps API (tìm địa điểm theo tên trên Google Maps).
// https://www.omkar.cloud/tools/google-maps-scraper — giới hạn 5 req/s, chỉ request 200 mới bị tính quota.

const TIMEOUT_MS = 15_000;

// Giới hạn dùng chung cho mọi lời gọi trong tiến trình: tối đa 5 request bắt đầu trong 1 giây.
// Nơi gọi cứ chạy song song, không cần tự chia lô/ngủ (Omkar xử lý gần như tuần tự, ~0.8s/request).
const RATE_LIMIT = 5;
// Dư 10% so với 1 giây: Omkar đếm theo thời điểm request tới máy chủ, độ trễ mạng làm lệch khung đếm (đã gặp 429)
const RATE_WINDOW_MS = 1100;
const RATE_LIMITED_RETRY_MS = 1100;
const recentStarts: number[] = [];
let slotQueue: Promise<void> = Promise.resolve();

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function acquireSlot(): Promise<void> {
  const turn = slotQueue.then(async () => {
    for (;;) {
      const now = Date.now();
      while (recentStarts.length > 0 && now - recentStarts[0] >= RATE_WINDOW_MS) recentStarts.shift();
      if (recentStarts.length < RATE_LIMIT) {
        recentStarts.push(now);
        return;
      }
      await sleep(RATE_WINDOW_MS - (now - recentStarts[0]));
    }
  });
  slotQueue = turn;
  return turn;
}

// Omkar xử lý các request của một API key gần như lần lượt (~0.9s/request): gửi dồn 30+ request cùng lúc thì
// request cuối phải chờ phía Omkar quá TIMEOUT_MS và bị hủy oan. Giới hạn số request đang chạy, phần còn lại
// xếp hàng tại đây (không tính vào timeout).
const MAX_IN_FLIGHT = 2;
let inFlight = 0;
const inFlightWaiters: (() => void)[] = [];

async function acquireInFlight(): Promise<() => void> {
  if (inFlight >= MAX_IN_FLIGHT) await new Promise<void>((resolve) => inFlightWaiters.push(resolve));
  else inFlight++;
  // Người chờ được đánh thức kế thừa chỗ của request vừa xong (inFlight giữ nguyên)
  return () => {
    const next = inFlightWaiters.shift();
    if (next) next();
    else inFlight--;
  };
}

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

const OMKAR_BASE_URL = "https://google-maps-scraper.omkar.cloud";

async function request(path: string, params: Record<string, string>): Promise<OmkarPlace[]> {
  const apiKey = process.env.OMKAR_API_KEY;
  if (!apiKey) throw new Error("Thiếu biến môi trường OMKAR_API_KEY.");

  const query = new URLSearchParams({ language: "vi", country_code: "vn", ...params });
  const send = async () => {
    await acquireSlot();
    return fetch(`${OMKAR_BASE_URL}${path}?${query}`, {
      headers: { "API-Key": apiKey },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  };

  // Giữ chỗ trong suốt request: timeout chỉ đo thời gian Omkar xử lý, không cộng thời gian xếp hàng
  const release = await acquireInFlight();
  try {
    let res = await send();
    // Vẫn bị giới hạn tốc độ (429 không tính quota) → chờ rồi thử lại một lần
    if (res.status === 429) {
      await sleep(RATE_LIMITED_RETRY_MS);
      res = await send();
    }

    if (!res.ok) {
      // Lỗi gateway có dạng { code, message } (vd: quota_exceeded, rate_limited, invalid_api_key)
      const body = (await res.json().catch(() => null)) as { code?: string; message?: string } | null;
      throw new Error(`Omkar ${res.status}: ${body?.code ?? ""} ${body?.message ?? ""}`.trim());
    }

    const data = (await res.json()) as { results?: OmkarPlace[] };
    return data.results ?? [];
  } finally {
    release();
  }
}

/**
 * Tìm theo từ khóa; `lat`/`lng`/`zoom` chỉ ưu tiên thứ hạng, KHÔNG giới hạn khu vực.
 * `subtypes`: chỉ giữ địa điểm có danh mục khớp (tên loại tiếng Anh từ /categories, vd "hot pot restaurant").
 * Omkar so `subtypes` với danh mục theo ngôn ngữ kết quả → khi lọc phải gọi `language: "en"`
 * (đã thử 08/11/2026: language vi + subtypes tiếng Anh luôn ra 0 kết quả).
 */
export async function searchGoogleMaps({
  query,
  limit = 3,
  lat,
  lng,
  zoom,
  subtypes,
  language,
}: {
  query: string;
  limit?: number;
  lat?: number;
  lng?: number;
  zoom?: number;
  subtypes?: readonly string[];
  language?: "vi" | "en";
}): Promise<OmkarPlace[]> {
  const params: Record<string, string> = { query, limit: String(limit) };
  if (subtypes?.length) {
    params.subtypes = subtypes.join(",");
    params.language = language ?? "en";
  } else if (language) {
    params.language = language;
  }
  if (lat != null && lng != null) {
    params.lat = String(lat);
    params.lng = String(lng);
    if (zoom != null) params.zoom = String(zoom);
  }
  return request("/search", params);
}

/**
 * Tìm trong khung nhìn bản đồ: chỉ trả về địa điểm nằm trong khung 1000×1000 px quanh (`lat`, `lng`) ở mức `zoom`
 * (zoom 13 ≈ 18×18 km, zoom 12 ≈ 36×36 km ở vĩ độ Việt Nam). Chỉ lấy địa điểm đang hoạt động.
 */
export async function searchGoogleMapsInArea({
  query,
  lat,
  lng,
  zoom,
  limit = 20,
  subtypes,
}: {
  query: string;
  lat: number;
  lng: number;
  zoom: number;
  limit?: number;
  // Như searchGoogleMaps: lọc theo loại thì gọi bằng tiếng Anh
  subtypes?: readonly string[];
}): Promise<OmkarPlace[]> {
  return request("/search-in-area", {
    query,
    lat: String(lat),
    lng: String(lng),
    zoom: String(zoom),
    limit: String(limit),
    business_status: "OPEN",
    ...(subtypes?.length ? { subtypes: subtypes.join(","), language: "en" } : {}),
  });
}
