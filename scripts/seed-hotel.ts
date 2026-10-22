import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { createHotelFromLinksAction } from "@/features/provider/hotels/actions";

const REQUIRED_AMENITIES = [
  "Wifi miễn phí",
  "Điều hòa",
  "Nước nóng",
  "Lễ tân 24/7",
  "Dọn phòng hằng ngày",
];

const OPTIONAL_AMENITIES = [
  "Hồ bơi",
  "Bãi đỗ xe",
  "Nhà hàng",
  "Phòng gym",
  "Spa & massage",
  "Buffet sáng",
  "Xe đưa đón sân bay",
  "Ban công view biển",
  "Quầy bar",
  "Khu vui chơi trẻ em",
  "Giặt ủi",
  "Cho thuê xe máy",
  "Khu vườn",
  "BBQ ngoài trời",
  "Thang máy",
  "Bàn làm việc",
];

const ROOM_REQUIRED_AMENITIES = [
  "Điều hòa",
  "Nước nóng",
  "Wifi miễn phí",
  "TV màn hình phẳng",
  "Khăn tắm",
];

const ROOM_OPTIONAL_AMENITIES = [
  "Minibar",
  "Bồn tắm",
  "Ban công",
  "Két an toàn",
  "Ấm đun nước",
  "Máy sấy tóc",
  "Bàn làm việc",
  "Ghế sofa",
  "Tủ lạnh",
  "View biển",
];

const IMAGES = [
  "https://picsum.photos/1200/800",
  "https://picsum.photos/1200/800",
  "https://picsum.photos/1200/800",
];

