import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { createTourFromLinksAction } from "@/features/provider/tours/actions";

const IMAGES = [
  "https://picsum.photos/1200/800",
  "https://picsum.photos/1200/800",
  "https://picsum.photos/1200/800",
];

type ItineraryDay = { title: string; description: string };

type TourSeed = {
  title: string;
  provinceName: string;
  tagNames: string[];
  durationDays: number;
  durationNights: number;
  basePrice: number;
  description: string;
  includeServices: string[];
  excludeServices: string[];
  itinerary: ItineraryDay[];
  departureStartDays: number;
  departureEveryDays: number;
  totalSlots: number;
};

const TOURS: TourSeed[] = [
  {
    title: "Hà Nội - Tràng An - Bái Đính - Hang Múa 1 ngày",
    provinceName: "Ninh Bình",
    tagNames: [
      "Văn hóa - lịch sử",
      "Thiên nhiên",
      "Gia đình",
      "Giá rẻ",
      "Một mình",
    ],
    durationDays: 1,
    durationNights: 0,
    basePrice: 890000,
    description:
      "Tour trong ngày từ Hà Nội khám phá ba điểm nổi bật nhất Ninh Bình: chùa Bái Đính lớn nhất Đông Nam Á, quần thể danh thắng Tràng An bằng thuyền nan và Hang Múa với 486 bậc đá ngắm toàn cảnh. Bữa trưa thưởng thức đặc sản dê núi và cơm cháy. Phù hợp gia đình và nhóm bạn có ít thời gian.",
    includeServices: [
      "Xe đưa đón khứ hồi Hà Nội - Ninh Bình",
      "Vé thuyền Tràng An",
      "Vé tham quan Hang Múa",
      "Bữa trưa đặc sản dê núi",
      "Hướng dẫn viên suốt tuyến",
    ],
    excludeServices: [
      "Chi phí cá nhân, đồ uống ngoài chương trình",
      "Tiền tip cho hướng dẫn viên và tài xế",
    ],
    itinerary: [
      {
        title: "Ngày 1: Hà Nội - Bái Đính - Tràng An - Hang Múa - Hà Nội",
        description:
          "07h00 xe đón tại khu phố cổ Hà Nội, 09h30 đến chùa Bái Đính tham quan chùa mới, bảo tháp và hành lang La Hán. 11h30 dùng bữa trưa đặc sản. 13h00 đi thuyền nan qua các hang Tràng An. 15h30 leo Hang Múa ngắm toàn cảnh Tam Cốc. 17h00 khởi hành về Hà Nội, kết thúc tour khoảng 19h30.",
      },
    ],
    departureStartDays: 3,
    departureEveryDays: 1,
    totalSlots: 40,
  },
  {
    title: "Ninh Bình 2 ngày 1 đêm: Tràng An - Tam Cốc - Hang Múa homestay",
    provinceName: "Ninh Bình",
    tagNames: ["Thiên nhiên", "Cặp đôi", "Bạn bè", "Homestay", "Nghỉ dưỡng"],
    durationDays: 2,
    durationNights: 1,
    basePrice: 1950000,
    description:
      "Hành trình 2 ngày nghỉ đêm tại homestay giữa đồng lúa Tam Cốc, cho phép trải nghiệm Ninh Bình chậm rãi. Ngày đầu đi thuyền Tràng An và thăm cố đô Hoa Lư, ngày hai ngắm bình minh trên Hang Múa, chèo thuyền Tam Cốc và đạp xe qua làng quê. Lý tưởng cho cặp đôi và nhóm bạn.",
    includeServices: [
      "Xe đưa đón khứ hồi Hà Nội",
      "1 đêm homestay tiêu chuẩn",
      "Vé thuyền Tràng An và Tam Cốc",
      "Vé Hang Múa và Hoa Lư",
      "3 bữa ăn theo chương trình",
      "Thuê xe đạp 1 ngày",
    ],
    excludeServices: [
      "Chi phí cá nhân, đồ uống ngoài chương trình",
      "Tiền tip cho hướng dẫn viên và tài xế",
      "Bữa tối ngoài chương trình",
    ],
    itinerary: [
      {
        title: "Ngày 1: Hà Nội - Hoa Lư - Tràng An",
        description:
          "07h30 xe đón khởi hành, 10h00 tham quan cố đô Hoa Lư, đền vua Đinh và vua Lê. 12h00 ăn trưa đặc sản dê núi. Chiều đi thuyền nan Tràng An xuyên các hang động. Tối nhận phòng homestay và thưởng thức bữa tối đồng quê.",
      },
      {
        title: "Ngày 2: Hang Múa - Tam Cốc - Hà Nội",
        description:
          "05h30 dậy sớm ngắm bình minh, leo Hang Múa. 08h00 ăn sáng, đi thuyền Tam Cốc và ghé chùa Bích Động. 11h30 ăn trưa, 13h00 xe đưa đoàn về Hà Nội, kết thúc tour khoảng 16h30.",
      },
    ],
    departureStartDays: 5,
    departureEveryDays: 3,
    totalSlots: 30,
  },
  {
    title: "Cúc Phương trekking 2 ngày 1 đêm",
    provinceName: "Ninh Bình",
    tagNames: ["Thiên nhiên", "Phiêu lưu mạo hiểm", "Phượt", "Gia đình", "Núi"],
    durationDays: 2,
    durationNights: 1,
    basePrice: 2350000,
    description:
      "Chuyến đi khám phá vườn quốc gia Cúc Phương với trekking đến cây chò ngàn năm tuổi, động Người Xưa và trung tâm cứu hộ linh trưởng. Đêm nghỉ nhà sàn trong rừng, nghe tiếng chim thú. Phù hợp du khách yêu thiên nhiên và hoạt động ngoài trời.",
    includeServices: [
      "Xe đưa đón khứ hồi",
      "1 đêm nhà sàn trong vườn quốc gia",
      "Vé vào vườn quốc gia",
      "Hướng dẫn viên rừng",
      "3 bữa ăn theo chương trình",
    ],
    excludeServices: [
      "Chi phí cá nhân, đồ uống ngoài chương trình",
      "Tiền tip cho hướng dẫn viên và tài xế",
      "Bảo hiểm du lịch tự nguyện",
    ],
    itinerary: [
      {
        title: "Ngày 1: Hà Nội - Cúc Phương - Cây chò ngàn năm",
        description:
          "07h00 khởi hành, 10h00 đến Cúc Phương, tham quan trung tâm cứu hộ linh trưởng. Chiều trekking 5km đến cây chò ngàn năm tuổi, về nghỉ nhà sàn, dùng bữa tối BBQ ngoài trời.",
      },
      {
        title: "Ngày 2: Động Người Xưa - Hà Nội",
        description:
          "07h00 ăn sáng, leo bậc đá đến động Người Xưa, quan sát bướm và chim rừng. 11h00 ăn trưa, 13h00 về Hà Nội, kết thúc tour khoảng 17h30.",
      },
    ],
    departureStartDays: 6,
    departureEveryDays: 7,
    totalSlots: 20,
  },
  {
    title: "Vân Long - Thung Nham - Bái Đính 1 ngày",
    provinceName: "Ninh Bình",
    tagNames: ["Thiên nhiên", "Gia đình", "Cặp đôi", "Một mình"],
    durationDays: 1,
    durationNights: 0,
    basePrice: 990000,
    description:
      "Tour kết hợp đầm Vân Long, nơi sống của loài voọc mông trắng, vườn chim Thung Nham và chùa Bái Đính. Du khách đi thuyền yên bình trên đầm, xuyên hang Chợ Mơ và ngắm đàn chim trở về chiều tối.",
    includeServices: [
      "Xe đưa đón khứ hồi",
      "Vé thuyền Vân Long",
      "Vé vườn chim Thung Nham",
      "Bữa trưa đặc sản",
      "Hướng dẫn viên",
    ],
    excludeServices: [
      "Chi phí cá nhân, đồ uống ngoài chương trình",
      "Tiền tip cho hướng dẫn viên và tài xế",
    ],
    itinerary: [
      {
        title: "Ngày 1: Hà Nội - Vân Long - Thung Nham - Hà Nội",
        description:
          "07h00 khởi hành, 09h30 đi thuyền Vân Long qua hang Chợ Mơ. 12h00 ăn trưa tại nhà hàng bên đầm. 14h00 tham quan Thung Nham và vườn chim. 17h00 ngắm đàn chim về tổ, 17h30 xe về Hà Nội.",
      },
    ],
    departureStartDays: 4,
    departureEveryDays: 2,
    totalSlots: 35,
  },
  {
    title: "Food tour Ninh Bình: dê núi, cơm cháy, ốc núi 1 ngày",
    provinceName: "Ninh Bình",
    tagNames: [
      "Đặc sản địa phương",
      "Ẩm thực đường phố",
      "Bạn bè",
      "Giá rẻ",
      "Văn hóa - lịch sử",
    ],
    durationDays: 1,
    durationNights: 0,
    basePrice: 790000,
    description:
      "Tour ẩm thực dành cho người mê ăn, nếm thử dê núi, cơm cháy, ốc núi, miến lươn và nem Yên Mạc cùng người dẫn địa phương. Kết hợp ghé chợ quê và tham quan cố đô Hoa Lư.",
    includeServices: [
      "Xe đưa đón trong ngày",
      "Các bữa ăn và món nếm thử theo chương trình",
      "Vé cố đô Hoa Lư",
      "Hướng dẫn viên ẩm thực",
    ],
    excludeServices: [
      "Chi phí cá nhân, đồ uống ngoài chương trình",
      "Tiền tip cho hướng dẫn viên và tài xế",
    ],
    itinerary: [
      {
        title: "Ngày 1: Hà Nội - Ninh Bình food tour",
        description:
          "07h00 xe đón từ Hà Nội. 09h30 ăn sáng miến lươn, tham quan chợ. 11h00 thăm cố đô Hoa Lư. 12h30 thưởng thức dê núi, cơm cháy. 15h00 ốc núi và nem Yên Mạc. 17h30 về Hà Nội.",
      },
    ],
    departureStartDays: 2,
    departureEveryDays: 2,
    totalSlots: 25,
  },
  {
    title: "Ninh Bình - Phát Diệm - Kim Sơn 1 ngày",
    provinceName: "Ninh Bình",
    tagNames: ["Văn hóa - lịch sử", "Một mình", "Giá rẻ", "Bạn bè"],
    durationDays: 1,
    durationNights: 0,
    basePrice: 850000,
    description:
      "Chuyến đi về miền đất Kim Sơn với nhà thờ đá Phát Diệm, kiến trúc độc đáo kết hợp Đông - Tây, và đền thờ Nguyễn Công Trứ. Kết thúc bằng bữa cơm hải sản dân dã vùng ven biển.",
    includeServices: [
      "Xe đưa đón khứ hồi",
      "Hướng dẫn viên",
      "Bữa trưa hải sản",
      "Vé tham quan",
    ],
    excludeServices: [
      "Chi phí cá nhân, đồ uống ngoài chương trình",
      "Tiền tip cho hướng dẫn viên và tài xế",
    ],
    itinerary: [
      {
        title: "Ngày 1: Hà Nội - Phát Diệm - Kim Sơn - Hà Nội",
        description:
          "07h00 khởi hành, 09h30 tham quan nhà thờ đá Phát Diệm, dạo hồ và các nhà nguyện. 11h30 ăn trưa hải sản. 14h00 thăm đền Nguyễn Công Trứ và vùng cửa biển. 17h00 về Hà Nội.",
      },
    ],
    departureStartDays: 3,
    departureEveryDays: 4,
    totalSlots: 35,
  },
  {
    title: "Ninh Bình 3 ngày 2 đêm nghỉ dưỡng cho cặp đôi",
    provinceName: "Ninh Bình",
    tagNames: ["Nghỉ dưỡng", "Sang trọng", "Cặp đôi", "Thiên nhiên"],
    durationDays: 3,
    durationNights: 2,
    basePrice: 5450000,
    description:
      "Kỳ nghỉ 3 ngày 2 đêm dành cho cặp đôi tại resort 5 sao giữa vườn sen. Chương trình gồm chèo thuyền Tràng An, bữa tối riêng tư bên hồ, spa thư giãn, đạp xe qua làng quê và bình minh trên Hang Múa.",
    includeServices: [
      "Xe riêng đưa đón khứ hồi",
      "2 đêm resort 5 sao",
      "Vé thuyền và tham quan",
      "Bữa tối lãng mạn 1 buổi",
      "Spa 60 phút cho 2 người",
      "Hướng dẫn viên riêng",
    ],
    excludeServices: [
      "Chi phí cá nhân, đồ uống ngoài chương trình",
      "Tiền tip cho hướng dẫn viên và tài xế",
    ],
    itinerary: [
      {
        title: "Ngày 1: Hà Nội - Ninh Bình - Tràng An",
        description:
          "08h00 xe riêng đón, 10h30 nhận phòng resort. Chiều đi thuyền Tràng An, tối bữa tối riêng bên hồ sen.",
      },
      {
        title: "Ngày 2: Hang Múa - Tam Cốc - Spa",
        description:
          "Sáng sớm ngắm bình minh Hang Múa, ăn sáng tại resort. Đi thuyền Tam Cốc, chiều spa thư giãn 60 phút.",
      },
      {
        title: "Ngày 3: Cố đô Hoa Lư - Hà Nội",
        description:
          "Sáng tự do thư giãn, 10h00 thăm cố đô Hoa Lư, 12h00 ăn trưa, 14h00 về Hà Nội.",
      },
    ],
    departureStartDays: 7,
    departureEveryDays: 7,
    totalSlots: 12,
  },
  {
    title: "Hành hương Bái Đính - Tràng An - Cố đô Hoa Lư 1 ngày",
    provinceName: "Ninh Bình",
    tagNames: ["Văn hóa - lịch sử", "Chay", "Gia đình", "Một mình", "Giá rẻ"],
    durationDays: 1,
    durationNights: 0,
    basePrice: 820000,
    description:
      "Chương trình hành hương dành cho du khách thích không gian tâm linh, thăm chùa Bái Đính, đền vua Đinh, vua Lê và đi thuyền Tràng An. Bữa trưa chay thanh tịnh tại quán gần chùa.",
    includeServices: [
      "Xe đưa đón khứ hồi",
      "Vé thuyền Tràng An",
      "Bữa trưa chay",
      "Hướng dẫn viên",
    ],
    excludeServices: [
      "Chi phí cá nhân, đồ uống ngoài chương trình",
      "Tiền tip cho hướng dẫn viên và tài xế",
    ],
    itinerary: [
      {
        title: "Ngày 1: Hà Nội - Bái Đính - Hoa Lư - Tràng An",
        description:
          "06h30 khởi hành, 09h00 thăm chùa Bái Đính. 11h30 dùng cơm chay. 13h30 tham quan cố đô Hoa Lư. 15h30 đi thuyền Tràng An. 17h30 về Hà Nội.",
      },
    ],
    departureStartDays: 4,
    departureEveryDays: 3,
    totalSlots: 40,
  },
  {
    title: "Hà Nội - Cát Bà 2 ngày 1 đêm",
    provinceName: "Hải Phòng",
    tagNames: ["Biển", "Gần biển", "Gia đình", "Bạn bè", "Hải sản"],
    durationDays: 2,
    durationNights: 1,
    basePrice: 2450000,
    description:
      "Chuyến đi 2 ngày đến đảo Cát Bà bằng tàu cao tốc, tắm biển Cát Cò, thăm pháo đài Thần Công, tham quan vườn quốc gia Cát Bà và thưởng thức hải sản tươi. Phù hợp gia đình và nhóm bạn muốn kỳ nghỉ ngắn ven biển.",
    includeServices: [
      "Xe và tàu cao tốc khứ hồi",
      "1 đêm khách sạn 3 sao",
      "Vé tham quan",
      "3 bữa ăn theo chương trình",
      "Hướng dẫn viên",
    ],
    excludeServices: [
      "Chi phí cá nhân, đồ uống ngoài chương trình",
      "Tiền tip cho hướng dẫn viên và tài xế",
    ],
    itinerary: [
      {
        title: "Ngày 1: Hà Nội - Cát Bà - Cát Cò",
        description:
          "06h30 xe đón khởi hành, 09h30 lên tàu cao tốc sang Cát Bà. 11h30 nhận phòng, ăn trưa hải sản. Chiều tắm biển Cát Cò. Tối tự do dạo chợ đêm.",
      },
      {
        title: "Ngày 2: Pháo đài Thần Công - Hà Nội",
        description:
          "Sáng thăm pháo đài Thần Công, 10h00 ăn sáng muộn, trả phòng. 13h00 tàu về đất liền, 17h00 về Hà Nội.",
      },
    ],
    departureStartDays: 5,
    departureEveryDays: 3,
    totalSlots: 35,
  },
  {
    title: "Cát Bà - Vịnh Lan Hạ chèo kayak 1 ngày",
    provinceName: "Hải Phòng",
    tagNames: [
      "Biển",
      "Thiên nhiên",
      "Phiêu lưu mạo hiểm",
      "Bạn bè",
      "Cặp đôi",
    ],
    durationDays: 1,
    durationNights: 0,
    basePrice: 1250000,
    description:
      "Một ngày trên Vịnh Lan Hạ, du thuyền len qua đảo đá vôi, chèo kayak vào hang Ba Trái Đào, tắm biển bãi Ba Trái Đào và thưởng thức bữa trưa hải sản. Cảnh đẹp không kém Vịnh Hạ Long nhưng yên tĩnh hơn.",
    includeServices: [
      "Du thuyền Lan Hạ",
      "Kayak và áo phao",
      "Bữa trưa hải sản trên tàu",
      "Hướng dẫn viên",
      "Vé tham quan vịnh",
    ],
    excludeServices: [
      "Chi phí cá nhân, đồ uống ngoài chương trình",
      "Tiền tip cho hướng dẫn viên và tài xế",
    ],
    itinerary: [
      {
        title: "Ngày 1: Cát Bà - Lan Hạ - Cát Bà",
        description:
          "08h30 xuống du thuyền tại cảng Cát Bà. 09h30 chèo kayak qua hang. 12h00 ăn trưa trên tàu. 14h00 tắm biển, câu cá. 16h30 về cảng.",
      },
    ],
    departureStartDays: 3,
    departureEveryDays: 2,
    totalSlots: 30,
  },
  {
    title: "Hải Phòng food tour: bánh đa cua, nem cua bể, bánh mì cay",
    provinceName: "Hải Phòng",
    tagNames: [
      "Ẩm thực đường phố",
      "Đặc sản địa phương",
      "Bạn bè",
      "Giá rẻ",
      "Trung tâm thành phố",
    ],
    durationDays: 1,
    durationNights: 0,
    basePrice: 890000,
    description:
      "Tour khám phá ẩm thực đường phố Hải Phòng với bánh đa cua, nem cua bể, bánh mì cay, ốc Tam Bạc và cà phê trứng. Có hướng dẫn viên người địa phương kể về văn hóa ẩm thực của thành phố Cảng.",
    includeServices: [
      "Xe đưa đón từ Hà Nội",
      "Các món ăn thử theo chương trình",
      "Hướng dẫn viên ẩm thực",
    ],
    excludeServices: [
      "Chi phí cá nhân, đồ uống ngoài chương trình",
      "Tiền tip cho hướng dẫn viên và tài xế",
    ],
    itinerary: [
      {
        title: "Ngày 1: Hà Nội - Hải Phòng food tour",
        description:
          "07h30 xe đón khởi hành, 09h30 ăn bánh đa cua. 11h30 nem cua bể, chả mực. 14h00 bánh mì cay và cà phê trứng. 16h30 ốc Tam Bạc, 18h00 về Hà Nội.",
      },
    ],
    departureStartDays: 2,
    departureEveryDays: 2,
    totalSlots: 25,
  },
  {
    title: "Đồ Sơn - Hòn Dấu 1 ngày",
    provinceName: "Hải Phòng",
    tagNames: ["Biển", "Gần biển", "Gia đình", "Văn hóa - lịch sử"],
    durationDays: 1,
    durationNights: 0,
    basePrice: 790000,
    description:
      "Chuyến đi trong ngày đến Đồ Sơn, tắm biển, ghé đền Bà Đế, đảo Hòn Dấu và hải đăng cổ. Phù hợp gia đình và nhóm bạn muốn nghỉ ngơi cuối tuần.",
    includeServices: [
      "Xe đưa đón khứ hồi",
      "Vé đảo Hòn Dấu",
      "Bữa trưa hải sản",
      "Hướng dẫn viên",
    ],
    excludeServices: [
      "Chi phí cá nhân, đồ uống ngoài chương trình",
      "Tiền tip cho hướng dẫn viên và tài xế",
    ],
    itinerary: [
      {
        title: "Ngày 1: Hà Nội - Đồ Sơn - Hòn Dấu",
        description:
          "07h00 khởi hành, 09h30 tắm biển Đồ Sơn. 11h30 ăn trưa hải sản. 13h30 thăm đền Bà Đế và đảo Hòn Dấu. 16h30 về Hà Nội.",
      },
    ],
    departureStartDays: 3,
    departureEveryDays: 3,
    totalSlots: 40,
  },
  {
    title: "Cát Bà 3 ngày 2 đêm nghỉ dưỡng biển",
    provinceName: "Hải Phòng",
    tagNames: ["Biển", "Nghỉ dưỡng", "Sang trọng", "Cặp đôi", "Resort"],
    durationDays: 3,
    durationNights: 2,
    basePrice: 4950000,
    description:
      "Kỳ nghỉ 3 ngày tại resort 5 sao ven biển Cát Bà với hồ bơi vô cực, spa và nhà hàng hải sản. Chương trình gồm tour Vịnh Lan Hạ, thư giãn bãi biển riêng và một buổi tối BBQ hải sản.",
    includeServices: [
      "Tàu cao tốc khứ hồi",
      "2 đêm resort 5 sao",
      "Tour Vịnh Lan Hạ",
      "Bữa tối BBQ hải sản",
      "Hướng dẫn viên",
    ],
    excludeServices: [
      "Chi phí cá nhân, đồ uống ngoài chương trình",
      "Tiền tip cho hướng dẫn viên và tài xế",
    ],
    itinerary: [
      {
        title: "Ngày 1: Hà Nội - Cát Bà",
        description:
          "08h00 xuất phát, 11h00 sang đảo bằng tàu cao tốc, nhận phòng resort. Chiều tự do tắm biển, tối thưởng thức hải sản.",
      },
      {
        title: "Ngày 2: Vịnh Lan Hạ",
        description:
          "Cả ngày đi du thuyền Lan Hạ, chèo kayak, tắm biển. Tối BBQ ngoài trời.",
      },
      {
        title: "Ngày 3: Spa - Hà Nội",
        description:
          "Sáng spa thư giãn, trả phòng, 13h00 tàu về đất liền, 17h00 về Hà Nội.",
      },
    ],
    departureStartDays: 7,
    departureEveryDays: 7,
    totalSlots: 12,
  },
  {
    title: "Vườn quốc gia Cát Bà trekking 2 ngày 1 đêm",
    provinceName: "Hải Phòng",
    tagNames: ["Thiên nhiên", "Phiêu lưu mạo hiểm", "Núi", "Phượt", "Homestay"],
    durationDays: 2,
    durationNights: 1,
    basePrice: 2150000,
    description:
      "Hai ngày trekking trong vườn quốc gia Cát Bà, leo đỉnh Ngự Lâm ngắm toàn cảnh đảo, thăm hang Trung Trang và nghỉ đêm homestay làng chài. Có hướng dẫn viên rừng đồng hành.",
    includeServices: [
      "Xe và tàu khứ hồi",
      "1 đêm homestay",
      "Vé vườn quốc gia",
      "Hướng dẫn viên rừng",
      "3 bữa ăn theo chương trình",
    ],
    excludeServices: [
      "Chi phí cá nhân, đồ uống ngoài chương trình",
      "Tiền tip cho hướng dẫn viên và tài xế",
      "Bảo hiểm du lịch tự nguyện",
    ],
    itinerary: [
      {
        title: "Ngày 1: Hà Nội - Cát Bà - Trekking Ngự Lâm",
        description:
          "07h00 khởi hành, 10h30 đến Cát Bà. Chiều trekking lên đỉnh Ngự Lâm. Tối nghỉ homestay làng chài.",
      },
      {
        title: "Ngày 2: Hang Trung Trang - Hà Nội",
        description:
          "Sáng thăm hang Trung Trang, 11h00 ăn trưa, 13h00 về đất liền, 17h00 về Hà Nội.",
      },
    ],
    departureStartDays: 6,
    departureEveryDays: 5,
    totalSlots: 20,
  },
  {
    title: "Hải Phòng city tour: Nhà hát lớn - Bảo tàng - Chùa Dư Hàng",
    provinceName: "Hải Phòng",
    tagNames: [
      "Văn hóa - lịch sử",
      "Trung tâm thành phố",
      "Gia đình",
      "Một mình",
      "Giá rẻ",
    ],
    durationDays: 1,
    durationNights: 0,
    basePrice: 690000,
    description:
      "Một ngày khám phá di sản thành phố Cảng với Nhà hát lớn kiến trúc Pháp, Bảo tàng Hải Phòng, chùa Dư Hàng cổ kính và bữa trưa đặc sản bánh đa cua. Phù hợp du khách thích lịch sử và văn hóa.",
    includeServices: [
      "Xe đưa đón khứ hồi",
      "Vé bảo tàng",
      "Bữa trưa đặc sản",
      "Hướng dẫn viên",
    ],
    excludeServices: [
      "Chi phí cá nhân, đồ uống ngoài chương trình",
      "Tiền tip cho hướng dẫn viên và tài xế",
    ],
    itinerary: [
      {
        title: "Ngày 1: Hà Nội - Hải Phòng city tour",
        description:
          "07h30 khởi hành, 09h30 thăm Nhà hát lớn và phố cổ Pháp. 10h30 tham quan Bảo tàng Hải Phòng. 12h00 ăn trưa bánh đa cua. 14h00 thăm chùa Dư Hàng. 16h00 về Hà Nội.",
      },
    ],
    departureStartDays: 3,
    departureEveryDays: 4,
    totalSlots: 40,
  },
  {
    title: "Hạ Long - Lan Hạ - Cát Bà 3 ngày 2 đêm",
    provinceName: "Hải Phòng",
    tagNames: ["Biển", "Thiên nhiên", "Gia đình", "Cặp đôi", "Nghỉ dưỡng"],
    durationDays: 3,
    durationNights: 2,
    basePrice: 4250000,
    description:
      "Hành trình kết nối ba vịnh đẹp của vùng biển Đông Bắc, bắt đầu bằng chuyến du thuyền Hạ Long, đi qua Lan Hạ và nghỉ ở Cát Bà. Du khách chèo kayak, tắm biển, thưởng thức hải sản và khám phá hệ sinh thái đảo.",
    includeServices: [
      "Xe và tàu khứ hồi",
      "1 đêm du thuyền và 1 đêm khách sạn Cát Bà",
      "Vé tham quan",
      "6 bữa ăn",
      "Hướng dẫn viên",
    ],
    excludeServices: [
      "Chi phí cá nhân, đồ uống ngoài chương trình",
      "Tiền tip cho hướng dẫn viên và tài xế",
    ],
    itinerary: [
      {
        title: "Ngày 1: Hà Nội - Hạ Long",
        description:
          "07h00 khởi hành, 11h30 lên du thuyền Hạ Long, tham quan hang động và chèo kayak. Đêm nghỉ trên du thuyền.",
      },
      {
        title: "Ngày 2: Lan Hạ - Cát Bà",
        description:
          "Sáng tàu đưa đoàn qua Lan Hạ, tắm biển. Chiều đến Cát Bà, nhận phòng khách sạn.",
      },
      {
        title: "Ngày 3: Cát Bà - Hà Nội",
        description:
          "Sáng dạo bãi Cát Cò và chợ hải sản, 13h00 tàu về đất liền, 17h30 về Hà Nội.",
      },
    ],
    departureStartDays: 6,
    departureEveryDays: 7,
    totalSlots: 20,
  },
];

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildDepartures(tour: TourSeed) {
  const departures: {
    departureDate: string;
    returnDate: string;
    price: number;
    totalSlots: number;
  }[] = [];

  const base = new Date();
  base.setHours(0, 0, 0, 0);

  for (let i = 0; i < 6; i += 1) {
    const departureDate = new Date(base);
    departureDate.setDate(
      base.getDate() + tour.departureStartDays + i * tour.departureEveryDays,
    );

    const returnDate = new Date(departureDate);
    returnDate.setDate(
      departureDate.getDate() + Math.max(tour.durationDays - 1, 0),
    );

    const isWeekend = [0, 6].includes(departureDate.getDay());
    const price = isWeekend
      ? Math.round((tour.basePrice * 1.1) / 10000) * 10000
      : tour.basePrice;

    departures.push({
      departureDate: formatDate(departureDate),
      returnDate: formatDate(returnDate),
      price,
      totalSlots: tour.totalSlots,
    });
  }

  return departures;
}

