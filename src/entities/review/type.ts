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
