// Logic thuần của lộ trình (dùng được cả client lẫn server): kiểu dữ liệu, quy tắc bữa ăn, tối ưu thứ tự.
import type { Place } from "@/features/customer/chat/lib/places";
import type { DurationMatrix, RouteLeg, TravelMode } from "@/lib/google-routes";

export type { TravelMode };
export type Slot = "hotel" | "breakfast" | "lunch" | "dinner" | "visit";
export type MealSlot = Exclude<Slot, "hotel" | "visit">;

export type StopInput = { placeId: string; slot: Slot; time: string; durationMin: number; note?: string };
export type DayInput = { date?: string; start: string; end: string; stops: StopInput[] };
export type ItineraryInput = { title: string; days: DayInput[] };

export type Stop = StopInput & { place: Place };
export type Leg = RouteLeg;
/** legs[i] là chặng từ stops[i] tới stops[i + 1]; null nếu không tìm được đường. */
export type Day = { date?: string; start: string; end: string; stops: Stop[]; legs: (Leg | null)[] };
export type Itinerary = { title: string; days: Day[] };

export const MEAL_WINDOWS: Record<MealSlot, { label: string; from: string; to: string }> = {
  breakfast: { label: "Bữa sáng", from: "06:00", to: "09:00" },
  lunch: { label: "Bữa trưa", from: "11:00", to: "13:30" },
  dinner: { label: "Bữa tối", from: "17:30", to: "20:30" },
};
const MEALS = Object.keys(MEAL_WINDOWS) as MealSlot[];
// Ngày phủ khung bữa ít nhất chừng này phút thì bắt buộc có bữa đó
const MEAL_REQUIRED_OVERLAP_MIN = 60;
// Hai bữa liền nhau phải cách nhau ít nhất chừng này phút
const MIN_MEAL_GAP_MIN = 150;
// Đến trễ mốc kế tiếp quá chừng này phút thì cảnh báo
const LATE_TOLERANCE_MIN = 15;
const MAX_BRUTE_FORCE = 7;

export const isMeal = (slot: Slot): slot is MealSlot => slot in MEAL_WINDOWS;

export function toMinutes(time: string): number {
  const m = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!m) return Number.NaN;
  return Number(m[1]) * 60 + Number(m[2]);
}

