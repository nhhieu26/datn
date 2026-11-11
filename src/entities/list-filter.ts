export type ListSort =
  | "popular"
  | "price_asc"
  | "price_desc"
  | "newest"
  /** theo điểm tìm kiếm ngữ nghĩa, chỉ dùng khi có từ khóa */
  | "relevance";

export type ListFilter = {
  q?: string;
  province?: string;
  tag?: string;
  minPrice?: number;
  maxPrice?: number;
  /** chỉ lấy mục có ratingAvg >= minRating */
  minRating?: number;
  /** điểm cosine id → score từ tìm kiếm ngữ nghĩa cho câu `q` (không có khi Pinecone lỗi) */
  semantic?: Map<string, number>;
  sort: ListSort;
  skip: number;
  take: number;
};

export function priceRange(filter: Pick<ListFilter, "minPrice" | "maxPrice">) {
  if (filter.minPrice === undefined && filter.maxPrice === undefined) {
    return undefined;
  }
  return { gte: filter.minPrice, lte: filter.maxPrice };
}

export function ratingWhere(filter: Pick<ListFilter, "minRating">) {
  return filter.minRating === undefined
    ? {}
    : { ratingAvg: { gte: filter.minRating } };
}

export function priceOrder(sort: ListSort): "asc" | "desc" | undefined {
  if (sort === "price_asc") return "asc";
  if (sort === "price_desc") return "desc";
  return undefined;
}

export function average(values: number[]): number | undefined {
  return values.length
    ? values.reduce((sum, v) => sum + v, 0) / values.length
    : undefined;
}

export function menuAveragePrice(menu: unknown): number | undefined {
  const prices = ((menu as { price?: unknown }[] | null) ?? [])
    .map((item) => Number(item.price))
    .filter((n) => Number.isFinite(n));
  return average(prices);
}

/**
 * Giá trung bình (phòng/món) không tính được bằng Prisma nên khi lọc hoặc sort theo giá
 * phải lấy hết rồi lọc, sắp xếp, cắt trang trong bộ nhớ. Mục không có giá bị loại khi lọc giá
 * và xếp cuối khi sort giá. Sort "popular" xếp theo lượt đặt giảm dần (getBookings),
 * cùng lượt đặt thì mới nhất trước.
 */
export function paginateByPrice<T extends { id: string; createdAt: Date }>(
  rows: T[],
  getPrice: (row: T) => number | undefined,
  filter: ListFilter,
  bookingCounts?: Map<string, number>,
) {
  const order = priceOrder(filter.sort);
  const hasRange =
    filter.minPrice !== undefined || filter.maxPrice !== undefined;
  const priced = rows.map((row) => ({
    row,
    price: getPrice(row),
    bookingCount: bookingCounts?.get(row.id) ?? 0,
  }));
  const kept = hasRange
    ? priced.filter(({ price }) => inPriceRange(price, filter))
    : priced;
  if (order) {
    const dir = order === "asc" ? 1 : -1;
    kept.sort((a, b) => {
      if (a.price === undefined && b.price === undefined) return 0;
      if (a.price === undefined) return 1;
      if (b.price === undefined) return -1;
      return (a.price - b.price) * dir;
    });
  } else if (bookingCounts) {
    kept.sort(
      (a, b) =>
        b.bookingCount - a.bookingCount ||
        b.row.createdAt.getTime() - a.row.createdAt.getTime(),
    );
  }
  return {
    items: kept
      .slice(filter.skip, filter.skip + filter.take)
      .map(({ row, bookingCount }) => ({ ...row, bookingCount })),
    total: kept.length,
  };
}

/** Lọc/sort theo giá hoặc theo lượt đặt đều phải quét hết rồi xử lý trong bộ nhớ */
export function needsScan(filter: ListFilter) {
  return (
    filter.minPrice !== undefined ||
    filter.maxPrice !== undefined ||
    priceOrder(filter.sort) !== undefined ||
    filter.sort === "popular"
  );
}

function inPriceRange(
  price: number | undefined,
  filter: Pick<ListFilter, "minPrice" | "maxPrice">,
) {
  if (price === undefined) return false;
  return (
    (filter.minPrice === undefined || price >= filter.minPrice) &&
    (filter.maxPrice === undefined || price <= filter.maxPrice)
  );
}

/**
 * Điều kiện tìm theo từ khóa: khớp chuỗi ở các trường `keyword(q)` HOẶC nằm trong
 * kết quả tìm kiếm ngữ nghĩa (tìm kiếm lai — tên riêng vẫn khớp được bằng từ khóa).
 */
export function searchWhere<W>(
  filter: Pick<ListFilter, "q" | "semantic">,
  keyword: (q: string) => W[],
): { OR?: W[] } {
  if (!filter.q) return {};
  const conditions = keyword(filter.q);
  if (filter.semantic?.size) {
    conditions.push({ id: { in: [...filter.semantic.keys()] } } as W);
  }
  return { OR: conditions };
}

/** Điểm cộng khi tên mục chứa nguyên cụm từ khóa. */
const KEYWORD_BONUS = 0.1;

/**
 * Sắp xếp theo độ phù hợp: điểm cosine (0 nếu chỉ khớp từ khóa) + điểm cộng khi tên chứa từ khóa.
 * Lọc giá trong bộ nhớ như paginateByPrice. Tập kết quả nhỏ (topK ngữ nghĩa + mục khớp từ khóa).
 */
export function paginateByRelevance<T extends { id: string; createdAt: Date }>(
  rows: T[],
  getTitle: (row: T) => string,
  getPrice: (row: T) => number | undefined,
  filter: ListFilter,
) {
  const hasRange =
    filter.minPrice !== undefined || filter.maxPrice !== undefined;
  const q = filter.q?.toLowerCase();
  const scored = rows
    .filter((row) => !hasRange || inPriceRange(getPrice(row), filter))
    .map((row) => ({
      row,
      score:
        (filter.semantic?.get(row.id) ?? 0) +
        (q && getTitle(row).toLowerCase().includes(q) ? KEYWORD_BONUS : 0),
    }));
  scored.sort(
    (a, b) =>
      b.score - a.score ||
      b.row.createdAt.getTime() - a.row.createdAt.getTime(),
  );
  return {
    items: scored
      .slice(filter.skip, filter.skip + filter.take)
      .map(({ row, score }) => ({ ...row, score })),
    total: scored.length,
  };
}
