// Tầng 1 của kiểm duyệt: lọc thô bằng từ khóa + quy tắc, chạy tức thì và không tốn chi phí.
// - "block": thô tục rõ ràng → chặn ngay, không gọi AI.
// - "suspect": có dấu hiệu nghi vấn (từ nhẹ, quảng cáo, SĐT, spam ký tự) → chuyển AI kèm gợi ý.
// - "clean": không phát hiện gì → vẫn chuyển AI để đánh giá ngữ nghĩa.

import { normalizeForMatch } from "./normalize";
import type { ModerationCategory } from "./types";

/**
 * Từ chỉ thô tục khi CÓ DẤU — bỏ dấu sẽ trùng từ thường
 * (lồn/lon, cặc/các, đéo/đeo, đĩ/đi, chó đẻ/chỗ để...), nên chỉ so trên bản giữ dấu.
 */
const SEVERE_ACCENTED = [
  "lồn",
  "cặc",
  "con cặc",
  "địt",
  "đéo",
  "buồi",
  "đụ",
  "đĩ",
  "chó đẻ",
  "đồ chó",
  "thằng chó",
  "con chó cái",
  "đầu buồi",
  "mả mẹ",
  "đù má",
  "đụ má",
  "đéo mẹ",
];

/** Viết tắt / cụm thô tục không mơ hồ, so trên bản bỏ dấu (bắt được cả khi người viết gõ không dấu). */
const SEVERE_PLAIN = [
  "dm",
  "dmm",
  "dcm",
  "dkm",
  "dmcs",
  "dcmm",
  "vcl",
  "vkl",
  "vcc",
  "clm",
  "cmm",
  "dit me",
  "dit con",
  "dit cu",
  "ditme",
  "djt",
  "du ma",
  "du me",
  "duma",
  "dume",
  "deo me",
  "fuck",
  "fucking",
  "fucker",
  "motherfucker",
  "shit",
  "bullshit",
  "bitch",
  "asshole",
  "cunt",
  "pussy",
];

/** Từ ngữ nặng nề/xúc phạm nhẹ — chưa đủ để chặn, để AI xét ngữ cảnh. */
const MILD_ACCENTED = [
  "ngu",
  "ngu ngốc",
  "ngu như",
  "đần",
  "đần độn",
  "óc chó",
  "mất dạy",
  "khốn nạn",
  "vãi",
  "cứt",
  "cút",
  "đù",
  "rác rưởi",
  "súc vật",
];

const MILD_PLAIN = ["vl", "cl", "vc", "cmnr", "wtf", "oc cho", "mat day", "khon nan", "suc vat"];

/** Từ khóa quảng cáo / kéo khách ra ngoài nền tảng. */
const ADVERTISING_PLAIN = [
  "zalo",
  "inbox",
  "ib",
  "lien he",
  "lh",
  "hotline",
  "sdt",
  "telegram",
  "giam gia",
  "khuyen mai",
  "kiem tien",
  "viec lam",
  "vay tien",
  "casino",
  "ca cuoc",
  "nha cai",
  "theo doi kenh",
  "sub kenh",
  "follow",
  "click",
];

const URL_RE = /(https?:\/\/|www\.)\S+|\b[a-z0-9-]+\.(com|vn|net|org|info|xyz|top|io|me|link|site)\b/i;
const PHONE_RE = /(?:\+?84|\b0)(?:[\s.-]?\d){9,10}\b/;
const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.]+/;
const CHAR_FLOOD_RE = /(.)\1{5,}/u;

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Regex khớp nguyên từ/cụm từ (ranh giới Unicode — \b của JS không hiểu chữ có dấu). */
function wordListRegex(words: string[]) {
  const alternation = [...words]
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp)
    .join("|");
  return new RegExp(`(?<![\\p{L}\\p{N}])(?:${alternation})(?![\\p{L}\\p{N}])`, "giu");
}

const SEVERE_ACCENTED_RE = wordListRegex(SEVERE_ACCENTED);
const SEVERE_PLAIN_RE = wordListRegex(SEVERE_PLAIN);
const MILD_ACCENTED_RE = wordListRegex(MILD_ACCENTED);
const MILD_PLAIN_RE = wordListRegex(MILD_PLAIN);
const ADVERTISING_RE = wordListRegex(ADVERTISING_PLAIN);

function matchAll(re: RegExp, text: string): string[] {
  return [...new Set(text.match(re) ?? [])];
}

export type KeywordScreenResult = {
  verdict: "block" | "suspect" | "clean";
  /** từ khóa / quy tắc đã khớp (dùng làm gợi ý cho AI và hiển thị cho admin) */
  matches: string[];
  categories: ModerationCategory[];
};

export function keywordScreen(text: string): KeywordScreenResult {
  const { accented, plain } = normalizeForMatch(text);

  const severe = [...matchAll(SEVERE_ACCENTED_RE, accented), ...matchAll(SEVERE_PLAIN_RE, plain)];
  if (severe.length > 0) {
    return { verdict: "block", matches: [...new Set(severe)], categories: ["profanity"] };
  }

  const matches: string[] = [];
  const categories = new Set<ModerationCategory>();

  const mild = [...matchAll(MILD_ACCENTED_RE, accented), ...matchAll(MILD_PLAIN_RE, plain)];
  if (mild.length > 0) {
    matches.push(...mild);
    categories.add("profanity");
  }

  const ads = matchAll(ADVERTISING_RE, plain);
  if (ads.length > 0) {
    matches.push(...ads);
    categories.add("advertising");
  }

  const raw = text.normalize("NFC");
  if (URL_RE.test(raw)) {
    matches.push("đường dẫn (URL)");
    categories.add("advertising");
  }
  if (PHONE_RE.test(raw)) {
    matches.push("số điện thoại");
    categories.add("personal_info");
  }
  if (EMAIL_RE.test(raw)) {
    matches.push("địa chỉ email");
    categories.add("personal_info");
  }

  if (CHAR_FLOOD_RE.test(raw)) {
    matches.push("ký tự lặp liên tục");
    categories.add("spam");
  }
  const words = plain.split(/\s+/).filter(Boolean);
  if (words.length >= 8 && new Set(words).size / words.length < 0.4) {
    matches.push("lặp từ nhiều lần");
    categories.add("spam");
  }
  const letters = raw.match(/\p{L}/gu) ?? [];
  const upper = raw.match(/\p{Lu}/gu) ?? [];
  if (letters.length >= 15 && upper.length / letters.length > 0.8) {
    matches.push("viết hoa toàn bộ");
    categories.add("spam");
  }
  if (raw.length >= 10 && letters.length / raw.length < 0.4) {
    matches.push("ít chữ, nhiều ký hiệu");
    categories.add("gibberish");
  }

  return matches.length > 0
    ? { verdict: "suspect", matches: [...new Set(matches)], categories: [...categories] }
    : { verdict: "clean", matches: [], categories: [] };
}
