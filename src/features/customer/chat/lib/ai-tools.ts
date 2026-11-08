import {
  InferUITools,
  type UIMessage,
  type UIDataTypes,
  tool,
  type ToolSet,
} from "ai";
import { z } from "zod";
import { firstImage } from "@/features/customer/components/cards/card-parts";
import { queryTourEmbeddings } from "@/lib/pinecone";
import { prisma } from "@/lib/prisma";
import { logTiming, timed } from "@/lib/timing";
import { MEALS } from "@/features/customer/trips/lib/meal-stops";
import {
  createTripFromPlaces,
  resolvePlace,
} from "@/features/customer/trips/lib/trip-service";
import { MAX_STOPS_PER_DAY, MAX_TRIP_DAYS, type TripView } from "@/features/customer/trips/lib/types";
import {
  searchExternalPlaces,
  haversineKm,
  rankHotels,
  searchHotelsInProvince,
} from "./external-places";
import { type FoundPlace, findPlaces } from "./find-places";
import {
  buildSemanticText,
  getSemanticIds,
  liveService,
  resolveLocation,
  sortBySemanticOrder,
} from "./internal-places";
import { num, truncate } from "./format";

const MAX_RESULTS = 5;

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
// Mặc định 3 để model nhận ít dữ liệu và chọn lọc hơn
const DEFAULT_RESULTS = 3;
const limitField = z.number().int().min(1).max(MAX_RESULTS).default(DEFAULT_RESULTS);

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

// Số điểm tham quan ứng viên đưa cho AI chọn (dư so với ~4 điểm/ngày để AI có lựa chọn)
const destinationCandidateCount = (days: number) => Math.min(4 * days + 4, 14);
// Quán ứng viên: đủ số bữa cần xếp + vài quán dự phòng (mỗi quán là 1 lượt tra Google Places, chạy song song)
const restaurantCandidateCount = (days: number, meals: number) => Math.min(days * meals * 2 + 2, 16);
const HOTEL_CANDIDATES = 6;
// Khách sạn cách điểm tham quan gần nhất xa hơn mức này coi là sai nơi; web trả về ít hơn MIN thì bù từ Google Maps
const HOTEL_MAX_DISTANCE_KM = 30;
const MIN_HOTEL_CANDIDATES = 3;

const tripStops = (view: TripView) =>
  view.days.flatMap((d) => d.stops.map((s) => ({ day: d.day, name: s.name, kind: s.kind })));

const tripSummary = (view: TripView) => ({
  tripId: view.id,
  url: `/trips/${view.id}`,
  title: view.title,
  days: view.dayCount,
  stops: tripStops(view),
});

type ExternalFound = Extract<FoundPlace, { source: "external" }>;
const isExternalFound = (p: FoundPlace): p is ExternalFound => p.source === "external";

// Ứng viên gọn cho AI chọn (chỉ các trường cần để quyết định)
const toCandidate = (p: ExternalFound) => ({
  id: p.id,
  name: p.name,
  type: p.type,
  address: p.address,
  rating: p.rating,
  reviewCount: p.reviewCount,
  reason: p.reason,
});

// Input chung của 3 tool tìm khi lập lộ trình
const tripSearchSchema = z.object({
  request: z
    .string()
    .min(1)
    .describe("Yêu cầu đầy đủ của khách (gộp thông tin đã biết: điểm đến, số người, sở thích)."),
  province: z.string().min(1).describe("Điểm đến chính, ví dụ: Ninh Bình, Cát Bà, Hà Nội."),
  criteria: z
    .string()
    .optional()
    .describe(
      "Tiêu chí chọn BẠN tự suy ra từ yêu cầu cho loại địa điểm này, vd: 'thiên nhiên, ít leo trèo, hợp trẻ nhỏ', 'gần trung tâm, có hồ bơi', 'quán địa phương đông khách'.",
    ),
});

