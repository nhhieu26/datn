import {
  InferUITools,
  type UIMessage,
  type UIDataTypes,
  tool,
  type ToolSet,
} from "ai";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const MAX_RESULTS = 5;

const provinceField = z
  .string()
  .optional()
  .describe("Tên tỉnh/thành phố, ví dụ: Đà Nẵng, Hội An, Hà Nội.");
const tagsField = z
  .array(z.string())
  .optional()
  .describe("Từ khóa chủ đề/loại hình, ví dụ: biển, ẩm thực, gia đình.");
const limitField = z.number().int().min(1).max(MAX_RESULTS).default(MAX_RESULTS);

const provinceWhere = (province?: string) =>
  province
    ? {
        OR: [
          { name: { contains: province, mode: "insensitive" as const } },
          { fullName: { contains: province, mode: "insensitive" as const } },
        ],
      }
    : undefined;

const tagsWhere = (tags?: string[]) =>
  tags?.length
    ? {
        some: {
          tag: {
            OR: tags.map((name) => ({
              name: { contains: name, mode: "insensitive" as const },
            })),
          },
        },
      }
    : undefined;

// Ảnh lưu dạng Json; chỉ lấy ảnh đầu tiên nếu là chuỗi
const firstImage = (images: unknown) =>
  Array.isArray(images) && typeof images[0] === "string" ? images[0] : null;

const num = (value: { toString(): string } | null | undefined) =>
  value == null ? null : Number(value.toString());

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

