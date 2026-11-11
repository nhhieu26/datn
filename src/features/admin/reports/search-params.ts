import {
  DEFAULT_RANGE,
  parseReportRange,
  type ReportRange,
  type ReportRangeQuery,
} from "@/features/provider/reports/search-params";

export const ADMIN_REPORT_PATH = "/admin/reports";
export const ADMIN_REPORT_EXPORT_PATH = "/api/admin/reports/export";

export type AdminReportQuery = ReportRangeQuery;

type RawParams = Record<string, string | string[] | undefined>;

export function parseAdminReportQuery(params: RawParams): AdminReportQuery {
  return parseReportRange(params);
}

function toSearch(query: AdminReportQuery) {
  const params = new URLSearchParams();
  if (query.range !== DEFAULT_RANGE) params.set("range", query.range);
  if (query.range === "custom") {
    params.set("from", query.from);
    params.set("to", query.to);
  }
  const search = params.toString();
  return search ? `?${search}` : "";
}

export function buildAdminReportUrl(range: Exclude<ReportRange, "custom">) {
  return `${ADMIN_REPORT_PATH}${toSearch({ range, from: "", to: "" })}`;
}

export function buildAdminReportExportUrl(query: AdminReportQuery) {
  return `${ADMIN_REPORT_EXPORT_PATH}${toSearch(query)}`;
}