export const buildChatTools = ({ userId }: { userId?: string | null } = {}) => ({
  // Tool không có execute: model gọi để hỏi lại người dùng,
  // câu trả lời do client gửi về qua addToolOutput
  askUser: tool({
    description:
      "Hỏi lại người dùng khi yêu cầu quá mơ hồ chưa biết tìm ở đâu hoặc cần làm rõ một tiêu chí quyết định. Chỉ hỏi MỘT câu về MỘT thông tin duy nhất mỗi lần gọi. Không lạm dụng nếu đã có địa điểm hoặc nhu cầu đủ để tìm kiếm gợi ý ban đầu. Trường `message` là câu trả lời của bạn cho người dùng, hiển thị trước các lựa chọn.",
    inputSchema: z.object({
      // Đặt đầu tiên để lời dẫn stream ra trước khi các lựa chọn xuất hiện
      message: z
        .string()
        .min(1)
        .describe(
          "Lời trả lời/dẫn dắt 1–3 câu bằng tiếng Việt, hiển thị như tin nhắn của AI trước các lựa chọn: phản hồi yêu cầu của người dùng và giải thích vì sao cần hỏi thêm. Không lặp lại các lựa chọn.",
        ),
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

  findPlaces: tool({
    description:
      "Tìm khách sạn/lưu trú, nhà hàng/quán ăn, điểm tham quan phù hợp với yêu cầu. Pipeline tự động: tìm trên web (Google Search) song song với dữ liệu nội bộ Roamly (Semantic Search), tra Google Maps lấy vị trí, đánh giá cho địa điểm ngoài hệ thống, rồi trả về tối đa 5 địa điểm có tọa độ để hiển thị trên bản đồ. Gọi MỘT lần mỗi lượt với đủ các loại cần tìm.",
    inputSchema: z.object({
      request: z
        .string()
        .min(1)
        .describe(
          "Yêu cầu đầy đủ của khách bằng tiếng Việt (gộp các thông tin đã biết trong hội thoại), ví dụ: 'khách sạn gần biển có hồ bơi ở Cát Bà cho gia đình 4 người'.",
        ),
      query: queryField,
      province: provinceField,
      kinds: z
        .array(z.enum(["hotel", "restaurant", "destination"]))
        .min(1)
        .describe(
          "Các loại địa điểm cần tìm: hotel (lưu trú), restaurant (ăn uống), destination (tham quan). Lập lịch trình thì truyền cả 3.",
        ),
      maxPrice: z
        .number()
        .positive()
        .optional()
        .describe("Giá phòng mỗi đêm tối đa (VND), chỉ áp dụng cho khách sạn nội bộ."),
      amenities: z
        .array(z.string())
        .optional()
        .describe("Tiện nghi khách sạn mong muốn, ví dụ: hồ bơi, wifi, bữa sáng."),
    }),
    execute: (input) => findPlaces(input),
  }),

  findTripDestinations: tool({
    description:
      "LẬP LỘ TRÌNH — tìm điểm tham quan: tìm trên web theo yêu cầu/tiêu chí, sau đó tra Google Maps lấy vị trí và đánh giá. Gọi CÙNG LÚC với `findTripHotels` và `findTripRestaurants`.",
    inputSchema: tripSearchSchema.extend({
      days: z
        .number()
        .int()
        .min(1)
        .max(MAX_TRIP_DAYS)
        .default(1)
        .describe("Số ngày của chuyến đi (2 ngày 1 đêm → 2)."),
    }),
    execute: async ({ request, province, days, criteria }) => {
      const target = destinationCandidateCount(days);
      const found = await timed(
        " findTripDestinations: web → Google Maps",
        () =>
          findPlaces({ request, province, kinds: ["destination"], maxPlaces: target, internal: false, criteria }),
        (r) => `${r.places.length} điểm`,
      );
      const destinations = found.places.filter(isExternalFound).filter((p) => p.kind === "destination");
      // Web lỗi/chậm hoặc trả về ít → bù điểm tham quan tìm thẳng trên Google Maps (không có giá/lý do)
      if (destinations.length < target) {
        try {
          const extra = await timed(" findTripDestinations: bù từ Google Maps", () =>
            searchExternalPlaces({ query: "điểm tham quan du lịch", province }),
          );
          for (const place of extra) {
            if (destinations.length >= target) break;
            if (place.kind !== "destination" || destinations.some((p) => p.id === place.id)) continue;
            destinations.push({ ...place, reason: null, webMentioned: false });
          }
        } catch (error) {
          console.warn("Không bù được điểm tham quan từ Google Maps:", error);
        }
      }
      return { destinations: destinations.map(toCandidate) };
    },
  }),

  findTripHotels: tool({
    description:
      "LẬP LỘ TRÌNH — tìm khách sạn/resort/homestay: tìm trên web theo yêu cầu/tiêu chí, sau đó tra Google Maps lấy vị trí và đánh giá. Gọi CÙNG LÚC với `findTripDestinations` và `findTripRestaurants`.",
    inputSchema: tripSearchSchema,
    execute: async ({ request, province, criteria }) => {
      const found = await timed(
        " findTripHotels: web → Google Maps",
        () =>
          findPlaces({ request, province, kinds: ["hotel"], maxPlaces: HOTEL_CANDIDATES, internal: false, criteria }),
        (r) => `${r.places.length} khách sạn`,
      );
      const hotels = found.places.filter(isExternalFound).filter((p) => p.kind === "hotel");
      if (hotels.length < MIN_HOTEL_CANDIDATES) {
        try {
          const extra = await timed(
            " findTripHotels: bù từ Google Maps",
            () => searchHotelsInProvince(province),
            (r) => `${r.length} khách sạn`,
          );
          for (const place of rankHotels(extra)) {
            if (hotels.length >= HOTEL_CANDIDATES) break;
            if (hotels.some((p) => p.id === place.id)) continue;
            hotels.push({ ...place, reason: null, webMentioned: false });
          }
        } catch (error) {
          console.warn("Không bù được khách sạn từ Google Maps:", error);
        }
      }
      return { hotels: hotels.map(toCandidate) };
    },
  }),

  findTripRestaurants: tool({
    description:
      "LẬP LỘ TRÌNH — tìm nhà hàng/quán ăn: tìm trên web theo yêu cầu/món/tiêu chí, sau đó tra Google Maps lấy vị trí và đánh giá. Gọi CÙNG LÚC với `findTripDestinations` và `findTripHotels`. Bỏ qua nếu người dùng không muốn ăn ngoài.",
    inputSchema: tripSearchSchema.extend({
      days: z.number().int().min(1).max(MAX_TRIP_DAYS).default(1).describe("Số ngày của chuyến đi."),
      meals: z
        .array(z.enum(MEALS))
        .min(1)
        .describe(
          "Các bữa ăn mỗi ngày cần quán (breakfast/lunch/dinner). Tự quyết theo yêu cầu và độ dài chuyến đi, vd đi trong ngày → ['lunch'], nhiều ngày → ['lunch','dinner'].",
        ),
      foodKeyword: z
        .string()
        .optional()
        .describe("Món/đặc sản người dùng muốn ăn hoặc đặc sản nổi tiếng của vùng, vd: 'gà đồi', 'bánh đa cua', 'dê núi'."),
    }),
    execute: async ({ request, province, criteria, days, meals, foodKeyword }) => {
      const target = restaurantCandidateCount(days, meals.length);
      const food = foodKeyword?.trim();
      const found = await timed(
        " findTripRestaurants: web → Google Maps",
        () =>
          findPlaces({
            request: food ? `${request}. Muốn ăn: ${food}` : request,
            province,
            kinds: ["restaurant"],
            maxPlaces: target,
            internal: false,
            criteria,
          }),
        (r) => `${r.places.length} quán`,
      );
      const restaurants = found.places.filter(isExternalFound).filter((p) => p.kind === "restaurant");
      if (restaurants.length < target) {
        try {
          const extra = await timed(" findTripRestaurants: bù từ Google Maps", () =>
            searchExternalPlaces({ query: food || "nhà hàng đặc sản", province }),
          );
          for (const place of extra) {
            if (restaurants.length >= target) break;
            if (place.kind !== "restaurant" || restaurants.some((p) => p.id === place.id)) continue;
            restaurants.push({ ...place, reason: null, webMentioned: false });
          }
        } catch (error) {
          console.warn("Không bù được quán ăn từ Google Maps:", error);
        }
      }
      return { meals, restaurants: restaurants.map(toCandidate) };
    },
  }),

  createTrip: tool({
    description:
      "LẬP LỘ TRÌNH — bước cuối: tạo lộ trình từ khách sạn, điểm tham quan và quán ăn BẠN đã chọn trong kết quả 3 tool tìm. Hệ thống tự chia ngày, xếp quán vào từng ngày/bữa và sắp thứ tự di chuyển ngắn nhất theo đường bộ (xuất phát và quay về khách sạn).",
    inputSchema: z.object({
      title: z.string().min(1).describe("Tên ngắn gọn cho lộ trình, ví dụ: 'Ninh Bình 2 ngày 1 đêm'."),
      province: z.string().min(1).describe("Điểm đến chính, ví dụ: Ninh Bình, Cát Bà, Hà Nội."),
      days: z
        .number()
        .int()
        .min(1)
        .max(MAX_TRIP_DAYS)
        .describe("BẮT BUỘC: số ngày của chuyến đi (2 ngày 1 đêm → 2)."),
      hotelId: z.string().min(1).describe("`id` của MỘT khách sạn trong `hotels` của `findTripHotels`."),
      destinationIds: z
        .array(z.string().min(1))
        .min(1)
        .max(MAX_STOPS_PER_DAY * MAX_TRIP_DAYS)
        .describe("`id` các điểm tham quan bạn chọn trong `destinations` của `findTripDestinations` (khoảng 3–4 điểm mỗi ngày)."),
      meals: z
        .array(z.enum(MEALS))
        .default([])
        .describe("Các bữa mỗi ngày cần quán, đúng như đã truyền cho `findTripRestaurants`; [] nếu không ăn ngoài."),
      restaurants: z
        .array(
          z.object({
            id: z.string().min(1).describe("`id` của quán trong `restaurants` của `findTripRestaurants`."),
            meal: z
              .enum(MEALS)
              .optional()
              .describe("Chỉ điền khi quán hợp riêng một bữa (vd quán phở → breakfast); bỏ trống để hệ thống tự xếp."),
          }),
        )
        .max(MAX_TRIP_DAYS * MEALS.length)
        .default([])
        .describe("Các quán bạn chọn, khoảng (số ngày × số bữa) quán, không trùng nhau."),
    }),
    execute: async ({ province, days, title, hotelId, destinationIds, meals, restaurants }) => {
      // Kiểm tra lại từ CSDL: chỉ nhận địa điểm thật đã tra Google Maps, đúng loại
      const validateStart = performance.now();
      const hotel = await resolvePlace({ source: "external", kind: "hotel", refId: hotelId });
      if (!hotel || hotel.kind !== "hotel") {
        return {
          ok: false as const,
          error: "`hotelId` không phải khách sạn trong kết quả `findTripHotels`, hãy chọn khách sạn khác.",
        };
      }
      const uniqueIds = [...new Set(destinationIds)].filter((id) => id !== hotelId);
      const resolved = await Promise.all(
        uniqueIds.map((refId) => resolvePlace({ source: "external", kind: "destination", refId })),
      );
      const destinations = resolved.filter(
        (p): p is NonNullable<typeof p> => p != null && p.kind === "destination",
      );
      logTiming(" createTrip: kiểm tra id trong CSDL", performance.now() - validateStart, `${destinations.length} điểm hợp lệ`);
      if (destinations.length === 0) {
        return {
          ok: false as const,
          error: "Không có điểm tham quan hợp lệ trong `destinationIds`, hãy chọn lại từ kết quả `findTripDestinations`.",
        };
      }
      // Tìm theo tên có thể ra khách sạn ở nơi khác (vd "Hà Giang Hotel" ở Quảng Ninh): đo tới điểm tham quan GẦN NHẤT
      // (không đo tới tâm: cung đường dài như Hà Giang có tâm nằm giữa núi)
      const hotelKm = Math.min(...destinations.map((d) => haversineKm(d, hotel)));
      if (hotelKm > HOTEL_MAX_DISTANCE_KM) {
        return {
          ok: false as const,
          error: `Khách sạn "${hotel.name}" cách các điểm tham quan đã chọn ${Math.round(hotelKm)} km — hãy chọn khách sạn khác gần hơn trong \`hotels\`.`,
        };
      }

      const seen = new Set<string>();
      const restaurantRefs = restaurants
        .filter((r) => !seen.has(r.id) && seen.add(r.id))
        .map((r) => ({ ref: { source: "external" as const, kind: "restaurant" as const, refId: r.id }, meal: r.meal }));

      try {
        const { view, skippedRestaurants } = await timed(" createTrip: tạo lộ trình + xếp quán + tối ưu đường bộ", () =>
          createTripFromPlaces({
            title,
            province,
            days,
            userId,
            places: [hotel, ...destinations].map((p) => ({ source: p.source, kind: p.kind, refId: p.refId })),
            restaurants: restaurantRefs,
            meals,
          }),
        );
        return { ok: true as const, ...tripSummary(view), skippedRestaurants };
      } catch (error) {
        console.error("Tạo lộ trình thất bại:", error);
        return { ok: false as const, error: "Hệ thống chưa tạo được lộ trình, vui lòng thử lại sau." };
      }
    },
  }),
}) satisfies ToolSet;

export type ChatTools = InferUITools<ReturnType<typeof buildChatTools>>;

export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>;
