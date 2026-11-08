import type { TripDayView, TripMeal, TripStopView } from "./types";

export const MEALS = ["breakfast", "lunch", "dinner"] as const satisfies readonly TripMeal[];
export type Meal = TripMeal;

export type MealAnchor = { meal: Meal; latitude: number; longitude: number };

const midpoint = (a: TripStopView, b: TripStopView) => ({
  latitude: (a.latitude + b.latitude) / 2,
  longitude: (a.longitude + b.longitude) / 2,
});

const at = (s: TripStopView) => ({ latitude: s.latitude, longitude: s.longitude });

/**
 * Vị trí tìm quán cho từng bữa của một ngày, dựa trên thứ tự đi đã tối ưu:
 * sáng — điểm xuất phát (khách sạn hoặc điểm đầu); trưa — giữa tuyến; tối — điểm cuối hoặc khách sạn.
 */
export function mealAnchors(day: TripDayView, meals: readonly Meal[]): MealAnchor[] {
  const byId = new Map(day.stops.map((s) => [s.id, s]));
  const routeOrder = day.route?.error ? [] : (day.route?.stopIds ?? []);
  const ordered = routeOrder.length
    ? routeOrder.map((id) => byId.get(id)).filter((s): s is TripStopView => Boolean(s))
    : day.stops;
  const visits = ordered.filter((s) => s.kind !== "hotel");
  if (visits.length === 0) return [];

  const hotel = day.baseHotel;
  const anchors: MealAnchor[] = [];
  for (const meal of new Set(meals)) {
    if (meal === "breakfast") {
      anchors.push({ meal, ...at(hotel ?? visits[0]) });
    } else if (meal === "lunch") {
      const k = Math.ceil(visits.length / 2) - 1;
      const point = visits.length > 1 ? midpoint(visits[k], visits[k + 1]) : at(visits[0]);
      anchors.push({ meal, ...point });
    } else {
      anchors.push({ meal, ...at(hotel ?? visits[visits.length - 1]) });
    }
  }
  return anchors;
}

// Quán cách điểm neo xa hơn mức này thì không xếp vào bữa đó (lệch tuyến quá nhiều)
const MAX_RESTAURANT_DETOUR_KM = 25;

const distanceKm = (a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) => {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.latitude - a.latitude);
  const dLng = rad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
};

export type RestaurantToAssign<R> = {
  ref: R;
  name: string;
  latitude: number;
  longitude: number;
  // Bữa AI muốn dùng quán này (vd quán phở → sáng); bỏ trống → bữa nào cũng được
  meal?: Meal | null;
};

/**
 * Xếp quán ăn AI đã chọn vào các ô (ngày, bữa) của lộ trình đã tối ưu:
 * mỗi ô một quán, mỗi quán một ô, ghép tham lam theo cặp (quán, điểm neo của bữa) gần nhau nhất;
 * quán có `meal` chỉ vào ô cùng bữa, quán quá xa mọi ô còn trống thì bỏ qua.
 */
export function assignRestaurants<R>(
  days: TripDayView[],
  restaurants: RestaurantToAssign<R>[],
  meals: readonly Meal[],
): { picks: { day: number; meal: Meal; ref: R }[]; skipped: string[] } {
  const slots = days.flatMap((d) => mealAnchors(d, meals).map((a) => ({ day: d.day, ...a })));
  const pairs = restaurants.flatMap((r, ri) =>
    slots.flatMap((slot, si) => {
      if (r.meal && r.meal !== slot.meal) return [];
      const km = distanceKm(r, slot);
      return km <= MAX_RESTAURANT_DETOUR_KM ? [{ ri, si, km }] : [];
    }),
  );
  pairs.sort((a, b) => a.km - b.km);

  const usedRestaurants = new Set<number>();
  const usedSlots = new Set<number>();
  const picks: { day: number; meal: Meal; ref: R }[] = [];
  for (const { ri, si } of pairs) {
    if (usedRestaurants.has(ri) || usedSlots.has(si)) continue;
    usedRestaurants.add(ri);
    usedSlots.add(si);
    picks.push({ day: slots[si].day, meal: slots[si].meal, ref: restaurants[ri].ref });
  }
  const skipped = restaurants.filter((_, i) => !usedRestaurants.has(i)).map((r) => r.name);
  return { picks, skipped };
}
