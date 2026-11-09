// Lưu lộ trình trong localStorage của trình duyệt (không cần đăng nhập).
import type { Itinerary, TravelMode } from "./itinerary";
import type { TripChatMessage } from "./tools";

export type Trip = {
  id: string;
  title: string;
  mode: TravelMode;
  itinerary: Itinerary | null;
  messages: TripChatMessage[];
  /** toolCallId của lần setItinerary đã áp dụng, để không ghi đè các chỉnh sửa tay sau đó. */
  appliedToolCallId?: string;
  warnings?: string[];
  createdAt: number;
  updatedAt: number;
};

const TRIPS_KEY = "roamly:trips";
const PENDING_KEY = "roamly:trip-pending-prompt";
const CHANGE_EVENT = "roamly:trips-change";

/** Chuỗi JSON thô (so sánh được bằng ===, dùng làm snapshot cho useSyncExternalStore). */
export function readTripsRaw(): string {
  try {
    return localStorage.getItem(TRIPS_KEY) ?? "";
  } catch {
    return "";
  }
}

export function parseTrips(raw: string): Record<string, Trip> {
  try {
    const data = raw ? (JSON.parse(raw) as unknown) : null;
    return data && typeof data === "object" ? (data as Record<string, Trip>) : {};
  } catch {
    return {};
  }
}

/** Theo dõi thay đổi ở tab này (sự kiện tự phát) và ở tab khác (sự kiện storage). */
export function subscribeTrips(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

const readAll = () => parseTrips(readTripsRaw());

function writeAll(trips: Record<string, Trip>): boolean {
  try {
    localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
    window.dispatchEvent(new Event(CHANGE_EVENT));
    return true;
  } catch {
    return false;
  }
}

export function saveTrip(trip: Trip): boolean {
  const trips = readAll();
  trips[trip.id] = { ...trip, updatedAt: Date.now() };
  return writeAll(trips);
}

export function deleteTrip(id: string) {
  const trips = readAll();
  delete trips[id];
  writeAll(trips);
}

export function createTrip(): Trip {
  const now = Date.now();
  const trip: Trip = {
    id: crypto.randomUUID().slice(0, 8),
    title: "Lộ trình mới",
    mode: "car",
    itinerary: null,
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
  saveTrip(trip);
  return trip;
}

/** Câu hỏi chuyển từ trang khác sang, trang lộ trình sẽ tự gửi khi mở. */
export function setPendingPrompt(tripId: string, prompt: string) {
  try {
    sessionStorage.setItem(PENDING_KEY, JSON.stringify({ tripId, prompt }));
  } catch {
    // Bỏ qua: người dùng sẽ tự nhập lại
  }
}

export function takePendingPrompt(tripId: string): string | null {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as { tripId?: string; prompt?: string };
    if (data.tripId !== tripId || !data.prompt) return null;
    sessionStorage.removeItem(PENDING_KEY);
    return data.prompt;
  } catch {
    return null;
  }
}
