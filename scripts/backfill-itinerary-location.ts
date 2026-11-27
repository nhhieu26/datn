/**
 * Điền `location` cho từng ngày lịch trình của các tour cũ, suy ra từ tiêu đề ngày
 * (VD "Ngày 1: Hà Nội - Bái Đính - Tràng An - Hà Nội" → "Bái Đính - Tràng An").
 * Chỉ điền ngày còn trống, không ghi đè địa điểm nhà cung cấp đã nhập.
 *
 * Điểm Google Maps (`stops`) do provider tự tìm và chọn trong form tour, script không tự chọn.
 *
 *   npx tsx scripts/backfill-itinerary-location.ts                     # chạy thử, in kết quả
 *   npx tsx scripts/backfill-itinerary-location.ts --apply             # ghi vào DB
 */
import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import type { TourStop } from "../src/entities/tour/schema";

type ItineraryDay = {
  title: string;
  description: string;
  location?: string;
  stops?: TourStop[];
};

// Điểm đón/trả khách, không phải điểm tham quan của tour
const PICKUP_POINTS = ["hà nội"];
// Hoạt động chứ không phải địa điểm
const NON_PLACES = ["spa"];
// Từ mô tả hoạt động đi kèm tên địa điểm, VD "Ninh Bình food tour" → "Ninh Bình"
const ACTIVITY_WORDS = /\b(food tour|city tour)\b|^trekking\s+/gi;
// Tên dễ bị Google gắn nhầm vào tỉnh của tour → ghi rõ khu vực
const PLACE_OVERRIDES: Record<string, string> = {
  "hạ long": "Vịnh Hạ Long, Quảng Ninh",
};

export function deriveDayLocation(title: string): string {
  const stops: string[] = [];
  const body = title.replace(/^\s*ngày\s*\d+\s*[:.\-–]\s*/i, "");
  for (const raw of body.split(/\s+[-–→]\s+/)) {
    const part = raw.replace(ACTIVITY_WORDS, "").replace(/\s+/g, " ").trim();
    const key = part.toLowerCase();
    if (!part || PICKUP_POINTS.includes(key) || NON_PLACES.includes(key)) {
      continue;
    }
    const stop = PLACE_OVERRIDES[key] ?? part;
    if (stops.at(-1) !== stop) stops.push(stop);
  }
  return stops.join(" - ");
}

async function main() {
  const apply = process.argv.includes("--apply");
  const tours = await prisma.tour.findMany({
    select: { id: true, slug: true, itinerary: true },
    orderBy: { createdAt: "asc" },
  });

  let changedTours = 0;
  for (const tour of tours) {
    const days = Array.isArray(tour.itinerary)
      ? (tour.itinerary as ItineraryDay[])
      : [];
    let changed = false;
    const next = days.map((day) => {
      if (day.location?.trim()) return day;
      const location = deriveDayLocation(day.title ?? "");
      if (!location) return day;
      changed = true;
      return { ...day, location };
    });

    console.log(`\n# ${tour.slug}${changed ? "" : " (giữ nguyên)"}`);
    next.forEach((day) =>
      console.log(`  - ${day.title}\n      → ${day.location || "(trống)"}`)
    );

    if (changed) {
      changedTours++;
      if (apply) {
        await prisma.tour.update({
          where: { id: tour.id },
          data: { itinerary: next },
        });
      }
    }
  }

  console.log(
    `\n${apply ? "Đã cập nhật" : "Sẽ cập nhật (chạy thử)"} ${changedTours}/${tours.length} tour.` +
      (apply ? "" : " Thêm --apply để ghi vào DB.")
  );
}

// Chỉ chạy khi gọi trực tiếp, để seed có thể import deriveDayLocation
if (process.argv[1]?.includes("backfill-itinerary-location")) {
  main().finally(() => prisma.$disconnect());
}
