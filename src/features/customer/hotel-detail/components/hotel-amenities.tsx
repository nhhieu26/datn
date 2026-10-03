import { amenityIcon } from "../lib/amenity-icon";

export function HotelAmenities({ amenities }: { amenities: string[] }) {
  if (amenities.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-x-9 gap-y-5 border-y border-new-chip py-6">
      {amenities.map((a) => (
        <div
          key={a}
          className="flex flex-col items-center gap-2 text-new-paragraph"
        >
          <span aria-hidden className="material-symbols-outlined text-[32px]">
            {amenityIcon(a)}
          </span>
          <p className="text-sm">{a}</p>
        </div>
      ))}
    </div>
  );
}
