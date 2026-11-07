import type { Prisma } from "@/generated/prisma/client";
import { firstImage } from "@/features/customer/components/cards/card-parts";
import { getExternalPlaceById } from "@/features/customer/chat/lib/external-places";
import { num } from "@/features/customer/chat/lib/format";
import { liveService } from "@/features/customer/chat/lib/internal-places";
import { getRoadRoute, getRouteMatrix } from "@/lib/osrm";
import { prisma } from "@/lib/prisma";
import { ConflictError, ForbiddenError, NotFoundError } from "@/shared/lib/errors";
import { optimizeOrder } from "./optimize";
import {
  MAX_STOPS_PER_DAY,
  MAX_TRIP_DAYS,
  type TripDayRoute,
  type TripPlaceRef,
  type TripStopView,
  type TripView,
} from "./types";

type PlaceSnapshot = TripPlaceRef & {
  name: string;
  address: string | null;
  image: string | null;
  url: string;
  latitude: number;
  longitude: number;
};

const clampDays = (days: number) => Math.min(MAX_TRIP_DAYS, Math.max(1, Math.round(days)));

// ---------- Đọc địa điểm nguồn ----------

/** Lấy thông tin địa điểm từ CSDL (không tin tọa độ do client/AI gửi lên). */
export async function resolvePlace(ref: TripPlaceRef): Promise<PlaceSnapshot | null> {
  if (ref.source === "external") {
    const place = await getExternalPlaceById(ref.refId);
    if (!place) return null;
    return {
      source: "external",
      kind: place.kind,
      refId: place.id,
      name: place.name,
      address: place.address || null,
      image: null,
      url: place.url,
      latitude: place.latitude,
      longitude: place.longitude,
    };
  }

  const select = {
    id: true,
    name: true,
    slug: true,
    address: true,
    images: true,
    latitude: true,
    longitude: true,
  } as const;
  const row =
    ref.kind === "hotel"
      ? await prisma.hotel.findFirst({ where: { id: ref.refId, ...liveService }, select })
      : ref.kind === "restaurant"
        ? await prisma.restaurant.findFirst({ where: { id: ref.refId, ...liveService }, select })
        : await prisma.destination.findFirst({ where: { id: ref.refId, isPublished: true }, select });
  if (!row) return null;

  const latitude = num(row.latitude);
  const longitude = num(row.longitude);
  if (latitude == null || longitude == null) return null;
  const path = { hotel: "hotels", restaurant: "restaurants", destination: "destinations" }[ref.kind];
  return {
    source: "internal",
    kind: ref.kind,
    refId: row.id,
    name: row.name,
    address: row.address,
    image: firstImage(row.images),
    url: `/${path}/${row.slug}`,
    latitude,
    longitude,
  };
}

// ---------- Đọc lộ trình ----------

async function loadTrip(tripId: string) {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: { stops: { orderBy: [{ day: "asc" }, { position: "asc" }, { createdAt: "asc" }] } },
  });
  if (!trip) throw new NotFoundError("Không tìm thấy lộ trình.");
  return trip;
}

type TripRow = Awaited<ReturnType<typeof loadTrip>>;

function toStopView(row: TripRow["stops"][number]): TripStopView {
  return {
    id: row.id,
    day: row.day,
    position: row.position,
    source: row.source,
    kind: row.kind,
    refId: row.refId,
    name: row.name,
    address: row.address,
    image: row.image,
    url: row.url,
    latitude: num(row.latitude)!,
    longitude: num(row.longitude)!,
  };
}

function parseRoutes(raw: Prisma.JsonValue): TripDayRoute[] {
  return Array.isArray(raw) ? (raw as unknown as TripDayRoute[]) : [];
}

// Khách sạn gốc của ngày: khách sạn trong ngày, nếu không có thì khách sạn ở ngày gần nhất trước đó
function baseHotelFor(stops: TripStopView[], day: number): TripStopView | null {
  const own = stops.find((s) => s.day === day && s.kind === "hotel");
  if (own) return own;
  const earlier = stops
    .filter((s) => s.kind === "hotel" && s.day < day)
    .sort((a, b) => b.day - a.day || a.position - b.position);
  return earlier[0] ?? null;
}

