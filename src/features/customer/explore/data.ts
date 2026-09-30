export type ExploreKind = "destination" | "hotel" | "restaurant" | "tour";

export type ExploreItem = {
  id: string;
  kind: ExploreKind;
  title: string;
  location: string;
  description: string;
  rating: number;
  reviews: string;
  image: string;
  price?: string;
  priceUnit?: string;
};

export type MapListItem = {
  id: string;
  kind: ExploreKind;
  title: string;
  location: string;
  image: string;
  rating: number;
  priceText: string;
  priceUnit?: string;
};

const IMG = "https://lh3.googleusercontent.com/aida-public/";

export const TOTAL_RESULTS = 126;

export const KIND_LABELS: Record<ExploreKind, string> = {
  destination: "Điểm đến",
  hotel: "Khách sạn",
  restaurant: "Nhà hàng",
  tour: "Tour",
};

export const KIND_FILTERS: { label: string; kind: ExploreKind }[] = [
  { label: "Tour", kind: "tour" },
  { label: "Khách sạn", kind: "hotel" },
  { label: "Nhà hàng", kind: "restaurant" },
  { label: "Điểm đến", kind: "destination" },
];

export const RATING_FILTERS = ["4.5 trở lên", "4.0 trở lên", "3.5 trở lên"];

export const DURATION_FILTERS = ["1 ngày", "2–3 ngày", "4–7 ngày", "7+ ngày"];

export const STYLE_FILTERS = [
  "Biển",
  "Thiên nhiên",
  "Ẩm thực",
  "Nghỉ dưỡng",
  "Phiêu lưu",
  "Gia đình",
];

