import Link from "next/link";
import { formatPrice } from "@/features/customer/components/cards/card-parts";
import type { DestinationDetail } from "../lib/to-destination-detail";

const cta =
  "flex w-full items-center justify-center gap-2 rounded px-7 py-3.5 font-bold transition-colors";

export function DestinationInfoCard({
  destination,
}: {
  destination: DestinationDetail;
}) {
  const { latitude, longitude, location } = destination;
  const mapUrl =
    latitude != null && longitude != null
      ? `https://www.google.com/maps?q=${latitude},${longitude}`
      : null;
  const q = encodeURIComponent(location);

  return (
    <div className="sticky top-4 rounded-lg bg-new-chip p-6">
      <div className="flex flex-col gap-0.5 border-b border-new-paragraph/30 pb-6">
        <p>Giá vé tham quan</p>
        <p className="text-2xl font-bold text-new-title">
          {destination.ticketPrice
            ? formatPrice(destination.ticketPrice)
            : "Miễn phí"}
        </p>
      </div>

      <div className="flex items-start gap-3 py-6 text-new-title">
        <span aria-hidden className="material-symbols-outlined text-new-teal">
          location_on
        </span>
        <p>
          {destination.address}, {location}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {mapUrl && (
          <a
            className={`${cta} bg-new-teal text-white hover:bg-new-teal-hover`}
            href={mapUrl}
            rel="noreferrer"
            target="_blank"
          >
            <span aria-hidden className="material-symbols-outlined">
              map
            </span>
            Xem bản đồ
          </a>
        )}
        <Link
          className={`${cta} border border-new-teal text-new-teal hover:bg-white`}
          href={`/explore?kind=tour&province=${q}`}
        >
          Khám phá tour tại {location}
        </Link>
        <Link
          className={`${cta} border border-new-teal text-new-teal hover:bg-white`}
          href={`/explore?kind=hotel&province=${q}`}
        >
          Tìm khách sạn tại {location}
        </Link>
      </div>
    </div>
  );
}
