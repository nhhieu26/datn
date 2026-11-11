// Chuẩn hóa văn bản trước khi so khớp từ khóa, chống các kiểu lách luật phổ biến:
// viết hoa, kéo dài ký tự ("nguuuu"), thay số cho chữ ("d1t"), chèn dấu chấm/khoảng trắng ("đ.m", "d m m").

const LEET: Record<string, string> = {
  "0": "o",
  "1": "i",
  "3": "e",
  "4": "a",
  "@": "a",
  $: "s",
};

/** Bỏ dấu tiếng Việt: "Địt mẹ" → "dit me". */
export function stripDiacritics(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

/** Ghép các chữ cái đơn lẻ bị tách bởi dấu chấm/khoảng trắng/gạch: "đ.m.m" → "đmm". */
function joinSpacedLetters(text: string): string {
  // Hai đầu là ranh giới không phải chữ/số (khoảng trắng, dấu câu, đầu/cuối chuỗi): "đ.m.m," vẫn bắt được
  return text.replace(/(?<![\p{L}\p{N}])(\p{L}(?:[\s.\-_*]+\p{L}){1,})(?![\p{L}\p{N}])/gu, (match) => {
    const parts = match.split(/[\s.\-_*]+/);
    // Chỉ ghép khi mọi phần đều là 1 chữ cái, tránh dính các từ bình thường lại với nhau
    return parts.every((p) => [...p].length === 1) ? parts.join("") : match;
  });
}

export type NormalizedText = {
  /** chữ thường, giữ dấu tiếng Việt */
  accented: string;
  /** chữ thường, bỏ dấu */
  plain: string;
};

export function normalizeForMatch(text: string): NormalizedText {
  let s = text.normalize("NFC").toLowerCase();
  // Số/ký hiệu kẹp giữa chữ cái mới coi là leet (giữ nguyên SĐT, giá tiền)
  s = s.replace(/(?<=\p{L})[0134@$](?=\p{L})|(?<=\p{L})[0134@$]\b/gu, (c) => LEET[c] ?? c);
  // Gộp ký tự lặp từ 3 lần trở lên: "nguuuu" → "ngu"
  s = s.replace(/(\p{L})\1{2,}/gu, "$1");
  s = joinSpacedLetters(s);
  s = s.replace(/\s+/g, " ").trim();
  return { accented: s, plain: stripDiacritics(s) };
}