export const chatTools = {
  // Tool không có execute: model gọi để hỏi lại người dùng,
  // câu trả lời do client gửi về qua addToolOutput
  askUser: tool({
    description:
      "Hỏi lại người dùng khi câu hỏi hiện tại còn thiếu thông tin quan trọng (điểm đến, ngân sách, số người đi, sở thích...). Chỉ hỏi MỘT câu về MỘT thông tin duy nhất mỗi lần gọi. Chỉ dùng khi chưa thể đưa ra lời khuyên tốt.",
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
      "Lấy dự báo thời tiết thực tế (nhiệt độ, khả năng mưa) cho một tỉnh/thành phố trong những ngày tới (tối đa 14 ngày kể từ hôm nay). Dùng khi người dùng hỏi thời tiết hoặc đã chọn ngày đi cụ thể. Không dùng cho câu hỏi khí hậu theo mùa chung chung.",
    inputSchema: z.object({
      province: z
        .string()
        .describe("Tên tỉnh/thành phố, ví dụ: Đà Lạt, Đà Nẵng, Sa Pa."),
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
      "Tìm tour trong cơ sở dữ liệu Roamly theo điểm đến, chủ đề, ngân sách và số ngày. Luôn dùng trước khi gợi ý tour cụ thể.",
    inputSchema: z.object({
      province: provinceField,
      tags: tagsField,
      maxPrice: z.number().positive().optional().describe("Giá tối đa (VND)."),
      days: z.number().int().positive().optional().describe("Số ngày của tour."),
      limit: limitField,
    }),
    execute: async ({ province, tags, maxPrice, days, limit }) => {
      const tours = await prisma.tour.findMany({
        where: {
          ...liveService,
          province: provinceWhere(province),
          tags: tagsWhere(tags),
          ...(maxPrice ? { basePrice: { lte: maxPrice } } : {}),
          ...(days ? { durationDays: days } : {}),
        },
        orderBy: [{ ratingAvg: "desc" }, { reviewCount: "desc" }],
        take: limit,
        select: {
          title: true,
          slug: true,
          images: true,
          durationDays: true,
          durationNights: true,
          basePrice: true,
          ratingAvg: true,
          reviewCount: true,
          province: { select: { name: true } },
          tags: { select: { tag: { select: { name: true } } } },
        },
      });
      return tours.map((t) => ({
        title: t.title,
        url: `/tours/${t.slug}`,
        image: firstImage(t.images),
        province: t.province.name,
        duration: `${t.durationDays}N${t.durationNights}Đ`,
        price: num(t.basePrice),
        rating: num(t.ratingAvg),
        reviewCount: t.reviewCount,
        tags: t.tags.map((x) => x.tag.name),
      }));
    },
  }),

  searchHotels: tool({
    description:
      "Tìm khách sạn trong cơ sở dữ liệu Roamly theo điểm đến, tiện nghi và giá phòng. Luôn dùng trước khi gợi ý khách sạn cụ thể.",
    inputSchema: z.object({
      province: provinceField,
      tags: tagsField,
      amenities: z
        .array(z.string())
        .optional()
        .describe("Tiện nghi mong muốn, ví dụ: hồ bơi, wifi, bữa sáng."),
      maxPrice: z
        .number()
        .positive()
        .optional()
        .describe("Giá phòng mỗi đêm tối đa (VND)."),
      limit: limitField,
    }),
    execute: async ({ province, tags, amenities, maxPrice, limit }) => {
      const hotels = await prisma.hotel.findMany({
        where: {
          ...liveService,
          province: provinceWhere(province),
          tags: tagsWhere(tags),
          ...(amenities?.length
            ? {
                AND: amenities.map((a) => ({
                  amenities: { hasSome: [a, a.toLowerCase()] },
                })),
              }
            : {}),
          rooms: {
            some: {
              status: "published",
              ...(maxPrice ? { basePrice: { lte: maxPrice } } : {}),
            },
          },
        },
        orderBy: [{ ratingAvg: "desc" }, { reviewCount: "desc" }],
        take: limit,
        select: {
          name: true,
          slug: true,
          images: true,
          address: true,
          amenities: true,
          ratingAvg: true,
          reviewCount: true,
          province: { select: { name: true } },
          rooms: {
            where: { status: "published" },
            orderBy: { basePrice: "asc" },
            take: 1,
            select: { basePrice: true },
          },
        },
      });
      return hotels.map((h) => ({
        name: h.name,
        url: `/hotels/${h.slug}`,
        image: firstImage(h.images),
        province: h.province.name,
        address: h.address,
        amenities: h.amenities,
        priceFrom: num(h.rooms[0]?.basePrice),
        rating: num(h.ratingAvg),
        reviewCount: h.reviewCount,
      }));
    },
  }),

  searchRestaurants: tool({
    description:
      "Tìm nhà hàng trong cơ sở dữ liệu Roamly theo điểm đến và loại món/chủ đề. Luôn dùng trước khi gợi ý nhà hàng cụ thể.",
    inputSchema: z.object({
      province: provinceField,
      tags: tagsField,
      limit: limitField,
    }),
    execute: async ({ province, tags, limit }) => {
      const restaurants = await prisma.restaurant.findMany({
        where: {
          ...liveService,
          province: provinceWhere(province),
          tags: tagsWhere(tags),
        },
        orderBy: [{ ratingAvg: "desc" }, { reviewCount: "desc" }],
        take: limit,
        select: {
          name: true,
          slug: true,
          images: true,
          address: true,
          ratingAvg: true,
          reviewCount: true,
          province: { select: { name: true } },
          tags: { select: { tag: { select: { name: true } } } },
        },
      });
      return restaurants.map((r) => ({
        name: r.name,
        url: `/restaurants/${r.slug}`,
        image: firstImage(r.images),
        province: r.province.name,
        address: r.address,
        rating: num(r.ratingAvg),
        reviewCount: r.reviewCount,
        tags: r.tags.map((x) => x.tag.name),
      }));
    },
  }),

  searchDestinations: tool({
    description:
      "Tìm địa điểm tham quan trong cơ sở dữ liệu Roamly theo điểm đến và chủ đề. Luôn dùng trước khi gợi ý địa điểm cụ thể.",
    inputSchema: z.object({
      province: provinceField,
      tags: tagsField,
      limit: limitField,
    }),
    execute: async ({ province, tags, limit }) => {
      const destinations = await prisma.destination.findMany({
        where: {
          isPublished: true,
          province: provinceWhere(province),
          tags: tagsWhere(tags),
        },
        take: limit,
        select: {
          name: true,
          slug: true,
          images: true,
          address: true,
          openTime: true,
          closeTime: true,
          ticketPrice: true,
          province: { select: { name: true } },
          tags: { select: { tag: { select: { name: true } } } },
        },
      });
      return destinations.map((d) => ({
        name: d.name,
        url: `/destinations/${d.slug}`,
        image: firstImage(d.images),
        province: d.province.name,
        address: d.address,
        hours: `${d.openTime} - ${d.closeTime}`,
        ticketPrice: num(d.ticketPrice),
        tags: d.tags.map((x) => x.tag.name),
      }));
    },
  }),
} satisfies ToolSet;

export type ChatTools = InferUITools<typeof chatTools>;

export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>;
