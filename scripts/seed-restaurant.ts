import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { createRestaurantFromLinksAction } from "@/features/provider/restaurants/actions";
import {
  DAY_END_TIME,
  DAY_START_TIME,
  getSlotsWithinRange,
  type TimeSlot,
} from "@/entities/restaurant/time-slots";

function clamp(time: string, min: string, max: string): string {
  if (time < min) return min;
  if (time > max) return max;
  return time;
}

/**
 * Nguồn RESTAURANTS khai báo giờ mở cửa dưới dạng khoảng (vd 17:30-22:00).
 * Hàm này quy đổi mỗi khoảng thành các khung giờ cố định 30 phút (06:00-22:30)
 * mà createRestaurantSchema yêu cầu. Khoảng qua nửa đêm (vd 22:00-03:00) được
 * cắt tại giờ đóng cửa của lưới (22:30) vì lưới không có khung giờ qua đêm.
 */
export function expandTimeRanges(ranges: TimeSlot[]): TimeSlot[] {
  const seen = new Set<string>();
  return ranges
    .flatMap((range) => {
      const start = clamp(range.startTime, DAY_START_TIME, DAY_END_TIME);
      const end =
        range.startTime <= range.endTime
          ? clamp(range.endTime, DAY_START_TIME, DAY_END_TIME)
          : DAY_END_TIME;
      return getSlotsWithinRange(start, end);
    })
    .filter((slot) => {
      if (seen.has(slot.startTime)) return false;
      seen.add(slot.startTime);
      return true;
    });
}

const IMAGES = [
  "https://picsum.photos/1200/800",
  "https://picsum.photos/1200/800",
  "https://picsum.photos/1200/800",
];

