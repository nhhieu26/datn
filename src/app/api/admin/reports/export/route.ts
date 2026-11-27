import { getAdminReportData, KIND_LABELS, parseAdminReportQuery } from "@/features/admin/reports";
import { auth } from "@/lib/auth";
import { buildXlsxWorkbook, exportFilename, xlsxResponse } from "@/lib/export-xlsx";

const MONEY = "#,##0";
const PERCENT = "0.0";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });
  if (session.user.role !== "admin") return new Response("Forbidden", { status: 403 });

  const query = parseAdminReportQuery(Object.fromEntries(new URL(request.url).searchParams));
  const data = await getAdminReportData(query);

  const buffer = await buildXlsxWorkbook([
    {
      name: "Tổng quan",
      columns: [
        { header: "Chỉ số", key: "label", width: 32 },
        { header: "Giá trị", key: "value", width: 22, numFmt: MONEY },
        { header: "So với kỳ trước", key: "trend", width: 18 },
      ],
      rows: [
        { label: "Kỳ báo cáo", value: data.periodLabel, trend: "" },
        ...data.stats.map((s) => ({ label: s.label, value: s.raw, trend: s.trend.label })),
        ...data.funnel.map((f) => ({ label: `Phễu · ${f.label}`, value: f.count, trend: `${f.percent}%` })),
      ],
    },
    {
      name: "Doanh thu theo kỳ",
      columns: [
        { header: "Kỳ", key: "label", width: 14 },
        { header: "GMV (VND)", key: "gmv", width: 20, numFmt: MONEY },
        { header: "Hoa hồng (VND)", key: "fee", width: 20, numFmt: MONEY },
        { header: "GMV kỳ trước (VND)", key: "previous", width: 22, numFmt: MONEY },
      ],
      rows: data.revenue.labels.map((label, i) => ({
        label,
        gmv: data.revenue.values[i],
        fee: data.feeValues[i],
        previous: data.previousRevenue[i],
      })),
    },
    {
      name: "Đơn theo dịch vụ",
      columns: [
        { header: "Dịch vụ", key: "label", width: 14 },
        { header: "Số đơn", key: "bookings", width: 10 },
        { header: "Hoàn thành", key: "completed", width: 12 },
        { header: "Đã hủy", key: "cancelled", width: 10 },
        { header: "Tỷ lệ hoàn thành (%)", key: "completionRate", width: 20, numFmt: PERCENT },
        { header: "Tỷ lệ hủy (%)", key: "cancellationRate", width: 14, numFmt: PERCENT },
        { header: "Lượt khách", key: "guests", width: 12 },
        { header: "GMV (VND)", key: "gmv", width: 20, numFmt: MONEY },
        { header: "Hoa hồng (VND)", key: "fee", width: 20, numFmt: MONEY },
      ],
      rows: data.kinds.map((k) => ({
        label: k.label,
        bookings: k.bookings,
        completed: k.completed,
        cancelled: k.cancelled,
        completionRate: k.completionRate,
        cancellationRate: k.cancellationRate,
        guests: k.guests,
        gmv: k.gmv,
        fee: k.fee,
      })),
    },
    {
      name: "Top đối tác",
      columns: [
        { header: "Hạng", key: "rank", width: 8 },
        { header: "Đối tác", key: "name", width: 36 },
        { header: "Loại", key: "kind", width: 14 },
        { header: "Số đơn", key: "bookings", width: 10 },
        { header: "GMV (VND)", key: "gmv", width: 20, numFmt: MONEY },
        { header: "Hoa hồng (VND)", key: "fee", width: 20, numFmt: MONEY },
        { header: "Tỷ trọng GMV (%)", key: "share", width: 18, numFmt: PERCENT },
      ],
      rows: data.topProviders.map((p, i) => ({
        rank: i + 1,
        name: p.name,
        kind: KIND_LABELS[p.kind],
        bookings: p.bookings,
        gmv: p.gmv,
        fee: p.fee,
        share: p.share,
      })),
    },
    {
      name: "Top tỉnh thành",
      columns: [
        { header: "Hạng", key: "rank", width: 8 },
        { header: "Tỉnh/thành", key: "name", width: 28 },
        { header: "Số đơn", key: "bookings", width: 10 },
        { header: "Tỷ trọng (%)", key: "share", width: 14, numFmt: PERCENT },
      ],
      rows: data.topProvinces.map((p, i) => ({
        rank: i + 1,
        name: p.name,
        bookings: p.bookings,
        share: p.share,
      })),
    },
  ]);

  return xlsxResponse(buffer, exportFilename("bao-cao-he-thong"));
}
