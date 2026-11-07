export const num = (value: { toString(): string } | null | undefined) =>
  value == null ? null : Number(value.toString());

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

export const truncate =(text: string | null | undefined, maxLength = 280) => {
  if (!text) return null;
  const cleaned = text.replace(/\s+/g, " ").trim();
  return cleaned.length <= maxLength
    ? cleaned
    : `${cleaned.slice(0, maxLength - 1)}…`;
};
