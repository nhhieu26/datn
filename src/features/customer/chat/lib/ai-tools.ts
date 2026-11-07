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
import { findPlaces } from "./find-places";
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
} satisfies ToolSet;

export type ChatTools = InferUITools<typeof chatTools>;

export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>;
