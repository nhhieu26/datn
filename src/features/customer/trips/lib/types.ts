import type { RouteLeg } from "@/lib/osrm";

export type TripStopSource = "internal" | "external";
export type TripStopKind = "hotel" | "restaurant" | "destination";

export const MAX_TRIP_DAYS = 7;
export const MAX_STOPS_PER_DAY = 10;

/** Tham chiếu tới một địa điểm có thể thêm vào lộ trình. */
export type TripPlaceRef = {
  source: TripStopSource;
  kind: TripStopKind;
  refId: string;
};

/** Đường đi theo đường bộ của một ngày. */
export type TripDayRoute = {
  day: number;
  // Thứ tự id điểm dừng trên đường đi (khách sạn gốc ở đầu và cuối nếu có); legs[i] nối stopIds[i] → stopIds[i + 1]
  stopIds: string[];
  distanceM: number;
  durationS: number;
  // GeoJSON LineString: [longitude, latitude][]
  geometry: [number, number][];
  legs: RouteLeg[];
  // Không tính được đường đi (OSRM lỗi) — vẫn giữ điểm dừng, không vẽ đường chim bay
  error?: boolean;
};

export type TripMeal = "breakfast" | "lunch" | "dinner";

export type TripStopView = TripPlaceRef & {
  id: string;
  day: number;
  position: number;
  // Bữa ăn của quán (sáng đầu ngày, trưa giữa tuyến, tối cuối ngày); null = đặt theo khoảng cách
  meal: TripMeal | null;
  name: string;
  address: string | null;
  image: string | null;
  url: string;
  latitude: number;
  longitude: number;
};

export type TripDayView = {
  day: number;
  // Khách sạn xuất phát/kết thúc trong ngày (có thể thuộc ngày trước)
  baseHotel: TripStopView | null;
  stops: TripStopView[];
  route: TripDayRoute | null;
};

export type TripView = {
  id: string;
  title: string;
  province: string | null;
  dayCount: number;
  days: TripDayView[];
};
