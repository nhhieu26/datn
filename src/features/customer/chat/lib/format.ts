export const num = (value: { toString(): string } | null | undefined) =>
  value == null ? null : Number(value.toString());

// Google Maps URLs API theo tọa độ
export const googleMapsUrl = (latitude: number, longitude: number) =>
  `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

// Bỏ dấu tiếng Việt: "Nhà hàng Đức Dê" -> "Nha hang Duc De"
export const stripDiacritics = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");

const NAME_PREFIXES =
  /^(khach san|nha hang|quan an|quan|resort|homestay|hotel|restaurant|khu du lich|nha nghi|villa)\s+/;

function normalizeName(value: string): string {
  return stripDiacritics(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(NAME_PREFIXES, "");
}

// So khớp tên địa điểm giữa các nguồn (bỏ dấu, bỏ tiền tố loại hình, chứa nhau là khớp)
export function sameName(a: string, b: string): boolean {
  const x = normalizeName(a);
  const y = normalizeName(b);
  if (x.length < 3 || y.length < 3) return x === y;
  return x.includes(y) || y.includes(x);
}

// Từ chỉ loại hình địa điểm, không giúp phân biệt địa điểm này với địa điểm khác khi so tên
const GENERIC_NAME_WORDS = new Set(
  (
    "khu du lich sinh thai quan the danh thang di tich lich su van hoa diem tham quan " +
    "dao hon ban nui dinh thac ho song pho co cho phien den chua nha tho " +
    "khach san hotel resort homestay villa spa and the du thuyen cruise show tour ve"
  ).split(" "),
);

const nameTokens = (value: string, areaTokens: Set<string>) =>
  stripDiacritics(value)
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter((t) => t && !GENERIC_NAME_WORDS.has(t) && !areaTokens.has(t));

function editDistance(a: string, b: string): number {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    for (let j = 1; j <= b.length; j++) {
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = curr;
  }
  return prev[b.length];
}

/**
 * Độ giống nhau 0–1 giữa tên trên web và tên trên Google Maps, không dùng AI.
 * Bỏ dấu, bỏ tên khu vực và từ chỉ loại hình ("khu du lịch", "đảo", "du thuyền"...), rồi lấy điểm cao hơn của:
 * - tỉ lệ từ của tên ngắn hơn có trong tên dài hơn (cho sai 1 ký tự: "Sín"↔"Xín", "Phúc"↔"Phước");
 * - độ giống khi ghép liền các từ ("Sa Pa"↔"Sapa", "Langbiang"↔"Lang Bian").
 * Thử trên 22 cặp tên thật (08/11/2026): ngưỡng 0.75 đúng 19/22; 3 ca sai là tên gọi khác/phiên âm
 * ("Đại Nội"↔"Hoàng Thành Huế") — với các ca này kết quả đầu của Google Maps vẫn đúng.
 */
export function nameSimilarity(web: string, gmaps: string, area = ""): number {
  const areaTokens = new Set(stripDiacritics(area).toLowerCase().split(/\s+/).filter(Boolean));
  const a = nameTokens(web, areaTokens);
  const b = nameTokens(gmaps, areaTokens);
  if (a.length === 0 || b.length === 0) return 0;
  const x = a.join("");
  const y = b.join("");
  const joined = 1 - editDistance(x, y) / Math.max(x.length, y.length);
  const [short, long] = a.length <= b.length ? [a, b] : [b, a];
  const hits = short.filter((t) => long.some((u) => u === t || (t.length >= 3 && editDistance(t, u) <= 1))).length;
  return Math.max(joined, hits / short.length);
}

export const truncate =(text: string | null | undefined, maxLength = 280) => {
  if (!text) return null;
  const cleaned = text.replace(/\s+/g, " ").trim();
  return cleaned.length <= maxLength
    ? cleaned
    : `${cleaned.slice(0, maxLength - 1)}…`;
};
