import { formatPrice } from "@/features/customer/components/cards/card-parts";
import { groupTimeSlots, type RestaurantDetail } from "../lib/restaurant-detail";

const sectionTitle = "mb-4 text-2xl font-bold text-new-title";
const th = "px-4 py-3 text-left text-sm font-bold text-new-title";
const td = "px-4 py-3 text-new-paragraph";
const tableWrap = "overflow-x-auto rounded-md border border-new-chip";

const SOCIALS = ["public", "mail", "share"];

export function RestaurantContent({
  restaurant,
}: {
  restaurant: RestaurantDetail;
}) {
  const ranges = groupTimeSlots(restaurant.timeSlots);
  const hasCoords = restaurant.latitude != null && restaurant.longitude != null;

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h4 className={sectionTitle}>Giới thiệu</h4>
        <p className="leading-7 whitespace-pre-line text-new-paragraph">
          {restaurant.description || "Chưa có mô tả cho nhà hàng này."}
        </p>
      </section>

      <section>
        <h4 className={sectionTitle}>Thực đơn</h4>
        <div className={tableWrap}>
          <table className="w-full min-w-[480px] text-sm">
            <thead className="bg-new-chip">
              <tr>
                <th className={th}>STT</th>
                <th className={th}>Món</th>
                <th className={th}>Mô tả</th>
                <th className={`${th} text-right`}>Giá</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-new-chip">
              {restaurant.menu.length === 0 && (
                <tr>
                  <td className={td} colSpan={4}>
                    Chưa có món nào.
                  </td>
                </tr>
              )}
              {restaurant.menu.map((m, i) => (
                <tr key={`${m.name}-${i}`}>
                  <td className={td}>{String(i + 1).padStart(2, "0")}</td>
                  <td className={`${td} font-medium text-new-title`}>{m.name}</td>
                  <td className={td}>{m.description}</td>
                  <td className={`${td} text-right font-bold text-new-title`}>
                    {formatPrice(m.price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h4 className={sectionTitle}>Giờ mở cửa</h4>
        <div className={tableWrap}>
          <table className="w-full text-sm">
            <thead className="bg-new-chip">
              <tr>
                <th className={th}>Khung giờ</th>
                <th className={th}>Mở cửa</th>
                <th className={th}>Đóng cửa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-new-chip">
              {ranges.length === 0 && (
                <tr>
                  <td className={td} colSpan={3}>
                    Chưa cập nhật giờ mở cửa.
                  </td>
                </tr>
              )}
              {ranges.map((r, i) => (
                <tr key={r.start}>
                  <td className={`${td} font-medium text-new-title`}>
                    Ca {i + 1}
                  </td>
                  <td className={td}>{r.start}</td>
                  <td className={td}>{r.end}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h4 className={sectionTitle}>Vị trí</h4>
        <div className="flex items-start gap-2.5 rounded-md bg-new-itinerary-bg p-5 text-new-paragraph">
          <span aria-hidden className="material-symbols-outlined text-new-teal">
            location_on
          </span>
          <div>
            <p className="font-bold text-new-title">
              {restaurant.address}, {restaurant.location}
            </p>
            {restaurant.phone && (
              <p className="mt-1 text-sm">Điện thoại: {restaurant.phone}</p>
            )}
            {hasCoords && (
              <p className="mt-1 text-sm">
                Tọa độ: {restaurant.latitude}, {restaurant.longitude}
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-new-chip pt-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-bold text-new-title">Thẻ:</span>
          {restaurant.tags.map((t) => (
            <span
              key={t}
              className="rounded bg-new-chip px-3 py-1 text-sm text-new-title"
            >
              {t}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3 text-new-title">
          <span className="font-bold">Chia sẻ:</span>
          {SOCIALS.map((s) => (
            <span
              key={s}
              aria-hidden
              className="material-symbols-outlined cursor-pointer text-xl hover:text-new-teal"
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