const HOTELS = [
  {
    name: "Emeralda Resort Ninh Bình",
    provinceName: "Ninh Bình",
    address: "Thôn Văn Lâm, Ninh Hải, Hoa Lư, Ninh Bình",
    description:
      "Emeralda Resort là khu nghỉ dưỡng 5 sao nằm cạnh đầm Vân Long cũ, thiết kế theo phong cách làng quê Bắc Bộ với các căn villa mái ngói, vườn sen và hồ bơi vô cực nhìn ra núi đá vôi. Resort có spa, nhà hàng đặc sản Ninh Bình và các hoạt động đạp xe, chèo thuyền khám phá Tràng An - Tam Cốc.",
    latitude: 20.2288,
    longitude: 105.9005,
    tagNames: [
      "Nghỉ dưỡng",
      "Sang trọng",
      "Thiên nhiên",
      "Cặp đôi",
      "Gia đình",
    ],
    images: IMAGES,
    rooms: [
      {
        name: "Phòng Deluxe Hướng Vườn",
        description:
          "Phòng rộng 40m2 nhìn ra vườn sen, giường King, ban công riêng, phòng tắm lớn với bồn ngâm.",
        capacity: 2,
        quantity: 30,
        basePrice: 2200000,
        images: IMAGES,
      },
      {
        name: "Villa Hướng Núi",
        description:
          "Villa riêng 75m2 với hiên rộng nhìn núi đá vôi, phòng khách riêng, thích hợp cặp đôi hoặc gia đình nhỏ.",
        capacity: 3,
        quantity: 12,
        basePrice: 4200000,
        images: IMAGES,
      },
    ],
  },
  {
    name: "Tam Coc Garden Resort",
    provinceName: "Ninh Bình",
    address: "Thôn Hải Nham, Ninh Hải, Hoa Lư, Ninh Bình",
    description:
      "Tam Coc Garden là resort boutique sát khu danh thắng Tam Cốc, gồm các bungalow gỗ nằm giữa vườn cây xanh mát và hồ cá. Không gian yên tĩnh, có hồ bơi, nhà hàng đồ Việt và dịch vụ thuê xe đạp đi Hang Múa, Bích Động chỉ vài phút.",
    latitude: 20.2142,
    longitude: 105.9331,
    tagNames: ["Nghỉ dưỡng", "Thiên nhiên", "Cặp đôi", "Bạn bè", "Homestay"],
    images: IMAGES,
    rooms: [
      {
        name: "Bungalow Hướng Vườn",
        description:
          "Bungalow gỗ 35m2 ngập trong cây xanh, giường đôi, hiên riêng, đầy đủ tiện nghi.",
        capacity: 2,
        quantity: 20,
        basePrice: 1300000,
        images: IMAGES,
      },
      {
        name: "Bungalow Gia Đình",
        description:
          "Bungalow rộng 55m2 có 2 giường, phù hợp gia đình 4 người, view hồ cá.",
        capacity: 4,
        quantity: 8,
        basePrice: 2100000,
        images: IMAGES,
      },
    ],
  },
  {
    name: "Mua Caves Ecolodge",
    provinceName: "Ninh Bình",
    address: "Khê Đầu Hạ, Ninh Xuân, Hoa Lư, Ninh Bình",
    description:
      "Mua Caves Ecolodge nằm ngay dưới chân Hang Múa, với các bungalow đá và gỗ nhìn ra núi, hồ bơi và vườn hoa. Đây là nơi lý tưởng để ngắm bình minh trên Hang Múa, đi Tràng An hay Tam Cốc chỉ bằng xe đạp, kết hợp thưởng thức ẩm thực địa phương ngay tại nhà hàng của resort.",
    latitude: 20.2161,
    longitude: 105.9223,
    tagNames: ["Homestay", "Thiên nhiên", "Cặp đôi", "Bạn bè", "Một mình"],
    images: IMAGES,
    rooms: [
      {
        name: "Phòng Standard Hướng Vườn",
        description:
          "Phòng 28m2 giản dị, giường đôi hoặc 2 giường đơn, cửa sổ nhìn vườn.",
        capacity: 2,
        quantity: 18,
        basePrice: 800000,
        images: IMAGES,
      },
      {
        name: "Bungalow Hướng Núi",
        description:
          "Bungalow 40m2 với ban công view Hang Múa, nội thất gỗ ấm cúng.",
        capacity: 2,
        quantity: 12,
        basePrice: 1250000,
        images: IMAGES,
      },
    ],
  },
  {
    name: "Hidden Charm Hotel & Resort",
    provinceName: "Ninh Bình",
    address: "Thôn Bích Động, Ninh Hải, Hoa Lư, Ninh Bình",
    description:
      "Hidden Charm là khách sạn nghỉ dưỡng 4 sao nằm gần khu Tam Cốc - Bích Động, kiến trúc truyền thống hòa quyện cảnh quan đồng quê. Khách sạn có hồ bơi ngoài trời, spa, phòng ăn lớn và dịch vụ tổ chức tour đi thuyền Tam Cốc, xe đạp và bữa tối đặc sản Ninh Bình.",
    latitude: 20.2086,
    longitude: 105.9378,
    tagNames: [
      "Nghỉ dưỡng",
      "Sang trọng",
      "Gia đình",
      "Cặp đôi",
      "Đặc sản địa phương",
    ],
    images: IMAGES,
    rooms: [
      {
        name: "Phòng Superior",
        description:
          "Phòng 30m2 thiết kế hiện đại pha nét truyền thống, giường King hoặc 2 giường đơn.",
        capacity: 2,
        quantity: 30,
        basePrice: 1100000,
        images: IMAGES,
      },
      {
        name: "Phòng Deluxe Hướng Hồ",
        description:
          "Phòng 38m2 view hồ sen và núi, có ban công riêng và bồn tắm.",
        capacity: 2,
        quantity: 20,
        basePrice: 1600000,
        images: IMAGES,
      },
    ],
  },
  {
    name: "Legend Hotel Ninh Bình",
    provinceName: "Ninh Bình",
    address: "Số 5 Đường Hoàng Diệu, phường Vân Giang, Ninh Bình",
    description:
      "Legend Hotel là khách sạn 4 sao hiện đại nằm trong trung tâm thành phố Ninh Bình, thuận tiện di chuyển đến Tràng An, Bái Đính và các nhà hàng đặc sản. Khách sạn có hồ bơi trên cao, nhà hàng Á - Âu, phòng gym và xe đưa đón theo yêu cầu.",
    latitude: 20.2539,
    longitude: 105.9753,
    tagNames: [
      "Trung tâm thành phố",
      "Sang trọng",
      "Gia đình",
      "Bạn bè",
      "Khách sạn 5 sao",
    ],
    images: IMAGES,
    rooms: [
      {
        name: "Phòng Standard",
        description:
          "Phòng 26m2 tiện nghi cơ bản, giường đôi hoặc 2 giường đơn.",
        capacity: 2,
        quantity: 40,
        basePrice: 750000,
        images: IMAGES,
      },
      {
        name: "Phòng Deluxe Thành Phố",
        description:
          "Phòng 32m2 tầng cao nhìn ra thành phố và núi xa, giường King.",
        capacity: 2,
        quantity: 25,
        basePrice: 1150000,
        images: IMAGES,
      },
      {
        name: "Phòng Gia Đình",
        description:
          "Phòng 45m2 có 2 giường đôi, không gian rộng cho gia đình 4 người.",
        capacity: 4,
        quantity: 10,
        basePrice: 1800000,
        images: IMAGES,
      },
    ],
  },
  {
    name: "Tràng An Riverside Homestay",
    provinceName: "Ninh Bình",
    address: "Thôn Lê Xá, Trường Yên, Hoa Lư, Ninh Bình",
    description:
      "Homestay nhỏ xinh ven sông gần bến thuyền Tràng An, do gia đình địa phương điều hành. Chủ nhà nấu bữa cơm quê, cho thuê xe đạp và chỉ đường đi các điểm tham quan. Không gian ấm cúng, giá phải chăng, rất hợp du khách đi bụi và nhóm bạn trẻ.",
    latitude: 20.2493,
    longitude: 105.9122,
    tagNames: [
      "Homestay",
      "Giá rẻ",
      "Một mình",
      "Bạn bè",
      "Đặc sản địa phương",
    ],
    images: IMAGES,
    rooms: [
      {
        name: "Phòng Đôi Có Quạt Điều Hòa",
        description: "Phòng 20m2 sạch sẽ, giường đôi, nhà vệ sinh riêng.",
        capacity: 2,
        quantity: 10,
        basePrice: 450000,
        images: IMAGES,
      },
      {
        name: "Phòng Dorm 6 Giường",
        description: "Phòng tập thể 6 giường tầng, phù hợp nhóm bạn đi bụi.",
        capacity: 6,
        quantity: 5,
        basePrice: 180000,
        images: IMAGES,
      },
    ],
  },
  {
    name: "Cúc Phương Eco Lodge",
    provinceName: "Ninh Bình",
    address: "Vườn quốc gia Cúc Phương, Nho Quan, Ninh Bình",
    description:
      "Khu nghỉ sinh thái nằm trong lòng vườn quốc gia Cúc Phương, được xây dựng bằng gỗ và tre với những căn nhà sàn nhìn ra rừng nguyên sinh. Du khách có thể nghe tiếng chim, đi bộ đường mòn và tham quan trung tâm cứu hộ linh trưởng ngay trong khuôn viên.",
    latitude: 20.3225,
    longitude: 105.6203,
    tagNames: [
      "Thiên nhiên",
      "Phiêu lưu mạo hiểm",
      "Gia đình",
      "Phượt",
      "Nghỉ dưỡng",
    ],
    images: IMAGES,
    rooms: [
      {
        name: "Nhà Sàn Đôi",
        description: "Nhà sàn gỗ 30m2 hướng rừng, giường đôi, hiên nhỏ.",
        capacity: 2,
        quantity: 12,
        basePrice: 900000,
        images: IMAGES,
      },
      {
        name: "Nhà Sàn Gia Đình",
        description: "Nhà sàn 50m2 có hai phòng ngủ, phù hợp 4 - 5 người.",
        capacity: 5,
        quantity: 6,
        basePrice: 1700000,
        images: IMAGES,
      },
    ],
  },
  {
    name: "Bái Đính Palace Hotel",
    provinceName: "Ninh Bình",
    address: "Số 12 Đường Bái Đính, Gia Sinh, Gia Viễn, Ninh Bình",
    description:
      "Khách sạn 3 sao gần quần thể chùa Bái Đính, thuận tiện cho khách hành hương và du lịch đoàn. Có nhà hàng phục vụ cơm chay và đặc sản địa phương, bãi đỗ xe rộng và dịch vụ đưa đón xe điện đến chùa.",
    latitude: 20.2809,
    longitude: 105.8654,
    tagNames: ["Giá rẻ", "Gia đình", "Văn hóa - lịch sử", "Chay", "Bạn bè"],
    images: IMAGES,
    rooms: [
      {
        name: "Phòng Standard",
        description: "Phòng 24m2 gọn gàng, giường đôi hoặc 2 giường đơn.",
        capacity: 2,
        quantity: 30,
        basePrice: 550000,
        images: IMAGES,
      },
      {
        name: "Phòng Family",
        description: "Phòng 36m2 có 3 giường, phù hợp gia đình đi hành hương.",
        capacity: 4,
        quantity: 15,
        basePrice: 950000,
        images: IMAGES,
      },
    ],
  },
  {
    name: "Cát Bà Sunrise Resort",
    provinceName: "Hải Phòng",
    address: "Đường Hà Sen, thị trấn Cát Bà, Cát Hải, Hải Phòng",
    description:
      "Cát Bà Sunrise là resort 4 sao ngay mặt biển Cát Cò, có hồ bơi ngoài trời, nhà hàng hải sản, quầy bar bãi biển và khu spa. Hầu hết phòng đều có ban công nhìn ra vịnh, thuận tiện đi dạo bãi tắm, chợ đêm và bến tàu đi Lan Hạ.",
    latitude: 20.7254,
    longitude: 107.0498,
    tagNames: [
      "Biển",
      "Gần biển",
      "Nghỉ dưỡng",
      "Gia đình",
      "Cặp đôi",
      "Hải sản",
    ],
    images: IMAGES,
    rooms: [
      {
        name: "Phòng Deluxe Hướng Biển",
        description: "Phòng 35m2 có ban công nhìn biển, giường King, bồn tắm.",
        capacity: 2,
        quantity: 40,
        basePrice: 1450000,
        images: IMAGES,
      },
      {
        name: "Phòng Premier Gia Đình",
        description: "Phòng 52m2 có 2 giường đôi, ban công rộng nhìn biển.",
        capacity: 4,
        quantity: 15,
        basePrice: 2250000,
        images: IMAGES,
      },
    ],
  },
  {
    name: "Lan Hạ Bay Boutique Hotel",
    provinceName: "Hải Phòng",
    address: "Số 3 Đường 1/4, thị trấn Cát Bà, Cát Hải, Hải Phòng",
    description:
      "Khách sạn boutique 3 sao nằm gần cảng Cát Bà, thiết kế trẻ trung với tông trắng xanh, phục vụ du khách đi Lan Hạ và khám phá đảo. Có quầy bar, nhà hàng nhỏ và dịch vụ cho thuê xe máy, đặt tour kayak.",
    latitude: 20.7274,
    longitude: 107.0462,
    tagNames: ["Gần biển", "Bạn bè", "Cặp đôi", "Giá rẻ", "Phượt"],
    images: IMAGES,
    rooms: [
      {
        name: "Phòng Standard Hướng Phố",
        description: "Phòng 22m2 giường đôi, cửa sổ nhìn phố đêm Cát Bà.",
        capacity: 2,
        quantity: 20,
        basePrice: 650000,
        images: IMAGES,
      },
      {
        name: "Phòng Superior Hướng Biển",
        description: "Phòng 28m2 có ban công nhỏ nhìn cảng, giường đôi.",
        capacity: 2,
        quantity: 12,
        basePrice: 950000,
        images: IMAGES,
      },
    ],
  },
  {
    name: "Đồ Sơn Beach Resort",
    provinceName: "Hải Phòng",
    address: "Số 2 Lý Thánh Tông, Vạn Hương, Đồ Sơn, Hải Phòng",
    description:
      "Resort 4 sao sát bờ biển Đồ Sơn với kiến trúc Pháp cổ điển, hồ bơi lớn, nhà hàng hải sản và khu vui chơi trẻ em. Từ đây du khách chỉ mất vài phút đi bộ đến bãi tắm và đền Bà Đế, rất phù hợp nghỉ dưỡng cuối tuần.",
    latitude: 20.7142,
    longitude: 106.7849,
    tagNames: ["Biển", "Gần biển", "Nghỉ dưỡng", "Gia đình", "Hải sản"],
    images: IMAGES,
    rooms: [
      {
        name: "Phòng Superior Hướng Vườn",
        description:
          "Phòng 30m2 nhìn vườn và hồ bơi, giường đôi hoặc 2 giường đơn.",
        capacity: 2,
        quantity: 40,
        basePrice: 1000000,
        images: IMAGES,
      },
      {
        name: "Phòng Deluxe Hướng Biển",
        description: "Phòng 36m2 có ban công view biển Đồ Sơn.",
        capacity: 3,
        quantity: 25,
        basePrice: 1500000,
        images: IMAGES,
      },
    ],
  },
  {
    name: "Grand Hải Phòng Hotel",
    provinceName: "Hải Phòng",
    address: "Số 22 Hoàng Văn Thụ, Hồng Bàng, Hải Phòng",
    description:
      "Khách sạn 5 sao trong trung tâm Hải Phòng, cách Nhà hát lớn vài phút đi bộ. Có nhà hàng cao cấp, quầy bar tầng thượng, hồ bơi trong nhà và phòng họp, phục vụ cả khách du lịch lẫn công tác.",
    latitude: 20.8567,
    longitude: 106.6862,
    tagNames: [
      "Trung tâm thành phố",
      "Sang trọng",
      "Khách sạn 5 sao",
      "Cặp đôi",
      "Bạn bè",
    ],
    images: IMAGES,
    rooms: [
      {
        name: "Phòng Deluxe",
        description:
          "Phòng 36m2 nội thất sang trọng, giường King, view thành phố.",
        capacity: 2,
        quantity: 50,
        basePrice: 1800000,
        images: IMAGES,
      },
      {
        name: "Phòng Executive Suite",
        description: "Suite 60m2 có phòng khách riêng và quyền sử dụng lounge.",
        capacity: 2,
        quantity: 10,
        basePrice: 3500000,
        images: IMAGES,
      },
    ],
  },
  {
    name: "Hải Phòng Heritage Boutique",
    provinceName: "Hải Phòng",
    address: "Số 8 Điện Biên Phủ, Hồng Bàng, Hải Phòng",
    description:
      "Khách sạn boutique trong tòa nhà kiến trúc Pháp thập niên 1920, được cải tạo với nội thất cổ điển và ánh sáng ấm. Nằm giữa các điểm di sản như Bảo tàng Hải Phòng, Nhà hát lớn và khu phố ẩm thực Tam Bạc.",
    latitude: 20.8582,
    longitude: 106.6838,
    tagNames: [
      "Trung tâm thành phố",
      "Văn hóa - lịch sử",
      "Cặp đôi",
      "Bạn bè",
      "Ẩm thực đường phố",
    ],
    images: IMAGES,
    rooms: [
      {
        name: "Phòng Classic",
        description: "Phòng 24m2 với trần cao, sàn gỗ và cửa sổ kiểu Pháp.",
        capacity: 2,
        quantity: 15,
        basePrice: 900000,
        images: IMAGES,
      },
      {
        name: "Phòng Heritage Suite",
        description: "Phòng 40m2 có ban công nhìn phố cổ, giường King.",
        capacity: 2,
        quantity: 5,
        basePrice: 1650000,
        images: IMAGES,
      },
    ],
  },
  {
    name: "Cát Bà Eco Homestay",
    provinceName: "Hải Phòng",
    address: "Thôn Việt Hải, Trân Châu, Cát Hải, Hải Phòng",
    description:
      "Homestay trong làng chài Việt Hải bên rìa vườn quốc gia Cát Bà. Chủ nhà tổ chức bữa tối hải sản, đi thuyền kayak buổi sáng và trekking nhẹ trong rừng. Không gian yên bình, giá tiết kiệm và hợp phượt thủ.",
    latitude: 20.7861,
    longitude: 106.9933,
    tagNames: ["Homestay", "Thiên nhiên", "Giá rẻ", "Phượt", "Một mình"],
    images: IMAGES,
    rooms: [
      {
        name: "Phòng Đôi",
        description: "Phòng 22m2 nhìn ra vườn, giường đôi.",
        capacity: 2,
        quantity: 8,
        basePrice: 500000,
        images: IMAGES,
      },
      {
        name: "Phòng Tập Thể 4 Giường",
        description: "Phòng 4 giường tầng cho nhóm bạn.",
        capacity: 4,
        quantity: 4,
        basePrice: 300000,
        images: IMAGES,
      },
    ],
  },
  {
    name: "Cát Bà Island Resort & Spa",
    provinceName: "Hải Phòng",
    address: "Bãi Lăng Hà, Gia Luận, Cát Hải, Hải Phòng",
    description:
      "Resort 5 sao biệt lập ven biển phía bắc đảo Cát Bà, có bãi riêng, hồ bơi vô cực, spa và nhà hàng hải sản. Phù hợp du khách muốn kỳ nghỉ riêng tư, yên tĩnh, tránh xa đông đúc trung tâm đảo.",
    latitude: 20.8089,
    longitude: 107.0212,
    tagNames: ["Biển", "Nghỉ dưỡng", "Sang trọng", "Cặp đôi", "Resort"],
    images: IMAGES,
    rooms: [
      {
        name: "Phòng Deluxe Ocean View",
        description: "Phòng 40m2 nhìn biển, ban công rộng, giường King.",
        capacity: 2,
        quantity: 30,
        basePrice: 2600000,
        images: IMAGES,
      },
      {
        name: "Villa Biển 2 Phòng Ngủ",
        description: "Villa 120m2 có hồ bơi riêng, hai phòng ngủ, bếp nhỏ.",
        capacity: 4,
        quantity: 8,
        basePrice: 6800000,
        images: IMAGES,
      },
    ],
  },
  {
    name: "Hải Phòng Riverside Hotel",
    provinceName: "Hải Phòng",
    address: "Số 30 Lạch Tray, Ngô Quyền, Hải Phòng",
    description:
      "Khách sạn 3 sao hiện đại nằm gần sân bay Cát Bi và trung tâm thành phố, phù hợp khách công tác và gia đình quá cảnh. Có nhà hàng phục vụ bánh đa cua, nem cua bể, bãi đỗ xe rộng và xe đưa đón sân bay.",
    latitude: 20.8392,
    longitude: 106.7014,
    tagNames: [
      "Trung tâm thành phố",
      "Giá rẻ",
      "Gia đình",
      "Đặc sản địa phương",
      "Bạn bè",
    ],
    images: IMAGES,
    rooms: [
      {
        name: "Phòng Standard",
        description:
          "Phòng 24m2 tiện nghi cơ bản, giường đôi hoặc 2 giường đơn.",
        capacity: 2,
        quantity: 35,
        basePrice: 600000,
        images: IMAGES,
      },
      {
        name: "Phòng Family",
        description: "Phòng 38m2 có 2 giường đôi cho gia đình 4 người.",
        capacity: 4,
        quantity: 12,
        basePrice: 1050000,
        images: IMAGES,
      },
    ],
  },
];

