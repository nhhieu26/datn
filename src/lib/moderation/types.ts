import type {
  ModerationSource,
  ModerationStatus,
  ModerationTarget,
} from "@/generated/prisma/client";

export const MODERATION_CATEGORIES = [
  "spam",
  "advertising",
  "profanity",
  "harassment",
  "hate",
  "sexual",
  "personal_info",
  "irrelevant",
  "gibberish",
] as const;

export type ModerationCategory = (typeof MODERATION_CATEGORIES)[number];

export const MODERATION_CATEGORY_LABELS: Record<ModerationCategory, string> = {
  spam: "Spam",
  advertising: "Quảng cáo",
  profanity: "Thô tục",
  harassment: "Xúc phạm",
  hate: "Thù ghét",
  sexual: "Khiêu dâm",
  personal_info: "Thông tin cá nhân",
  irrelevant: "Không liên quan",
  gibberish: "Vô nghĩa",
};

export function categoryLabel(category: string): string {
  return MODERATION_CATEGORY_LABELS[category as ModerationCategory] ?? category;
}

export type ModerationInput = {
  target: ModerationTarget;
  userId: string;
  content: string;
  /** Ngữ cảnh cho AI, vd: tên dịch vụ / tiêu đề bài viết */
  subject?: string;
  /** Số sao (chỉ với review) */
  rating?: number;
};

/** Kết quả kiểm duyệt khi nội dung được phép lưu. */
export type ModerationOutcome = {
  status: ModerationStatus;
  source: ModerationSource;
  reason: string | null;
  categories: ModerationCategory[];
};

export type ModerationDecision =
  | { action: "block"; reason: string; categories: ModerationCategory[]; matches: string[] }
  | ({ action: "save"; confidence: number | null } & ModerationOutcome);
