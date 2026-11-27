/**
 * Điền điểm tham quan Google Maps (`stops`) từ dữ liệu seed vào các tour seed đã có trong DB,
 * khớp theo tên tour và tiêu đề ngày. Không tạo tour mới.
 * Mặc định chỉ điền ngày chưa có điểm; thêm --force để ghi đè cả ngày provider đã chọn điểm.
 *
 *   bun scripts/sync-tour-stops.ts                  # chạy thử, in thay đổi
 *   bun scripts/sync-tour-stops.ts --apply          # ghi vào DB
 *   bun scripts/sync-tour-stops.ts --apply --force  # ghi đè cả ngày đã có điểm
 */
import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import type { TourStop } from "../src/entities/tour/schema";
import { TOURS } from "./seed-tour";

type ItineraryDay = { title: string; description: string; location?: string; stops?: TourStop[] };

const apply = process.argv.includes("--apply");
const force = process.argv.includes("--force");

async function main() {
  const seedByTitle = new Map(TOURS.map((t) => [t.title, t]));
  const tours = await prisma.tour.findMany({
    where: { title: { in: [...seedByTitle.keys()] } },
    select: { id: true, title: true, itinerary: true },
  });

  let updatedTours = 0;
  for (const tour of tours) {
    const seed = seedByTitle.get(tour.title)!;
    const itinerary = (tour.itinerary as ItineraryDay[] | null) ?? [];
    const changes: string[] = [];

    const next = itinerary.map((day) => {
      const seedDay = seed.itinerary.find((d) => d.title === day.title);
      if (!seedDay) return day;
      if (day.stops?.length && !force) {
        changes.push(`  = ${day.title} (đã có ${day.stops.length} điểm, giữ nguyên)`);
        return day;
      }
      changes.push(`  + ${day.title}: ${seedDay.stops.map((s) => s.name).join(" → ")}`);
      return { ...day, stops: seedDay.stops };
    });

    const changed = changes.some((c) => c.startsWith("  +"));
    console.log(`${changed ? "✓" : "·"} ${tour.title} [${tour.id}]`);
    changes.forEach((c) => console.log(c));
    if (changed) {
      updatedTours += 1;
      if (apply) await prisma.tour.update({ where: { id: tour.id }, data: { itinerary: next } });
    }
  }

  console.log(
    `\n${apply ? "Đã cập nhật" : "Sẽ cập nhật"} ${updatedTours}/${tours.length} tour.` +
      (apply ? "" : " Chạy lại với --apply để ghi vào DB."),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
