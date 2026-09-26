import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { slugify } from "@/lib/utils";

const TAGS: string[] = [
  "Biển",
  "Núi",
  "Phượt",
  "Nghỉ dưỡng",
  "Sang trọng",
  "Giá rẻ",
  "Gia đình",
  "Cặp đôi",
  "Bạn bè",
  "Một mình",
  "Ẩm thực đường phố",
  "Đặc sản địa phương",
  "Chay",
  "Hải sản",
  "Homestay",
  "Resort",
  "Khách sạn 5 sao",
  "Gần biển",
  "Trung tâm thành phố",
  "Thiên nhiên",
  "Văn hóa - lịch sử",
  "Phiêu lưu mạo hiểm",
];

export async function seedTags() {
  for (const name of TAGS) {
    const slug = slugify(name);

    await prisma.tag.upsert({
      where: { slug },
      create: { slug, name },
      update: { name },
    });

    console.log(`✓ ${name} (${slug})`);
  }

  console.log(`\nSeeded ${TAGS.length} tags.`);
}