export async function seedTours() {
  const providerProfile = await prisma.providerProfile.findFirst({
    where: { businessType: "tour", approvalStatus: "approved" },
  });
  if (!providerProfile) {
    console.warn(
      "⚠ Bỏ qua seed tour: chưa có hồ sơ nhà cung cấp loại Tour đã được duyệt.",
    );
    return;
  }

  const provinceByName = new Map(
    (await prisma.province.findMany()).map((p) => [p.name, p.id]),
  );
  const tagByName = new Map(
    (await prisma.tag.findMany()).map((t) => [t.name, t.id]),
  );

  for (const tour of TOURS) {
    const provinceId = provinceByName.get(tour.provinceName);
    if (!provinceId) {
      console.error(`✗ ${tour.title} (thiếu tỉnh/thành: ${tour.provinceName})`);
      continue;
    }

    const formData = new FormData();
    formData.set("providerProfileId", providerProfile.id);
    formData.set("title", tour.title);
    formData.set("provinceId", provinceId);
    formData.set("durationDays", String(tour.durationDays));
    formData.set("durationNights", String(tour.durationNights));
    formData.set("basePrice", String(tour.basePrice));
    formData.set("description", tour.description);
    formData.set(
      "tagIds",
      JSON.stringify(tour.tagNames.map((name) => tagByName.get(name))),
    );
    formData.set("includeServices", JSON.stringify(tour.includeServices));
    formData.set("excludeServices", JSON.stringify(tour.excludeServices));
    formData.set("itinerary", JSON.stringify(tour.itinerary));
    formData.set("departures", JSON.stringify(buildDepartures(tour)));
    formData.set("imageUrls", JSON.stringify(IMAGES));

    const result = await createTourFromLinksAction(
      { status: "idle" },
      formData,
    );
    if (result.status === "error") {
      console.error(`✗ ${tour.title}`, result.formError ?? result.fieldErrors);
    } else {
      console.log(`✓ ${tour.title}`);
    }
  }

  await prisma.tour.updateMany({
    where: { providerProfileId: providerProfile.id },
    data: { status: "published" },
  });

  console.log(`\nSeeded ${TOURS.length} tours.`);
}
