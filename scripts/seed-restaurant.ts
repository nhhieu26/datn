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
    name: "Nhà hàng Dê Núi Tràng An",
    provinceName: "Ninh Bình",
    address: "Số 18 Đường Tràng An, Trường Yên, Hoa Lư, Ninh Bình",
    phone: "02293888111",
    capacity: 300,
    description:
      "Nhà hàng chuyên các món dê núi Ninh Bình, nổi tiếng với dê tái chanh, dê hấp tía tô và dê nướng. Không gian rộng, thoáng gần bến thuyền Tràng An, phù hợp đoàn khách và gia đình sau chuyến đi thuyền.",
    latitude: 20.2506,
    longitude: 105.9102,
    tagNames: ["Đặc sản địa phương", "Gia đình", "Bạn bè", "Giá rẻ"],
    menu: [
      {
        name: "Dê tái chanh",
        description:
          "Thịt dê núi tươi thái mỏng, trộn chanh, rau thơm và lạc rang, chấm tương gừng.",
        price: 220000,
      },
      {
        name: "Dê hấp tía tô",
        description:
          "Thịt dê hấp mềm với tía tô, thơm mùi gừng, ăn kèm bánh đa nem.",
        price: 260000,
      },
      {
        name: "Cơm cháy chà bông",
        description: "Cơm cháy giòn rụm ăn kèm chà bông, đặc sản Ninh Bình.",
        price: 80000,
      },
    ],
    timeSlots: [
      { startTime: "10:00", endTime: "14:00" },
      { startTime: "17:00", endTime: "21:30" },
    ],
  },
  {
    name: "Cơm Cháy Hoa Lư Quán",
    provinceName: "Ninh Bình",
    address: "Số 4 Đường Hoa Lư, phường Hoa Lư, Ninh Bình",
    phone: "02293777222",
    capacity: 120,
    description:
      "Quán chuyên cơm cháy và các món ăn truyền thống Ninh Bình. Cơm cháy giòn tan được chế biến tại chỗ, ăn kèm sốt thịt dê hoặc chà bông. Quán có không gian nhà gỗ ấm cúng, phù hợp bữa trưa nhẹ nhàng.",
    latitude: 20.2812,
    longitude: 105.9048,
    tagNames: ["Đặc sản địa phương", "Giá rẻ", "Gia đình", "Một mình"],
    menu: [
      {
        name: "Cơm cháy sốt thịt dê",
        description:
          "Cơm cháy giòn rưới sốt thịt dê thơm nồng, món đặc trưng Ninh Bình.",
        price: 120000,
      },
      {
        name: "Miến lươn",
        description:
          "Miến lươn xào giòn với hành phi và lươn đồng, nước dùng đậm vị.",
        price: 70000,
      },
      {
        name: "Nem Yên Mạc",
        description: "Nem chua truyền thống Yên Mạc, chấm tương ớt.",
        price: 60000,
      },
    ],
    timeSlots: [{ startTime: "08:00", endTime: "21:00" }],
  },
  {
    name: "Quán Ốc Núi Tam Cốc",
    provinceName: "Ninh Bình",
    address: "Thôn Văn Lâm, Ninh Hải, Hoa Lư, Ninh Bình",
    phone: "02293666333",
    capacity: 150,
    description:
      "Quán ốc núi nổi tiếng gần Tam Cốc, phục vụ ốc núi hấp sả, ốc nấu chuối đậu và cá rô đồng. Quán có sân vườn thoáng mát, giá bình dân, thường đông khách vào buổi chiều tối.",
    latitude: 20.2178,
    longitude: 105.9281,
    tagNames: ["Đặc sản địa phương", "Giá rẻ", "Bạn bè", "Ẩm thực đường phố"],
    menu: [
      {
        name: "Ốc núi hấp sả",
        description: "Ốc núi béo ngọt hấp sả gừng, chấm muối tiêu chanh.",
        price: 140000,
      },
      {
        name: "Ốc nấu chuối đậu",
        description: "Món ăn dân dã với ốc, chuối xanh, đậu phụ và lá lốt.",
        price: 120000,
      },
      {
        name: "Cá rô đồng kho tộ",
        description: "Cá rô đồng kho tộ đậm đà ăn với cơm trắng.",
        price: 150000,
      },
    ],
    timeSlots: [{ startTime: "10:00", endTime: "21:30" }],
  },
  {
    name: "Nhà hàng Lúa Vàng Tam Cốc",
    provinceName: "Ninh Bình",
    address: "Số 55 Đường Tam Cốc, Ninh Hải, Hoa Lư, Ninh Bình",
    phone: "02293555444",
    capacity: 250,
    description:
      "Nhà hàng phục vụ thực đơn đoàn và buffet trưa cho khách tham quan Tam Cốc - Bích Động. Không gian nhà sàn nhìn ra cánh đồng lúa, thực đơn gồm các món đồng quê và đặc sản dê núi.",
    latitude: 20.2152,
    longitude: 105.9323,
    tagNames: ["Đặc sản địa phương", "Gia đình", "Thiên nhiên", "Bạn bè"],
    menu: [
      {
        name: "Set menu đoàn 6 món",
        description:
          "Gồm dê núi, cá rô, rau luộc, canh chua và tráng miệng, phục vụ theo mâm.",
        price: 250000,
      },
      {
        name: "Buffet trưa Tam Cốc",
        description:
          "Buffet các món Việt truyền thống, quầy cơm cháy và hoa quả.",
        price: 180000,
      },
    ],
    timeSlots: [
      { startTime: "10:30", endTime: "14:00" },
      { startTime: "17:30", endTime: "21:00" },
    ],
  },
  {
    name: "Bếp Quê Vân Long",
    provinceName: "Ninh Bình",
    address: "Xóm 3, Gia Vân, Gia Viễn, Ninh Bình",
    phone: "02293444555",
    capacity: 100,
    description:
      "Quán ăn gia đình ven đầm Vân Long với các món cá đồng, tôm, cua đồng nấu theo kiểu quê. Chủ quán là người dân địa phương, nguyên liệu lấy từ đầm và vườn nhà nên rất tươi.",
    latitude: 20.3695,
    longitude: 105.8689,
    tagNames: ["Đặc sản địa phương", "Thiên nhiên", "Gia đình", "Giá rẻ"],
    menu: [
      {
        name: "Cá chép om dưa",
        description: "Cá chép đầm Vân Long om dưa chua, thơm vị quê.",
        price: 170000,
      },
      {
        name: "Cua đồng đồng riêu",
        description: "Canh riêu cua đồng nấu với cà chua, ăn kèm rau sống.",
        price: 90000,
      },
      {
        name: "Gà đồi nướng mật ong",
        description: "Gà đồi thả vườn nướng mật ong, da giòn thịt ngọt.",
        price: 280000,
      },
    ],
    timeSlots: [{ startTime: "10:00", endTime: "20:30" }],
  },
  {
    name: "Quán Chay An Lạc",
    provinceName: "Ninh Bình",
    address: "Số 9 Đường Bái Đính, Gia Sinh, Gia Viễn, Ninh Bình",
    phone: "02293333666",
    capacity: 120,
    description:
      "Quán chay thanh tịnh gần chùa Bái Đính, phục vụ cơm chay, bún chay và các món rau củ địa phương. Không gian nhẹ nhàng, thực đơn thanh đạm, phù hợp khách hành hương.",
    latitude: 20.2793,
    longitude: 105.8641,
    tagNames: ["Chay", "Giá rẻ", "Gia đình", "Một mình"],
    menu: [
      {
        name: "Cơm chay thập cẩm",
        description: "Cơm trắng với các món đậu phụ, nấm, rau củ xào và canh.",
        price: 70000,
      },
      {
        name: "Bún riêu chay",
        description:
          "Bún riêu nấu từ cà chua, đậu phụ và nấm, nước dùng thanh ngọt.",
        price: 55000,
      },
      {
        name: "Nem chay chiên giòn",
        description: "Nem cuốn rau củ chiên giòn, chấm tương ớt chua ngọt.",
        price: 60000,
      },
    ],
    timeSlots: [{ startTime: "08:00", endTime: "20:00" }],
  },
  {
    name: "Nhà hàng Bái Đính Palace",
    provinceName: "Ninh Bình",
    address: "Số 12 Đường Bái Đính, Gia Sinh, Gia Viễn, Ninh Bình",
    phone: "02293222777",
    capacity: 400,
    description:
      "Nhà hàng quy mô lớn phục vụ đoàn khách sau chuyến tham quan Bái Đính. Thực đơn gồm đặc sản dê núi, cơm cháy, cá rô đồng và nhiều món Việt, phục vụ theo mâm nhanh gọn.",
    latitude: 20.2806,
    longitude: 105.8647,
    tagNames: ["Đặc sản địa phương", "Gia đình", "Bạn bè", "Giá rẻ"],
    menu: [
      {
        name: "Mâm cơm 8 món",
        description:
          "Mâm cơm đặc sản gồm dê, gà, cá, rau và canh, dành cho nhóm 6 người.",
        price: 650000,
      },
      {
        name: "Lẩu dê tiết canh",
        description: "Lẩu dê nấu với rau, nấm, đậu phụ, nước dùng đậm đà.",
        price: 380000,
      },
    ],
    timeSlots: [
      { startTime: "10:00", endTime: "14:00" },
      { startTime: "17:00", endTime: "21:00" },
    ],
  },
  {
    name: "Nhà hàng Miến Lươn Phố Cổ Ninh Bình",
    provinceName: "Ninh Bình",
    address: "Số 28 Đường Trần Hưng Đạo, Vân Giang, Ninh Bình",
    phone: "02293111888",
    capacity: 90,
    description:
      "Quán nhỏ trong trung tâm thành phố Ninh Bình chuyên miến lươn, cháo lươn và bún mọc. Lươn đồng được chế biến sạch sẽ, nước dùng ngọt thanh, là lựa chọn ăn sáng quen thuộc của người địa phương.",
    latitude: 20.2526,
    longitude: 105.9746,
    tagNames: ["Đặc sản địa phương", "Ẩm thực đường phố", "Giá rẻ", "Một mình"],
    menu: [
      {
        name: "Miến lươn nước",
        description:
          "Miến lươn nước dùng xương, lươn đồng chiên giòn, ăn kèm rau thơm.",
        price: 60000,
      },
      {
        name: "Cháo lươn",
        description: "Cháo trắng nấu nhừ ăn cùng lươn xào lăn, hành phi.",
        price: 55000,
      },
      {
        name: "Bún mọc",
        description: "Bún mọc giò nấm hương, nước dùng xương ngọt.",
        price: 50000,
      },
    ],
    timeSlots: [
      { startTime: "06:00", endTime: "11:00" },
      { startTime: "16:00", endTime: "20:00" },
    ],
  },
  {
    name: "Bánh Đa Cua Bà Hạnh",
    provinceName: "Hải Phòng",
    address: "Số 15 Lạch Tray, Ngô Quyền, Hải Phòng",
    phone: "02253812345",
    capacity: 80,
    description:
      "Quán bánh đa cua lâu đời của người Hải Phòng, nổi tiếng với nước dùng cua đồng ngọt, sợi bánh đa đỏ dai mềm và chả cua, tôm, rau muống. Quán đông khách vào buổi sáng, giá bình dân.",
    latitude: 20.8515,
    longitude: 106.6945,
    tagNames: ["Đặc sản địa phương", "Ẩm thực đường phố", "Giá rẻ", "Một mình"],
    menu: [
      {
        name: "Bánh đa cua đầy đủ",
        description:
          "Bánh đa cua với chả cua, tôm, rau muống và nước dùng cua đồng.",
        price: 55000,
      },
      {
        name: "Bánh đa cua đặc biệt",
        description: "Thêm gạch cua và chả ruốc, tôm to.",
        price: 85000,
      },
      {
        name: "Nem cua bể",
        description:
          "Nem cua bể chiên giòn nhân thịt cua, chấm nước mắm chua ngọt.",
        price: 90000,
      },
    ],
    timeSlots: [
      { startTime: "06:00", endTime: "11:00" },
      { startTime: "16:00", endTime: "20:00" },
    ],
  },
  {
    name: "Nem Cua Bể Quán Hải Phòng",
    provinceName: "Hải Phòng",
    address: "Số 62 Tam Bạc, Hồng Bàng, Hải Phòng",
    phone: "02253823456",
    capacity: 100,
    description:
      "Quán chuyên nem cua bể, món đặc sản số một của Hải Phòng. Nem cuốn bánh đa nem, chiên giòn vàng, nhân thịt cua, nấm mèo, miến. Quán nằm trong khu phố ẩm thực Tam Bạc, thích hợp cho nhóm bạn.",
    latitude: 20.8584,
    longitude: 106.6781,
    tagNames: [
      "Đặc sản địa phương",
      "Ẩm thực đường phố",
      "Bạn bè",
      "Trung tâm thành phố",
    ],
    menu: [
      {
        name: "Nem cua bể (6 cái)",
        description: "Nem cua bể giòn rụm, ăn kèm rau sống và nước chấm.",
        price: 120000,
      },
      {
        name: "Chả mực Hạ Long",
        description: "Chả mực giã tay giòn dai, chiên vàng.",
        price: 180000,
      },
      {
        name: "Bún cá cay",
        description: "Bún cá cay đặc trưng Hải Phòng với nước dùng cay nồng.",
        price: 60000,
      },
    ],
    timeSlots: [{ startTime: "10:00", endTime: "22:00" }],
  },
  {
    name: "Nhà hàng Hải Sản Cát Bà View",
    provinceName: "Hải Phòng",
    address: "Số 7 Núi Ngọc, thị trấn Cát Bà, Cát Hải, Hải Phòng",
    phone: "02253888999",
    capacity: 300,
    description:
      "Nhà hàng hải sản nằm trên bờ biển Cát Bà với tầm nhìn thẳng ra vịnh. Hải sản tươi sống lấy từ lồng bè gần đảo, đa dạng cua, ghẹ, tôm hùm, ngao, hàu nướng, phục vụ theo thời giá.",
    latitude: 20.7262,
    longitude: 107.0481,
    tagNames: [
      "Hải sản",
      "Gần biển",
      "Gia đình",
      "Bạn bè",
      "Đặc sản địa phương",
    ],
    menu: [
      {
        name: "Ghẹ hấp bia",
        description:
          "Ghẹ Cát Bà tươi hấp bia, thịt chắc ngọt, chấm muối tiêu chanh.",
        price: 380000,
      },
      {
        name: "Hàu nướng mỡ hành",
        description: "Hàu Cát Bà nướng mỡ hành, đậu phộng và hành phi.",
        price: 160000,
      },
      {
        name: "Mực nháy nướng",
        description: "Mực tươi nướng than, chấm sa tế.",
        price: 320000,
      },
      {
        name: "Cơm chiên hải sản",
        description: "Cơm chiên với tôm, mực, ngao.",
        price: 130000,
      },
    ],
    timeSlots: [{ startTime: "10:00", endTime: "22:00" }],
  },
  {
    name: "Quán Ốc Tam Bạc",
    provinceName: "Hải Phòng",
    address: "Số 39 Tam Bạc, Hồng Bàng, Hải Phòng",
    phone: "02253876543",
    capacity: 120,
    description:
      "Quán ốc nổi tiếng trong khu phố ẩm thực với các món ốc luộc, ốc xào me, ốc nướng tiêu. Quán có nhiều chỗ ngồi vỉa hè, giá rẻ, rất phù hợp nhóm bạn đi chơi buổi tối.",
    latitude: 20.8588,
    longitude: 106.6773,
    tagNames: ["Ẩm thực đường phố", "Hải sản", "Giá rẻ", "Bạn bè"],
    menu: [
      {
        name: "Ốc hương xào bơ tỏi",
        description: "Ốc hương xào bơ tỏi thơm lừng, béo ngậy.",
        price: 180000,
      },
      {
        name: "Ốc mỡ xào me",
        description: "Ốc mỡ xào me chua ngọt đậm đà.",
        price: 120000,
      },
      {
        name: "Sò điệp nướng mỡ hành",
        description: "Sò điệp nướng mỡ hành giòn ngọt.",
        price: 150000,
      },
    ],
    timeSlots: [{ startTime: "15:00", endTime: "22:30" }],
  },
  {
    name: "Bánh Mì Cay Hải Phòng - Chợ Sắt",
    provinceName: "Hải Phòng",
    address: "Số 4 Cầu Đất, Ngô Quyền, Hải Phòng",
    phone: "0912345678",
    capacity: 40,
    description:
      "Tiệm bánh mì cay chuẩn vị Hải Phòng, với ổ bánh mì nhỏ giòn nướng than, nhân pate, thịt, chả và sốt cay đặc trưng. Quán nhỏ nhưng luôn đông khách, phù hợp bữa nhẹ nhanh gọn.",
    latitude: 20.8556,
    longitude: 106.6921,
    tagNames: ["Ẩm thực đường phố", "Giá rẻ", "Một mình", "Đặc sản địa phương"],
    menu: [
      {
        name: "Bánh mì cay thập cẩm",
        description: "Bánh mì nhân pate, thịt nguội, chả và sốt cay.",
        price: 20000,
      },
      {
        name: "Bánh mì que chấm sốt",
        description: "Bánh mì que giòn chấm sốt cay.",
        price: 10000,
      },
      {
        name: "Cà phê trứng",
        description: "Cà phê trứng béo thơm kiểu Hải Phòng.",
        price: 35000,
      },
    ],
    timeSlots: [{ startTime: "06:00", endTime: "21:00" }],
  },
  {
    name: "Nhà hàng Tôm Hùm Đồ Sơn",
    provinceName: "Hải Phòng",
    address: "Số 28 Lý Thánh Tông, Vạn Hương, Đồ Sơn, Hải Phòng",
    phone: "02253865432",
    capacity: 350,
    description:
      "Nhà hàng hải sản bờ biển Đồ Sơn, nổi tiếng với tôm hùm, ghẹ xanh, cá hồng và cua huỳnh đế. Không gian rộng, có thể tổ chức tiệc và đón đoàn, phục vụ theo thời giá hải sản.",
    latitude: 20.7135,
    longitude: 106.7837,
    tagNames: ["Hải sản", "Gần biển", "Gia đình", "Sang trọng", "Bạn bè"],
    menu: [
      {
        name: "Tôm hùm nướng phô mai",
        description: "Tôm hùm nướng phô mai béo ngậy.",
        price: 1500000,
      },
      {
        name: "Cua huỳnh đế hấp",
        description: "Cua huỳnh đế hấp nguyên con, thịt chắc ngọt.",
        price: 1200000,
      },
      {
        name: "Lẩu hải sản Đồ Sơn",
        description: "Lẩu hải sản nước dùng chua cay cho nhóm 4 người.",
        price: 650000,
      },
    ],
    timeSlots: [{ startTime: "10:00", endTime: "22:00" }],
  },
  {
    name: "Quán Chay Tâm An Hải Phòng",
    provinceName: "Hải Phòng",
    address: "Số 12 Lê Lai, Ngô Quyền, Hải Phòng",
    phone: "02253899123",
    capacity: 80,
    description:
      "Quán chay thanh tịnh trung tâm Hải Phòng, phục vụ cơm chay, bún chay, nem chay với nguyên liệu rau củ sạch. Không gian trang nhã, giá phải chăng, hợp khách ăn kiêng và hành hương.",
    latitude: 20.8602,
    longitude: 106.6926,
    tagNames: ["Chay", "Giá rẻ", "Gia đình", "Một mình", "Trung tâm thành phố"],
    menu: [
      {
        name: "Cơm chay phần",
        description: "Cơm trắng ăn kèm đậu phụ, nấm, rau xào và canh.",
        price: 65000,
      },
      {
        name: "Bún bò chay Huế",
        description: "Bún bò chay cay nhẹ, nước dùng ngọt từ rau củ.",
        price: 55000,
      },
    ],
    timeSlots: [{ startTime: "08:00", endTime: "20:30" }],
  },
  {
    name: "Nhà hàng Cua Biển Cát Hải",
    provinceName: "Hải Phòng",
    address: "Số 20 Hoàng Châu, Cát Hải, Hải Phòng",
    phone: "02253833345",
    capacity: 200,
    description:
      "Nhà hàng phục vụ các món cua biển, ghẹ, sá sùng và tôm sú tươi sống đánh bắt từ ngư trường Cát Hải. Không gian giản dị sát bến cảng, giá hợp lý, là điểm đến quen thuộc của dân địa phương.",
    latitude: 20.7947,
    longitude: 106.9935,
    tagNames: ["Hải sản", "Đặc sản địa phương", "Gia đình", "Giá rẻ"],
    menu: [
      {
        name: "Cua biển rang me",
        description: "Cua biển rang me chua ngọt cay nhẹ.",
        price: 420000,
      },
      {
        name: "Sá sùng xào tỏi",
        description: "Sá sùng xào tỏi đặc sản biển Cát Hải.",
        price: 250000,
      },
      {
        name: "Cháo hàu",
        description: "Cháo nấu từ hàu tươi và hành lá.",
        price: 90000,
      },
    ],
    timeSlots: [{ startTime: "09:30", endTime: "21:30" }],
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