export const EXPLORE_ITEMS: ExploreItem[] = [
  {
    id: "bali",
    kind: "destination",
    title: "Bali, Indonesia",
    location: "Bali, Indonesia",
    description:
      "Thiên đường nhiệt đới với bãi biển tuyệt đẹp, văn hóa độc đáo và ẩm thực phong phú.",
    rating: 4.8,
    reviews: "12.5K",
    image: `${IMG}AB6AXuAJ9kUM3p0aolkFTvkDru74KIm_xaadl-KM6YvNON092w0B1JPIWBMYrU4GX_VKw1mkY9RXuLGBX-TJEAKF5h55a-ga9CcpJWAcU6YxcQUsWxtMvZUcu0SRLwjdxqTQk71zRh9zSdfUXAVobfb-4WdcLGRfspLnEVU5kJUJKoNGOI-scHmvZ2PeCFJ7uc1emg4fpch_rRYKcOVEDdZaxhsU8VokvG6kj-hAHVErpfugEnioHZDesgM7`,
  },
  {
    id: "intercontinental-danang",
    kind: "hotel",
    title: "InterContinental Danang",
    location: "Đà Nẵng, Việt Nam",
    description:
      "Khu nghỉ dưỡng 5 sao sang trọng bên bãi biển Non Nước tuyệt đẹp.",
    rating: 4.7,
    reviews: "320",
    price: "Từ 4.500.000đ",
    priceUnit: "/ đêm",
    image: `${IMG}AB6AXuDPhbQzzGHOR0jYod5emESu3a_WFA4mwRs-MG8HZeHsuOee0C2GfoLuF2y6Xg6j5Qg77SXPVr1whgSoI_tsCYoZoSH74muJMbAPDWgLxl-IUQFIhdYKoZX3sT9kg_nscuSCUyLvpyBLnnaeCSJYaNAQs7yQdVdLiX1pCs7brpkS9YNWgWAnTMdymnLF7__liRNQY7IsiHpJjGMtjAd3w6uhrP7LoRL6MsyC7qRr16CQpPXETCqarVrF`,
  },
  {
    id: "nha-hang-nen",
    kind: "restaurant",
    title: "Nhà hàng Nén",
    location: "Đà Nẵng, Việt Nam",
    description:
      "Trải nghiệm ẩm thực Việt Nam đương đại tinh tế với thực đơn theo mùa.",
    rating: 4.9,
    reviews: "1.2K",
    price: "300.000đ – 1.000.000đ",
    image: `${IMG}AB6AXuCVpikAqzpT-SoXnBxCHWSq6Z7mW74oS_wGZpQFeL8G0CcCtUPFPzVDi4mVOa9gpcHDovrBZanQ-Zonc3orQURrz7m0G5wq5vYq_orrzSYa8GYl_8gYwfFrqSXZ7n1Pqe-pjI_8kPPMaT-X8LAEn2-0KdyjIMCYNyYOyxi6SgeNPxcu5guF6EPMqL_tGLaQKvVTaF7d_MODk3NX_bE2yi6ZdblF6QsTZ9eqEgnU5p1XZjKPsxfI00Do`,
  },
  {
    id: "tour-ha-long",
    kind: "tour",
    title: "Tour Vịnh Hạ Long 2N1Đ",
    location: "Quảng Ninh, Việt Nam",
    description:
      "Khám phá kỳ quan thiên nhiên thế giới với hành trình 2 ngày 1 đêm đáng nhớ.",
    rating: 4.8,
    reviews: "892",
    price: "Từ 2.990.000đ",
    priceUnit: "/ người",
    image: `${IMG}AB6AXuArdzJSHW1aO6ci5K6oq0aB2UD6jSavaXZbuhqAj95bxdrXIkp60pPg9nsgFxTwPyqGn1DW3v41RakAfWm20KJ1-ivNqvOwd3djKleU_O_hLefpaBEZI4tFf1qz4RU5npAxpBCajdUziFtyWEvM50a6JWIxGUBLZyVJPHt7O6HxylM9bhXJ9s1mOn2Aki1QaNGizoeMol_bmRKnJD_V2BK9DJWsZlfjU5Zyiw0SbsNuMnaicI20WHeJ`,
  },
  {
    id: "ubud",
    kind: "destination",
    title: "Ubud, Bali",
    location: "Bali, Indonesia",
    description:
      "Không gian yên bình giữa thiên nhiên xanh mát và văn hóa bản địa đặc sắc.",
    rating: 4.7,
    reviews: "8.1K",
    image: `${IMG}AB6AXuA6kREvzF0alGAaK4cNsmsc4-UNfWe2cXBwSTAoJuPOBDEwu2Vut6z-KhzEY90Ifb5mf_WNcpQd7x7eXVYniBJ_4AL4MC9ffXPWn5ewwk0wO7Sfi8i9zXKbwgXyXjQwaZfc9E5kw-tBst6BB5f-Sqj9SHz6rEpKR6RPntSLUCxQyvhRzSomJX9Ou-728lh-xNjeutxc77se5bFRoyEaW5SZ1bY7MXsgSOchbWDbnMMcYt6N5VaFRuv6`,
  },
  {
    id: "amanoi",
    kind: "hotel",
    title: "Amanoi Resort",
    location: "Ninh Thuận, Việt Nam",
    description:
      "Khu nghỉ dưỡng đẳng cấp thế giới với tầm nhìn hướng biển tuyệt đẹp.",
    rating: 4.8,
    reviews: "210",
    price: "Từ 28.000.000đ",
    priceUnit: "/ đêm",
    image: `${IMG}AB6AXuCfv80RkwapmXgA3JFaHyYXxpaY_CMnWdmShvIyMA2_0Xzw-2PEKN_VigyftMakSrozwFjdqO8APvqSYuh6GNxMrM-Qs2YeAyWk-um0_8Hsd5qBdRrbvZ_afim1uDDKSBIFG3RbECa_wEJZnqQoUZRVuAraXoa7JPAgH7MvgpucXvtyEWWYCru8O43TTRA322Khz340Rl9P7MnfwU4pt8baapdmWN9onPFUSiw1KPdCgygkJweEr2Qm`,
  },
  {
    id: "pizza-4ps",
    kind: "restaurant",
    title: "Pizza 4P's",
    location: "Hồ Chí Minh, Việt Nam",
    description:
      "Thưởng thức pizza phong cách Nhật Bản với nguyên liệu tươi ngon, chất lượng.",
    rating: 4.6,
    reviews: "3.4K",
    price: "200.000đ – 500.000đ",
    image: `${IMG}AB6AXuAzTTFUrXU1cEtFq4R1LaQ4M6_bQyfd7b2zaKR63T-9PkR7DNTeMT9yvgPUhcCmkbyc9ITZRhacKG5t44E7xZE3XLBMuVBqjDqff8BSLWEF3NYtLIzCINL5W3LBmoyHMZDbFd9vkva4f7G_Fu5n3a5qmG97W5JWQb06BBjdFIQVvba57oHvcweV0ryv6xpZTR4dDuYen36kDWWv3l7aJeLzIUX-ChTcNVN9y8ZfQFR0gAhSxqP95vAz`,
  },
  {
    id: "nusa-penida",
    kind: "tour",
    title: "Tour lặn biển Nusa Penida",
    location: "Bali, Indonesia",
    description:
      "Khám phá thế giới đại dương đầy màu sắc với rạn san hô tuyệt đẹp.",
    rating: 4.9,
    reviews: "1.1K",
    price: "Từ 1.890.000đ",
    priceUnit: "/ người",
    image: `${IMG}AB6AXuDLI0lLrGQ1yG4xsybR7tjyc39cmi5JMBYD9fq_miaJnn-xsDy1m58AtV9skByouayecxE4GLTgiDZnQyZU-anzdbHafMF1HiEcXS1FIFQuw61OMCcRMjGeIYcSRT530O5qZ9sLHkRrsCsl9KxkaeJKnZjSSReJsCGltkbanhoTDRziCklr5n8dHU452l2MYeO865noCBdy345D1MjLwfkbPhO9yVXb2SbUFdAwgZxkGToS8JXawo9C`,
  },
  {
    id: "santorini",
    kind: "destination",
    title: "Santorini, Hy Lạp",
    location: "Santorini, Hy Lạp",
    description:
      "Hòn đảo thiên đường với những ngôi nhà trắng xanh và hoàng hôn huyền thoại.",
    rating: 4.8,
    reviews: "6.2K",
    image: `${IMG}AB6AXuBVHuszLCUMh7kXd3u56lmhZTonJFgylbE6NxzDf__T-hmyJDHHD8RrxZckItGgI_WyKzd6ViDIz4jR7exchW3dR3uAa02LlXAo1VZxeEeTOCTG3IHjYgD_3tivdJNWJ_zxXxlf1_bkt363csn16e9aKdXyJr4GRLlz5f3Nuwlmz2CKxiT6MsAb7qlPijzDMnq_wA5KoCvwAghKzrvtZSPqEvTO02c_d6I3bPu3NNY3_f2kQRTgCUYo`,
  },
];

