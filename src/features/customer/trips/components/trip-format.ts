import type { RouteLeg } from "@/lib/osrm";
import type { TripDayView, TripMeal, TripStopKind, TripStopView } from "../lib/types";

export const KIND_LABEL: Record<TripStopKind, string> = {
  hotel: "Khách sạn",
  restaurant: "Nhà hàng",
  destination: "Điểm tham quan",
};

export const MEAL_LABEL: Record<TripMeal, string> = {
  breakfast: "Bữa sáng",
  lunch: "Bữa trưa",
  dinner: "Bữa tối",
};

// Màu đường đi của từng ngày trên bản đồ (ngày 1 giữ màu teal chủ đạo)
const DAY_COLORS = ["#017b6e", "#2563eb", "#9333ea", "#d97706", "#db2777", "#0891b2", "#65a30d"];
export const dayColor = (day: number) => DAY_COLORS[(day - 1) % DAY_COLORS.length];

export function formatDuration(seconds: number): string {
  const totalMinutes = Math.max(1, Math.round(seconds / 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} phút`;
  return minutes ? `${hours} giờ ${minutes} phút` : `${hours} giờ`;
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} km`;
}

export type SequenceItem = {
  stop: TripStopView;
  // "H" cho khách sạn gốc, số thứ tự cho các điểm dừng khác
  label: string;
  role: "start" | "stop" | "end";
  // Chặng di chuyển từ điểm trước tới điểm này (theo đường bộ)
  legBefore: RouteLeg | null;
};

/** Thứ tự hiển thị của một ngày: theo đường đi đã tối ưu, hoặc theo vị trí nếu chưa tính được đường. */
export function daySequence(day: TripDayView): SequenceItem[] {
  const base = day.baseHotel;
  const byId = new Map<string, TripStopView>(
    [...day.stops, ...(base ? [base] : [])].map((s) => [s.id, s]),
  );
  const route = day.route && !day.route.error && day.route.stopIds.length > 1 ? day.route : null;

  let ids: string[];
  if (route) {
    ids = route.stopIds;
  } else {
    const others = day.stops.filter((s) => s.id !== base?.id).map((s) => s.id);
    ids = base ? (others.length ? [base.id, ...others, base.id] : [base.id]) : others;
  }

  let counter = 0;
  const items: SequenceItem[] = [];
  ids.forEach((id, i) => {
    const stop = byId.get(id);
    if (!stop) return;
    const isBase = base?.id === id;
    items.push({
      stop,
      label: isBase ? "H" : String(++counter),
      role: isBase ? (i === 0 ? "start" : "end") : "stop",
      legBefore: route && i > 0 ? (route.legs[i - 1] ?? null) : null,
    });
  });
  return items;
}
