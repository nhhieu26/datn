import { formatCurrency } from "@/lib/utils";
import type { HotelBookingDetailView } from "../types";

const thClass =
  "px-4 py-3 text-start text-xs font-medium text-muted-foreground-1 uppercase md:px-5";
const tdClass = "px-4 py-3 text-sm whitespace-nowrap text-foreground md:px-5";

/** Bảng chi tiết phòng đã đặt theo phong cách Preline. */
export function HotelBookingRoomCard({
  booking: b,
}: {
  booking: HotelBookingDetailView;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-table-line">
        <thead className="bg-surface">
          <tr>
            <th className={thClass} scope="col">Loại phòng</th>
            <th className={thClass} scope="col">Số phòng</th>
            <th className={thClass} scope="col">Số đêm</th>
            <th className={thClass} scope="col">Số khách</th>
            <th className={`${thClass} text-end`} scope="col">
              Đơn giá / đêm
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-table-line">
          <tr>
            <td className={`${tdClass} font-medium`}>{b.roomName}</td>
            <td className={tdClass}>{b.roomQuantity}</td>
            <td className={tdClass}>{b.nights}</td>
            <td className={tdClass}>{b.guests}</td>
            <td className={`${tdClass} text-end`}>
              {formatCurrency(b.unitPrice)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
