export type ModerationRowStatus = "approved" | "pending" | "rejected";
export type ModerationRowSource = "keyword" | "ai" | "admin" | "fallback";

/** Một dòng trong bảng kiểm duyệt (review hoặc bình luận), đã serialize cho client. */
export type ModerationRow = {
  id: string;
  target: "review" | "article_comment";
  content: string;
  authorName: string;
  authorEmail: string;
  /** tên dịch vụ / tiêu đề bài viết */
  subject: string;
  /** loại dịch vụ hoặc "Bài viết" */
  subjectLabel: string;
  subjectHref: string | null;
  rating: number | null;
  bookingCode: string | null;
  status: ModerationRowStatus;
  source: ModerationRowSource | null;
  reason: string | null;
  categories: string[];
  createdAt: string;
  moderatedAt: string | null;
};

export type ModerationSummary = {
  pendingReviews: number;
  pendingComments: number;
  /** 30 ngày gần nhất */
  keywordBlocked: number;
  aiApproved: number;
  aiPending: number;
  aiRejected: number;
  aiFallback: number;
  /** ms, null nếu chưa có lần gọi AI */
  aiAvgLatencyMs: number | null;
};
