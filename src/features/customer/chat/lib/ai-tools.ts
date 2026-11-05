import {
  InferUITools,
  type UIMessage,
  type UIDataTypes,
  tool,
  type ToolSet,
} from "ai";
import { z } from "zod";
import { menuAveragePrice } from "@/entities/list-filter";
import { firstImage } from "@/features/customer/components/cards/card-parts";
import { embedText } from "@/lib/gemini";
import {
  queryDestinationEmbeddings,
  queryHotelEmbeddings,
  queryRestaurantEmbeddings,
  queryTourEmbeddings,
} from "@/lib/pinecone";
import { prisma } from "@/lib/prisma";
import { searchExternalPlaces } from "./external-places";
import { num, truncate } from "./format";

const MAX_RESULTS = 5;
const PINECONE_TOP_K = 20;

const queryField = z
  .string()
  .optional()
  .describe(
    "Mô tả nhu cầu tự nhiên bằng tiếng Việt để tìm kiếm theo ngữ nghĩa (Pinecone Vector Search), ví dụ: 'đi thuyền ngắm đồng lúa nghỉ homestay', 'đặc sản dê núi cơm cháy cho gia đình', 'khách sạn gần biển có hồ bơi view đẹp'.",
  );
const provinceField = z
  .string()
  .optional()
  .describe(
    "Tên tỉnh/thành phố hoặc khu vực du lịch, ví dụ: Ninh Bình, Hải Phòng, Cát Bà, Tràng An, Hà Nội.",
  );
const tagsField = z
  .array(z.string())
  .optional()
  .describe("Từ khóa chủ đề/loại hình, ví dụ: biển, ẩm thực, gia đình, cặp đôi.");
// Mặc định 3 để khi gọi kết hợp nhiều tool, model nhận ít dữ liệu và chọn lọc hơn
const DEFAULT_RESULTS = 3;
const limitField = z.number().int().min(1).max(MAX_RESULTS).default(DEFAULT_RESULTS);

// semantic: khớp ngữ nghĩa với yêu cầu; popular: chỉ là dịch vụ nổi bật cùng khu vực (fallback)
const matchedBy = (index: number, semanticCount: number) =>
  index < semanticCount ? ("semantic" as const) : ("popular" as const);

type ItineraryItem = { title: string; description: string };

function parseItinerary(raw: unknown): ItineraryItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (item): item is { title?: unknown; description?: unknown } =>
        typeof item === "object" && item !== null,
    )
    .map((item) => ({
      title: typeof item.title === "string" ? item.title : "",
      description:
        typeof item.description === "string"
          ? (truncate(item.description, 180) ?? "")
          : "",
    }))
    .filter((item) => item.title.length > 0);
}

type MenuDish = { name: string; price: number | null; description: string | null };

function parseMenuDishes(raw: unknown, maxItems = 5): MenuDish[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (item): item is { name?: unknown; price?: unknown; description?: unknown } =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as { name?: unknown }).name === "string",
    )
    .slice(0, maxItems)
    .map((item) => ({
      name: String(item.name),
      price:
        typeof item.price === "number" && Number.isFinite(item.price)
          ? item.price
          : null,
      description:
        typeof item.description === "string"
          ? truncate(item.description, 120)
          : null,
    }));
}

async function resolveLocation(province?: string): Promise<{
  provinceIds: string[];
  subLocation?: string;
}> {
  const trimmed = province?.trim();
  if (!trimmed) return { provinceIds: [] };

  const matched = await prisma.province.findMany({
    where: {
      OR: [
        { name: { contains: trimmed, mode: "insensitive" } },
        { fullName: { contains: trimmed, mode: "insensitive" } },
      ],
    },
    select: { id: true },
  });

  if (matched.length > 0) {
    return { provinceIds: matched.map((p) => p.id) };
  }

  // Trường hợp người dùng nhập địa danh con (vd: Cát Bà, Tràng An, Tam Cốc, Đà Lạt...)
  return { provinceIds: [], subLocation: trimmed };
}

function buildSemanticText(parts: (string | string[] | undefined)[]): string {
  return parts
    .flatMap((p) => (Array.isArray(p) ? p : p ? [p] : []))
    .map((s) => s.trim())
    .filter(Boolean)
    .join(", ");
}

