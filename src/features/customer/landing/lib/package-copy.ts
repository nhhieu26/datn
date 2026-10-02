import type { PackageKind } from "./package-types";

export const PACKAGE_TABS: { kind: PackageKind; label: string }[] = [
  { kind: "tour", label: "Tour" },
  { kind: "hotel", label: "Khách sạn" },
  { kind: "restaurant", label: "Nhà hàng" },
  { kind: "destination", label: "Điểm đến" },
];

export const PACKAGE_COPY: Record<
  PackageKind,
  { script: string; heading: string; cta: string }
> = {
  tour: {
    script: "Tour phổ biến",
    heading: "Tour được yêu thích nhất",
    cta: "Xem tất cả tour",
  },
  hotel: {
    script: "Khách sạn phổ biến",
    heading: "Khách sạn được yêu thích nhất",
    cta: "Xem tất cả khách sạn",
  },
  restaurant: {
    script: "Nhà hàng phổ biến",
    heading: "Nhà hàng được yêu thích nhất",
    cta: "Xem tất cả nhà hàng",
  },
  destination: {
    script: "Điểm đến phổ biến",
    heading: "Điểm đến được yêu thích nhất",
    cta: "Xem tất cả điểm đến",
  },
};
