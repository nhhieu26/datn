import { getPlacesByIds } from "@/features/customer/chat/lib/places";
import { computeDurationMatrix, computeLegs } from "@/lib/google-routes";
import {
  type Day,
  type Itinerary,
  type ItineraryInput,
  optimizeDay,
  type Stop,
  sortStops,
  type TravelMode,
  validateDay,
} from "./itinerary";

const MAX_STOPS_PER_DAY = 25;

export type BuildResult =
  | { status: "ok"; itinerary: Itinerary; warnings: string[] }
  | { status: "invalid"; issues: string[] };

/**
 * Dựng lộ trình từ danh sách placeId: đọc tọa độ trong DB, kiểm tra quy tắc bữa ăn,
 * tối ưu thứ tự điểm tham quan và tính các chặng theo đường đi thực tế.
 * `strict`: vi phạm quy tắc → trả "invalid" (dùng cho AI để tự sửa); ngược lại chỉ cảnh báo
 * (dùng khi người dùng tự xóa điểm trên giao diện).
 */
export async function buildItinerary(
  input: ItineraryInput,
  mode: TravelMode,
  { strict, optimize = true }: { strict: boolean; optimize?: boolean },
): Promise<BuildResult> {
  const places = await getPlacesByIds(input.days.flatMap((d) => d.stops.map((s) => s.placeId)));
  const issues: string[] = [];

  const days = input.days.map((d, i) => {
    const label = `Ngày ${i + 1}`;
    if (d.stops.length > MAX_STOPS_PER_DAY) issues.push(`${label}: tối đa ${MAX_STOPS_PER_DAY} điểm dừng.`);
    const stops: Stop[] = [];
    for (const s of d.stops) {
      const place = places.get(s.placeId);
      if (place) stops.push({ ...s, place });
      else issues.push(`${label}: placeId "${s.placeId}" không tồn tại; chỉ dùng id từ kết quả tìm kiếm.`);
    }
    const day = { ...d, stops: sortStops(stops) };
    issues.push(...validateDay(day, label));
    return day;
  });

  if (strict && issues.length > 0) return { status: "invalid", issues };
  const warnings = strict ? [] : [...issues];

  const built = await Promise.all(
    days.map(async (day, i): Promise<Day> => {
      const label = `Ngày ${i + 1}`;
      let stops = day.stops;
      const points = () => stops.map((s) => ({ lat: s.place.lat, lng: s.place.lng }));

      if (optimize && stops.length > 2) {
        try {
          const matrix = await computeDurationMatrix(points(), mode);
          const optimized = optimizeDay(stops, matrix, label);
          stops = optimized.stops;
          warnings.push(...optimized.warnings);
        } catch (error) {
          console.error("computeDurationMatrix:", error);
          warnings.push(`${label}: chưa tối ưu được thứ tự do lỗi dịch vụ chỉ đường.`);
        }
      }

      let legs: Day["legs"] = [];
      try {
        legs = await computeLegs(points(), mode);
      } catch (error) {
        console.error("computeLegs:", error);
        warnings.push(`${label}: chưa tính được quãng đường (${error instanceof Error ? error.message : "lỗi"}).`);
      }
      return { ...day, stops, legs };
    }),
  );

  return { status: "ok", itinerary: { title: input.title, days: built }, warnings };
}