function toView(trip: TripRow): TripView {
  const stops = trip.stops.map(toStopView);
  const routes = parseRoutes(trip.routes);
  return {
    id: trip.id,
    title: trip.title,
    province: trip.province,
    dayCount: trip.dayCount,
    days: Array.from({ length: trip.dayCount }, (_, i) => {
      const day = i + 1;
      return {
        day,
        baseHotel: baseHotelFor(stops, day),
        stops: stops.filter((s) => s.day === day).sort((a, b) => a.position - b.position),
        route: routes.find((r) => r.day === day) ?? null,
      };
    }),
  };
}

export async function getTrip(tripId: string): Promise<{ view: TripView; ownerId: string | null } | null> {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: { stops: { orderBy: [{ day: "asc" }, { position: "asc" }, { createdAt: "asc" }] } },
  });
  return trip ? { view: toView(trip), ownerId: trip.userId } : null;
}

export async function getTripView(tripId: string): Promise<TripView> {
  return toView(await loadTrip(tripId));
}

// ---------- Quyền sửa ----------

export const canEditTrip = (ownerId: string | null, userId?: string | null) =>
  !ownerId || ownerId === userId;

export async function assertCanEditTrip(tripId: string, userId?: string | null) {
  const trip = await prisma.trip.findUnique({ where: { id: tripId }, select: { userId: true } });
  if (!trip) throw new NotFoundError("Không tìm thấy lộ trình.");
  if (!canEditTrip(trip.userId, userId)) {
    throw new ForbiddenError("Chỉ chủ sở hữu mới được chỉnh sửa lộ trình này.");
  }
}

// ---------- Đường đi theo đường bộ ----------

type RecomputeOptions = {
  // true: tự sắp lại thứ tự tối ưu (chỉ khi AI tạo/thêm điểm); false: giữ thứ tự người dùng
  optimize?: boolean;
};

async function planDay(
  stops: TripStopView[],
  day: number,
  optimize: boolean,
): Promise<{ positions: [string, number][]; route: TripDayRoute | null }> {
  const base = baseHotelFor(stops, day);
  const others = stops
    .filter((s) => s.day === day && s.id !== base?.id)
    .sort((a, b) => a.position - b.position);
  const baseInDay = base?.day === day;
  const current = [...(baseInDay && base ? [base] : []), ...others];
  const keepOrder = () => current.map((s, i) => [s.id, i] as [string, number]);

  const points = base ? [base, ...others] : others;
  if (others.length === 0 || points.length < 2) return { positions: keepOrder(), route: null };

  try {
    let sequence = points;
    if (optimize) {
      const matrix = await getRouteMatrix(points);
      // Có khách sạn: xuất phát và quay về khách sạn; không có: đường mở, tự chọn điểm đầu
      const order = optimizeOrder(matrix.durations, base ? { start: 0, roundTrip: true } : {});
      sequence = order.map((i) => points[i]);
    }
    const path = base ? [...sequence, base] : sequence;
    const road = await getRoadRoute(path);
    return {
      positions: sequence.filter((s) => s.day === day).map((s, i) => [s.id, i]),
      route: { day, stopIds: path.map((s) => s.id), ...road },
    };
  } catch (error) {
    // Không có dữ liệu đường bộ → giữ thứ tự hiện tại, không thay bằng đường chim bay
    console.warn(`Không tính được đường đi ngày ${day}:`, error);
    return {
      positions: keepOrder(),
      route: { day, stopIds: [], distanceM: 0, durationS: 0, geometry: [], legs: [], error: true },
    };
  }
}

