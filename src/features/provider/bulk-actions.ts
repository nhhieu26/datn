import type { ServiceStatus } from "@/generated/prisma/client";

/** Số dịch vụ tối đa được xử lý trong một thao tác hàng loạt. */
export const MAX_BULK_ITEMS = 100;

/** `updated`: số dịch vụ đã đổi; `skipped`: số dịch vụ bỏ qua vì không thỏa điều kiện. */
export type BulkActionResult = { updated: number; skipped: number };

/** Chuẩn hóa danh sách id từ client: bỏ trùng, bỏ giá trị rỗng. Trả về null nếu không hợp lệ. */
export function parseBulkIds(ids: unknown): string[] | null {
  if (!Array.isArray(ids)) return null;
  const unique = [
    ...new Set(
      ids.filter((id): id is string => typeof id === "string" && id.length > 0),
    ),
  ];
  if (unique.length === 0 || unique.length > MAX_BULK_ITEMS) return null;
  return unique;
}

export function isServiceStatus(value: unknown): value is ServiceStatus {
  return value === "published" || value === "paused";
}
