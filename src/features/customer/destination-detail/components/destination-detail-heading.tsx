import { Rating, formatPrice } from "@/features/customer/components/cards/card-parts";
import type { DestinationDetail } from "../lib/to-destination-detail";

export function DestinationDetailHeading({
  destination,
}: {
  destination: DestinationDetail;
}) {
  const free = !destination.ticketPrice;
  return (
    <div className="flex flex-wrap justify-between gap-5 pt-10 pb-6">
      <div className="flex flex-col">
        <h2 className="text-2xl leading-[1.1] font-bold text-new-title lg:text-[40px]">
          {destination.name}
        </h2>
        <div className="mt-4 flex flex-wrap items-center gap-x-7 gap-y-3">
          <div className="flex items-center gap-2 text-new-teal">
            <span aria-hidden className="material-symbols-outlined">
              location_on
            </span>
            <div className="text-base font-bold lg:text-lg">
              {destination.address}, {destination.location}
            </div>
          </div>
          {destination.tags.length > 0 && (
            <>
              <div className="hidden h-5 w-px bg-new-paragraph/30 sm:block" />
              <ul className="flex flex-wrap gap-2">
                {destination.tags.map((t) => (
                  <li
                    key={t}
                    className="rounded bg-new-chip px-3 py-1 text-sm text-new-title"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-0.5">
        <div className="flex items-end gap-2.5">
          <p>Giá vé</p>
          <p className="text-2xl font-bold text-new-title">
            {free ? "Miễn phí" : formatPrice(destination.ticketPrice ?? 0)}
          </p>
          {!free && <p>/người</p>}
        </div>
        <Rating />
      </div>
    </div>
  );
}