async function recomputeDays(tripId: string, days: number[], { optimize = false }: RecomputeOptions = {}) {
  const trip = await loadTrip(tripId);
  const stops = trip.stops.map(toStopView);
  const targetDays = [...new Set(days)].filter((d) => d >= 1 && d <= trip.dayCount).sort((a, b) => a - b);
  let routes = parseRoutes(trip.routes).filter((r) => r.day <= trip.dayCount);
  const positions: [string, number][] = [];

  // Tuần tự để không dồn request lên máy chủ OSRM
  for (const day of targetDays) {
    const plan = await planDay(stops, day, optimize);
    positions.push(...plan.positions);
    routes = routes.filter((r) => r.day !== day);
    if (plan.route) routes.push(plan.route);
  }

  await prisma.$transaction([
    ...positions.map(([id, position]) =>
      prisma.tripStop.update({ where: { id }, data: { position } }),
    ),
    prisma.trip.update({
      where: { id: tripId },
      data: { routes: routes.sort((a, b) => a.day - b.day) as unknown as Prisma.InputJsonValue },
    }),
  ]);
}

// Đổi khách sạn ảnh hưởng điểm xuất phát của các ngày sau
const affectedDays = (day: number, kind: string, dayCount: number) =>
  kind === "hotel" ? Array.from({ length: dayCount - day + 1 }, (_, i) => day + i) : [day];

/** Tính lại đường đi toàn bộ lộ trình, giữ nguyên thứ tự (nút "Thử lại" khi chưa tính được đường đi). */
export async function recomputeTripRoutes(tripId: string): Promise<TripView> {
  const trip = await loadTrip(tripId);
  await recomputeDays(tripId, Array.from({ length: trip.dayCount }, (_, i) => i + 1));
  return getTripView(tripId);
}

/** Tối ưu thứ tự các ngày theo thời gian di chuyển đường bộ (AI gọi khi được yêu cầu). */
export async function optimizeDays(tripId: string, days: number[]): Promise<TripView> {
  await recomputeDays(tripId, days, { optimize: true });
  return getTripView(tripId);
}

// ---------- Tạo & chỉnh sửa ----------

/**
 * Tạo lộ trình từ danh sách địa điểm (AI gợi ý): 1 khách sạn làm gốc, các điểm còn lại
 * được sắp theo vòng tối ưu rồi cắt thành từng ngày liên tiếp (điểm gần nhau cùng ngày), sau đó tối ưu từng ngày.
 */
export async function createTripFromPlaces({
  title,
  province,
  days,
  places,
  userId,
}: {
  title: string;
  province?: string | null;
  days: number;
  places: TripPlaceRef[];
  userId?: string | null;
}): Promise<TripView> {
  const dayCount = clampDays(days);
  const seen = new Set<string>();
  const resolved = (await Promise.all(places.map(resolvePlace))).filter(
    (p): p is PlaceSnapshot => {
      if (!p || seen.has(`${p.source}:${p.refId}`)) return false;
      seen.add(`${p.source}:${p.refId}`);
      return true;
    },
  );

  const hotel = resolved.find((p) => p.kind === "hotel") ?? null;
  const others = resolved.filter((p) => p.kind !== "hotel").slice(0, dayCount * MAX_STOPS_PER_DAY);

  let ordered = others;
  if (dayCount > 1 && others.length > 1) {
    const points = hotel ? [hotel, ...others] : others;
    try {
      const matrix = await getRouteMatrix(points);
      const order = optimizeOrder(matrix.durations, hotel ? { start: 0, roundTrip: true } : {});
      ordered = order.map((i) => points[i]).filter((p) => p !== hotel);
    } catch (error) {
      console.warn("Không chia được ngày theo đường bộ, giữ thứ tự gợi ý:", error);
    }
  }

  const toStop = (p: PlaceSnapshot, day: number, position: number) => ({
    day,
    position,
    source: p.source,
    kind: p.kind,
    refId: p.refId,
    name: p.name,
    address: p.address,
    image: p.image,
    url: p.url,
    latitude: p.latitude,
    longitude: p.longitude,
  });

  const trip = await prisma.trip.create({
    data: {
      title: title.trim().slice(0, 120) || "Lộ trình của tôi",
      province: province?.trim() || null,
      dayCount,
      userId: userId ?? null,
      stops: {
        create: [
          ...(hotel ? [toStop(hotel, 1, 0)] : []),
          ...ordered.map((p, i) => toStop(p, Math.floor((i * dayCount) / ordered.length) + 1, i + 1)),
        ],
      },
    },
    select: { id: true },
  });

  await recomputeDays(trip.id, Array.from({ length: dayCount }, (_, i) => i + 1), { optimize: true });
  return getTripView(trip.id);
}

