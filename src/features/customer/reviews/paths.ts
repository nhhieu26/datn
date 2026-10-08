import type { ReviewKind } from "@/entities/review";

export const SERVICE_PATH: Record<ReviewKind, string> = {
  tour: "/tours",
  hotel: "/hotels",
  restaurant: "/restaurants",
};

export const MY_BOOKINGS_PATH: Record<ReviewKind, string> = {
  tour: "/my-bookings",
  hotel: "/my-hotel-bookings",
  restaurant: "/my-restaurant-bookings",
};

/** Link tới form đánh giá trên trang chi tiết dịch vụ. */
export function reviewUrl(kind: ReviewKind, slug: string) {
  return `${SERVICE_PATH[kind]}/${slug}#reviews`;
}