export async function seedHotels() {
  const providerProfile = await prisma.providerProfile.findFirst({
    where: { businessType: "hotel", approvalStatus: "approved" },
  });
  if (!providerProfile) return;

  const provinceByName = new Map(
    (await prisma.province.findMany()).map((p) => [p.name, p.id]),
  );
  const tagByName = new Map(
    (await prisma.tag.findMany()).map((t) => [t.name, t.id]),
  );

  for (const hotel of HOTELS) {
    const optional = [...OPTIONAL_AMENITIES].sort(() => Math.random() - 0.5);
    const amenities = [
      ...REQUIRED_AMENITIES,
      ...optional.slice(0, 4 + Math.floor(Math.random() * 3)),
    ];

    const rooms = hotel.rooms.map((room) => {
      const roomOptional = [...ROOM_OPTIONAL_AMENITIES].sort(
        () => Math.random() - 0.5,
      );
      return {
        ...room,
        amenities: [
          ...ROOM_REQUIRED_AMENITIES,
          ...roomOptional.slice(0, 2 + Math.floor(Math.random() * 3)),
        ],
      };
    });

    const formData = new FormData();
    formData.set("providerProfileId", providerProfile.id);
    formData.set("name", hotel.name);
    formData.set("provinceId", provinceByName.get(hotel.provinceName)!);
    formData.set("address", hotel.address);
    formData.set("latitude", String(hotel.latitude));
    formData.set("longitude", String(hotel.longitude));
    formData.set("description", hotel.description);
    formData.set("amenities", JSON.stringify(amenities));
    formData.set(
      "tagIds",
      JSON.stringify(hotel.tagNames.map((name) => tagByName.get(name))),
    );
    formData.set("rooms", JSON.stringify(rooms));
    formData.set("imageUrls", JSON.stringify(hotel.images));
    formData.set(
      "roomImageUrls",
      JSON.stringify(hotel.rooms.map((room) => room.images)),
    );

    await createHotelFromLinksAction({ status: "idle" }, formData);
  }

  await prisma.hotel.updateMany({
    where: { providerProfileId: providerProfile.id },
    data: { status: "published" },
  });

  await prisma.room.updateMany({
    where: { hotel: { providerProfileId: providerProfile.id } },
    data: { status: "published" },
  });
}