/** Tạo lộ trình trống (người dùng tự chọn điểm dừng). */
export async function createEmptyTrip(userId?: string | null): Promise<string> {
  const trip = await prisma.trip.create({
    data: { title: "Lộ trình của tôi", userId: userId ?? null },
    select: { id: true },
  });
  return trip.id;
}

const nextPositionInDay = (stops: { day: number; position: number }[], day: number) =>
  stops.filter((s) => s.day === day).reduce((max, s) => Math.max(max, s.position), -1) + 1;

/**
 * Chèn điểm dừng (AI thêm) vào cuối ngày `day`, KHÔNG tính lại đường đi —
 * bên gọi tự tối ưu lại lộ trình sau khi thêm xong (xem `optimizeDays`).
 */
export async function insertStop(
  tripId: string,
  ref: TripPlaceRef,
  day: number,
): Promise<{ name: string; day: number }> {
  const trip = await loadTrip(tripId);
  const targetDay = Math.min(Math.max(1, Math.round(day)), trip.dayCount);
  if (trip.stops.filter((s) => s.day === targetDay).length >= MAX_STOPS_PER_DAY) {
    throw new ConflictError(`Mỗi ngày tối đa ${MAX_STOPS_PER_DAY} điểm dừng.`);
  }

  const place = await resolvePlace(ref);
  if (!place) throw new NotFoundError("Không tìm thấy địa điểm này.");
  if (trip.stops.some((s) => s.source === place.source && s.refId === place.refId)) {
    throw new ConflictError(`"${place.name}" đã có trong lộ trình.`);
  }

  await prisma.tripStop.create({
    data: {
      tripId,
      day: targetDay,
      position: nextPositionInDay(trip.stops, targetDay),
      source: place.source,
      kind: place.kind,
      refId: place.refId,
      name: place.name,
      address: place.address,
      image: place.image,
      url: place.url,
      latitude: place.latitude,
      longitude: place.longitude,
    },
  });
  return { name: place.name, day: targetDay };
}

/** Xóa điểm dừng; các điểm còn lại giữ nguyên thứ tự. */
export async function removeStop(tripId: string, stopId: string): Promise<TripView> {
  const trip = await loadTrip(tripId);
  const stop = trip.stops.find((s) => s.id === stopId);
  if (!stop) throw new NotFoundError("Điểm dừng không còn trong lộ trình.");
  await prisma.tripStop.delete({ where: { id: stopId } });
  await recomputeDays(tripId, affectedDays(stop.day, stop.kind, trip.dayCount));
  return getTripView(tripId);
}

/**
 * Chuyển điểm dừng sang ngày khác (hoặc đổi vị trí trong cùng ngày) tại vị trí `index`
 * trong danh sách điểm dừng của ngày đích (không tính khách sạn gốc); không có `index` thì vào cuối ngày.
 */
