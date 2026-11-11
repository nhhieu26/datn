import type { ServiceStatus } from "@/generated/prisma/client";
import { formatDate } from "@/lib/utils";

const DAY_MS = 24 * 60 * 60 * 1000;

type ServiceStatusInfo = {
  status: ServiceStatus;
  deleteScheduledAt: string | null;
  activeBookings: number;
};

/**
 * Ghi chú dưới badge trạng thái, phân biệt dịch vụ tạm dừng thủ công
 * với dịch vụ đã bị xóa và đang chờ cron xóa.
 */
export function describeServiceStatus(
  service: ServiceStatusInfo,
  now: Date = new Date(),
): string | null {
  if (service.deleteScheduledAt) {
    const deleteAt = new Date(service.deleteScheduledAt);
    if (deleteAt <= now) {
      return service.activeBookings > 0
        ? `Chờ ${service.activeBookings} booking hoàn tất rồi xóa`
        : "Sẽ xóa trong lần dọn dẹp tới";
    }
    const daysLeft = Math.ceil((deleteAt.getTime() - now.getTime()) / DAY_MS);
    return `Tự xóa sau ${daysLeft} ngày (${formatDate(service.deleteScheduledAt)})`;
  }
  if (service.status === "paused") return "Dừng thủ công · có thể mở bán lại";
  return null;
}