export function fromMinutes(minutes: number): string {
  const m = Math.max(0, Math.round(minutes / 5) * 5);
  return `${String(Math.floor(m / 60) % 24).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

const byTime = (a: { time: string }, b: { time: string }) => toMinutes(a.time) - toMinutes(b.time);

/**
 * Kiểm tra quy tắc bữa ăn của một ngày. Trả về danh sách lỗi (rỗng nếu hợp lệ).
 * - Mỗi khung bữa mà ngày phủ ≥60 phút thì phải có đúng 1 bữa trong khung đó → ngày trọn vẹn có 3 bữa,
 *   nửa ngày có 1–2 bữa.
 * - Bữa ăn phải là nhà hàng (bữa sáng được phép ăn tại khách sạn) và nằm trong khung giờ.
 * - Các bữa cách nhau ≥2,5 giờ, không dồn bữa để rút ngắn quãng đường.
 */
export function validateDay(day: { start: string; end: string; stops: Stop[] }, label: string): string[] {
  const issues: string[] = [];
  const start = toMinutes(day.start);
  const end = toMinutes(day.end);
  if (Number.isNaN(start) || Number.isNaN(end) || start >= end) {
    return [`${label}: giờ bắt đầu/kết thúc không hợp lệ (${day.start}–${day.end}).`];
  }

  for (const s of day.stops) {
    const t = toMinutes(s.time);
    if (Number.isNaN(t)) issues.push(`${label}: giờ "${s.time}" của ${s.place.name} không hợp lệ (dạng HH:mm).`);
    else if (t < start || t > end) {
      issues.push(`${label}: ${s.place.name} lúc ${s.time} nằm ngoài khung ngày ${day.start}–${day.end}.`);
    }
  }

  for (const meal of MEALS) {
    const w = MEAL_WINDOWS[meal];
    const from = toMinutes(w.from);
    const to = toMinutes(w.to);
    const stops = day.stops.filter((s) => s.slot === meal);
    const overlap = Math.min(end, to) - Math.max(start, from);

    if (overlap >= MEAL_REQUIRED_OVERLAP_MIN && stops.length === 0) {
      issues.push(`${label}: thiếu ${w.label.toLowerCase()} (${w.from}–${w.to}) vì ngày kéo dài ${day.start}–${day.end}.`);
    }
    if (stops.length > 1) issues.push(`${label}: có ${stops.length} ${w.label.toLowerCase()}, chỉ được 1.`);

    for (const s of stops) {
      const t = toMinutes(s.time);
      if (t < from || t > to) {
        issues.push(`${label}: ${w.label} tại ${s.place.name} lúc ${s.time} không nằm trong khung ${w.from}–${w.to}.`);
      }
      const okKind = s.place.kind === "restaurant" || (meal === "breakfast" && s.place.kind === "hotel");
      if (!okKind) issues.push(`${label}: ${w.label} phải ở nhà hàng, ${s.place.name} không phải nhà hàng.`);
    }
  }

  const meals = day.stops.filter((s) => isMeal(s.slot)).sort(byTime);
  for (let i = 1; i < meals.length; i++) {
    const gap = toMinutes(meals[i].time) - toMinutes(meals[i - 1].time);
    if (gap < MIN_MEAL_GAP_MIN) {
      issues.push(
        `${label}: ${meals[i - 1].place.name} (${meals[i - 1].time}) và ${meals[i].place.name} (${meals[i].time}) chỉ cách nhau ${gap} phút; hai bữa phải cách nhau ít nhất ${MIN_MEAL_GAP_MIN / 60} giờ.`,
      );
    }
  }

  return issues;
}

function permutations<T>(items: T[]): T[][] {
  if (items.length <= 1) return [items];
  return items.flatMap((item, i) =>
    permutations([...items.slice(0, i), ...items.slice(i + 1)]).map((rest) => [item, ...rest]),
  );
}

/** Thứ tự đi qua `visits` có tổng thời gian nhỏ nhất, từ `from` (nếu có) tới `to` (nếu có). */
function bestOrder(visits: number[], from: number | null, to: number | null, cost: (a: number, b: number) => number) {
  const total = (order: number[]) => {
    let sum = from != null ? cost(from, order[0]) : 0;
    for (let i = 1; i < order.length; i++) sum += cost(order[i - 1], order[i]);
    return sum + (to != null ? cost(order.at(-1)!, to) : 0);
  };

  if (visits.length <= MAX_BRUTE_FORCE) {
    return permutations(visits).reduce((best, o) => (total(o) < total(best) ? o : best));
  }

  // Nhiều điểm: láng giềng gần nhất rồi cải thiện bằng 2-opt
  const left = new Set(visits);
  const order: number[] = [];
  let current = from ?? visits[0];
  if (from == null) {
    left.delete(current);
    order.push(current);
  }
  while (left.size > 0) {
    const next = [...left].reduce((a, b) => (cost(current, b) < cost(current, a) ? b : a));
    left.delete(next);
    order.push(next);
    current = next;
  }
  let improved = true;
  while (improved) {
    improved = false;
    for (let i = 0; i < order.length - 1; i++) {
      for (let j = i + 1; j < order.length; j++) {
        const candidate = [...order.slice(0, i), ...order.slice(i, j + 1).reverse(), ...order.slice(j + 1)];
        if (total(candidate) < total(order)) {
          order.splice(0, order.length, ...candidate);
          improved = true;
        }
      }
    }
  }
  return order;
}

/**
 * Tối ưu thứ tự trong một ngày theo thời gian di chuyển thực tế (`matrix` theo chỉ số của `stops`).
 * Bữa ăn và khách sạn là mốc cố định theo giờ; chỉ các điểm tham quan giữa hai mốc liền nhau được
 * đổi thứ tự và tính lại giờ. Nhờ vậy các bữa ăn không bao giờ bị dồn lại để rút ngắn quãng đường.
 * `stops` phải đã sắp theo giờ.
 */
export function optimizeDay(stops: Stop[], matrix: DurationMatrix, label: string) {
  const warnings: string[] = [];
  const travelMin = (a: number, b: number) => {
    const s = matrix[a]?.[b];
    return s == null || !Number.isFinite(s) ? 24 * 60 : s / 60;
  };

  const anchors = stops.flatMap((s, i) => (s.slot === "visit" ? [] : [i]));
  const bounds = [null, ...anchors, null];
  const result: { index: number; time: string }[] = [];

  for (let k = 0; k < bounds.length - 1; k++) {
    const from = bounds[k];
    const to = bounds[k + 1];
    if (from != null) result.push({ index: from, time: stops[from].time });

    const lo = from ?? -1;
    const hi = to ?? stops.length;
    const visits = stops.flatMap((s, i) => (i > lo && i < hi ? [i] : []));
    if (visits.length === 0) continue;

    const order = bestOrder(visits, from, to, travelMin);
    let cursor =
      from != null
        ? toMinutes(stops[from].time) + stops[from].durationMin + travelMin(from, order[0])
        : Math.min(...visits.map((i) => toMinutes(stops[i].time)));

    order.forEach((i, n) => {
      result.push({ index: i, time: fromMinutes(cursor) });
      cursor += stops[i].durationMin + (n < order.length - 1 ? travelMin(i, order[n + 1]) : 0);
    });

    if (to != null) {
      const arrive = cursor + travelMin(order.at(-1)!, to);
      if (arrive > toMinutes(stops[to].time) + LATE_TOLERANCE_MIN) {
        warnings.push(
          `${label}: tham quan xong khoảng ${fromMinutes(arrive)} mới tới ${stops[to].place.name} (dự kiến ${stops[to].time}); nên bớt điểm hoặc rút ngắn thời gian tham quan.`,
        );
      }
    }
  }

  return { stops: result.map(({ index, time }) => ({ ...stops[index], time })), warnings };
}

export const sortStops = (stops: Stop[]) => [...stops].sort(byTime);

/** Bản rút gọn để đưa vào prompt (không có polyline, ảnh...). */
export function summarizeItinerary(it: Itinerary | null) {
  if (!it) return null;
  return {
    title: it.title,
    days: it.days.map((d, i) => ({
      day: i + 1,
      date: d.date,
      start: d.start,
      end: d.end,
      stops: d.stops.map((s, j) => ({
        placeId: s.placeId,
        name: s.place.name,
        kind: s.place.kind,
        slot: s.slot,
        time: s.time,
        durationMin: s.durationMin,
        note: s.note,
        nextLeg: d.legs[j]
          ? `${(d.legs[j].distanceM / 1000).toFixed(1)} km, ${Math.round(d.legs[j].durationS / 60)} phút`
          : undefined,
      })),
    })),
  };
}
