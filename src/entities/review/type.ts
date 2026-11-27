export type ReviewKind = "tour" | "hotel" | "restaurant";

export type ReviewItem = {
  id: string;
  customerName: string;
  rating: number;
  content: string;
  createdAt: Date;
};

/** Đơn completed của customer cho dịch vụ, chưa được đánh giá. */
export type ReviewableBooking = {
  code: string;
  date: Date;
};

/** Review hiển thị cho provider kèm dịch vụ được đánh giá. */
export type ProviderReviewItem = ReviewItem & {
  serviceName: string;
  serviceSlug: string;
};

export type ProviderReviewFilter = {
  rating?: number;
};

export type ProviderReviewSummary = {
  total: number;
  average: number;
  /** Số review theo từng mức sao, index 0 = 1★ ... index 4 = 5★. */
  distribution: [number, number, number, number, number];
};

export type ReviewModerationStatus = "approved" | "pending" | "rejected";
export type ReviewModerationSource = "keyword" | "ai" | "admin" | "fallback";

export type ModerationReviewFilter = {
  status?: ReviewModerationStatus;
  source?: ReviewModerationSource;
  q?: string;
};

/** Review hiển thị trong trang kiểm duyệt của admin. */
export type ModerationReviewItem = {
  id: string;
  kind: ReviewKind;
  rating: number;
  content: string;
  status: ReviewModerationStatus;
  moderationSource: ReviewModerationSource | null;
  moderationReason: string | null;
  moderationCategories: string[];
  moderatedAt: Date | null;
  createdAt: Date;
  customerName: string;
  customerEmail: string;
  serviceId: string | null;
  serviceName: string;
  serviceSlug: string | null;
  bookingCode: string | null;
};
