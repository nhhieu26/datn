import type { ServiceStatus } from "@/generated/prisma/client";

export type TourListItem = {
  id: string;
  code: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  provinceName: string;
  durationDays: number;
  durationNights: number;
  basePrice: number;
  nearestDepartureDate: string | null;
  totalBookings: number;
  rating: number | null;
  reviewCount: number;
  status: ServiceStatus;
};

const IMAGES = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCXSk5PTysU3Sjo7Su5I8eJg_cWR-089y-SyD1w3ABaxYMxyDP6KgpxlPxFXUTkZTniN1jjC92DKfydxZ9rDARlAlvK2u_BoiWonq8JVerK8BqxPHAEKkw5RdauYz5U_YQjre4CCkEis50GIGxtHACko2G2zABMpeH5_A68lQ5xE18KuV2V7PpDu5fZ6x-dHw6cAFM-85Wgn6lVjvr4QCNlBMtXb4Qhq1Y4VW3JNTPB4ZsykqzZSdAS",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD1RaPFI2-sTs9SkhtgVg7QUOhLtS_QVlLewiBjzR7SBCxbaYxYp5WlKemwE7we5M6Qx-ndiAb89fMSC1rL4Z1OQbl0UCEklwHG8NO7xPMcANPoDTegzcBChBVqD1xFkCQVnVN9xZhDoLj_1O4YReecLH-Vki6544rJZzV7mc1tFZs3n9wQCuq85KfAb1djR_fM3fpjg1J8N5vlgAQHY8EXjLWVC_WyI1-LTullB-HyVPLFaD1_HEou",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBI7KV3SbE1LL2zv38bn2htS_zYp6m0Xp9lbSygtt30Czwlo3YbSQfbBfZulT9rFFDMsPl6OXkBca_1znWC1v-OSBpTmR31FpJSUBFlx1HMd6KhNjA6rinqJ83PI4DifUVkUX_FGQ4qBoH7Q-mLrtYZn2gw69cYW8G4kXc2cRgOczArxJZkUJ5TVjyVwfbR0CcygFTlejcfqWDDv_6x5y2eEQ5OJ5C4Ch9M_9FvL0NJie1INCIuZV53",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBAGi9ZstA3tOuRgLX2eRLSjmzE5Zxg21rnyitfn7JQWNqXQfEMUEoqrOxQziJ8EYMvjOnCp0ANKRiuVsDg4lD8JwiSbuOfnzpVvgUf6JLB7MaMiXfqMYMy364kKb8c1ZFes9ci_naqwNI1KhxN5FRdCzK3LFZJczjrQ25ZSin2s3DW864O8g9ZpKi93k3egI02OPAqo0tHtxx_X5xQ39_ut4WqMsq9u7tDVect_wXSun6izhlNct7m",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDVGQ0oNS8aUDUBcorQFFiqT6yNglWZDttn9_PYDuizG1wmFLNkyu1X3lcusRSqFJwJQEZRzNcTps2h3kWtukYA9m92d7KsWw0GTelX2Q1rrNgZcnuQTEVEKsYCQ-tcCZ8CrPEBbgOVRWWJsR6lIDxvbyxjbYbwY5if0vStwUp6cwV4J1I4dxhGujHxIDEWDLBBg7pACALtqvEkRYFiCfcRpkv8_QtYCyrYGxGagCb0-SlxLSq0oNrO",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDvd0IH-dCDPEMSgcLZ7JXDnH6jc187wjPjljwJM94Fu_kzj3UZ8QVLWET6VlyqLqBCAbE5TRrFwpz5y5rZ0CwDqbvgjTEb4eRnFmQHLXCJipcGewCkr0FisAuLi3w1Q885TzFWAu9pVQt1cvOZzA-lT52qXl-aK9G6tF8A43gPNAXHYYxE07N4w92yHaWho0sCVPbExq0-m6_5N7t_amx62EpSpBDK1D7WKPqrZ0jGzI55JQN6SP6j",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuATrSFSqurBfvKKWB0Yp6eYM86uMrk0i5ZriZwFjI8cenx9Wp9Pl6yZkcfbR1DjYRH3mW6PnI2WB2JKHWgZShg9zjPXH7w0Z6CcfSEwk2MvUz-MvDOr57Kz_t29STQbnsOC4_6v4uzeu20_l34m_kY5j6nkvYhK39lhe3MglUoBkxjpaLuZfvIZeSH9Vvqvyd4KjMrF63uCSlA49v4bYAXir6_JIWLdmuUVL2FafWOnPNf9bRVogiks",
];

