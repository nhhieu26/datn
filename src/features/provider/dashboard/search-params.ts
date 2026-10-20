import type { BusinessType } from "@/generated/prisma/client";

export const DASHBOARD_RANGES = ["month", "week", "day"] as const;

export type DashboardRange = (typeof DASHBOARD_RANGES)[number];

export type DashboardQuery = {
  type: BusinessType | null;
  range: DashboardRange;
};

const BUSINESS_TYPES: BusinessType[] = ["tour", "hotel", "restaurant"];

type RawParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export function parseDashboardQuery(params: RawParams): DashboardQuery {
  const type = first(params.type);
  const range = first(params.range);
  return {
    type: BUSINESS_TYPES.find((t) => t === type) ?? null,
    range: DASHBOARD_RANGES.find((r) => r === range) ?? "month",
  };
}

export function buildDashboardUrl(type: BusinessType, range: DashboardRange) {
  const params = new URLSearchParams({ type });
  if (range !== "month") params.set("range", range);
  return `/provider?${params}`;
}
