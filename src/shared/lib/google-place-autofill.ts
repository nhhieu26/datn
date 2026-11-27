// Chuyển dữ liệu Google Places (Maps JavaScript API) sang dữ liệu tự điền form
import type { LatLng } from "@/shared/components/location-picker";

export const MAX_AUTOFILL_PHOTOS = 5;

export const PLACE_AUTOFILL_FIELDS = [
  "id",
  "displayName",
  "formattedAddress",
  "location",
  "addressComponents",
  "nationalPhoneNumber",
  "internationalPhoneNumber",
  "editorialSummary",
  "regularOpeningHours",
  "photos",
  "rating",
  "userRatingCount",
  "googleMapsURI",
];

export type PlaceAutofillPhoto = { uri: string; attribution: string | null };

export type PlaceAutofill = {
  placeId: string;
  name: string;
  address: string;
  location: LatLng;
  provinceName: string | null;
  phone: string | null;
  description: string | null;
  openTime: string | null;
  closeTime: string | null;
  rating: number | null;
  userRatingCount: number | null;
  googleMapsUrl: string | null;
  photos: PlaceAutofillPhoto[];
};

const pad = (n: number) => String(n).padStart(2, "0");
const toHHmm = (minutes: number) =>
  `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;

/** Bỏ ", Việt Nam" và mã bưu chính khỏi địa chỉ Google */
export function cleanAddress(address: string): string {
  return address
    .replace(/,?\s*(Việt Nam|Vietnam|Viet Nam)\s*$/i, "")
    .replace(/\s+\d{5,6}(?=\s*(,|$))/g, "")
    .replace(/\s*,\s*,/g, ",")
    .trim()
    .replace(/,$/, "");
}

/** Giờ mở sớm nhất & đóng muộn nhất trong tuần (HH:mm) */
function openingRange(
  hours: google.maps.places.OpeningHours | null | undefined,
): { openTime: string; closeTime: string } | null {
  const periods = hours?.periods ?? [];
  if (periods.length === 0) return null;

  let open = Infinity;
  let close = -Infinity;
  for (const period of periods) {
    const start = period.open.hour * 60 + period.open.minute;
    // Không có giờ đóng = mở 24/24; đóng sang ngày hôm sau → coi như mở tới cuối ngày
    const end =
      !period.close || period.close.day !== period.open.day
        ? 24 * 60 - 1
        : period.close.hour * 60 + period.close.minute;
    open = Math.min(open, start);
    close = Math.max(close, end);
  }
  if (!Number.isFinite(open) || !Number.isFinite(close) || close <= open) return null;
  return { openTime: toHHmm(open), closeTime: toHHmm(close) };
}

export function toPlaceAutofill(place: google.maps.places.Place): PlaceAutofill | null {
  const location = place.location;
  if (!place.id || !place.displayName || !location) return null;

  const provinceName =
    place.addressComponents?.find((c) =>
      c.types.includes("administrative_area_level_1"),
    )?.longText ?? null;
  const range = openingRange(place.regularOpeningHours);

  return {
    placeId: place.id,
    name: place.displayName,
    address: cleanAddress(place.formattedAddress ?? ""),
    location: { lat: location.lat(), lng: location.lng() },
    provinceName,
    phone: place.nationalPhoneNumber ?? place.internationalPhoneNumber ?? null,
    description: place.editorialSummary?.trim() || null,
    openTime: range?.openTime ?? null,
    closeTime: range?.closeTime ?? null,
    rating: place.rating ?? null,
    userRatingCount: place.userRatingCount ?? null,
    googleMapsUrl: place.googleMapsURI ?? null,
    photos: (place.photos ?? []).slice(0, MAX_AUTOFILL_PHOTOS).map((photo) => ({
      uri: photo.getURI({ maxWidth: 1600 }),
      attribution: photo.authorAttributions[0]?.displayName ?? null,
    })),
  };
}

// ---------- Khớp tỉnh/thành với danh sách 34 tỉnh sau sáp nhập 2025 ----------

function provinceKey(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/^\s*(tinh|thanh pho|tp\.?)\s+/, "")
    .replace(/\s+(city|province)\s*$/, "")
    .replace(/[^a-z]/g, "");
}

// Tỉnh cũ (Google có thể vẫn trả về) → tỉnh mới
const MERGED_PROVINCES: Record<string, string> = Object.fromEntries(
  (
    [
      ["Hà Giang", "Tuyên Quang"],
      ["Yên Bái", "Lào Cai"],
      ["Bắc Kạn", "Thái Nguyên"],
      ["Vĩnh Phúc", "Phú Thọ"],
      ["Hòa Bình", "Phú Thọ"],
      ["Hoà Bình", "Phú Thọ"],
      ["Bắc Giang", "Bắc Ninh"],
      ["Thái Bình", "Hưng Yên"],
      ["Hải Dương", "Hải Phòng"],
      ["Hà Nam", "Ninh Bình"],
      ["Nam Định", "Ninh Bình"],
      ["Quảng Bình", "Quảng Trị"],
      ["Quảng Nam", "Đà Nẵng"],
      ["Kon Tum", "Quảng Ngãi"],
      ["Bình Định", "Gia Lai"],
      ["Ninh Thuận", "Khánh Hòa"],
      ["Đắk Nông", "Lâm Đồng"],
      ["Bình Thuận", "Lâm Đồng"],
      ["Phú Yên", "Đắk Lắk"],
      ["Bình Dương", "Hồ Chí Minh"],
      ["Bà Rịa - Vũng Tàu", "Hồ Chí Minh"],
      ["Ho Chi Minh City", "Hồ Chí Minh"],
      ["Bình Phước", "Đồng Nai"],
      ["Long An", "Tây Ninh"],
      ["Sóc Trăng", "Cần Thơ"],
      ["Hậu Giang", "Cần Thơ"],
      ["Bến Tre", "Vĩnh Long"],
      ["Trà Vinh", "Vĩnh Long"],
      ["Tiền Giang", "Đồng Tháp"],
      ["Bạc Liêu", "Cà Mau"],
      ["Kiên Giang", "An Giang"],
      ["Thừa Thiên Huế", "Huế"],
      ["Thừa Thiên - Huế", "Huế"],
      ["Hanoi", "Hà Nội"],
    ] as const
  ).map(([from, to]) => [provinceKey(from), provinceKey(to)]),
);

/**
 * Tìm id tỉnh/thành từ tên tỉnh Google trả về; nếu không có thì dò từng
 * phần của địa chỉ (từ cuối lên). Không khớp → null.
 */
export function matchProvinceId(
  provinceName: string | null,
  address: string,
  provinces: { id: string; name: string }[],
): string | null {
  const byKey = new Map(provinces.map((p) => [provinceKey(p.name), p.id]));
  const lookup = (value: string) => {
    const key = provinceKey(value);
    if (!key) return null;
    return byKey.get(key) ?? byKey.get(MERGED_PROVINCES[key] ?? "") ?? null;
  };

  if (provinceName) {
    const id = lookup(provinceName);
    if (id) return id;
  }
  const parts = address.split(",").reverse();
  for (const part of parts) {
    const id = lookup(part);
    if (id) return id;
  }
  return null;
}
