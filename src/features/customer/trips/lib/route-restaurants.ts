import {
  mentionsFood,
  type NearbyRestaurant,
  searchRestaurantCandidatesNear,
} from "@/features/customer/chat/lib/external-places";
import { normalizeFoodCategory } from "@/features/customer/chat/lib/food-categories";
import { timed } from "@/lib/timing";
import { type Meal, mealAnchors } from "./meal-stops";
import type { TripDayView, TripView } from "./types";

// Ít hơn số quán nhắc đúng món này thì mới tìm thêm theo loại (tốn thêm 1 lượt gọi API)
const MIN_FOOD_MATCHES = 3;

/**
 * Quán ăn quanh một điểm trên tuyến đường (Google Places API, có cache), theo thứ tự ưu tiên:
 * 1. quán tên/danh mục nhắc đúng món `keyword` (vd "lẩu") — tìm thường;
 * 2. nếu nhóm 1 ít hơn MIN_FOOD_MATCHES: thêm quán Google gắn đúng loại `category` (vd "hot pot restaurant"
 *    → mã loại "hot_pot_restaurant"; loại Google không có thì tìm không lọc);
 * 3. còn ít hơn MIN_FOOD_MATCHES quán (hoặc không nêu món) mới bù quán ăn khác quanh đó.
 */
export async function restaurantsNearAnchor({
  latitude,
  longitude,
  keyword,
  category,
  limit,
  excludeIds = [],
  label = "  quán",
}: {
  latitude: number;
  longitude: number;
  keyword?: string;
  // Loại quán Google Maps tiếng Anh; loại không hợp lệ bị bỏ qua (xem normalizeFoodCategory)
  category?: string | null;
  limit: number;
  excludeIds?: string[];
  label?: string;
}): Promise<NearbyRestaurant[]> {
  const near = { latitude, longitude, limit, excludeIds };
  const term = keyword?.trim();
  const type = normalizeFoodCategory(category);
  const found: NearbyRestaurant[] = [];
  const add = (places: NearbyRestaurant[]) => {
    for (const place of places) {
      if (found.length >= limit) break;
      if (!found.some((p) => p.id === place.id)) found.push(place);
    }
  };
  const byKeyword = term
    ? await timed(`${label}: Google "${term}"`, () => searchRestaurantCandidatesNear({ ...near, keyword: term }), (r) => `${r.length} quán`)
    : [];
  add(byKeyword.filter((p) => mentionsFood(p, term)));
  if (type && found.length < MIN_FOOD_MATCHES) {
    add(await timed(`${label}: Google loại "${type}"`, () => searchRestaurantCandidatesNear({ ...near, keyword: term, category: type }), (r) => `${r.length} quán`));
  }
  // Có nêu món: chỉ bù quán không nhắc đúng món khi còn quá ít (thà ít gợi ý còn hơn gợi ý sai món)
  const enough = term ? MIN_FOOD_MATCHES : limit - 1;
  if (found.length < enough) add(byKeyword);
  if (found.length < enough) {
    add(await timed(`${label}: Google "nha hang"`, () => searchRestaurantCandidatesNear(near), (r) => `${r.length} quán`));
  }
  return found;
}

/**
 * Quán ứng viên cho từng bữa của một ngày, tìm quanh các điểm neo trên tuyến đã tối ưu
 * (sáng: điểm xuất phát; trưa: giữa tuyến; tối: điểm cuối/khách sạn — xem mealAnchors).
 */
export async function restaurantOptionsForDay(
  day: TripDayView,
  meals: readonly Meal[],
  {
    keyword,
    category,
    limit,
    excludeIds = [],
  }: { keyword?: string; category?: string | null; limit: number; excludeIds?: string[] },
): Promise<{ day: number; meal: Meal; options: NearbyRestaurant[] }[]> {
  // Song song theo bữa: Google Places xử lý các request đồng thời
  const settled = await Promise.all(
    mealAnchors(day, meals).map(async (anchor) => {
      try {
        const options = await restaurantsNearAnchor({
          latitude: anchor.latitude,
          longitude: anchor.longitude,
          keyword,
          category,
          limit,
          excludeIds,
          label: `  quán ngày ${day.day} ${anchor.meal}`,
        });
        return { day: day.day, meal: anchor.meal, options };
      } catch (error) {
        console.warn(`Không tìm được quán ăn (${anchor.meal}) ngày ${day.day}:`, error);
        return null;
      }
    }),
  );
  return settled.filter((r): r is NonNullable<typeof r> => r != null);
}

/** Quán ứng viên cho từng (ngày, bữa) của cả lộ trình — dùng khi tạo lộ trình. */
export async function restaurantOptionsForTrip(
  view: TripView,
  meals: readonly Meal[],
  { keyword, category, limit }: { keyword?: string; category?: string | null; limit: number },
) {
  const result: Awaited<ReturnType<typeof restaurantOptionsForDay>> = [];
  for (const day of view.days) result.push(...(await restaurantOptionsForDay(day, meals, { keyword, category, limit })));
  return result;
}
