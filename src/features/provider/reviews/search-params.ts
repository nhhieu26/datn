import type { ProviderReviewFilter } from "@/entities/review";

export const REVIEWS_PAGE_SIZE = 10;

export type ReviewsQuery = {
  rating: number | "all";
  page: number;
};

type RawParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export function parseReviewsQuery(params: RawParams): ReviewsQuery {
  const rating = Number(first(params.rating));
  return {
    rating: Number.isInteger(rating) && rating >= 1 && rating <= 5 ? rating : "all",
    page: Math.max(1, Math.floor(Number(first(params.page))) || 1),
  };
}

export function hasActiveFilters(query: ReviewsQuery) {
  return query.rating !== "all";
}

export function buildReviewsUrl(
  query: ReviewsQuery,
  patch: Partial<ReviewsQuery> = {},
) {
  // Đổi bộ lọc thì về trang 1; `page` chỉ giữ khi được truyền trong patch
  const next = { ...query, page: 1, ...patch };
  const params = new URLSearchParams();
  if (next.rating !== "all") params.set("rating", String(next.rating));
  if (next.page > 1) params.set("page", String(next.page));
  const search = params.toString();
  return search ? `?${search}` : "?";
}

export function toReviewFilter(query: ReviewsQuery): ProviderReviewFilter {
  return { rating: query.rating === "all" ? undefined : query.rating };
}
