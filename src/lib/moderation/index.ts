// Kiểm duyệt nội dung người dùng (review, bình luận) theo 2 tầng:
//   1. Lọc từ khóa: thô tục rõ ràng → chặn ngay (không lưu, không gọi AI).
//   2. AI (Gemini): approve → hiển thị; reject chắc chắn → lưu nhưng ẩn; còn lại / AI lỗi → chờ admin duyệt.
// Mỗi bước ghi ModerationLog để thống kê.
import type {
  ModerationStage,
  ModerationTarget,
  ModerationVerdict,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { aiModerate } from "./ai";
import { keywordScreen } from "./keywords";
import type { ModerationCategory, ModerationDecision, ModerationInput } from "./types";

export * from "./types";
export { keywordScreen } from "./keywords";

/** Ngưỡng tin cậy để tự động ẩn nội dung AI cho là vi phạm; thấp hơn → chờ admin duyệt. */
const AUTO_REJECT_CONFIDENCE = 0.8;

export const KEYWORD_BLOCK_MESSAGE =
  "Nội dung chứa từ ngữ không phù hợp. Vui lòng chỉnh sửa lại trước khi gửi.";

type LogEntry = {
  target: ModerationTarget;
  targetId?: string | null;
  userId: string | null;
  content: string;
  stage: ModerationStage;
  verdict: ModerationVerdict;
  categories?: string[];
  reason?: string | null;
  confidence?: number | null;
  latencyMs?: number | null;
};

/** Ghi nhật ký kiểm duyệt; lỗi ghi log không được làm hỏng luồng chính. Trả về id log. */
export async function logModeration(entry: LogEntry): Promise<string | null> {
  try {
    const row = await prisma.moderationLog.create({
      data: { ...entry, categories: entry.categories ?? [] },
      select: { id: true },
    });
    return row.id;
  } catch (error) {
    console.error("[moderation] ghi log thất bại", error);
    return null;
  }
}

/** Gắn id nội dung vừa tạo vào các log của lần kiểm duyệt đó. */
export async function attachModerationLogs(logIds: string[], targetId: string) {
  const ids = logIds.filter(Boolean);
  if (ids.length === 0) return;
  await prisma.moderationLog
    .updateMany({ where: { id: { in: ids } }, data: { targetId } })
    .catch((error) => console.error("[moderation] gắn targetId thất bại", error));
}

export async function moderateContent(
  input: ModerationInput,
): Promise<ModerationDecision & { logIds: string[] }> {
  const base = { target: input.target, userId: input.userId, content: input.content };
  const logIds: (string | null)[] = [];

  // Tầng 1: từ khóa
  const screen = keywordScreen(input.content);
  if (screen.verdict === "block") {
    logIds.push(
      await logModeration({
        ...base,
        stage: "keyword",
        verdict: "block",
        categories: screen.categories,
        reason: `Từ khóa: ${screen.matches.join(", ")}`,
        latencyMs: 0,
      }),
    );
    return {
      action: "block",
      reason: KEYWORD_BLOCK_MESSAGE,
      categories: screen.categories,
      matches: screen.matches,
      logIds: logIds.filter((id): id is string => id != null),
    };
  }

  // Tầng 2: AI
  const startedAt = Date.now();
  try {
    const ai = await aiModerate(input, screen.matches);
    const latencyMs = Date.now() - startedAt;
    // Bộ lọc đã gắn nhãn thì giữ lại cả nhãn đó để admin thấy
    const categories = [
      ...new Set<ModerationCategory>([...ai.categories, ...(ai.verdict === "approve" ? [] : screen.categories)]),
    ];

    const status =
      ai.verdict === "approve"
        ? "approved"
        : ai.verdict === "reject" && ai.confidence >= AUTO_REJECT_CONFIDENCE
          ? "rejected"
          : "pending";

    logIds.push(
      await logModeration({
        ...base,
        stage: "ai",
        verdict: status === "approved" ? "approve" : status === "rejected" ? "reject" : "pending",
        categories,
        reason: ai.reason,
        confidence: ai.confidence,
        latencyMs,
      }),
    );

    return {
      action: "save",
      status,
      source: "ai",
      reason: ai.reason || null,
      categories: status === "approved" ? [] : categories,
      confidence: ai.confidence,
      logIds: logIds.filter((id): id is string => id != null),
    };
  } catch (error) {
    // AI lỗi / quá thời gian → không tự quyết, chuyển admin duyệt
    console.error("[moderation] AI lỗi, chuyển chờ duyệt", error);
    const reason = "Hệ thống AI chưa phân tích được, cần quản trị viên duyệt.";
    logIds.push(
      await logModeration({
        ...base,
        stage: "ai",
        verdict: "pending",
        categories: screen.categories,
        reason,
        latencyMs: Date.now() - startedAt,
      }),
    );
    return {
      action: "save",
      status: "pending",
      source: "fallback",
      reason,
      categories: screen.categories,
      confidence: null,
      logIds: logIds.filter((id): id is string => id != null),
    };
  }
}
