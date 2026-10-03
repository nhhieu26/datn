export type ExploreKind = "destination" | "hotel" | "restaurant" | "tour";

export type ExploreSort = "popular" | "price_asc" | "price_desc" | "newest";

export type ExploreItem = {
  id: string;
  kind: ExploreKind;
  createdAt: number;
  title: string;
  location: string;
  image: string;
  /** VND: tour (giá gốc), khách sạn (phòng TB), nhà hàng (món TB), điểm đến (vé) */
  price?: number;
  /** trang chi tiết */
  href?: string;
  /** hai chip thông tin, icon do từng card quyết định */
  meta: [string, string];
};

export const KIND_LABELS: Record<ExploreKind, string> = {
  destination: "Điểm đến",
  hotel: "Khách sạn",
  restaurant: "Nhà hàng",
  tour: "Tour",
};

export const KIND_FILTERS: { label: string; kind: ExploreKind | "all" }[] = [
  { label: "Tất cả", kind: "all" },
  { label: "Tour", kind: "tour" },
  { label: "Khách sạn", kind: "hotel" },
  { label: "Nhà hàng", kind: "restaurant" },
  { label: "Điểm đến", kind: "destination" },
];

export const SORT_OPTIONS: { label: string; value: ExploreSort }[] = [
  { label: "Phổ biến nhất", value: "popular" },
  { label: "Giá thấp đến cao", value: "price_asc" },
  { label: "Giá cao đến thấp", value: "price_desc" },
  { label: "Mới nhất", value: "newest" },
];

export const PAGE_SIZE = 9;
