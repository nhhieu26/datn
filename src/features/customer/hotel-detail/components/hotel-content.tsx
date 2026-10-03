import Image from "next/image";
import { formatPrice } from "@/features/customer/components/cards/card-parts";
import { amenityIcon } from "../lib/amenity-icon";
import type { HotelDetail, HotelRoom } from "../lib/to-hotel-detail";

// ponytail: chưa có trường chính sách trong DB nên dùng nội dung chung cho mọi khách sạn
const POLICIES = [
  "Nhận phòng từ 14:00, trả phòng trước 12:00.",
  "Hủy miễn phí trước ngày nhận phòng 24 giờ; sau thời điểm này phí hủy theo quy định của khách sạn.",
  "Không hút thuốc trong phòng; mang theo giấy tờ tùy thân khi nhận phòng.",
];

const sectionTitle = "mb-4 text-2xl font-bold text-new-title";

function RoomCard({ room }: { room: HotelRoom }) {
  return (
    <article className="rounded-md border border-new-chip p-4">
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {room.images.slice(0, 4).map((img, i) => (
          <div
            key={`${img.url}-${i}`}
            className="relative aspect-[4/3] overflow-hidden rounded"
          >
            <Image
              alt={`${room.name} ${i + 1}`}
              className="object-cover"
              fill
              sizes="(min-width: 1024px) 160px, 50vw"
              src={img.url}
            />
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h5 className="text-xl font-bold text-new-title">{room.name}</h5>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-new-title">
            <span className="flex items-center gap-1.5">
              <span aria-hidden className="material-symbols-outlined text-lg">
                group
              </span>
              {room.capacity} khách
            </span>
            <span className="flex items-center gap-1.5">
              <span aria-hidden className="material-symbols-outlined text-lg">
                meeting_room
              </span>
              Còn {room.quantity} phòng
            </span>
          </div>
          {room.description && (
            <p className="mt-3 leading-7 whitespace-pre-line text-new-paragraph">
              {room.description}
            </p>
          )}
          {room.amenities.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {room.amenities.map((a) => (
                <li
                  key={a}
                  className="flex items-center gap-1.5 rounded bg-new-chip px-3 py-1 text-sm text-new-title"
                >
                  <span aria-hidden className="material-symbols-outlined text-base">
                    {amenityIcon(a)}
                  </span>
                  {a}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex flex-col items-end gap-3">
          <p className="text-new-paragraph">
            <span className="text-2xl font-bold text-new-title">
              {formatPrice(room.basePrice)}
            </span>{" "}
            /đêm
          </p>
          <button
            className="cursor-pointer rounded bg-new-teal px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-new-teal-hover"
            type="button"
          >
            Chọn phòng
          </button>
        </div>
      </div>
    </article>
  );
}

export function HotelContent({ hotel }: { hotel: HotelDetail }) {
  const hasCoords = hotel.latitude != null && hotel.longitude != null;
  return (
    <div className="flex flex-col gap-8">
      <section>
        <h4 className={sectionTitle}>Giới thiệu</h4>
        <p className="leading-7 whitespace-pre-line text-new-paragraph">
          {hotel.description || "Chưa có mô tả cho khách sạn này."}
        </p>
      </section>

      <section className="rounded-md border border-new-chip p-[30px]">
        <h4 className={sectionTitle}>Tiện ích</h4>
        <ul className="grid gap-3 sm:grid-cols-2">
          {hotel.amenities.length === 0 && (
            <li className="text-new-muted">Không có</li>
          )}
          {hotel.amenities.map((a) => (
            <li key={a} className="flex items-start gap-2.5 text-new-paragraph">
              <span
                aria-hidden
                className="material-symbols-outlined text-xl text-new-teal"
              >
                check_circle
              </span>
              {a}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h4 className={sectionTitle}>Các loại phòng</h4>
        <div className="flex flex-col gap-5">
          {hotel.rooms.length === 0 && (
            <p className="text-new-muted">Chưa có phòng nào đang mở bán.</p>
          )}
          {hotel.rooms.map((r) => (
            <RoomCard key={r.id} room={r} />
          ))}
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
              {hotel.address}, {hotel.location}
            </p>
            {hasCoords && (
              <p className="mt-1 text-sm">
                Tọa độ: {hotel.latitude}, {hotel.longitude}
              </p>
            )}
          </div>
        </div>
      </section>

      <section>
        <h4 className={sectionTitle}>Chính sách</h4>
        <ol className="list-decimal space-y-2 pl-5 text-new-paragraph">
          {POLICIES.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ol>
      </section>

      {hotel.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 border-t border-new-chip pt-5">
          <span className="font-bold text-new-title">Thẻ:</span>
          {hotel.tags.map((t) => (
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
