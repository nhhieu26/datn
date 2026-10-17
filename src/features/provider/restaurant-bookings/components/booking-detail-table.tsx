import { formatDate } from "@/lib/utils";
import type { RestaurantBookingDetailView } from "../types";
import { formatTimeRange } from "../utils";

const thClass =
  "px-4 py-3 text-start text-xs font-medium text-muted-foreground-1 uppercase md:px-5";
const tdClass = "px-4 py-3 text-sm whitespace-nowrap text-foreground md:px-5";

/** Bảng chi tiết bàn đã đặt theo phong cách Preline. */
export function RestaurantBookingDetailTable({
  booking: b,
}: {
  booking: RestaurantBookingDetailView;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-table-line">
        <thead className="bg-surface">
          <tr>
            <th className={thClass} scope="col">Nhà hàng</th>
            <th className={thClass} scope="col">Ngày</th>
            <th className={thClass} scope="col">Khung giờ</th>
            <th className={`${thClass} text-end`} scope="col">
              Số khách
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-table-line">
          <tr>
            <td className={`${tdClass} font-medium`}>{b.restaurantName}</td>
            <td className={tdClass}>{formatDate(b.reservationDate)}</td>
            <td className={tdClass}>
              {formatTimeRange(b.startTime, b.endTime)}
            </td>
            <td className={`${tdClass} text-end`}>{b.guests}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
