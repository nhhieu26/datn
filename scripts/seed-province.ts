import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import type { ProvinceType } from "../src/generated/prisma/client";

type ProvinceSeed = {
  name: string;
  fullName: string;
  type: ProvinceType;
};

const PROVINCES: ProvinceSeed[] = [
  { name: "Lào Cai", fullName: "Tỉnh Lào Cai", type: "province" },
  { name: "Thái Nguyên", fullName: "Tỉnh Thái Nguyên", type: "province" },
  { name: "Phú Thọ", fullName: "Tỉnh Phú Thọ", type: "province" },
  { name: "Bắc Ninh", fullName: "Tỉnh Bắc Ninh", type: "province" },
  { name: "Hưng Yên", fullName: "Tỉnh Hưng Yên", type: "province" },
  { name: "Hải Phòng", fullName: "Thành phố Hải Phòng", type: "city" },
  { name: "Ninh Bình", fullName: "Tỉnh Ninh Bình", type: "province" },
  { name: "Quảng Trị", fullName: "Tỉnh Quảng Trị", type: "province" },
  { name: "Đà Nẵng", fullName: "Thành phố Đà Nẵng", type: "city" },
  { name: "Quảng Ngãi", fullName: "Tỉnh Quảng Ngãi", type: "province" },
  { name: "Gia Lai", fullName: "Tỉnh Gia Lai", type: "province" },
  { name: "Khánh Hòa", fullName: "Tỉnh Khánh Hòa", type: "province" },
  { name: "Lâm Đồng", fullName: "Tỉnh Lâm Đồng", type: "province" },
  { name: "Đắk Lắk", fullName: "Tỉnh Đắk Lắk", type: "province" },
  { name: "Hồ Chí Minh", fullName: "Thành phố Hồ Chí Minh", type: "city" },
  { name: "Đồng Nai", fullName: "Tỉnh Đồng Nai", type: "province" },
  { name: "Tây Ninh", fullName: "Tỉnh Tây Ninh", type: "province" },
  { name: "Cần Thơ", fullName: "Thành phố Cần Thơ", type: "city" },
  { name: "Vĩnh Long", fullName: "Tỉnh Vĩnh Long", type: "province" },
  { name: "Đồng Tháp", fullName: "Tỉnh Đồng Tháp", type: "province" },
  { name: "Cà Mau", fullName: "Tỉnh Cà Mau", type: "province" },
  { name: "An Giang", fullName: "Tỉnh An Giang", type: "province" },
  { name: "Tuyên Quang", fullName: "Tỉnh Tuyên Quang", type: "province" },
  { name: "Cao Bằng", fullName: "Tỉnh Cao Bằng", type: "province" },
  { name: "Điện Biên", fullName: "Tỉnh Điện Biên", type: "province" },
  { name: "Hà Tĩnh", fullName: "Tỉnh Hà Tĩnh", type: "province" },
  { name: "Lai Châu", fullName: "Tỉnh Lai Châu", type: "province" },
  { name: "Lạng Sơn", fullName: "Tỉnh Lạng Sơn", type: "province" },
  { name: "Nghệ An", fullName: "Tỉnh Nghệ An", type: "province" },
  { name: "Quảng Ninh", fullName: "Tỉnh Quảng Ninh", type: "province" },
  { name: "Thanh Hóa", fullName: "Tỉnh Thanh Hóa", type: "province" },
  { name: "Sơn La", fullName: "Tỉnh Sơn La", type: "province" },
  { name: "Hà Nội", fullName: "Thành phố Hà Nội", type: "city" },
  { name: "Huế", fullName: "Thành phố Huế", type: "city" },
];

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function seedProvinces() {
  for (const province of PROVINCES) {
    const slug = slugify(province.name);

    const imageUrl = `https://picsum.photos/seed/${slug}/1200/800`;

    await prisma.province.upsert({
      where: { slug },
      create: {
        slug,
        name: province.name,
        fullName: province.fullName,
        type: province.type,
        imageUrl,
      },
      update: {
        name: province.name,
        fullName: province.fullName,
        type: province.type,
        imageUrl,
      },
    });

    console.log(`✓ ${province.fullName} (${slug})`);
  }

  console.log(`\nSeeded ${PROVINCES.length} provinces.`);
}
