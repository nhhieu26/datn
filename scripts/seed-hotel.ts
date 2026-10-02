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

const HOTELS = [
  {
    name: "Grand Sea Hotel",
    provinceName: "Đà Nẵng",
    address: "8 Hà Bổng, An Hải, Đà Nẵng 550000, Vietnam",
    description:
      "Grand Sea Hotel tọa lạc tại số 8 Hà Bổng, chỉ cách bãi biển Mỹ Khê vài bước chân. Khách sạn đạt tiêu chuẩn 4 sao với thiết kế hiện đại, tinh tế, sở hữu hồ bơi ngoài trời trên tầng cao, trung tâm thể thao, spa thư giãn và nhà hàng phục vụ đa dạng các món ăn Á - Âu cùng hải sản địa phương. Vị trí vô cùng thuận tiện để du khách tắm biển, dạo quanh các phố ẩm thực sầm uất, cũng như di chuyển đến các điểm tham quan nổi tiếng như cầu Rồng, bán đảo Sơn Trà và danh thắng Ngũ Hành Sơn.",
    latitude: 16.068273975760587,
    longitude: 108.24393543533986,
    tagNames: [
      "Biển",
      "Gần biển",
      "Nghỉ dưỡng",
      "Sang trọng",
      "Gia đình",
      "Cặp đôi",
      "Bạn bè",
      "Hải sản",
      "Đặc sản địa phương",
    ],
    images: [
      "https://picsum.photos/1200/800",
      "https://picsum.photos/1200/800",
      "https://picsum.photos/1200/800",
    ],
    rooms: [
      {
        name: "Phòng Superior Giường Đôi / 2 Giường Đơn",
        description:
          "Phòng Superior rộng 28m2 thiết kế trang nhã, hiện đại. Trang bị 1 giường đôi hoặc 2 giường đơn, điều hòa, TV màn hình phẳng, minibar, két an toàn, bàn làm việc và phòng tắm riêng với vòi hoa sen cao cấp.",
        capacity: 2,
        quantity: 35,
        basePrice: 950000,
        images: [
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
        ],
      },
      {
        name: "Phòng Deluxe Hướng Biển (Deluxe Ocean View)",
        description:
          "Phòng Deluxe rộng 32m2 có cửa sổ lớn ngắm trọn cảnh biển Mỹ Khê thơ mộng. Nội thất hiện đại với giường King, bồn tắm ngâm thư giãn, sofa nhỏ tiếp khách và đầy đủ tiện nghi tiêu chuẩn 4 sao.",
        capacity: 2,
        quantity: 25,
        basePrice: 1350000,
        images: [
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
        ],
      },
      {
        name: "Phòng Senior Suite Hướng Biển",
        description:
          "Căn Suite sang trọng rộng 50m2 nằm ở tầng cao, không gian phòng khách và phòng ngủ thoáng đãng với ban công kính hướng biển. Trang bị bồn tắm sục, nội thất gỗ cao cấp, thích hợp cho cặp đôi nghỉ dưỡng hoặc gia đình.",
        capacity: 2,
        quantity: 10,
        basePrice: 2100000,
        images: [
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
        ],
      },
    ],
  },
  {
    name: "Silk Path Boutique Hanoi",
    provinceName: "Hà Nội",
    address: "21 P. Hàng Khay, Cửa Nam, Hà Nội 10000, Vietnam",
    description:
      "Silk Path Boutique Hanoi tọa lạc tại số 21 Hàng Khay, sở hữu vị trí 'vàng' ngay đối diện hồ Hoàn Kiếm thơ mộng. Khách sạn mang phong cách kiến trúc Pháp cổ điển sang trọng pha lẫn nét tinh tế của văn hóa Hà Nội. Từ đây, du khách chỉ mất vài bước chân để ra phố đi bộ Hồ Gươm, khu Phố Cổ, chợ Đêm và các địa điểm văn hóa, ẩm thực đặc sắc. Đây là lựa chọn hoàn hảo cho du khách du lịch lẫn công tác muốn tận hưởng không gian lưu trú đẳng cấp ngay trái tim thủ đô.",
    latitude: 21.02570477673971,
    longitude: 105.85251773148546,
    tagNames: [
      "Trung tâm thành phố",
      "Sang trọng",
      "Nghỉ dưỡng",
      "Cặp đôi",
      "Bạn bè",
      "Văn hóa - lịch sử",
      "Đặc sản địa phương",
    ],
    images: [
      "https://picsum.photos/1200/800",
      "https://picsum.photos/1200/800",
      "https://picsum.photos/1200/800",
    ],
    rooms: [
      {
        name: "Phòng Deluxe Classic",
        description:
          "Phòng Deluxe rộng 25m2 với thiết kế thanh lịch theo phong cách Pháp. Trang bị giường King hoặc 2 giường đơn, điều hòa, TV màn hình phẳng, két an toàn, minibar, bàn làm việc và phòng tắm khép kín với vòi hoa sen cao cấp.",
        capacity: 2,
        quantity: 20,
        basePrice: 1850000,
        images: [
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
        ],
      },
      {
        name: "Phòng Premium Hướng Hồ Hoàn Kiếm (Lake View)",
        description:
          "Phòng Premium rộng 30m2 sở hữu cửa sổ lớn ngắm trọn khung cảnh hồ Hoàn Kiếm xanh mát. Tích hợp giường King êm ái, bồn tắm ngâm thư giãn, máy pha cà phê và đầy đủ tiện nghi hiện đại.",
        capacity: 2,
        quantity: 12,
        basePrice: 2700000,
        images: [
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
        ],
      },
      {
        name: "Phòng Executive Suite Ban Công Hướng Hồ",
        description:
          "Căn Suite sang trọng rộng 45m2 có ban công riêng nhìn thẳng ra Hồ Gươm tuyệt đẹp. Không gian bao gồm khu vực tiếp khách riêng, bồn tắm cẩm thạch, nội thất gỗ cao cấp và dịch vụ chăm sóc đặc quyền.",
        capacity: 2,
        quantity: 5,
        basePrice: 4200000,
        images: [
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
        ],
      },
    ],
  },
  {
    name: "JW Marriott Hotel Hanoi",
    provinceName: "Hà Nội",
    address:
      "No 8 Do Duc Duc Road Tu Liem Ward, Từ Liêm, Hà Nội 100000, Vietnam",
    description:
      "JW Marriott Hotel Hanoi tọa lạc trên đường Đỗ Đức Dục, quận Nam Từ Liêm, ngay cạnh Trung tâm Hội nghị Quốc gia và bảo tàng Hà Nội. Với kiến trúc lấy cảm hứng từ hình ảnh con rồng huyền thoại bên bờ biển Việt Nam, khách sạn 5 sao sang trọng này cung cấp không gian nghỉ dưỡng đẳng cấp, ẩm thực phong phú và hệ thống dịch vụ phòng họp, sự kiện quy mô lớn. Vị trí rất thuận tiện cho khách công tác, các cuộc hội nghị cấp cao cũng như du khách muốn trải nghiệm dịch vụ lưu trú chất lượng hàng đầu.",
    latitude: 21.007166661797076,
    longitude: 105.7831679804705,
    tagNames: [
      "Sang trọng",
      "Khách sạn 5 sao",
      "Nghỉ dưỡng",
      "Gia đình",
      "Cặp đôi",
    ],
    images: [
      "https://picsum.photos/1200/800",
      "https://picsum.photos/1200/800",
      "https://picsum.photos/1200/800",
    ],
    rooms: [
      {
        name: "Phòng Deluxe giường King",
        description:
          "Phòng Deluxe rộng 48m2 với thiết kế hiện đại, cửa sổ kính lớn từ sàn đến trần tầm nhìn ra hồ hoặc thành phố. Trang bị giường King tiêu chuẩn, bồn tắm cẩm thạch sang trọng, TV màn hình phẳng, bàn làm việc rộng rãi và khu vực tiếp khách.",
        capacity: 2,
        quantity: 200,
        basePrice: 4200000,
        images: [
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
        ],
      },
      {
        name: "Phòng Executive Lounge Access",
        description:
          "Phòng Executive rộng 48m2 nằm ở các tầng cao, được hưởng quyền lợi độc quyền sử dụng Executive Lounge với bữa sáng miễn phí, trà chiều và cocktail tối. Trang bị nội thất cao cấp, máy pha cà phê, bồn tắm riêng và tầm nhìn đẹp ngắm toàn cảnh khu vực.",
        capacity: 3,
        quantity: 80,
        basePrice: 5800000,
        images: [
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
        ],
      },
      {
        name: "Phòng Executive Suite",
        description:
          "Căn Suite sang trọng rộng 90m2 gồm phòng khách riêng biệt và phòng ngủ đẳng cấp. Được tích hợp đầy đủ tiện nghi hiện đại, phòng tắm rộng có bồn tắm ngâm và vòi đài sen, đi kèm đặc quyền Executive Lounge dành cho khách thương gia và gia đình.",
        capacity: 3,
        quantity: 20,
        basePrice: 8500000,
        images: [
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
        ],
      },
    ],
  },
  {
    name: "Hạ Long Bay View Resort",
    provinceName: "Quảng Ninh",
    address: "Đường Đỗ Sĩ Họa, Bãi Cháy, Quảng Ninh 200000, Vietnam",
    description:
      "Vinpearl Resort & Spa Hạ Long tọa lạc trọn vẹn trên đảo Rều độc đáo thuộc vịnh Bãi Cháy, mang đến không gian nghỉ dưỡng 5 sao khép kín với tầm nhìn 360 độ ra Vịnh Hạ Long. Khách sạn sở hữu kiến trúc tân cổ điển lộng lẫy, bãi biển nhân tạo riêng, hồ bơi ngoài trời rộng lớn, hệ thống nhà hàng ẩm thực phong phú cùng dịch vụ Vincharm Spa đẳng cấp. Đây là điểm đến lý tưởng cho gia đình, cặp đôi và du khách muốn trải nghiệm kỳ nghỉ dưỡng sang trọng giữa kỳ quan thiên nhiên.",
    latitude: 20.947810571538184,
    longitude: 107.02444980295073,
    tagNames: [
      "Biển",
      "Nghỉ dưỡng",
      "Sang trọng",
      "Khách sạn 5 sao",
      "Gần biển",
      "Gia đình",
      "Cặp đôi",
      "Thiên nhiên",
    ],
    images: [
      "https://picsum.photos/1200/800",
      "https://picsum.photos/1200/800",
      "https://picsum.photos/1200/800",
    ],
    rooms: [
      {
        name: "Phòng Deluxe Giường Đôi / 2 Giường Đơn Hướng Biển",
        description:
          "Phòng Deluxe rộng 40m2 với ban công riêng hướng ra cảnh biển Vịnh Hạ Long thơ mộng. Trang bị giường King hoặc 2 giường đơn, bồn tắm nằm sang trọng, TV màn hình phẳng, điều hòa, minibar và bàn làm việc.",
        capacity: 2,
        quantity: 150,
        basePrice: 3200000,
        images: [
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
        ],
      },
      {
        name: "Phòng Executive Suite Hướng Biển",
        description:
          "Phòng Executive Suite rộng 76m2 có thiết kế tinh tế với phòng khách riêng biệt và ban công rộng mở ôm trọn tầm nhìn ra vịnh. Trang bị đầy đủ tiện nghi cao cấp, bồn tắm cẩm thạch và không gian thư giãn lý tưởng.",
        capacity: 3,
        quantity: 30,
        basePrice: 5500000,
        images: [
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
        ],
      },
      {
        name: "Phòng Family Suite Hướng Biển",
        description:
          "Phòng Family Suite rộng 80m2 được thiết kế tối ưu không gian cho gia đình, gồm 2 phòng ngủ thông nhau hoặc không gian sinh hoạt rộng rãi. Ban công hướng biển ngắm trọn hoàng hôn trên Vịnh Hạ Long.",
        capacity: 4,
        quantity: 20,
        basePrice: 7200000,
        images: [
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
        ],
      },
    ],
  },
  {
    name: "Pine Hill Homestay Dalat",
    provinceName: "Lâm Đồng",
    address: "27K Lê Hồng Phong, Xuân Hương - Đà Lạt, Lâm Đồng, Vietnam",
    description:
      "Pine Hill Homestay Dalat tọa lạc tại 27K Lê Hồng Phong, ngay trên đỉnh đồi thông xanh mát ngắm trọn thung lũng thơ mộng của Đà Lạt. Homestay sở hữu không gian yên tĩnh, lãng mạn với các căn bungalow gỗ riêng biệt và ngôi nhà trên cây độc đáo, được trang bị đầy đủ góc bếp nhỏ và tiện nghi sinh hoạt. Vị trí thuận tiện di chuyển tới trung tâm, Dinh Bảo Đại, chợ Đà Lạt và các điểm tham quan nổi tiếng, rất thích hợp cho cặp đôi, bạn bè hoặc khách đi phượt muốn tìm không gian hòa mình cùng thiên nhiên.",
    latitude: 11.93351117295299,
    longitude: 108.42649427228318,
    tagNames: [
      "Homestay",
      "Thiên nhiên",
      "Cặp đôi",
      "Bạn bè",
      "Phượt",
      "Nghỉ dưỡng",
      "Một mình",
    ],
    images: [
      "https://picsum.photos/1200/800",
      "https://picsum.photos/1200/800",
      "https://picsum.photos/1200/800",
    ],
    rooms: [
      {
        name: "Phòng Tree House Small",
        description:
          "Căn phòng gỗ trên cây độc đáo dành cho 2 người, không gian ấm cúng có cửa sổ và ban công hướng tầm nhìn ra rừng thông xanh mát. Phòng trang bị giường đôi, nhà vệ sinh riêng với vòi hoa sen.",
        capacity: 2,
        quantity: 3,
        basePrice: 850000,
      },
      {
        name: "Phòng Moonlight / Sunset",
        description:
          "Căn bungalow riêng biệt dành cho cặp đôi, thiết kế nhẹ nhàng với ban công thoáng đãng ngắm view rừng thông. Có khu vực bếp riêng trang bị đầy đủ dụng cụ nấu nướng, tivi, tủ lạnh và toilet riêng.",
        capacity: 2,
        quantity: 5,
        basePrice: 800000,
        images: [
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
        ],
      },
      {
        name: "Phòng Tree House Large / Forest",
        description:
          "Căn hộ gỗ rộng rãi cho nhóm bạn hoặc gia đình nhỏ gồm 2 giường đôi. Phòng có gian bếp tiện nghi, không gian sinh hoạt chung, ban công ngắm trọn cảnh rừng thông và thung lũng.",
        capacity: 4,
        quantity: 4,
        basePrice: 1400000,
        images: [
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
        ],
      },
    ],
  },
  {
    name: "Vinpearl Beachfront Nha Trang",
    provinceName: "Khánh Hòa",
    address: "78-80 Trần Phú, phường, Nha Trang, Khánh Hòa 650000, Vietnam",
    description:
      "Vinpearl Beachfront Nha Trang tọa lạc ngay trên con đường biển Trần Phú sầm uất, sở hữu vị trí đắc địa đối diện bãi biển Nha Trang. Căn hộ khách sạn 5 sao này mang đến không gian nghỉ dưỡng tiện nghi với hệ thống phòng suite hiện đại có tầm nhìn ôm trọn vịnh biển, bể bơi vô cực ngắm cảnh biển, trung tâm thương mại Vincom ngay dưới chân tòa nhà cùng hệ thống nhà hàng và spa đẳng cấp. Vị trí rất thuận tiện để du khách tiếp cận bãi biển, khám phá ẩm thực hải sản địa phương và các điểm tham quan trung tâm thành phố.",
    latitude: 12.233643388803426,
    longitude: 109.19713289294333,
    tagNames: [
      "Biển",
      "Gần biển",
      "Trung tâm thành phố",
      "Sang trọng",
      "Khách sạn 5 sao",
      "Nghỉ dưỡng",
      "Gia đình",
      "Cặp đôi",
      "Hải sản",
    ],
    images: [
      "https://picsum.photos/1200/800",
      "https://picsum.photos/1200/800",
      "https://picsum.photos/1200/800",
    ],
    rooms: [
      {
        name: "Phòng Studio Suite Hướng Biển",
        description:
          "Phòng Studio rộng 42m2 có ban công ngắm nhìn khung cảnh vịnh Nha Trang. Phòng tích hợp khu vực tiếp khách, giường King hoặc 2 giường đơn, phòng tắm sang trọng với vòi đài sen, điều hòa, TV thông minh, tủ lạnh và bàn làm việc.",
        capacity: 2,
        quantity: 250,
        basePrice: 2200000,
        images: [
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
        ],
      },
      {
        name: "Phòng Executive Suite 1 Phòng Ngủ Hướng Biển",
        description:
          "Phòng Suite rộng 55m2 có không gian phòng khách và phòng ngủ riêng biệt, trang bị ban công kính rộng thoáng nhìn trực diện ra biển. Đầy đủ tiện nghi cao cấp, bồn tắm ngâm thư giãn, sofa sang trọng và góc làm việc tiện lợi.",
        capacity: 2,
        quantity: 80,
        basePrice: 3100000,
        images: [
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
        ],
      },
      {
        name: "Phòng Grand Suite 2 Phòng Ngủ Hướng Biển",
        description:
          "Căn Suite rộng 82m2 với 2 phòng ngủ riêng biệt và phòng khách chung rộng rãi, tối ưu không gian nghỉ dưỡng cho gia đình hoặc nhóm bạn. Ban công ngắm cảnh biển từ tầng cao, trang bị 2 phòng tắm và nội thất hiện đại.",
        capacity: 4,
        quantity: 40,
        basePrice: 4800000,
        images: [
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
        ],
      },
    ],
  },
  {
    name: "Hue Imperial Hostel",
    provinceName: "Huế",
    address: "66/10A, Lê Lợi, Thuận Hóa, Huế 49000, Vietnam",
    description:
      "Hue Imperial Hostel nằm trong một hẻm yên tĩnh trên đường Lê Lợi, ngay trung tâm thành phố Huế và gần bờ sông Hương thơ mộng. Từ hostel, du khách chỉ mất vài phút đi bộ để tới phố đi bộ Chu Văn An - Phạm Ngũ Lão, cầu Tràng Tiền và các nhà hàng ẩm thực địa phương. Nơi đây mang không gian lưu trú ấm cúng, thân thiện với chi phí tiết kiệm, rất thích hợp cho dân đi phượt, khách du lịch tự túc hoặc các nhóm bạn bè muốn khám phá văn hóa, lịch sử và ẩm thực Cố đô.",
    latitude: 16.46961555719558,
    longitude: 107.59472712812945,
    tagNames: [
      "Trung tâm thành phố",
      "Giá rẻ",
      "Phượt",
      "Bạn bè",
      "Một mình",
      "Văn hóa - lịch sử",
      "Ẩm thực đường phố",
      "Đặc sản địa phương",
    ],
    images: [
      "https://picsum.photos/1200/800",
      "https://picsum.photos/1200/800",
      "https://picsum.photos/1200/800",
    ],
    rooms: [
      {
        name: "Giường Đơn Trong Phòng Tập Thể (Dorm)",
        description:
          "Giường tầng trong phòng tập thể nam nữ chung hoặc phòng nữ riêng. Trang bị rèm che riêng tư, đèn đọc sách, ổ cắm điện, hộc tủ có khóa an toàn và máy điều hòa. Dùng chung phòng tắm hiện đại có bình nóng lạnh.",
        capacity: 1,
        quantity: 20,
        basePrice: 150000,
        images: [
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
        ],
      },
      {
        name: "Phòng Tiêu Chuẩn Giường Đôi (Private Double)",
        description:
          "Phòng riêng rộng khoảng 18m2 dành cho 2 người, thiết kế đơn giản và sạch sẽ. Trang bị giường đôi, điều hòa, Wi-Fi miễn phí, bàn ghế nhỏ và phòng tắm riêng có vòi hoa sen.",
        capacity: 2,
        quantity: 8,
        basePrice: 380000,
        images: [
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
        ],
      },
      {
        name: "Phòng Gia Đình / Nhóm Bạn (Family Room)",
        description:
          "Phòng riêng rộng 25m2 bố trí 2 giường đôi lớn, thoải mái cho nhóm 4 người. Phòng thoáng mát có cửa sổ, điều hòa, TV màn hình phẳng, tủ quần áo và phòng tắm riêng khép kín.",
        capacity: 4,
        quantity: 4,
        basePrice: 650000,
        images: [
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
        ],
      },
    ],
  },
  {
    name: "Tam Coc Riverside Homestay",
    provinceName: "Ninh Bình",
    address: "Đội 1 -thôn văn lâm, Nam Hoa Lư, Ninh Bình 43000, Vietnam",
    description:
      "Tam Coc Riverside Homestay nằm ven sông tại khu vực thôn Văn Lâm, ngay gần bến thuyền Tam Cốc thuộc vùng di sản Tràng An - Ninh Bình. Homestay mang đến không gian bình yên, mộc mạc bao quanh bởi sông nước và những dãy núi đá vôi hùng vĩ. Nơi đây sở hữu khuôn viên xanh mát, sân vườn rộng rãi cùng nhà hàng phục vụ các món ăn đặc sản địa phương. Vị trí rất lý tưởng để du khách chèo thuyền, đạp xe khám phá thiên nhiên, tìm hiểu văn hóa và tận hưởng kỳ nghỉ thư thái.",
    latitude: 20.219916871223454,
    longitude: 105.9393809019057,
    tagNames: [
      "Homestay",
      "Thiên nhiên",
      "Nghỉ dưỡng",
      "Phượt",
      "Cặp đôi",
      "Gia đình",
      "Bạn bè",
      "Đặc sản địa phương",
      "Văn hóa - lịch sử",
    ],
    images: [
      "https://picsum.photos/1200/800",
      "https://picsum.photos/1200/800",
      "https://picsum.photos/1200/800",
    ],
    rooms: [
      {
        name: "Phòng Bungalow Hướng Sông (River View Bungalow)",
        description:
          "Căn bungalow riêng biệt rộng 30m2 có ban công nhìn trực diện ra dòng sông thơ mộng và núi đá vôi. Trang bị giường King, điều hòa, phòng tắm riêng khép kín có vòi hoa sen, khu vực ngồi uống trà và Wi-Fi miễn phí.",
        capacity: 2,
        quantity: 6,
        basePrice: 750000,
        images: [
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
        ],
      },
      {
        name: "Phòng Deluxe Hướng Vườn (Garden View Room)",
        description:
          "Phòng nghỉ ấm cúng rộng 25m2 nằm trong khuôn viên sân vườn xanh mát. Được trang bị 1 giường đôi hoặc 2 giường đơn, điều hòa, tủ quần áo, bàn làm việc nhỏ và phòng tắm riêng đầy đủ tiện nghi.",
        capacity: 2,
        quantity: 8,
        basePrice: 550000,
        images: [
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
        ],
      },
      {
        name: "Phòng Gia Đình Hướng Sông (Family River View Room)",
        description:
          "Phòng rộng 40m2 với 2 giường đôi lớn, phù hợp cho gia đình hoặc nhóm bạn 4 người. Ban công thoáng đãng ngắm cảnh sông núi Tam Cốc, trang bị đầy đủ điều hòa, minibar và phòng tắm riêng rộng rãi.",
        capacity: 4,
        quantity: 4,
        basePrice: 1100000,
        images: [
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
        ],
      },
    ],
  },
  {
    name: "Catba Island Resort & Spa",
    provinceName: "Hải Phòng",
    address: "Catba Island, Cát Hải, Hải Phòng, Vietnam",
    description:
      "Catba Island Resort & Spa tọa lạc ngay bãi biển Cát Cò 1, thuộc đảo Cát Bà, huyện Cát Hải, Hải Phòng. Resort 4 sao này là sự kết hợp giữa kiến trúc Á Đông truyền thống và phong cách hiện đại, nằm ẩn mình giữa không gian núi rừng thiên nhiên và biển cả bao la. Khách sạn sở hữu công viên nước mini, hai hồ bơi ngoài trời, spa thư giãn cùng hệ thống nhà hàng phục vụ hải sản tươi sống và ẩm thực đa dạng. Đây là điểm đến tuyệt vời cho gia đình, cặp đôi và nhóm bạn muốn trải nghiệm kỳ nghỉ dưỡng hòa mình vào thiên nhiên biển đảo.",
    latitude: 20.718229856446474,
    longitude: 107.05222416756656,
    tagNames: [
      "Biển",
      "Gần biển",
      "Nghỉ dưỡng",
      "Thiên nhiên",
      "Gia đình",
      "Cặp đôi",
      "Bạn bè",
      "Hải sản",
    ],
    images: [
      "https://picsum.photos/1200/800",
      "https://picsum.photos/1200/800",
      "https://picsum.photos/1200/800",
    ],
    rooms: [
      {
        name: "Phòng Superior Hướng Biển",
        description:
          "Phòng Superior rộng 25m2 với ban công riêng nhìn ra khung cảnh biển Cát Bà. Phòng được trang bị 1 giường đôi hoặc 2 giường đơn, điều hòa, TV truyền hình cáp, minibar, két an toàn và phòng tắm riêng với vòi hoa sen.",
        capacity: 2,
        quantity: 60,
        basePrice: 1850000,
        images: [
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
        ],
      },
      {
        name: "Phòng Deluxe Hướng Biển",
        description:
          "Phòng Deluxe rộng 30m2 thiết kế ấm cúng với nội thất gỗ, cửa sổ thoáng đãng ôm trọn tầm nhìn ra biển. Trang bị giường King hoặc 2 giường đơn, bồn tắm nằm hoặc vòi đài sen, bàn làm việc và khu vực tiếp khách nhỏ.",
        capacity: 2,
        quantity: 40,
        basePrice: 2350000,
        images: [
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
        ],
      },
      {
        name: "Phòng Suite Hướng Biển",
        description:
          "Phòng Suite cao cấp rộng 50m2 gồm phòng khách và phòng ngủ riêng biệt, ban công rộng rãi ngắm toàn cảnh Vịnh Lan Hạ. Trang bị nội thất hiện đại, bồn tắm sục Jacuzzi, sofa sang trọng và đầy đủ tiện nghi cao cấp.",
        capacity: 2,
        quantity: 10,
        basePrice: 3800000,
        images: [
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
        ],
      },
    ],
  },
  {
    name: "Sapa Valley view Hotel",
    provinceName: "Lào Cai",
    address: "034 Mường Hoa, Sa Pa, Lào Cai, Vietnam",
    description:
      "Sapa Valley View Hotel tọa lạc tại số 034 đường Mường Hoa, một trong những tuyến đường đẹp nhất thị trấn Sa Pa. Khách sạn sở hữu vị trí đắc địa trên sườn đồi với tầm nhìn ôm trọn thung lũng Mường Hoa thơ mộng và dãy núi Hoàng Liên Sơn hùng vĩ. Từ khách sạn, du khách có thể dễ dàng đi bộ đến chợ đêm Sa Pa, nhà thờ Đá và các điểm tham quan trung tâm. Đây là lựa chọn lưu trú tuyệt vời cho du khách muốn ngắm cảnh thiên nhiên, trải nghiệm văn hóa Tây Bắc với mức giá hợp lý.",
    latitude: 22.32924622038715,
    longitude: 103.84551446638788,
    tagNames: [
      "Thiên nhiên",
      "Trung tâm thành phố",
      "Phượt",
      "Giá rẻ",
      "Cặp đôi",
      "Bạn bè",
      "Một mình",
      "Văn hóa - lịch sử",
      "Đặc sản địa phương",
    ],
    images: [
      "https://picsum.photos/1200/800",
      "https://picsum.photos/1200/800",
      "https://picsum.photos/1200/800",
    ],
    rooms: [
      {
        name: "Phòng Deluxe Giường Đôi Hướng Thung Lũng",
        description:
          "Phòng Deluxe rộng 25m2 có cửa sổ kính lớn và ban công nhìn thẳng ra thung lũng Mường Hoa. Trang bị 1 giường đôi lớn, điều hòa 2 chiều, TV màn hình phẳng, ấm đun nước, minibar và phòng tắm riêng có vòi hoa sen nước nóng.",
        capacity: 2,
        quantity: 12,
        basePrice: 650000,
        images: [
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
        ],
      },
      {
        name: "Phòng Superior 2 Giường Đơn Hướng Núi",
        description:
          "Phòng rộng 22m2 ấm cúng phù hợp cho 2 bạn bè hoặc khách đi phượt. Được trang bị 2 giường đơn, điều hòa 2 chiều, tủ quần áo, Wi-Fi miễn phí và phòng tắm riêng khép kín sạch sẽ.",
        capacity: 2,
        quantity: 10,
        basePrice: 550000,
        images: [
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
        ],
      },
      {
        name: "Phòng Gia Đình Hướng Thung Lũng",
        description:
          "Phòng Family rộng 35m2 với 2 giường đôi lớn, phù hợp cho gia đình hoặc nhóm bạn 4 người. Ban công rộng rãi ngắm toàn cảnh mây vờn thung lũng, đầy đủ tiện nghi sinh hoạt và không gian thoáng đãng.",
        capacity: 4,
        quantity: 6,
        basePrice: 1100000,
        images: [
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
        ],
      },
    ],
  },
  {
    name: "Mekong Riverside Boutique Resort & Spa",
    provinceName: "Cần Thơ",
    address: "Hoa Qui Ward, Hoa Khanh Subdistrict, Cái Bè, Đồng Tháp, Vietnam",
    description:
      "Mekong Riverside Boutique Resort & Spa tọa lạc bên bờ sông Tiền thuộc huyện Cái Bè (nay thuộc tỉnh Tiền Giang, khu vực đồng bằng sông Cửu Long). Resort mang đến không gian nghỉ dưỡng sinh thái bình yên với các căn bungalow sinh thái nằm giữa vườn cây ăn trái và ao hồ tự nhiên. Khách sạn sở hữu bể bơi ngoài trời hướng sông, dịch vụ spa thư giãn, nhà hàng phục vụ các món ăn đặc sản miền Tây cùng các hoạt động chèo thuyền kayak, đạp xe khám phá làng quê. Điểm đến hoàn hảo cho cặp đôi và gia đình muốn rời xa ồn ào đô thị để hòa mình vào thiên nhiên sông nước.",
    latitude: 10.326123773420361,
    longitude: 106.01935633556451,
    tagNames: [
      "Nghỉ dưỡng",
      "Thiên nhiên",
      "Cặp đôi",
      "Gia đình",
      "Bạn bè",
      "Đặc sản địa phương",
    ],
    images: [
      "https://picsum.photos/1200/800",
      "https://picsum.photos/1200/800",
      "https://picsum.photos/1200/800",
    ],
    rooms: [
      {
        name: "Bungalow Hướng Vườn (Garden View Bungalow)",
        description:
          "Căn bungalow gỗ rộng 50m2 ẩn mình giữa khu vườn nhiệt đới xanh mát. Trang bị giường King hoặc 2 giường đơn, ban công riêng với võng thư giãn, điều hòa, minibar, két an toàn và phòng tắm riêng có vòi hoa sen ngoài trời.",
        capacity: 2,
        quantity: 15,
        basePrice: 1850000,
        images: [
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
        ],
      },
      {
        name: "Bungalow Hướng Sông (River View Bungalow)",
        description:
          "Bungalow rộng 55m2 nằm ngay sát bờ sông Tiền với ban công rộng mở đón gió sông và tầm nhìn cảnh hoàng hôn rực rỡ. Trang bị nội thất gỗ tự nhiên cao cấp, sofa thư giãn, bồn tắm ngâm và đầy đủ tiện nghi nghỉ dưỡng.",
        capacity: 2,
        quantity: 10,
        basePrice: 2400000,
        images: [
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
        ],
      },
      {
        name: "Bungalow Gia Đình Hướng Sông (Family Riverfront Bungalow)",
        description:
          "Căn bungalow gia đình rộng 80m2 gồm 2 giường đôi lớn hoặc không gian phòng ngủ rộng rãi kết nối. Ban công thoáng đãng view trực diện sông, phù hợp cho gia đình 4 người tận hưởng kỳ nghỉ sinh thái trọn vẹn.",
        capacity: 4,
        quantity: 5,
        basePrice: 3600000,
        images: [
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
          "https://picsum.photos/1200/800",
        ],
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
}
