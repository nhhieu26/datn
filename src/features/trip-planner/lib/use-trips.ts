"use client";

import { useMemo, useSyncExternalStore } from "react";
import { parseTrips, readTripsRaw, subscribeTrips, type Trip } from "./storage";

/** Các lộ trình đã lưu; undefined khi đang render ở server (chưa đọc được localStorage). */
export function useTrips(): Record<string, Trip> | undefined {
  const raw = useSyncExternalStore(subscribeTrips, readTripsRaw, () => null);
  return useMemo(() => (raw == null ? undefined : parseTrips(raw)), [raw]);
}
