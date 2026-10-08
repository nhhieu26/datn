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
