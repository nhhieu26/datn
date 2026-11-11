import ExcelJS from "exceljs";

export type XlsxColumn = {
  header: string;
  key: string;
  width?: number;
  /** Định dạng số, ví dụ `#,##0` cho tiền. */
  numFmt?: string;
};

const XLSX_MIME =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export type XlsxRow = Record<string, string | number | null>;

export type XlsxSheet = {
  name: string;
  columns: XlsxColumn[];
  rows: XlsxRow[];
};

/** Workbook nhiều sheet, mỗi sheet có hàng tiêu đề cố định và bộ lọc. */
export async function buildXlsxWorkbook(sheets: XlsxSheet[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  for (const { name, columns, rows } of sheets) {
    const sheet = workbook.addWorksheet(name, {
      views: [{ state: "frozen", ySplit: 1 }],
    });
    sheet.columns = columns.map((c) => ({
      header: c.header,
      key: c.key,
      width: c.width ?? 18,
      style: c.numFmt ? { numFmt: c.numFmt } : {},
    }));
    sheet.addRows(rows);

    const header = sheet.getRow(1);
    header.font = { bold: true };
    header.alignment = { vertical: "middle" };
    header.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE5E7EB" },
    };
    sheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: columns.length },
    };
  }

  return Buffer.from(await workbook.xlsx.writeBuffer());
}

export function buildXlsx(
  sheetName: string,
  columns: XlsxColumn[],
  rows: XlsxRow[],
): Promise<Buffer> {
  return buildXlsxWorkbook([{ name: sheetName, columns, rows }]);
}

export function xlsxResponse(buffer: Buffer, filename: string) {
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": XLSX_MIME,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

/** Ngày-giờ theo giờ Việt Nam, ví dụ `10/11/2026 14:30`. */
export function formatDateTimeVN(date: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/** Ngày lưu dạng 00:00 UTC (ngày khởi hành, nhận phòng...) nên format theo UTC. */
export function formatDateOnly(date: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "UTC",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function exportFilename(prefix: string) {
  const d = new Date(Date.now() + 7 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10)
    .replaceAll("-", "");
  return `${prefix}-${d}.xlsx`;
}