export const RESTAURANTS = [
  {
    name: "Buffet Poseidon",
    provinceName: "Hà Nội",
    address:
      "Tầng 4-5, Tòa nhà Hà Nội Center Point, 27 Lê Văn Lương, Phường Nhân Chính, Quận Thanh Xuân, Hà Nội",
    phone: "0979949533",
    capacity: 600,
    description:
      "Nhà hàng buffet lẩu nướng hải sản quy mô lớn nằm tại trung tâm thương mại Hà Nội Center Point. Không gian rộng rãi, hiện đại với sức chứa hàng trăm khách cùng menu đa dạng hơn 200 món gồm ghẹ, bề bề, hàu, tôm, mực, bò Mỹ tẩm ướp cùng quầy quầy lẩu, sashimi và tráng miệng phong phú.",
    latitude: 21.0048588858335,
    longitude: 105.80479733438058,
    tagNames: [
      "Hải sản",
      "Sang trọng",
      "Gia đình",
      "Bạn bè",
      "Trung tâm thành phố",
      "Đặc sản địa phương",
    ],
    menu: [
      {
        name: "Buffet Hải sản - Nướng & Lẩu (Người lớn - Ngày thường)",
        description:
          "Thưởng thức trọn vẹn hơn 200 món hải sản tươi sống (ghẹ, bề bề, ốc, tôm), BBQ nướng tại bàn, lẩu và sushi, sashimi.",
        price: 358000,
      },
      {
        name: "Buffet Hải sản - Nướng & Lẩu (Người lớn - Cuối tuần / Lễ)",
        description:
          "Vé buffet hải sản cao cấp ngày cuối tuần và dịp Lễ Tết với thực đơn phong phú, refill liên tục.",
        price: 388000,
      },
      {
        name: "Buffet Trẻ em (Từ 1m đến 1m3)",
        description:
          "Suất buffet dành riêng cho trẻ em từ 1m đến dưới 1m3, miễn phí hoàn toàn cho trẻ dưới 1m.",
        price: 158000,
      },
    ],
    timeSlots: [
      { startTime: "11:00", endTime: "14:00" },
      { startTime: "17:30", endTime: "22:00" },
    ],
  },
  {
    name: "Haidilao Hotpot Vincom Trần Duy Hưng",
    provinceName: "Hà Nội",
    address:
      "Tầng 3, TTTM Vincom Center, 119 Trần Duy Hưng, Phường Yên Hòa, Quận Cầu Giấy, Hà Nội",
    phone: "02439198822",
    capacity: 250,
    description:
      "Thương hiệu lẩu Tứ Xuyên nổi tiếng toàn cầu với dịch vụ chăm sóc khách hàng độc đáo và tận tâm. Khách hàng có thể trải nghiệm nước lẩu đa dạng từ lẩu Cà chua, lẩu Thái đến lẩu Tứ Xuyên cay nồng, đi kèm các loại thịt bò nhập khẩu, đồ nhúng phong phú, quầy gia vị tự pha và màn múa mì nghệ thuật đặc sắc.",
    latitude: 21.006923783631663,
    longitude: 105.79622325115095,
    tagNames: [
      "Sang trọng",
      "Gia đình",
      "Bạn bè",
      "Cặp đôi",
      "Trung tâm thành phố",
    ],
    menu: [
      {
        name: "Lẩu Cà Chua (Nước dùng)",
        description:
          "Nước lẩu cà chua đậm đà, chua ngọt thanh dịu, hợp vị với mọi lứa tuổi.",
        price: 120000,
      },
      {
        name: "Thịt Bò Haidilao",
        description:
          "Thịt bò mềm ướp gia vị đặc trưng Haidilao, nhúng lẩu đậm vị.",
        price: 145000,
      },
      {
        name: "Múa Mì Cổ Truyển",
        description:
          "Màn biểu diễn kéo mì tươi trực tiếp tại bàn ăn bởi các nghệ nhân múa mì.",
        price: 20000,
      },
      {
        name: "Quầy Gia Vị & Món Ăn Kèm (Per Person)",
        description:
          "Tự do pha chế nước chấm theo công thức riêng, kèm hoa quả, chè và đồ ăn nhẹ không giới hạn.",
        price: 40000,
      },
    ],
    timeSlots: [
      { startTime: "10:00", endTime: "14:00" },
      { startTime: "17:00", endTime: "22:00" },
      { startTime: "22:00", endTime: "03:00" },
    ],
  },
  {
    name: "Vegan Kitchen An Nhiên Viên",
    provinceName: "Hồ Chí Minh",
    address: "392/20/64 Cao Thắng, Phường 12, Quận 10, Hồ Chí Minh",
    phone: "0908889999",
    capacity: 60,
    description:
      "Quán ăn chay thanh tịnh ẩn mình trong hẻm nhỏ tĩnh lặng trên đường Cao Thắng. An Nhiên Viên mang đến không gian ấm cúng, mộc mạc cùng thực đơn món chay phong phú được chế biến từ nguyên liệu rau củ tươi ngon, thuần tự nhiên, không chất bảo quản, phù hợp cho những ai tìm kiếm sự nhẹ nhàng và thanh lọc cơ thể.",
    latitude: 10.778866940203718,
    longitude: 106.6808030441198,
    tagNames: [
      "Chay",
      "Nghỉ dưỡng",
      "Gia đình",
      "Bạn bè",
      "Một mình",
      "Trung tâm thành phố",
    ],
    menu: [
      {
        name: "Lẩu Nấm An Nhiên",
        description:
          "Nước dùng thanh ngọt từ rau củ ninh kỹ, ăn kèm các loại nấm tươi và rau xanh theo mùa.",
        price: 180000,
      },
      {
        name: "Cơm Chiên Hạt Sen",
        description:
          "Cơm chiên hạt sen bùi bùi, kết hợp cùng đậu hũ, nấm đông cô và củ quả xắt hạt lựu.",
        price: 65000,
      },
      {
        name: "Gỏi Cuốn Chay",
        description:
          "Bánh tráng cuốn rau sống, bún, đậu hũ chiên giòn và nấm, chấm kèm sốt tương đậu đậm đà.",
        price: 45000,
      },
    ],
    timeSlots: [
      { startTime: "09:00", endTime: "14:00" },
      { startTime: "16:00", endTime: "21:00" },
    ],
  },
  {
    name: "Nhà Hàng Cố Đô",
    provinceName: "Hồ Chí Minh",
    address: "367 An Dương Vương, Phường 3, Quận 5, Hồ Chí Minh",
    phone: "02838350415",
    capacity: 150,
    description:
      "Nhà hàng ẩm thực xứ Huế lâu đời nổi tiếng nằm trên đường An Dương Vương. Không gian ấm cúng, đậm chất hoài cổ với lối kiến trúc mang nét văn hóa Cố đô. Chuyên phục vụ các món ăn đặc sản Huế chuẩn vị từ bánh bèo, bánh lọc, nem trụi đến lẩu thả, cơm âm phủ và các món chè Cung đình thanh ngọt.",
    latitude: 10.765813131460543,
    longitude: 106.68906847281903,
    tagNames: [
      "Đặc sản địa phương",
      "Văn hóa - lịch sử",
      "Gia đình",
      "Bạn bè",
      "Trung tâm thành phố",
    ],
    menu: [
      {
        name: "Mẹt Bánh Bèo - Nậm - Lọc Cố Đô",
        description:
          "Khay tổng hợp các loại bánh Huế truyền thống, nhân tôm chấy, ăn kèm nước mắm ruốc cay nhẹ.",
        price: 120000,
      },
      {
        name: "Bún Bò Huế Đặc Biệt",
        description:
          "Bún bò đậm đà hương vị mắm ruốc Huế, ăn kèm nạm bò, chả cua, huyết và rau sống tươi ngon.",
        price: 75000,
      },
      {
        name: "Cơm Âm Phủ Huế",
        description:
          "Món cơm đĩa Cố đô truyền thống kết hợp thịt nướng, chả lụa, tôm chấy, trứng tráng và rau củ thái sợi.",
        price: 85000,
      },
      {
        name: "Chè Hạt Sen Bọc Nhãn Lồng",
        description:
          "Món chè Cung đình Huế thanh mát, hạt sen bùi dẻo bọc trong nhãn lồng mọng nước.",
        price: 45000,
      },
    ],
    timeSlots: [
      { startTime: "09:00", endTime: "14:00" },
      { startTime: "16:00", endTime: "22:00" },
    ],
  },
  {
    name: "Nhà hàng Vịnh Xanh",
    provinceName: "Khánh Hòa",
    address:
      "3 Nguyễn Thị Minh Khai, Phường Lộc Thọ, Thành phố Nha Trang, Khánh Hòa",
    phone: "02583522888",
    capacity: 200,
    description:
      "Nhà hàng hải sản tọa lạc ngay vị trí đắt giá gần quảng trường và bãi biển Nha Trang. Không gian thoáng đãng, hiện đại, chuyên phục vụ các món hải sản tươi sống đặc trưng của vùng biển Khánh Hòa như tôm hùm, cá mú, mực lá và các món ăn đậm đà hương vị biển miền Trung.",
    latitude: 12.239627319169072,
    longitude: 109.19467271713303,
    tagNames: [
      "Hải sản",
      "Biển",
      "Gần biển",
      "Đặc sản địa phương",
      "Gia đình",
      "Bạn bè",
      "Trung tâm thành phố",
    ],
    menu: [
      {
        name: "Tôm hùm Bình Ba nướng phô mai",
        description:
          "Tôm hùm tươi sống nướng cùng lớp phô mai bỏ lò béo ngậy, giữ trọn độ ngọt của thịt.",
        price: 750000,
      },
      {
        name: "Mực lá nướng muối ớt Nha Trang",
        description:
          "Mực lá giòn ngọt nướng sốt muối ớt xanh cay nồng đặc sản Khánh Hòa.",
        price: 220000,
      },
      {
        name: "Lẩu cá mú nấu ngót",
        description:
          "Lẩu cá mú tươi nấu cùng cà chua, thơm và rau cần, vị nước dùng thanh ngọt tự nhiên.",
        price: 350000,
      },
    ],
    timeSlots: [
      { startTime: "09:00", endTime: "14:00" },
      { startTime: "16:00", endTime: "22:00" },
    ],
  },
  {
    name: "Quán cơm tấm Ngày Xưa",
    provinceName: "Hồ Chí Minh",
    address: "3 Trưng Nhị, Phường 1, Thành phố Vũng Tàu, Bà Rịa - Vũng Tàu",
    phone: "0909123456",
    capacity: 80,
    description:
      "Quán cơm tấm bình dân nằm gần khu vực công viên Bãi Trước Vũng Tàu. Không gian đơn giản, gần gũi mang hương vị cơm tấm Sài Gòn đặc trưng với sườn nướng than hoa thơm lừng, bì dẻo, chả trứng béo ngậy ăn kèm nước mắm tỏi ớt kẹo đượm vị.",
    latitude: 10.351575822913576,
    longitude: 107.08500012644977,
    tagNames: [
      "Ẩm thực đường phố",
      "Đặc sản địa phương",
      "Giá rẻ",
      "Gần biển",
      "Trung tâm thành phố",
      "Bạn bè",
    ],
    menu: [
      {
        name: "Cơm tấm Sườn Cốt Lết Nướng",
        description:
          "Cơm tấm hạt dẻo ăn kèm sườn cốt lết tẩm ướp đậm đà nướng than hồng, mỡ hành thơm phức.",
        price: 45000,
      },
      {
        name: "Cơm tấm Sườn Bì Chả Đặc Biệt",
        description:
          "Dĩa cơm tấm đầy đủ gồm sườn nướng, bì trộn, chả trứng chưng và trứng ốp la lòng đào.",
        price: 65000,
      },
      {
        name: "Canh khổ qua dồn thịt",
        description:
          "Tô canh khổ qua dồn thịt băm nóng hổi, vị đắng nhẹ thanh mát giải nhiệt.",
        price: 20000,
      },
    ],
    timeSlots: [
      { startTime: "06:00", endTime: "14:00" },
      { startTime: "16:30", endTime: "21:00" },
    ],
  },
  {
    name: "BBQ Garden Đà Lạt - BUFFET nướng lẩu Đà Lạt",
    provinceName: "Lâm Đồng",
    address: "21 Hoàng Diệu, Phường 5, Thành phố Đà Lạt, Lâm Đồng",
    phone: "0908123456",
    capacity: 200,
    description:
      "Nhà hàng buffet lẩu nướng nằm trên tuyến đường Hoàng Diệu sầm uất tại Đà Lạt. Không gian sân vườn thoáng đãng, ấm cúng phù hợp với không khí se lạnh của thành phố sương mù. Thực đơn buffet đa dạng với các loại thịt bò, heo tẩm ướp đậm đà, hải sản tươi ngon cùng các loại rau củ đặc sản Đà Lạt và quầy lẩu nghi ngút khói.",
    latitude: 11.942553147008267,
    longitude: 108.42993931245286,
    tagNames: [
      "Đặc sản địa phương",
      "Gia đình",
      "Bạn bè",
      "Núi",
      "Cặp đôi",
      "Trung tâm thành phố",
    ],
    menu: [
      {
        name: "Vé Buffet Nướng & Lẩu (Người lớn)",
        description:
          "Thưởng thức không giới hạn các món thịt nướng tẩm ướp phong phú, hải sản tươi, rau củ Đà Lạt và nồi lẩu nóng hổi.",
        price: 239000,
      },
      {
        name: "Vé Buffet Nướng & Lẩu (Trẻ em)",
        description:
          "Suất buffet dành riêng cho trẻ em từ 1m đến 1m3 với đầy đủ các món nướng, chiên và tráng miệng ưa thích.",
        price: 119000,
      },
      {
        name: "Set Lẩu Nấm Bò Mỹ (Gọi thêm)",
        description:
          "Nước lẩu thanh ngọt kết hợp các loại nấm tươi Đà Lạt và thịt bò Mỹ thái mỏng mềm ngọt.",
        price: 150000,
      },
    ],
    timeSlots: [
      { startTime: "10:30", endTime: "14:00" },
      { startTime: "16:00", endTime: "22:00" },
    ],
  },
  {
    name: "Nhà Hàng Cơm Niêu Việt Xưa",
    provinceName: "Ninh Bình",
    address: "80 Tràng An, Phường Tân Thành, Thành phố Ninh Bình, Ninh Bình",
    phone: "0988666888",
    capacity: 300,
    description:
      "Nhà hàng nằm ngay trên trục đường danh thắng Tràng An, có không gian mang đậm nét kiến trúc thuần Việt truyền thống với nhà gỗ rộng rãi, thoáng mát. Chuyên phục vụ các món ăn ẩm thực dân dã Ninh Bình, nổi tiếng với cơm niêu cháy giòn, thịt dê núi Ninh Bình chế biến nhiều món và cơm cháy sốt dê đậm đà.",
    latitude: 20.263859721348076,
    longitude: 105.96316150681272,
    tagNames: [
      "Đặc sản địa phương",
      "Gia đình",
      "Bạn bè",
      "Thiên nhiên",
      "Văn hóa - lịch sử",
      "Trung tâm thành phố",
    ],
    menu: [
      {
        name: "Cơm niêu cháy Việt Xưa",
        description:
          "Cơm nấu niêu đất có lớp cháy giòn rụm đáy niêu, ăn kèm mắm kho quẹt hoặc sốt thịt dê.",
        price: 45000,
      },
      {
        name: "Dê núi tái chanh Ninh Bình",
        description:
          "Thịt dê núi tươi ngon chần tới, bóp cùng chanh, sả, gừng, vừng rang và lá mơ chấm nước tương gừng.",
        price: 180000,
      },
      {
        name: "Cơm cháy sốt dê",
        description:
          "Cơm cháy chiên giòn rụm ăn cùng nước sốt thịt dê xào sánh mịn, thơm phức gia vị truyền thống.",
        price: 120000,
      },
      {
        name: "Dê nướng tảng",
        description:
          "Thịt dê nguyên tảng tẩm ướp vừng sả nướng than hoa, thịt mềm ngọt bên trong, thơm nức bên ngoài.",
        price: 220000,
      },
    ],
    timeSlots: [
      { startTime: "08:00", endTime: "14:30" },
      { startTime: "16:30", endTime: "22:00" },
    ],
  },
  {
    name: "Nhà Hàng Hải Yến - Hải Sản Cát Bà",
    provinceName: "Hải Phòng",
    address: "258 Đường 1/4, Thị trấn Cát Bà, Huyện Cát Hải, Hải Phòng",
    phone: "0983888999",
    capacity: 250,
    description:
      "Nhà hàng hải sản tọa lạc ngay mặt tiền tuyến đường 1/4 ven biển sầm uất tại thị trấn Cát Bà. Với không gian rộng rãi, thoáng mát ngắm trọn vịnh Cát Bà, nhà hàng chuyên phục vụ các loại hải sản tươi sống đánh bắt tại địa phương như bề bề, tu hài, ghẹ xanh, mực nhảy và cá song chế biến theo phong cách ẩm thực biển Hải Phòng đậm đà.",
    latitude: 20.720786650152704,
    longitude: 107.05114955293354,
    tagNames: [
      "Hải sản",
      "Biển",
      "Gần biển",
      "Đặc sản địa phương",
      "Gia đình",
      "Bạn bè",
    ],
    menu: [
      {
        name: "Tu hài nướng mỡ hành",
        description:
          "Tu hài Cát Bà tươi sống nướng mỡ hành và đậu phụng rang thơm phức, thịt giòn ngọt.",
        price: 250000,
      },
      {
        name: "Bề bề rang muối",
        description:
          "Bề bề mẩy thịt rang cùng lớp muối đậm đà, vỏ giòn thơm, thịt ngọt tự nhiên.",
        price: 280000,
      },
      {
        name: "Lẩu cá song Vịnh Cát Bà",
        description:
          "Cá song tươi sống nhúng lẩu nước dùng chua cay thanh nhẹ, ăn kèm rau sống và bún tươi.",
        price: 450000,
      },
      {
        name: "Mực trứng hấp lá lốt",
        description:
          "Mực trứng Cát Bà hấp cùng lá lốt thơm lừng, giữ trọn vị béo ngọt bùi.",
        price: 200000,
      },
    ],
    timeSlots: [
      { startTime: "08:00", endTime: "14:00" },
      { startTime: "16:00", endTime: "22:30" },
    ],
  },
  {
    name: "Thắng Cố A Quỳnh",
    provinceName: "Lào Cai",
    address: "15 Thạch Sơn, Thị xã Sa Pa, Tỉnh Lào Cai",
    phone: "02143871555",
    capacity: 250,
    description:
      "Nhà hàng ẩm thực Tây Bắc nổi tiếng bậc nhất tại Sa Pa, nằm ngay trung tâm gần nhà thờ đá. Không gian mang đậm nét văn hóa vùng cao với nội trúc gỗ mộc mạc và hoa văn thổ cẩm. Quán nổi danh với món thắng cố ngựa truyền thống nấu cùng 12 loại gia vị thảo mộc rừng, cùng các món đặc sản như lẩu cá tầm, lẩu cá hồi, lợn cắp nách và gà đồi nướng mật ong.",
    latitude: 22.336059990666158,
    longitude: 103.84422747671245,
    tagNames: [
      "Đặc sản địa phương",
      "Núi",
      "Văn hóa - lịch sử",
      "Gia đình",
      "Bạn bè",
      "Phượt",
      "Trung tâm thành phố",
    ],
    menu: [
      {
        name: "Thắng Cố Ngựa Truyền Thống",
        description:
          "Món ăn đặc sản Sa Pa ninh cùng thảo mộc rừng, ăn kèm rau cải mèo và nước chấm chẩm chéo cay nồng.",
        price: 350000,
      },
      {
        name: "Lẩu Cá Tầm Sa Pa",
        description:
          "Cá tầm tươi sống nhúng lẩu nước dùng chua cay thanh ngọt, ăn kèm các loại rau đặc sản vùng cao.",
        price: 500000,
      },
      {
        name: "Lợn Cắp Nách Nướng Mật Ong",
        description:
          "Thịt lợn cắp nách da giòn rụm, thịt thơm ngọt tẩm ướp mắc khén và mật ong rừng.",
        price: 180000,
      },
      {
        name: "Gà Đồi Nướng Mắc Khén",
        description:
          "Gà đồi thịt chắc nướng than hoa thơm lừng vị hạt mắc khén và hạt dỗi đặc trưng Tây Bắc.",
        price: 250000,
      },
    ],
    timeSlots: [{ startTime: "08:00", endTime: "22:30" }],
  },
  {
    name: "Song Huong Floating Restaurant",
    provinceName: "Huế",
    address:
      "Công viên 3/2, 2 Lê Lợi, Phường Phú Hội, Thành phố Huế, Thừa Thiên Huế",
    phone: "02343823569",
    capacity: 350,
    description:
      "Nhà hàng nổi độc đáo thiết kế hình bông sen nằm ngay bên bờ sông Hương thơ mộng, cạnh cầu Tràng Tiền. Với tầm nhìn bao quát dòng sông Hương lung linh về đêm, nhà hàng chuyên phục vụ các món ăn Cung đình Huế sang trọng, hải sản tươi sống và ẩm thực xứ Huế truyền thống trong không gian lãng mạn, mang đậm dấu ấn văn hóa Cố đô.",
    latitude: 16.469241518399734,
    longitude: 107.59152974673295,
    tagNames: [
      "Đặc sản địa phương",
      "Sang trọng",
      "Cặp đôi",
      "Gia đình",
      "Văn hóa - lịch sử",
      "Trung tâm thành phố",
    ],
    menu: [
      {
        name: "Yến tiệc Cung đình Huế (Mẹt ẩm thực Cố đô)",
        description:
          "Set món ăn mô phỏng yến tiệc hoàng gia gồm chả phụng, nem công, bánh bèo, bánh bột lọc được tạo hình nghệ thuật.",
        price: 350000,
      },
      {
        name: "Tôm hùm bỏ lò phô mai",
        description:
          "Tôm hùm tươi sống đút lò phô mai béo ngậy, giữ trọn vị ngọt đặc trưng của hải sản.",
        price: 680000,
      },
      {
        name: "Cơm hến Cố đô",
        description:
          "Cơm hến chuẩn vị Huế với thịt hến xào đậm đà, tóp mỡ giòn rụm, mắm ruốc thơm nức và rau sống bắp chuối.",
        price: 55000,
      },
      {
        name: "Lẩu hải sản Sông Hương",
        description:
          "Lẩu hải sản tươi sống gồm tôm, mực, cá bớp với nước dùng chua cay đậm đà phong cách miền Trung.",
        price: 420000,
      },
    ],
    timeSlots: [{ startTime: "08:00", endTime: "22:00" }],
  },
  {
    name: "Nhà Hàng Đông Hồ - Cà Mau",
    provinceName: "Cà Mau",
    address: "175 Nguyễn Du, Phường 5, Thành phố Cà Mau, Cà Mau",
    phone: "02903831777",
    capacity: 300,
    description:
      "Nhà hàng ẩm thực nổi tiếng tại thành phố Cà Mau với không gian sân vườn rộng rãi, thoáng mát ngợp bóng cây xanh. Chuyên phục vụ các món ăn đặc sản đậm chất miền Tây sông nước và vùng đất mũi Cà Mau, nổi bật nhất là các món chế biến từ cua biển Cà Mau chắc thịt, tôm sông, cá thòi lòi và cá lóc nướng trui.",
    latitude: 9.181390697495642,
    longitude: 105.16092847048907,
    tagNames: [
      "Đặc sản địa phương",
      "Hải sản",
      "Gia đình",
      "Bạn bè",
      "Thiên nhiên",
      "Trung tâm thành phố",
    ],
    menu: [
      {
        name: "Cua Cà Mau hấp bia",
        description:
          "Cua thịt/cua gạch Cà Mau tươi sống hấp bia giữ nguyên vị ngọt đậm đà, chấm muối tiêu chanh.",
        price: 380000,
      },
      {
        name: "Cá thòi lòi nướng muối ớt",
        description:
          "Đặc sản đất mũi Cà Mau, cá thòi lòi thịt dai ngọt nướng muối ớt cay nồng thơm phức.",
        price: 180000,
      },
      {
        name: "Lẩu mắm Đất Mũi",
        description:
          "Nước lẩu mắm đậm đà ăn kèm tôm, mực, cá ngát và củ ngó sen cùng các loại rau đồng miền Tây.",
        price: 250000,
      },
      {
        name: "Tôm đất nướng lu",
        description:
          "Tôm đất sinh thái Cà Mau nướng trong lu gốm, thịt tôm săn chắc và ngọt tự nhiên.",
        price: 220000,
      },
    ],
    timeSlots: [{ startTime: "09:00", endTime: "22:00" }],
  },
];

