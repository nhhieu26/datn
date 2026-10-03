import { openingLabel, type RestaurantDetail } from "../lib/restaurant-detail";

export function RestaurantFeatures({
  restaurant,
}: {
  restaurant: RestaurantDetail;
}) {
  const items = [
    ...restaurant.tags.slice(0, 2).map((t) => ({ icon: "restaurant", label: t })),
    { icon: "group", label: `${restaurant.capacity} chỗ ngồi` },
    { icon: "schedule", label: openingLabel(restaurant.timeSlots) },
    ...(restaurant.phone ? [{ icon: "call", label: restaurant.phone }] : []),
  ].filter((i) => i.label);

  return (
    <div className="flex flex-wrap gap-x-9 gap-y-5 border-y border-new-chip py-6">
      {items.map((i) => (
        <div
          key={i.icon + i.label}
          className="flex flex-col items-center gap-2 text-new-paragraph"
        >
          <span aria-hidden className="material-symbols-outlined text-[32px]">
            {i.icon}
          </span>
          <p className="text-sm">{i.label}</p>
        </div>
      ))}
    </div>
  );
}