async function getSemanticIds(
  semanticText: string,
  queryFn: (
    vector: number[],
    topK: number,
    provinceIds?: string[],
  ) => Promise<string[]>,
  provinceIds?: string[],
): Promise<string[]> {
  if (!semanticText) return [];
  try {
    const vector = await embedText(semanticText);
    return await queryFn(vector, PINECONE_TOP_K, provinceIds);
  } catch (error) {
    console.warn("Semantic search fallback sang Prisma:", error);
    return [];
  }
}

function sortBySemanticOrder<T extends { id: string }>(
  items: T[],
  semanticIds: string[],
): T[] {
  const rank = new Map(semanticIds.map((id, idx) => [id, idx]));
  return [...items].sort(
    (a, b) => (rank.get(a.id) ?? Infinity) - (rank.get(b.id) ?? Infinity),
  );
}

// Chỉ lấy dịch vụ đang mở bán, chưa bị xóa/lên lịch xóa
const liveService = {
  status: "published" as const,
  deletedAt: null,
  deleteScheduledAt: null,
};

// Mã thời tiết WMO của Open-Meteo -> mô tả tiếng Việt
const weatherLabel = (code: number) => {
  if (code === 0) return "Trời quang";
  if (code <= 3) return "Ít mây đến nhiều mây";
  if (code <= 48) return "Sương mù";
  if (code <= 57) return "Mưa phùn";
  if (code <= 67) return "Mưa";
  if (code <= 77) return "Tuyết";
  if (code <= 82) return "Mưa rào";
  if (code <= 86) return "Mưa tuyết";
  return "Dông";
};

const OPEN_METEO_TIMEOUT_MS = 8000;

const tourSelect = {
  id: true,
  title: true,
  slug: true,
  description: true,
  images: true,
  itinerary: true,
  includeServices: true,
  durationDays: true,
  durationNights: true,
  basePrice: true,
  ratingAvg: true,
  reviewCount: true,
  province: { select: { name: true } },
  tags: { select: { tag: { select: { name: true } } } },
} as const;

const hotelSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  images: true,
  address: true,
  latitude: true,
  longitude: true,
  amenities: true,
  ratingAvg: true,
  reviewCount: true,
  province: { select: { name: true } },
  tags: { select: { tag: { select: { name: true } } } },
  rooms: {
    where: { status: "published" as const },
    orderBy: { basePrice: "asc" as const },
    take: 3,
    select: {
      name: true,
      capacity: true,
      basePrice: true,
      amenities: true,
    },
  },
} as const;

const restaurantSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  images: true,
  address: true,
  latitude: true,
  longitude: true,
  capacity: true,
  menu: true,
  ratingAvg: true,
  reviewCount: true,
  province: { select: { name: true } },
  tags: { select: { tag: { select: { name: true } } } },
  timeSlots: {
    select: { startTime: true, endTime: true },
  },
} as const;

const destinationSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  images: true,
  address: true,
  latitude: true,
  longitude: true,
  openTime: true,
  closeTime: true,
  ticketPrice: true,
  province: { select: { name: true } },
  tags: { select: { tag: { select: { name: true } } } },
} as const;

