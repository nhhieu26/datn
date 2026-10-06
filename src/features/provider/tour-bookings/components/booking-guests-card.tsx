import { formatCurrency } from "@/lib/utils";
import type { TourBookingDetailView } from "../types";

export function BookingGuestsCard({
  booking: b,
}: {
  booking: TourBookingDetailView;
}) {
  return (
    <table className="w-full text-left text-sm">
      <thead className="bg-slate-50 text-xs tracking-wider text-slate-500 uppercase">
        <tr>
          <th className="px-6 py-3 font-semibold">Loại</th>
          <th className="px-6 py-3 font-semibold">Số lượng</th>
          <th className="px-6 py-3 text-right font-semibold">Đơn giá</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="px-6 py-4 font-bold text-slate-900">Khách tham gia</td>
          <td className="px-6 py-4 text-slate-700">{b.guests}</td>
          <td className="px-6 py-4 text-right text-slate-700">
            {formatCurrency(b.unitPrice)}
          </td>
        </tr>
      </tbody>
    </table>
  );
}