export const MAP_LIST_ITEMS: MapListItem[] = [
  {
    id: "intercontinental-danang",
    kind: "hotel",
    title: "InterContinental Danang",
    location: "Đà Nẵng, Việt Nam",
    rating: 4.7,
    priceText: "4.500.000đ",
    priceUnit: "/đêm",
    image: `${IMG}AB6AXuDPhbQzzGHOR0jYod5emESu3a_WFA4mwRs-MG8HZeHsuOee0C2GfoLuF2y6Xg6j5Qg77SXPVr1whgSoI_tsCYoZoSH74muJMbAPDWgLxl-IUQFIhdYKoZX3sT9kg_nscuSCUyLvpyBLnnaeCSJYaNAQs7yQdVdLiX1pCs7brpkS9YNWgWAnTMdymnLF7__liRNQY7IsiHpJjGMtjAd3w6uhrP7LoRL6MsyC7qRr16CQpPXETCqarVrF`,
  },
  {
    id: "nha-hang-nen",
    kind: "restaurant",
    title: "Nhà hàng Nén",
    location: "Đà Nẵng, Việt Nam",
    rating: 4.9,
    priceText: "300K - 1.000K",
    image: `${IMG}AB6AXuCVpikAqzpT-SoXnBxCHWSq6Z7mW74oS_wGZpQFeL8G0CcCtUPFPzVDi4mVOa9gpcHDovrBZanQ-Zonc3orQURrz7m0G5wq5vYq_orrzSYa8GYl_8gYwfFrqSXZ7n1Pqe-pjI_8kPPMaT-X8LAEn2-0KdyjIMCYNyYOyxi6SgeNPxcu5guF6EPMqL_tGLaQKvVTaF7d_MODk3NX_bE2yi6ZdblF6QsTZ9eqEgnU5p1XZjKPsxfI00Do`,
  },
  {
    id: "tour-ha-long",
    kind: "tour",
    title: "Tour Vịnh Hạ Long 2N1Đ",
    location: "Quảng Ninh, Việt Nam",
    rating: 4.8,
    priceText: "2.990.000đ",
    priceUnit: "/người",
    image: `${IMG}AB6AXuArdzJSHW1aO6ci5K6oq0aB2UD6jSavaXZbuhqAj95bxdrXIkp60pPg9nsgFxTwPyqGn1DW3v41RakAfWm20KJ1-ivNqvOwd3djKleU_O_hLefpaBEZI4tFf1qz4RU5npAxpBCajdUziFtyWEvM50a6JWIxGUBLZyVJPHt7O6HxylM9bhXJ9s1mOn2Aki1QaNGizoeMol_bmRKnJD_V2BK9DJWsZlfjU5Zyiw0SbsNuMnaicI20WHeJ`,
  },
  {
    id: "bali",
    kind: "destination",
    title: "Bali, Indonesia",
    location: "Bali, Indonesia",
    rating: 4.8,
    priceText: "Điểm hot",
    image: `${IMG}AB6AXuAJ9kUM3p0aolkFTvkDru74KIm_xaadl-KM6YvNON092w0B1JPIWBMYrU4GX_VKw1mkY9RXuLGBX-TJEAKF5h55a-ga9CcpJWAcU6YxcQUsWxtMvZUcu0SRLwjdxqTQk71zRh9zSdfUXAVobfb-4WdcLGRfspLnEVU5kJUJKoNGOI-scHmvZ2PeCFJ7uc1emg4fpch_rRYKcOVEDdZaxhsU8VokvG6kj-hAHVErpfugEnioHZDesgM7`,
  },
  {
    id: "amanoi",
    kind: "hotel",
    title: "Amanoi Resort",
    location: "Ninh Thuận, Việt Nam",
    rating: 4.8,
    priceText: "28.000.000đ",
    priceUnit: "/đêm",
    image: `${IMG}AB6AXuCfv80RkwapmXgA3JFaHyYXxpaY_CMnWdmShvIyMA2_0Xzw-2PEKN_VigyftMakSrozwFjdqO8APvqSYuh6GNxMrM-Qs2YeAyWk-um0_8Hsd5qBdRrbvZ_afim1uDDKSBIFG3RbECa_wEJZnqQoUZRVuAraXoa7JPAgH7MvgpucXvtyEWWYCru8O43TTRA322Khz340Rl9P7MnfwU4pt8baapdmWN9onPFUSiw1KPdCgygkJweEr2Qm`,
  },
];