export const MOCK_TOURS: TourListItem[] = [
  {
    id: "tr8092",
    code: "TR-8092",
    title: "Trekking Săn Mây Sa Pa & Suối Khoáng Nóng",
    description:
      "Chinh phục đỉnh Fansipan ngắm bình minh trên biển mây và thư giãn tại suối khoáng nóng tự nhiên.",
    imageUrl: IMAGES[0],
    category: "Thiên nhiên & Phiêu lưu",
    provinceName: "Lào Cai",
    durationDays: 2,
    durationNights: 1,
    basePrice: 1890000,
    nearestDepartureDate: "2026-04-18",
    totalBookings: 148,
    rating: 4.8,
    reviewCount: 320,
    status: "published",
  },
  {
    id: "tr5519",
    code: "TR-5519",
    title: "Khám Phá Văn Hóa Bản Địa & Thác Nước Thái Nguyên",
    description:
      "Đắm mình trong văn hóa làng nghề truyền thống, thăm rừng chè cổ thụ và thác nước ẩn giấu.",
    imageUrl: IMAGES[1],
    category: "Văn hóa ẩm thực",
    provinceName: "Thái Nguyên",
    durationDays: 2,
    durationNights: 1,
    basePrice: 3250000,
    nearestDepartureDate: "2026-04-20",
    totalBookings: 92,
    rating: 4.9,
    reviewCount: 185,
    status: "paused",
  },
  {
    id: "tr3120",
    code: "TR-3120",
    title: "Du Thuyền Ngủ Đêm Vịnh Hạ Long & Kayak",
    description:
      "Hành trình du thuyền khám phá hang động đá vôi, làng chài và chèo kayak giữa vịnh di sản.",
    imageUrl: IMAGES[2],
    category: "Nghỉ dưỡng & Biển đảo",
    provinceName: "Quảng Ninh",
    durationDays: 3,
    durationNights: 2,
    basePrice: 4650000,
    nearestDepartureDate: "2026-04-22",
    totalBookings: 115,
    rating: 4.7,
    reviewCount: 210,
    status: "published",
  },
  {
    id: "tr2904",
    code: "TR-2904",
    title: "Trải Nghiệm Ẩm Thực Cung Đình & Chợ Sớm Hà Nội",
    description:
      "Tour ẩm thực đêm khám phá 36 phố phường, thưởng thức đặc sản gia truyền và cà phê trứng.",
    imageUrl: IMAGES[3],
    category: "Văn hóa ẩm thực",
    provinceName: "Hà Nội",
    durationDays: 1,
    durationNights: 0,
    basePrice: 890000,
    nearestDepartureDate: "2026-04-25",
    totalBookings: 34,
    rating: 4.6,
    reviewCount: 56,
    status: "pending",
  },
  {
    id: "tr1102",
    code: "TR-1102",
    title: "Khám Phá Rừng Nhiệt Đới & Hang Động Phong Nha",
    description:
      "Tour mạo hiểm xuyên rừng nguyên sinh, khám phá hệ thống hang động kỳ vĩ và sông ngầm.",
    imageUrl: IMAGES[4],
    category: "Phiêu lưu mạo hiểm",
    provinceName: "Quảng Bình",
    durationDays: 3,
    durationNights: 2,
    basePrice: 7200000,
    nearestDepartureDate: null,
    totalBookings: 0,
    rating: null,
    reviewCount: 0,
    status: "rejected",
  },
  {
    id: "tr4417",
    code: "TR-4417",
    title: "Săn Ảnh Đồi Chè & Thác Bản Giốc Mùa Nước Đổ",
    description:
      "Hành trình nhiếp ảnh đến thác Bản Giốc hùng vĩ và những đồi chè xanh mướt miền biên viễn.",
    imageUrl: IMAGES[5],
    category: "Nhiếp ảnh & Trải nghiệm",
    provinceName: "Cao Bằng",
    durationDays: 3,
    durationNights: 2,
    basePrice: 3990000,
    nearestDepartureDate: "2026-05-02",
    totalBookings: 61,
    rating: 4.8,
    reviewCount: 97,
    status: "published",
  },
  {
    id: "tr7781",
    code: "TR-7781",
    title: "Nghỉ Dưỡng Biển Đảo Phú Quốc & Lặn Ngắm San Hô",
    description:
      "Kỳ nghỉ trọn gói tại resort 5 sao kết hợp lặn biển ngắm san hô và khám phá làng chài.",
    imageUrl: IMAGES[6],
    category: "Nghỉ dưỡng & Biển đảo",
    provinceName: "Kiên Giang",
    durationDays: 4,
    durationNights: 3,
    basePrice: 8500000,
    nearestDepartureDate: "2026-05-08",
    totalBookings: 203,
    rating: 4.9,
    reviewCount: 412,
    status: "published",
  },
  {
    id: "tr6350",
    code: "TR-6350",
    title: "Đạp Xe Xuyên Đồng Lúa Tam Cốc & Hang Múa",
    description:
      "Đạp xe qua cánh đồng lúa chín, chèo thuyền Tam Cốc và leo núi ngắm toàn cảnh Hang Múa.",
    imageUrl: IMAGES[0],
    category: "Thiên nhiên & Phiêu lưu",
    provinceName: "Ninh Bình",
    durationDays: 2,
    durationNights: 1,
    basePrice: 1590000,
    nearestDepartureDate: "2026-05-15",
    totalBookings: 0,
    rating: null,
    reviewCount: 0,
    status: "pending",
  },
  {
    id: "tr9021",
    code: "TR-9021",
    title: "City Tour Đà Nẵng - Bà Nà Hills & Cầu Rồng",
    description:
      "Khám phá thành phố đáng sống với Bà Nà Hills, Cầu Vàng và show phun lửa Cầu Rồng về đêm.",
    imageUrl: IMAGES[2],
    category: "Nghỉ dưỡng & Biển đảo",
    provinceName: "Đà Nẵng",
    durationDays: 2,
    durationNights: 1,
    basePrice: 2190000,
    nearestDepartureDate: "2026-04-30",
    totalBookings: 87,
    rating: 4.5,
    reviewCount: 143,
    status: "paused",
  },
];

export type ToursSummary = {
  total: number;
  published: number;
  pending: number;
  inactive: number;
};

export function getToursSummary(tours: TourListItem[]): ToursSummary {
  return {
    total: tours.length,
    published: tours.filter((tour) => tour.status === "published").length,
    pending: tours.filter((tour) => tour.status === "pending").length,
    inactive: tours.filter(
      (tour) => tour.status === "paused" || tour.status === "rejected"
    ).length,
  };
}
