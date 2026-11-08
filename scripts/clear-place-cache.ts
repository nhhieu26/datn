import "dotenv/config";
import { createInterface } from "node:readline/promises";
import { prisma } from "../src/lib/prisma";

// Xoá TOÀN BỘ cache tìm kiếm địa điểm (bảng ExternalPlaceSearch): mọi key gmaps|..., gmaps-list|..., gmaps-near|...,
// gmaps-hotels|... của bản này và cả key serp|... của bản app khác dùng chung CSDL.
// Lần tìm sau sẽ gọi lại Google Places API (tính phí). Không xoá địa điểm đã lưu (ExternalPlace) hay lộ trình.
// Dùng: bun scripts/clear-place-cache.ts [--yes]

async function main() {
  const rows = await prisma.externalPlaceSearch.findMany({ select: { queryKey: true } });
  if (rows.length === 0) {
    console.log("Cache tìm kiếm địa điểm đang trống.");
    return;
  }

  const byPrefix = new Map<string, number>();
  for (const { queryKey } of rows) {
    const prefix = queryKey.split("|")[0] || "(không có tiền tố)";
    byPrefix.set(prefix, (byPrefix.get(prefix) ?? 0) + 1);
  }
  console.log(`Sẽ xoá ${rows.length} bản ghi cache trong ExternalPlaceSearch:`);
  for (const [prefix, count] of [...byPrefix].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${prefix}: ${count}`);
  }

  if (!process.argv.includes("--yes")) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    const answer = await rl.question("\nTiếp tục? (y/N) ");
    rl.close();
    if (answer.trim().toLowerCase() !== "y") {
      console.log("Đã huỷ.");
      return;
    }
  }

  const { count } = await prisma.externalPlaceSearch.deleteMany({});
  console.log(`\nĐã xoá ${count} bản ghi cache.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
