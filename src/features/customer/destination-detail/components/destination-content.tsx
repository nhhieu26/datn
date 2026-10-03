import { formatPrice } from "@/features/customer/components/cards/card-parts";
import type { DestinationDetail } from "../lib/to-destination-detail";

const sectionTitle = "mb-4 text-2xl font-bold text-new-title";

// ponytail: chưa có trường giờ mở cửa/lưu ý trong DB nên dùng nội dung chung cho mọi điểm đến
const TIPS = [
  "Nên đến vào buổi sáng sớm hoặc cuối chiều để tránh đông và nắng gắt.",
  "Mang theo giấy tờ tùy thân, nước uống và trang phục phù hợp thời tiết.",
  "Giữ gìn vệ sinh và tuân thủ quy định tại điểm tham quan.",
];

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <li className="flex items-start gap-3 rounded-md bg-new-section-bg p-4">
      <span
        aria-hidden
        className="material-symbols-outlined text-2xl text-new-teal"
      >
        {icon}
      </span>
      <div>
        <p className="text-sm text-new-muted">{label}</p>
        <p className="font-bold text-new-title">{value}</p>
      </div>
    </li>
  );
}

export function DestinationContent({
  destination,
}: {
  destination: DestinationDetail;
}) {
  const hasCoords =
    destination.latitude != null && destination.longitude != null;
  return (
    <div className="flex flex-col gap-8">
      <section>
        <h4 className={sectionTitle}>Giới thiệu</h4>
        <p className="leading-7 whitespace-pre-line text-new-paragraph">
          {destination.description || "Chưa có mô tả cho điểm đến này."}
        </p>
      </section>

      <section className="rounded-md border border-new-chip p-[30px]">
        <h4 className={sectionTitle}>Thông tin tham quan</h4>
        <ul className="grid gap-3 sm:grid-cols-2">
          <InfoItem
            icon="confirmation_number"
            label="Giá vé"
            value={
              destination.ticketPrice
                ? formatPrice(destination.ticketPrice)
                : "Miễn phí"
            }
          />
          <InfoItem
            icon="map"
            label="Tỉnh/Thành phố"
            value={destination.location}
          />
          {destination.tags.length > 0 && (
            <InfoItem
              icon="sell"
              label="Loại hình"
              value={destination.tags.join(", ")}
            />
          )}
        </ul>
      </section>

      <section>
        <h4 className={sectionTitle}>Vị trí</h4>
        <div className="flex items-start gap-2.5 rounded-md bg-new-itinerary-bg p-5 text-new-paragraph">
          <span aria-hidden className="material-symbols-outlined text-new-teal">
            location_on
          </span>
          <div>
            <p className="font-bold text-new-title">
              {destination.address}, {destination.location}
            </p>
            {hasCoords && (
              <p className="mt-1 text-sm">
                Tọa độ: {destination.latitude}, {destination.longitude}
              </p>
            )}
          </div>
        </div>
      </section>

      <section>
        <h4 className={sectionTitle}>Lưu ý khi tham quan</h4>
        <ol className="list-decimal space-y-2 pl-5 text-new-paragraph">
          {TIPS.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ol>
      </section>

      {destination.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 border-t border-new-chip pt-5">
          <span className="font-bold text-new-title">Thẻ:</span>
          {destination.tags.map((t) => (
            <span
              key={t}
              className="rounded bg-new-chip px-3 py-1 text-sm text-new-title"
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
