// File này chạy cả ở client: không import repo (Prisma).
export const MODERATION_PAGE_SIZE = 10;
export const MODERATION_PATH = "/admin/moderation";

export type ModerationTab = "reviews" | "comments";
export type ModerationStatusFilter = "pending" | "rejected" | "approved" | "all";
export type ModerationSourceFilter = "keyword" | "ai" | "admin" | "fallback" | "all";

export type ModerationQuery = {
  tab: ModerationTab;
  status: ModerationStatusFilter;
  source: ModerationSourceFilter;
  q: string;
  page: number;
};

type RawParams = Record<string, string | string[] | undefined>;

const TABS: ModerationTab[] = ["reviews", "comments"];
const STATUSES: ModerationStatusFilter[] = ["pending", "rejected", "approved", "all"];
const SOURCES: ModerationSourceFilter[] = ["keyword", "ai", "admin", "fallback", "all"];

function first(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

function pick<T extends string>(value: string, options: T[], fallback: T): T {
  return (options as string[]).includes(value) ? (value as T) : fallback;
}

export function parseModerationQuery(params: RawParams): ModerationQuery {
  return {
    tab: pick(first(params.tab), TABS, "reviews"),
    // Mặc định hiện hàng chờ duyệt
    status: pick(first(params.status), STATUSES, "pending"),
    source: pick(first(params.source), SOURCES, "all"),
    q: first(params.q).trim().slice(0, 100),
    page: Math.max(1, Math.floor(Number(first(params.page))) || 1),
  };
}

export function hasActiveFilters(query: ModerationQuery) {
  return query.q !== "" || query.status !== "pending" || query.source !== "all";
}

export function buildModerationUrl(
  query: ModerationQuery,
  patch: Partial<ModerationQuery> = {},
) {
  // Đổi bộ lọc thì về trang 1; `page` chỉ giữ khi được truyền trong patch
  const next = { ...query, page: 1, ...patch };
  const params = new URLSearchParams();
  if (next.tab !== "reviews") params.set("tab", next.tab);
  if (next.status !== "pending") params.set("status", next.status);
  if (next.source !== "all") params.set("source", next.source);
  if (next.q) params.set("q", next.q);
  if (next.page > 1) params.set("page", String(next.page));
  const search = params.toString();
  return search ? `${MODERATION_PATH}?${search}` : MODERATION_PATH;
}

export function toModerationFilter(query: ModerationQuery) {
  return {
    status: query.status === "all" ? undefined : query.status,
    source: query.source === "all" ? undefined : query.source,
    q: query.q || undefined,
  };
}
