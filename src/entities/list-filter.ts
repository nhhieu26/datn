export type ListSort = "popular" | "price_asc" | "price_desc" | "newest";

export type ListFilter = {
  q?: string;
  province?: string;
  tag?: string;
  minPrice?: number;
  maxPrice?: number;
  /** chỉ lấy mục có ratingAvg >= minRating */
  minRating?: number;
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
  const kept = priced.filter(({ price }) => {
    if (!hasRange) return true;
    if (price === undefined) return false;
    return (
      (filter.minPrice === undefined || price >= filter.minPrice) &&
      (filter.maxPrice === undefined || price <= filter.maxPrice)
    );
  });
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