export const chatTools = {
  // Tool không có execute: model gọi để hỏi lại người dùng,
  // câu trả lời do client gửi về qua addToolOutput
  askUser: tool({
    description:
      "Hỏi lại người dùng khi yêu cầu quá mơ hồ chưa biết tìm ở đâu hoặc cần làm rõ một tiêu chí quyết định. Chỉ hỏi MỘT câu về MỘT thông tin duy nhất mỗi lần gọi. Không lạm dụng nếu đã có địa điểm hoặc nhu cầu đủ để tìm kiếm gợi ý ban đầu.",
    inputSchema: z.object({
      question: z
        .string()
        .describe(
          "MỘT câu hỏi làm rõ ngắn gọn bằng tiếng Việt, chỉ về một thông tin.",
        ),
      options: z
        .array(z.string())
        .length(3)
        .describe(
          "ĐÚNG 3 câu trả lời cụ thể cho đúng câu hỏi trên, để người dùng bấm chọn.",
        ),
    }),
  }),

  getWeather: tool({
    description:
      "Lấy dự báo thời tiết thực tế (nhiệt độ, khả năng mưa) cho một tỉnh/thành phố trong những ngày tới (tối đa 14 ngày kể từ hôm nay). Dùng khi người dùng hỏi thời tiết hoặc đang lập lịch trình cho chuyến đi sắp tới.",
    inputSchema: z.object({
      province: z
        .string()
        .describe("Tên tỉnh/thành phố, ví dụ: Ninh Bình, Hải Phòng, Đà Lạt, Đà Nẵng, Sa Pa."),
      days: z
        .number()
        .int()
        .min(1)
        .max(14)
        .default(5)
        .describe("Số ngày dự báo kể từ hôm nay."),
    }),
    execute: async ({ province, days }) => {
      try {
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(province)}&count=1&language=vi&countryCode=VN`,
          { signal: AbortSignal.timeout(OPEN_METEO_TIMEOUT_MS) },
        );
        const geo = (await geoRes.json()) as {
          results?: { name: string; latitude: number; longitude: number }[];
        };
        const place = geo.results?.[0];
        if (!place) return { error: `Không tìm thấy vị trí "${province}".` };

        const params = new URLSearchParams({
          latitude: String(place.latitude),
          longitude: String(place.longitude),
          daily:
            "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
          timezone: "Asia/Ho_Chi_Minh",
          forecast_days: String(days),
        });
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?${params}`,
          { signal: AbortSignal.timeout(OPEN_METEO_TIMEOUT_MS) },
        );
        const data = (await res.json()) as {
          daily?: {
            time: string[];
            weather_code: number[];
            temperature_2m_max: number[];
            temperature_2m_min: number[];
            precipitation_probability_max: (number | null)[];
          };
        };
        const d = data.daily;
        if (!d) return { error: "Không lấy được dữ liệu thời tiết." };

        return {
          location: place.name,
          forecast: d.time.map((date, i) => ({
            date,
            summary: weatherLabel(d.weather_code[i]),
            tempMax: d.temperature_2m_max[i],
            tempMin: d.temperature_2m_min[i],
            rainChance: d.precipitation_probability_max[i],
          })),
        };
      } catch {
        return { error: "Dịch vụ thời tiết tạm thời không khả dụng." };
      }
    },
  }),

  searchTours: tool({
    description:
      "Tìm tour du lịch trong cơ sở dữ liệu Roamly kết hợp Semantic Search (Pinecone) và lọc theo điểm đến, chủ đề, ngân sách, số ngày. Trả về cả lịch trình chi tiết từng ngày và dịch vụ bao gồm để tư vấn sâu.",
    inputSchema: z.object({
      query: queryField,
      province: provinceField,
      tags: tagsField,
      maxPrice: z.number().positive().optional().describe("Giá tối đa (VND)."),
      days: z.number().int().positive().optional().describe("Số ngày của tour."),
      limit: limitField,
    }),
    execute: async ({ query, province, tags, maxPrice, days, limit }) => {
      const { provinceIds, subLocation } = await resolveLocation(province);
      const semanticText = buildSemanticText([query, subLocation, tags, province]);
      const semanticIds = await getSemanticIds(
        semanticText,
        queryTourEmbeddings,
        provinceIds,
      );

      const baseWhere = {
        ...liveService,
        ...(provinceIds.length > 0 ? { provinceId: { in: provinceIds } } : {}),
        ...(subLocation
          ? {
              OR: [
                { title: { contains: subLocation, mode: "insensitive" as const } },
                {
                  description: {
                    contains: subLocation,
                    mode: "insensitive" as const,
                  },
                },
              ],
            }
          : {}),
        ...(maxPrice ? { basePrice: { lte: maxPrice } } : {}),
      };

      const exactDaysWhere = days ? { durationDays: days } : {};

      let results: Awaited<
        ReturnType<typeof prisma.tour.findMany<{ select: typeof tourSelect }>>
      > = [];

      if (semanticIds.length > 0) {
        const vectorMatches = await prisma.tour.findMany({
          where: {
            ...baseWhere,
            ...exactDaysWhere,
            id: { in: semanticIds },
          },
          select: tourSelect,
        });
        results = sortBySemanticOrder(vectorMatches, semanticIds).slice(0, limit);
      }

      if (results.length < limit) {
        const excludeIds = results.map((r) => r.id);
        const fallback = await prisma.tour.findMany({
          where: {
            ...baseWhere,
            ...exactDaysWhere,
            ...(excludeIds.length > 0 ? { id: { notIn: excludeIds } } : {}),
          },
          orderBy: [{ ratingAvg: "desc" }, { reviewCount: "desc" }],
          take: limit - results.length,
          select: tourSelect,
        });
        results = [...results, ...fallback];
      }

      // Nếu lọc cứng số ngày không có kết quả, nới lỏng ±1 ngày để gợi ý phương án gần nhất
      if (results.length === 0 && days) {
        const relaxedDaysWhere = {
          durationDays: { gte: Math.max(1, days - 1), lte: days + 1 },
        };
        if (semanticIds.length > 0) {
          const relaxedVector = await prisma.tour.findMany({
            where: {
              ...baseWhere,
              ...relaxedDaysWhere,
              id: { in: semanticIds },
            },
            select: tourSelect,
          });
          results = sortBySemanticOrder(relaxedVector, semanticIds).slice(0, limit);
        }
        if (results.length === 0) {
          results = await prisma.tour.findMany({
            where: { ...baseWhere, ...relaxedDaysWhere },
            orderBy: [{ ratingAvg: "desc" }, { reviewCount: "desc" }],
            take: limit,
            select: tourSelect,
          });
        }
      }

      return results.map((t) => ({
        title: t.title,
        url: `/tours/${t.slug}`,
        image: firstImage(t.images),
        province: t.province.name,
        duration: `${t.durationDays}N${t.durationNights}Đ`,
        price: num(t.basePrice),
        rating: num(t.ratingAvg),
        reviewCount: t.reviewCount,
        tags: t.tags.map((x) => x.tag.name),
        description: truncate(t.description, 300),
        itinerary: parseItinerary(t.itinerary),
        includeServices: t.includeServices.slice(0, 6),
      }));
    },
  }),

  searchHotels: tool({
    description:
      "Tìm khách sạn/resort/homestay trong cơ sở dữ liệu Roamly kết hợp Semantic Search (Pinecone) và lọc theo điểm đến, tiện nghi, giá phòng. Trả về cả mô tả và danh sách hạng phòng để tư vấn.",
    inputSchema: z.object({
      query: queryField,
      province: provinceField,
      tags: tagsField,
      amenities: z
        .array(z.string())
        .optional()
        .describe("Tiện nghi mong muốn, ví dụ: hồ bơi, wifi, bữa sáng, xe đạp."),
      maxPrice: z
        .number()
        .positive()
        .optional()
        .describe("Giá phòng mỗi đêm tối đa (VND)."),
      limit: limitField,
    }),
    execute: async ({ query, province, tags, amenities, maxPrice, limit }) => {
      const { provinceIds, subLocation } = await resolveLocation(province);
      const semanticText = buildSemanticText([
        query,
        subLocation,
        tags,
        amenities,
        province,
      ]);
      const semanticIds = await getSemanticIds(
        semanticText,
        queryHotelEmbeddings,
        provinceIds,
      );

      const baseWhere = {
        ...liveService,
        ...(provinceIds.length > 0 ? { provinceId: { in: provinceIds } } : {}),
        ...(subLocation
          ? {
              OR: [
                { name: { contains: subLocation, mode: "insensitive" as const } },
                {
                  address: { contains: subLocation, mode: "insensitive" as const },
                },
                {
                  description: {
                    contains: subLocation,
                    mode: "insensitive" as const,
                  },
                },
              ],
            }
          : {}),
        rooms: {
          some: {
            status: "published" as const,
            ...(maxPrice ? { basePrice: { lte: maxPrice } } : {}),
          },
        },
      };

      let results: Awaited<
        ReturnType<typeof prisma.hotel.findMany<{ select: typeof hotelSelect }>>
      > = [];

      if (semanticIds.length > 0) {
        const vectorMatches = await prisma.hotel.findMany({
          where: {
            ...baseWhere,
            id: { in: semanticIds },
          },
          select: hotelSelect,
        });
        results = sortBySemanticOrder(vectorMatches, semanticIds).slice(0, limit);
      }

      const semanticCount = results.length;
      if (results.length < limit) {
        const excludeIds = results.map((r) => r.id);
        const fallback = await prisma.hotel.findMany({
          where: {
            ...baseWhere,
            ...(excludeIds.length > 0 ? { id: { notIn: excludeIds } } : {}),
          },
          orderBy: [{ ratingAvg: "desc" }, { reviewCount: "desc" }],
          take: limit - results.length,
          select: hotelSelect,
        });
        results = [...results, ...fallback];
      }

      return results.map((h, i) => ({
        source: "internal" as const,
        matchedBy: matchedBy(i, semanticCount),
        name: h.name,
        url: `/hotels/${h.slug}`,
        image: firstImage(h.images),
        province: h.province.name,
        address: h.address,
        latitude: num(h.latitude),
        longitude: num(h.longitude),
        amenities: h.amenities,
        priceFrom: num(h.rooms[0]?.basePrice),
        rating: num(h.ratingAvg),
        reviewCount: h.reviewCount,
        tags: h.tags.map((x) => x.tag.name),
        description: truncate(h.description, 280),
        rooms: h.rooms.map((r) => ({
          name: r.name,
          capacity: r.capacity,
          price: num(r.basePrice),
          amenities: r.amenities.slice(0, 4),
        })),
      }));
    },
  }),

  searchRestaurants: tool({
    description:
      "Tìm nhà hàng/quán ăn trong cơ sở dữ liệu Roamly kết hợp Semantic Search (Pinecone) theo món ăn, phong cách ẩm thực và điểm đến. Trả về cả thực đơn các món đặc trưng kèm giá để tư vấn ẩm thực.",
    inputSchema: z.object({
      query: queryField,
      province: provinceField,
      tags: tagsField,
      limit: limitField,
    }),
    execute: async ({ query, province, tags, limit }) => {
      const { provinceIds, subLocation } = await resolveLocation(province);
      const semanticText = buildSemanticText([query, subLocation, tags, province]);
      const semanticIds = await getSemanticIds(
        semanticText,
        queryRestaurantEmbeddings,
        provinceIds,
      );

      const baseWhere = {
        ...liveService,
        ...(provinceIds.length > 0 ? { provinceId: { in: provinceIds } } : {}),
        ...(subLocation
          ? {
              OR: [
                { name: { contains: subLocation, mode: "insensitive" as const } },
                {
                  address: { contains: subLocation, mode: "insensitive" as const },
                },
                {
                  description: {
                    contains: subLocation,
                    mode: "insensitive" as const,
                  },
                },
              ],
            }
          : {}),
      };

      let results: Awaited<
        ReturnType<
          typeof prisma.restaurant.findMany<{ select: typeof restaurantSelect }>
        >
      > = [];

      if (semanticIds.length > 0) {
        const vectorMatches = await prisma.restaurant.findMany({
          where: {
            ...baseWhere,
            id: { in: semanticIds },
          },
          select: restaurantSelect,
        });
        results = sortBySemanticOrder(vectorMatches, semanticIds).slice(0, limit);
      }

      const semanticCount = results.length;
      if (results.length < limit) {
        const excludeIds = results.map((r) => r.id);
        const fallback = await prisma.restaurant.findMany({
          where: {
            ...baseWhere,
            ...(excludeIds.length > 0 ? { id: { notIn: excludeIds } } : {}),
          },
          orderBy: [{ ratingAvg: "desc" }, { reviewCount: "desc" }],
          take: limit - results.length,
          select: restaurantSelect,
        });
        results = [...results, ...fallback];
      }

      return results.map((r, i) => {
        const starts = r.timeSlots.map((s) => s.startTime).sort();
        const ends = r.timeSlots.map((s) => s.endTime).sort();
        const hours = starts.length
          ? `${starts[0]} - ${ends[ends.length - 1]}`
          : null;
        return {
          source: "internal" as const,
          matchedBy: matchedBy(i, semanticCount),
          name: r.name,
          url: `/restaurants/${r.slug}`,
          image: firstImage(r.images),
          province: r.province.name,
          address: r.address,
          latitude: num(r.latitude),
          longitude: num(r.longitude),
          capacity: r.capacity,
          hours,
          avgPrice: menuAveragePrice(r.menu) ?? null,
          rating: num(r.ratingAvg),
          reviewCount: r.reviewCount,
          tags: r.tags.map((x) => x.tag.name),
          description: truncate(r.description, 280),
          dishes: parseMenuDishes(r.menu, 5),
        };
      });
    },
  }),

  searchDestinations: tool({
    description:
      "Tìm địa điểm tham quan/danh thắng trong cơ sở dữ liệu Roamly kết hợp Semantic Search (Pinecone) theo điểm đến và chủ đề/trải nghiệm. Trả về mô tả chi tiết, giờ mở cửa và giá vé.",
    inputSchema: z.object({
      query: queryField,
      province: provinceField,
      tags: tagsField,
      limit: limitField,
    }),
    execute: async ({ query, province, tags, limit }) => {
      const { provinceIds, subLocation } = await resolveLocation(province);
      const semanticText = buildSemanticText([query, subLocation, tags, province]);
      const semanticIds = await getSemanticIds(
        semanticText,
        queryDestinationEmbeddings,
        provinceIds,
      );

      const baseWhere = {
        isPublished: true,
        ...(provinceIds.length > 0 ? { provinceId: { in: provinceIds } } : {}),
        ...(subLocation
          ? {
              OR: [
                { name: { contains: subLocation, mode: "insensitive" as const } },
                {
                  address: { contains: subLocation, mode: "insensitive" as const },
                },
                {
                  description: {
                    contains: subLocation,
                    mode: "insensitive" as const,
                  },
                },
              ],
            }
          : {}),
      };

      let results: Awaited<
        ReturnType<
          typeof prisma.destination.findMany<{ select: typeof destinationSelect }>
        >
      > = [];

      if (semanticIds.length > 0) {
        const vectorMatches = await prisma.destination.findMany({
          where: {
            ...baseWhere,
            id: { in: semanticIds },
          },
          select: destinationSelect,
        });
        results = sortBySemanticOrder(vectorMatches, semanticIds).slice(0, limit);
      }

      const semanticCount = results.length;
      if (results.length < limit) {
        const excludeIds = results.map((r) => r.id);
        const fallback = await prisma.destination.findMany({
          where: {
            ...baseWhere,
            ...(excludeIds.length > 0 ? { id: { notIn: excludeIds } } : {}),
          },
          take: limit - results.length,
          select: destinationSelect,
        });
        results = [...results, ...fallback];
      }

      return results.map((d, i) => ({
        source: "internal" as const,
        matchedBy: matchedBy(i, semanticCount),
        name: d.name,
        url: `/destinations/${d.slug}`,
        image: firstImage(d.images),
        province: d.province.name,
        address: d.address,
        latitude: num(d.latitude),
        longitude: num(d.longitude),
        hours: `${d.openTime} - ${d.closeTime}`,
        ticketPrice: num(d.ticketPrice),
        tags: d.tags.map((x) => x.tag.name),
        description: truncate(d.description, 300),
      }));
    },
  }),

  searchExternalPlaces: tool({
    description:
      "Tìm kiếm khách sạn, nhà hàng, quán ăn, điểm tham quan thực tế ngoài hệ thống (qua OpenStreetMap) tại một tỉnh/thành phố hoặc khu vực, trả về tên, địa chỉ, loại hình và tọa độ thật. Dùng để mở rộng lựa chọn, đề xuất công bằng giữa các địa điểm nổi tiếng ngoài đời thực và dịch vụ nội bộ, giúp lịch trình và tư vấn toàn diện, phong phú hơn.",
    inputSchema: z.object({
      kind: z
        .enum(["hotel", "restaurant", "destination"])
        .describe("Loại địa điểm: hotel (lưu trú), restaurant (ăn uống), destination (tham quan)."),
      province: z
        .string()
        .min(1)
        .describe("Tỉnh/thành phố hoặc khu vực, ví dụ: Đà Nẵng, Hội An, Đà Lạt."),
      name: z
        .string()
        .optional()
        .describe(
          "Tên riêng của địa điểm nếu người dùng hỏi đích danh, ví dụ: 'Cầu Rồng', 'Bánh xèo Bà Dưỡng'. Bỏ trống khi chỉ tìm theo loại.",
        ),
      limit: limitField,
    }),
    execute: async ({ kind, province, name, limit }) => {
      try {
        return await searchExternalPlaces({ kind, province, name, limit });
      } catch (error) {
        // Ném lại để model nhận lỗi (output-error) thay vì hiểu nhầm là "không có kết quả"
        console.warn("Tìm địa điểm ngoài (Nominatim) thất bại:", error);
        throw new Error("Dịch vụ bản đồ OpenStreetMap tạm thời không phản hồi.");
      }
    },
  }),
} satisfies ToolSet;

export type ChatTools = InferUITools<typeof chatTools>;

export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>;
