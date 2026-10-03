import {
  KIND_FILTERS,
  SORT_OPTIONS,
  type ExploreKind,
  type ExploreSort,
} from "../data";

export type ExploreQuery = {
  kind: ExploreKind | "all";
  q: string;
  tag?: string;
  location: string;
  from: string;
  to: string;
  minPrice?: number;
  maxPrice?: number;
  sort: ExploreSort;
  page: number;
};

type RawParams = Record<string, string | string[] | undefined>;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function first(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

function positiveNumber(value: string) {
  const n = Number(value);
  return value && Number.isFinite(n) && n >= 0 ? n : undefined;
}

export function parseExploreQuery(raw: RawParams): ExploreQuery {
  const kind = KIND_FILTERS.find((k) => k.kind === first(raw.kind))?.kind;
  const sort = SORT_OPTIONS.find((s) => s.value === first(raw.sort))?.value;
  const from = first(raw.from);
  const to = first(raw.to);
  const page = Math.floor(Number(first(raw.page)));
  return {
    kind: kind ?? "tour",
    q: first(raw.q),
    tag: first(raw.tag) || undefined,
    location: first(raw.location),
    from: DATE_RE.test(from) ? from : "",
    to: DATE_RE.test(to) ? to : "",
    minPrice: positiveNumber(first(raw.minPrice)),
    maxPrice: positiveNumber(first(raw.maxPrice)),
    sort: sort ?? "popular",
    page: page >= 1 ? page : 1,
  };
}

/** Dựng URL /explore, bỏ param rỗng/mặc định. `page` chỉ giữ khi được truyền trong patch. */
export function buildExploreUrl(
  query: ExploreQuery,
  patch: Partial<ExploreQuery> = {},
) {
  const next = { ...query, page: 1, ...patch };
  const params = new URLSearchParams();
  params.set("kind", next.kind);
  if (next.q) params.set("q", next.q);
  if (next.tag) params.set("tag", next.tag);
  if (next.location) params.set("location", next.location);
  // ngày chỉ lọc lịch khởi hành của tour
  if (next.kind === "tour" || next.kind === "all") {
    if (next.from) params.set("from", next.from);
    if (next.to) params.set("to", next.to);
  }
  if (next.minPrice !== undefined) params.set("minPrice", String(next.minPrice));
  if (next.maxPrice !== undefined) params.set("maxPrice", String(next.maxPrice));
  if (next.sort !== "popular") params.set("sort", next.sort);
  if (next.page > 1) params.set("page", String(next.page));
  return `/explore?${params.toString()}`;
}
