import { formatCurrency } from "@/lib/utils";
import type { HotelBookingDetailView } from "../types";

export function HotelBookingRoomCard({
  booking: b,
}: {
  booking: HotelBookingDetailView;
}) {
  return (
    <table className="w-full text-left text-sm">
      <thead className="bg-slate-50 text-xs tracking-wider text-slate-500 uppercase">
        <tr>
          <th className="px-6 py-3 font-semibold">Loại phòng</th>
          <th className="px-6 py-3 font-semibold">Số phòng</th>
          <th className="px-6 py-3 font-semibold">Số đêm</th>
          <th className="px-6 py-3 font-semibold">Số khách</th>
          <th className="px-6 py-3 text-right font-semibold">Đơn giá / đêm</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="px-6 py-4 font-bold text-slate-900">{b.roomName}</td>
          <td className="px-6 py-4 text-slate-700">{b.roomQuantity}</td>
          <td className="px-6 py-4 text-slate-700">{b.nights}</td>
          <td className="px-6 py-4 text-slate-700">{b.guests}</td>
          <td className="px-6 py-4 text-right text-slate-700">
            {formatCurrency(b.unitPrice)}
          </td>
        </tr>
      </tbody>
    </table>
  );
}