export async function seedRestaurants() {
  const providerProfile = await prisma.providerProfile.findFirst({
    where: { businessType: "restaurant", approvalStatus: "approved" },
  });
  if (!providerProfile) return;

  const provinceByName = new Map(
    (await prisma.province.findMany()).map((p) => [p.name, p.id]),
  );
  const tagByName = new Map(
    (await prisma.tag.findMany()).map((t) => [t.name, t.id]),
  );

  for (const restaurant of RESTAURANTS) {
    const formData = new FormData();
    formData.set("providerProfileId", providerProfile.id);
    formData.set("name", restaurant.name);
    formData.set("provinceId", provinceByName.get(restaurant.provinceName)!);
    formData.set("address", restaurant.address);
    formData.set("latitude", String(restaurant.latitude));
    formData.set("longitude", String(restaurant.longitude));
    formData.set("phone", restaurant.phone);
    formData.set("capacity", String(restaurant.capacity));
    formData.set("description", restaurant.description);
    formData.set(
      "tagIds",
      JSON.stringify(restaurant.tagNames.map((name) => tagByName.get(name))),
    );
    formData.set("menu", JSON.stringify(restaurant.menu));
    formData.set(
      "timeSlots",
      JSON.stringify(expandTimeRanges(restaurant.timeSlots)),
    );
    formData.set("imageUrls", JSON.stringify(IMAGES));

    const result = await createRestaurantFromLinksAction(
      { status: "idle" },
      formData,
    );
    if (result.status === "error") {
      console.error(
        `✗ ${restaurant.name}`,
        result.formError ?? result.fieldErrors,
      );
    }
  }

  await prisma.restaurant.updateMany({
    where: { providerProfileId: providerProfile.id },
    data: { status: "published" },
  });
}
