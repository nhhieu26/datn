import type { ExploreItem } from "@/features/customer/explore/data";

export type PackageKind = ExploreItem["kind"];

export type PackagesByKind = Record<PackageKind, ExploreItem[]>;