export async function moveStop(
  tripId: string,
  stopId: string,
  day: number,
  { optimize = false, index }: RecomputeOptions & { index?: number } = {},
): Promise<TripView> {
  const trip = await loadTrip(tripId);
  const stop = trip.stops.find((s) => s.id === stopId);
  if (!stop) throw new NotFoundError("Điểm dừng không còn trong lộ trình.");
  const targetDay = Math.min(Math.max(1, Math.round(day)), trip.dayCount);
  const sameDay = targetDay === stop.day;
  if (sameDay && index === undefined) return toView(trip);
  if (!sameDay && trip.stops.filter((s) => s.day === targetDay).length >= MAX_STOPS_PER_DAY) {
    throw new ConflictError(`Mỗi ngày tối đa ${MAX_STOPS_PER_DAY} điểm dừng.`);
  }

  // Thứ tự mới của ngày đích: khách sạn gốc (nếu có) luôn đứng đầu, chèn điểm dừng vào vị trí thả
  const stops = trip.stops.map(toStopView);
  const base = baseHotelFor(stops, targetDay);
  const pinned = base?.day === targetDay && base.id !== stopId ? base : null;
  const rest = stops
    .filter((s) => s.day === targetDay && s.id !== stopId && s.id !== pinned?.id)
    .sort((a, b) => a.position - b.position);
  const at = Math.min(Math.max(0, index ?? rest.length), rest.length);
  const orderedIds = [
    ...(pinned ? [pinned.id] : []),
    ...rest.slice(0, at).map((s) => s.id),
    stopId,
    ...rest.slice(at).map((s) => s.id),
  ];

  await prisma.$transaction(
    orderedIds.map((id, position) =>
      prisma.tripStop.update({
        where: { id },
        data: id === stopId ? { day: targetDay, position } : { position },
      }),
    ),
  );
  const from = Math.min(stop.day, targetDay);
  await recomputeDays(
    tripId,
    [stop.day, targetDay, ...(stop.kind === "hotel" ? affectedDays(from, "hotel", trip.dayCount) : [])],
    { optimize },
  );
  return getTripView(tripId);
}

/** Người dùng kéo thả sắp lại thứ tự điểm dừng trong một ngày (không tính khách sạn gốc của ngày). */
export async function reorderDayStops(tripId: string, day: number, orderedStopIds: string[]): Promise<TripView> {
  const trip = await loadTrip(tripId);
  if (day < 1 || day > trip.dayCount) throw new NotFoundError("Không tìm thấy ngày này.");
  const stops = trip.stops.map(toStopView);
  const base = baseHotelFor(stops, day);
  const pinned = base?.day === day ? base : null;
  const dayIds = stops.filter((s) => s.day === day && s.id !== pinned?.id).map((s) => s.id);
  const unique = new Set(orderedStopIds);
  if (
    unique.size !== orderedStopIds.length ||
    unique.size !== dayIds.length ||
    dayIds.some((id) => !unique.has(id))
  ) {
    throw new ConflictError("Lộ trình đã thay đổi, vui lòng tải lại trang.");
  }

  const ids = [...(pinned ? [pinned.id] : []), ...orderedStopIds];
  await prisma.$transaction(
    ids.map((id, position) => prisma.tripStop.update({ where: { id }, data: { position } })),
  );
  await recomputeDays(tripId, [day]);
  return getTripView(tripId);
}

export async function addDay(tripId: string): Promise<TripView> {
  const trip = await loadTrip(tripId);
  if (trip.dayCount >= MAX_TRIP_DAYS) {
    throw new ConflictError(`Lộ trình tối đa ${MAX_TRIP_DAYS} ngày.`);
  }
  await prisma.trip.update({ where: { id: tripId }, data: { dayCount: trip.dayCount + 1 } });
  return getTripView(tripId);
}

export async function removeDay(tripId: string, day: number): Promise<TripView> {
  const trip = await loadTrip(tripId);
  if (trip.dayCount <= 1) throw new ConflictError("Lộ trình cần ít nhất 1 ngày.");
  if (day < 1 || day > trip.dayCount) throw new NotFoundError("Không tìm thấy ngày này.");

  await prisma.$transaction([
    prisma.tripStop.deleteMany({ where: { tripId, day } }),
    prisma.tripStop.updateMany({ where: { tripId, day: { gt: day } }, data: { day: { decrement: 1 } } }),
    prisma.trip.update({
      where: { id: tripId },
      data: {
        dayCount: trip.dayCount - 1,
        routes: parseRoutes(trip.routes)
          .filter((r) => r.day < day) as unknown as Prisma.InputJsonValue,
      },
    }),
  ]);
  await recomputeDays(tripId, Array.from({ length: trip.dayCount - day }, (_, i) => day + i));
  return getTripView(tripId);
}

export async function renameTrip(tripId: string, title: string): Promise<TripView> {
  const trimmed = title.trim().slice(0, 120);
  if (!trimmed) throw new ConflictError("Tên lộ trình không được để trống.");
  await prisma.trip.update({ where: { id: tripId }, data: { title: trimmed } });
  return getTripView(tripId);
}
