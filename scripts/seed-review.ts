/**
 * Seed đánh giá (review) cho tour / khách sạn / nhà hàng, rồi cập nhật ratingAvg + reviewCount.
 * Chạy sau seed user + dịch vụ (đã gọi trong scripts/seed.ts), hoặc chạy riêng:
 *
 *   bun scripts/seed-review.ts
 *
 * Review seed được đánh dấu bằng tiền tố SEED_TAG trong nội dung; chạy lại sẽ xóa review seed cũ rồi tạo mới.
 * Review seed không gắn với đơn (booking) nào nên không chặn khách review đơn thật.
 */
import "dotenv/config";
import { prisma } from "../src/lib/prisma";

const SEED_TAG = "[seed] ";
const DAY_MS = 24 * 60 * 60 * 1000;
const REVIEWS_PER_SERVICE = 5;

type Kind = "tour" | "hotel" | "restaurant";

const COMMENTS: Record<Kind, Record<number, string[]>> = {
  tour: {
    5: [
      "Chuyến đi tuyệt vời, hướng dẫn viên nhiệt tình và lịch trình hợp lý. Sẽ quay lại!",
      "Cảnh đẹp, tổ chức chuyên nghiệp, đồ ăn ngon. Rất đáng tiền.",
      "Mọi thứ vượt mong đợi, cả gia đình đều rất hài lòng.",
    ],
    4: [
      "Tour khá tốt, lịch trình hơi dày nhưng hướng dẫn viên vui vẻ.",
      "Dịch vụ ổn, xe đón đúng giờ. Bữa trưa có thể cải thiện thêm.",
    ],
    3: [
      "Trải nghiệm bình thường, điểm đến đẹp nhưng thời gian ở mỗi nơi hơi ngắn.",
    ],
    2: ["Đoàn đông nên hơi ồn, lịch trình bị trễ so với dự kiến."],
    1: ["Không như mô tả, hướng dẫn viên thiếu nhiệt tình."],
  },
  hotel: {
    5: [
      "Phòng sạch sẽ, view đẹp, nhân viên thân thiện. Bữa sáng rất ngon.",
      "Vị trí thuận tiện, phòng thoải mái, sẽ quay lại lần sau.",
      "Dịch vụ xuất sắc, check-in nhanh và được hỗ trợ tận tình.",
    ],
    4: [
      "Phòng đẹp, tiện nghi đầy đủ. Cách âm có thể tốt hơn.",
      "Khách sạn ổn so với giá, nhân viên lịch sự.",
    ],
    3: ["Phòng sạch nhưng hơi cũ, wifi chập chờn vào buổi tối."],
    2: ["Điều hòa kêu to, phải đổi phòng mới ngủ được."],
    1: ["Phòng không giống ảnh, vệ sinh chưa tốt."],
  },
  restaurant: {
    5: [
      "Món ăn ngon, không gian đẹp, phục vụ nhanh. Rất đáng thử!",
      "Hương vị đậm đà, giá hợp lý, nhân viên chu đáo.",
      "Đặt bàn dễ dàng, đồ ăn lên đúng hẹn và rất tươi ngon.",
    ],
    4: [
      "Đồ ăn ngon, hơi đông vào giờ cao điểm nên phải chờ một chút.",
      "Không gian thoải mái, món ăn ổn. Sẽ ghé lại.",
    ],
    3: ["Món ăn tạm được, phần ăn hơi ít so với giá."],
    2: ["Phục vụ chậm, món lên không đều."],
    1: ["Món nguội, thái độ phục vụ chưa tốt."],
  },
};

/** Phân bố sao nghiêng về tích cực để điểm trung bình trông thực tế. */
const RATING_PATTERN = [5, 4, 5, 3, 5, 4, 5, 4, 2, 5, 4, 1];

function pick<T>(items: T[], index: number) {
  return items[index % items.length];
}

function reviewData(kind: Kind, serviceIndex: number, i: number) {
  const rating = pick(RATING_PATTERN, serviceIndex * 3 + i);
  const content = pick(COMMENTS[kind][rating], serviceIndex + i);
  return {
    rating,
    content: `${SEED_TAG}${content}`,
    createdAt: new Date(Date.now() - (1 + i * 5 + serviceIndex) * DAY_MS),
  };
}

async function refreshAggregate(kind: Kind, id: string) {
  const where =
    kind === "tour"
      ? { tourId: id }
      : kind === "hotel"
        ? { hotelId: id }
        : { restaurantId: id };
  const stats = await prisma.review.aggregate({
    where,
    _avg: { rating: true },
    _count: true,
  });
  const data = {
    ratingAvg: Math.round((stats._avg.rating ?? 0) * 10) / 10,
    reviewCount: stats._count,
  };
  if (kind === "tour") await prisma.tour.update({ where: { id }, data });
  else if (kind === "hotel") await prisma.hotel.update({ where: { id }, data });
  else await prisma.restaurant.update({ where: { id }, data });
}

export async function seedReviews() {
  const customers = await prisma.user.findMany({
    where: { role: "customer" },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });
  if (customers.length === 0) {
    console.warn("⚠ Bỏ qua seed review: chưa có tài khoản khách hàng.");
    return;
  }

  // Xóa review seed cũ và tính lại điểm các dịch vụ bị ảnh hưởng
  const old = await prisma.review.findMany({
    where: { content: { startsWith: SEED_TAG } },
    select: { tourId: true, hotelId: true, restaurantId: true },
  });
  await prisma.review.deleteMany({ where: { content: { startsWith: SEED_TAG } } });
  for (const r of old) {
    if (r.tourId) await refreshAggregate("tour", r.tourId);
    if (r.hotelId) await refreshAggregate("hotel", r.hotelId);
    if (r.restaurantId) await refreshAggregate("restaurant", r.restaurantId);
  }

  const [tours, hotels, restaurants] = await Promise.all([
    prisma.tour.findMany({
      where: { deletedAt: null },
      select: { id: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.hotel.findMany({
      where: { deletedAt: null },
      select: { id: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.restaurant.findMany({
      where: { deletedAt: null },
      select: { id: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const services: { kind: Kind; ids: string[] }[] = [
    { kind: "tour", ids: tours.map((t) => t.id) },
    { kind: "hotel", ids: hotels.map((h) => h.id) },
    { kind: "restaurant", ids: restaurants.map((r) => r.id) },
  ];

  let total = 0;
  for (const { kind, ids } of services) {
    let count = 0;
    for (const [serviceIndex, id] of ids.entries()) {
      // Bỏ qua dịch vụ cách quãng để còn dịch vụ chưa có đánh giá
      if (serviceIndex % 5 === 4) continue;

      const n = Math.min(REVIEWS_PER_SERVICE, customers.length);
      for (let i = 0; i < n; i++) {
        await prisma.review.create({
          data: {
            customerId: pick(customers, serviceIndex + i).id,
            ...reviewData(kind, serviceIndex, i),
            ...(kind === "tour"
              ? { tourId: id }
              : kind === "hotel"
                ? { hotelId: id }
                : { restaurantId: id }),
          },
        });
        count++;
      }
      await refreshAggregate(kind, id);
    }
    console.log(`✓ ${count} review ${kind}`);
    total += count;
  }
  return total;
}

if (process.argv[1]?.endsWith("seed-review.ts")) {
  seedReviews()
    .catch((err) => {
      console.error(err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
