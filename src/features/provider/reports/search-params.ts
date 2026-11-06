import type { BusinessType } from "@/generated/prisma/client";

export const REPORT_RANGES = ["7d", "30d", "12m", "custom"] as const;

export type ReportRange = (typeof REPORT_RANGES)[number];

export const REPORT_PATH = "/provider/reports";
const DEFAULT_RANGE: ReportRange = "7d";

export type ReportQuery = {
  type: BusinessType | null;
  range: ReportRange;
  /** Ngày dạng YYYY-MM-DD, chỉ có khi range là custom. */
  from: string;
  to: string;
};

const BUSINESS_TYPES: BusinessType[] = ["tour", "hotel", "restaurant"];

type RawParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

function isIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  // Loại ngày không tồn tại như 2026-02-31
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

export function parseReportQuery(params: RawParams): ReportQuery {
  const typeParam = first(params.type);
  const type = BUSINESS_TYPES.find((t) => t === typeParam) ?? null;
  const rangeParam = first(params.range);
  const range = REPORT_RANGES.find((r) => r === rangeParam) ?? DEFAULT_RANGE;

  if (range === "custom") {
    const from = first(params.from);
    const to = first(params.to);
    if (isIsoDate(from) && isIsoDate(to) && from <= to) return { type, range, from, to };
    return { type, range: DEFAULT_RANGE, from: "", to: "" };
  }
  return { type, range, from: "", to: "" };
}

export function buildReportUrl(type: BusinessType, range: Exclude<ReportRange, "custom">) {
  const params = new URLSearchParams({ type });
  if (range !== DEFAULT_RANGE) params.set("range", range);
  return `${REPORT_PATH}?${params}`;
}
