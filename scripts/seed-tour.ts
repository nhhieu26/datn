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
    title: "Hà Nội - Vịnh Hạ Long 2 ngày 1 đêm trên du thuyền",
    provinceName: "Quảng Ninh",
    tagNames: ["Biển", "Thiên nhiên", "Nghỉ dưỡng", "Gia đình", "Cặp đôi"],
    durationDays: 2,
    durationNights: 1,
    basePrice: 2950000,
    description:
      "Hành trình khám phá kỳ quan thiên nhiên thế giới Vịnh Hạ Long với hàng nghìn đảo đá vôi và hang động kỳ vĩ. Du khách nghỉ đêm trên du thuyền tiêu chuẩn, thưởng thức hải sản tươi sống, chèo kayak giữa vịnh và ngắm hoàng hôn buông xuống mặt nước xanh ngọc bích. Tour khởi hành từ Hà Nội, phù hợp cho gia đình và cặp đôi muốn kỳ nghỉ ngắn ngày trọn vẹn.",
    includeServices: [
      "Xe đưa đón khứ hồi Hà Nội - Hạ Long",
      "Du thuyền nghỉ đêm 4 sao, phòng máy lạnh",
      "Hướng dẫn viên tiếng Việt suốt tuyến",
      "3 bữa ăn chính theo chương trình",
      "Vé tham quan vịnh và hang động",
      "Chèo kayak và bữa tiệc hải sản tối",
    ],
    excludeServices: [
      "Chi phí cá nhân, đồ uống ngoài chương trình",
      "Phí làm hộ chiếu/thủ tục biên giới",
      "Tiền tip cho hướng dẫn viên và tài xế",
    ],
    itinerary: [
      {
        title: "Ngày 1: Hà Nội - Bến tàu Tuần Châu - Vịnh Hạ Long",
        description:
          "06h00 xe và hướng dẫn viên đón tại khách sạn trong khu phố cổ Hà Nội. 07h30 khởi hành đi Quảng Ninh, nghỉ chân và ăn sáng tự túc tại trạm dừng Hạ Long. 11h30 đến bến tàu Tuần Châu, làm thủ tục lên du thuyền, dùng bữa trưa trên tàu khi tàu rời bến. Buổi chiều tham quan hang Sửng Sốt và đảo Ti Tốp, chèo kayak len lỏi giữa các đảo đá. 18h00 tàu neo đậu qua đêm, dùng tiệc hải sản và tham gia hoạt động câu mực trên boong.",
      },
      {
        title: "Ngày 2: Vịnh Hạ Long - Tuần Châu - Hà Nội",
        description:
          "06h00 tập yoga và ngắm bình minh trên vịnh, dùng điểm tâm nhẹ. 07h30 tham quan làng chài Cửa Vạn bằng thuyền nan, tìm hiểu đời sống cư dân chài. 09h30 trở về tàu, ăn brunch và làm thủ tục trả phòng. 11h00 tàu cập bến Tuần Châu, xe đưa đoàn về Hà Nội. 15h30 kết thúc tour, chia tay đoàn tại điểm đón ban đầu.",
      },
    ],
    departureStartDays: 7,
    departureEveryDays: 7,
    totalSlots: 40,
  },
  {
    title: "Sa Pa - Fansipan - Bản Cát Cát 3 ngày 2 đêm",
    provinceName: "Lào Cai",
    tagNames: ["Núi", "Thiên nhiên", "Phượt", "Phiêu lưu mạo hiểm", "Giá rẻ"],
    durationDays: 3,
    durationNights: 2,
    basePrice: 3650000,
    description:
      "Chinh phục nóc nhà Đông Dương Fansipan cao 3.143m bằng cáp treo hiện đại, khám phá thị trấn Sa Pa trong sương và bản Cát Cát của người H'Mông. Du khách trải nghiệm trekking nhẹ nhàng qua ruộng bậc thang, thưởng thức đặc sản vùng cao như thắng cố, cá hồi Sa Pa và ngắm biển mây buổi sớm. Tour phù hợp cả người lớn tuổi và các bạn trẻ mê khám phá.",
    includeServices: [
      "Xe giường nằm khứ hồi Hà Nội - Sa Pa",
      "Khách sạn 3 sao trung tâm, 2 đêm",
      "Vé cáp treo Fansipan khứ hồi",
      "Hướng dẫn viên địa phương nhiệt tình",
      "Các bữa ăn theo chương trình",
      "Vé tham quan bản Cát Cát",
    ],
    excludeServices: [
      "Đồ uống, chi phí cá nhân",
      "Phí thuê trang phục chụp ảnh",
      "Bảo hiểm du lịch tự nguyện",
    ],
    itinerary: [
      {
        title: "Ngày 1: Hà Nội - Sa Pa - Bản Cát Cát",
        description:
          "21h00 tập trung tại bến xe Mỹ Đình, lên xe giường nằm đi Sa Pa. Ngủ đêm trên xe, đến Sa Pa khoảng 06h00 sáng hôm sau. Nhận phòng khách sạn, ăn sáng và nghỉ ngơi. Buổi chiều đi bộ xuống bản Cát Cát của người H'Mông đen, tham quan thác nước, cầu mây và tìm hiểu nghề dệt thổ cẩm. Tối tự do dạo phố, thưởng thức đồ nướng và ngắm thị trấn trong sương.",
      },
      {
        title: "Ngày 2: Chinh phục đỉnh Fansipan",
        description:
          "06h30 ăn sáng tại khách sạn, 07h30 di chuyển đến ga cáp treo Fansipan. Trải nghiệm cáp treo dài gần 6,3km ngắm toàn cảnh dãy Hoàng Liên Sơn hùng vĩ. Từ ga trên độ cao 3.000m, tiếp tục chinh phục 600 bậc đá lên đỉnh Fansipan, chụp ảnh tại cột mốc 3.143m. Ăn trưa tự túc tại khu ẩm thực. Chiều về tham quan quảng trường Sa Pa, nhà thờ đá cổ. Tối nghỉ tại khách sạn.",
      },
      {
        title: "Ngày 3: Sa Pa - Hà Nội",
        description:
          "Sáng tự do mua sắm đặc sản tại chợ Sa Pa, thưởng thức cà phê view núi. 10h00 trả phòng, ăn trưa tại nhà hàng địa phương. 13h00 lên xe giường nằm về Hà Nội. Khoảng 20h00 về đến bến xe Mỹ Đình, kết thúc chương trình, chia tay đoàn.",
      },
    ],
    departureStartDays: 5,
    departureEveryDays: 4,
    totalSlots: 30,
  },
  {
    title: "Tràng An - Bái Đính - Hang Múa 1 ngày",
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
    basePrice: 850000,
    description:
      "Tour trong ngày khám phá cố đô Ninh Bình với quần thể danh thắng Tràng An được UNESCO công nhận. Du khách ngồi thuyền nan len lỏi qua các hang động ngập nước, tham quan chùa Bái Đính nguy nga và leo núi Hang Múa ngắm toàn cảnh Tam Cốc từ trên cao. Chương trình nhẹ nhàng, phù hợp cho mọi lứa tuổi.",
    includeServices: [
      "Xe đưa đón khứ hồi Hà Nội - Ninh Bình",
      "Hướng dẫn viên suốt tuyến",
      "Bữa trưa đặc sản Ninh Bình",
      "Vé thuyền Tràng An và tham quan các điểm",
      "Nước uống và khăn lạnh",
    ],
    excludeServices: [
      "Vé leo Hang Múa (100.000đ/người)",
      "Chi phí cá nhân, đồ uống",
      "Tiền tip hướng dẫn viên",
    ],
    itinerary: [
      {
        title: "Sáng: Hà Nội - chùa Bái Đính",
        description:
          "07h00 xe đón đoàn tại khách sạn khu phố cổ, khởi hành đi Ninh Bình theo cao tốc Pháp Vân - Cầu Giẽ. 09h30 đến quần thể chùa Bái Đính - ngôi chùa lớn nhất Việt Nam với hành lang La Hán dài nhất châu Á, bảo tháp và tượng Phật bằng đồng. Hướng dẫn viên thuyết minh về lịch sử Phật giáo và kiến trúc độc đáo.",
      },
      {
        title: "Trưa: Ăn trưa đặc sản",
        description:
          "11h30 đoàn dùng bữa trưa tại nhà hàng địa phương với đặc sản cơm cháy, thịt dê núi và nem Yên Mạc. Nghỉ ngơi khoảng 30 phút trước khi tiếp tục hành trình.",
      },
      {
        title: "Chiều: Tràng An - Hang Múa - về Hà Nội",
        description:
          "13h00 lên thuyền nan khám phá quần thể Tràng An, len lỏi qua các hang tối như hang Sáng, hang Tối, hang Nấu Rượu và thăm phim trường Kong: Skull Island. 15h30 leo gần 500 bậc đá lên đỉnh Hang Múa, ngắm toàn cảnh Tam Cốc với dòng sông uốn lượn giữa núi đá vôi. 17h00 lên xe về Hà Nội, khoảng 19h30 về đến điểm đón, kết thúc tour.",
      },
    ],
    departureStartDays: 3,
    departureEveryDays: 2,
    totalSlots: 45,
  },
  {
    title: "Đà Nẵng - Hội An - Bà Nà Hills 4 ngày 3 đêm",
    provinceName: "Đà Nẵng",
    tagNames: ["Biển", "Nghỉ dưỡng", "Gia đình", "Cặp đôi", "Sang trọng"],
    durationDays: 4,
    durationNights: 3,
    basePrice: 5990000,
    description:
      "Kỳ nghỉ trọn vẹn tại thành phố đáng sống nhất Việt Nam với bãi biển Mỹ Khê quyến rũ, Cầu Rồng phun lửa và phố cổ Hội An lung linh đèn lồng. Du khách chinh phục Bà Nà Hills với Cầu Vàng nổi tiếng thế giới, vui chơi tại Fantasy Park và thưởng thức ẩm thực miền Trung. Lịch trình cân bằng giữa tham quan và nghỉ dưỡng, phù hợp gia đình và cặp đôi.",
    includeServices: [
      "Vé máy bay khứ hồi (tuỳ điểm khởi hành)",
      "Khách sạn 4 sao gần biển Mỹ Khê, 3 đêm",
      "Vé cáp treo và vui chơi Bà Nà Hills",
      "Xe đưa đón theo chương trình",
      "Hướng dẫn viên suốt tuyến",
      "Các bữa ăn theo lịch trình",
    ],
    excludeServices: [
      "Chi phí cá nhân, đồ uống",
      "Vé tham quan ngoài chương trình",
      "Bảo hiểm du lịch",
    ],
    itinerary: [
      {
        title: "Ngày 1: Đón sân bay - Bãi biển Mỹ Khê - Cầu Rồng",
        description:
          "Xe và hướng dẫn viên đón đoàn tại sân bay Đà Nẵng, đưa về khách sạn nhận phòng. Chiều tự do tắm biển Mỹ Khê, một trong những bãi biển đẹp nhất hành tinh. Tối dùng bữa hải sản tại nhà hàng ven biển, sau đó dạo bộ ngắm Cầu Rồng và xem màn phun lửa, phun nước vào cuối tuần. Nghỉ đêm tại Đà Nẵng.",
      },
      {
        title: "Ngày 2: Bà Nà Hills - Cầu Vàng",
        description:
          "07h30 ăn sáng, di chuyển đến Bà Nà Hills. Trải nghiệm tuyến cáp treo đạt nhiều kỷ lục thế giới, tham quan Cầu Vàng nằm trên đôi bàn tay khổng lồ, làng Pháp cổ kính và vườn hoa Le Jardin D'Amour. Ăn trưa buffet tại khu du lịch. Chiều vui chơi tự do tại Fantasy Park trong nhà. 17h00 xuống núi về khách sạn, tối tự do khám phá ẩm thực đường phố Đà Nẵng.",
      },
      {
        title: "Ngày 3: Hội An - Phố cổ đèn lồng",
        description:
          "Sáng tham quan Ngũ Hành Sơn và làng đá mỹ nghệ Non Nước. Trưa di chuyển về Hội An, nhận phòng khách sạn. Chiều tham quan phố cổ Hội An: Chùa Cầu, nhà cổ Tấn Ký, hội quán Phúc Kiến, xưởng thủ công truyền thống. Tối thả đèn hoa đăng trên sông Hoài, ngắm phố cổ lung linh trong ánh đèn lồng. Nghỉ đêm tại Hội An.",
      },
      {
        title: "Ngày 4: Hội An - Đà Nẵng - Tiễn sân bay",
        description:
          "Buổi sáng tự do đạp xe khám phá làng rau Trà Quế hoặc mua sắm đặc sản. 11h00 trả phòng, ăn trưa và di chuyển ra sân bay Đà Nẵng. Hướng dẫn viên tiễn đoàn, kết thúc chương trình tốt đẹp.",
      },
    ],
    departureStartDays: 6,
    departureEveryDays: 5,
    totalSlots: 35,
  },
  {
    title: "Nha Trang - Vinpearl Land - Hòn Mun 4 ngày 3 đêm",
    provinceName: "Khánh Hòa",
    tagNames: ["Biển", "Gần biển", "Nghỉ dưỡng", "Gia đình", "Bạn bè"],
    durationDays: 4,
    durationNights: 3,
    basePrice: 5490000,
    description:
      "Khám phá thành phố biển Nha Trang xinh đẹp với bãi biển cát trắng dài, vịnh đảo hoang sơ và khu vui chơi giải trí Vinpearl Land trên đảo Hòn Tre. Du khách lặn biển ngắm san hô tại Hòn Mun, thư giãn tại bùn khoáng I-Resort và thưởng thức hải sản tươi ngon. Chương trình kết hợp nghỉ dưỡng và vui chơi, lý tưởng cho gia đình và nhóm bạn.",
    includeServices: [
      "Khách sạn 4 sao trung tâm Nha Trang, 3 đêm",
      "Vé cáp treo và vui chơi Vinpearl Land",
      "Tour 4 đảo bao gồm Hòn Mun, Hòn Tằm",
      "Tắm bùn khoáng I-Resort",
      "Hướng dẫn viên và xe đưa đón",
      "Các bữa ăn theo chương trình",
    ],
    excludeServices: [
      "Vé máy bay khứ hồi",
      "Chi phí cá nhân, đồ uống",
      "Các dịch vụ tự chọn ngoài chương trình",
    ],
    itinerary: [
      {
        title: "Ngày 1: Đón sân bay - Tắm bùn khoáng",
        description:
          "Xe đón đoàn tại sân bay Cam Ranh, đưa về khách sạn trung tâm nhận phòng. Chiều thư giãn tại I-Resort với dịch vụ tắm bùn khoáng nóng và hồ khoáng nóng, giúp thư giãn cơ thể sau chuyến bay. Tối dùng bữa hải sản và dạo biển Nha Trang. Nghỉ đêm tại thành phố.",
      },
      {
        title: "Ngày 2: Vinpearl Land - Hòn Tre",
        description:
          "08h00 di chuyển đến cảng, trải nghiệm cáp treo vượt biển dài 3.320m đến đảo Hòn Tre. Cả ngày vui chơi tại Vinpearl Land: công viên nước, trò chơi cảm giác mạnh, thuỷ cung và khu vui chơi trong nhà. Tối xem show nhạc nước hoành tráng, sau đó trở về đất liền. Nghỉ đêm tại Nha Trang.",
      },
      {
        title: "Ngày 3: Tour 4 đảo - Hòn Mun",
        description:
          "08h30 khởi hành tour 4 đảo: Hòn Mun, Hòn Một, Hòn Tằm và Bãi Tranh. Du khách lặn ống thở ngắm rạn san hô tại khu bảo tồn biển Hòn Mun, tắm biển và tham gia các trò chơi nước. Ăn trưa hải sản trên đảo. Chiều về đất liền, tối tự do khám phá chợ đêm Nha Trang.",
      },
      {
        title: "Ngày 4: Nha Trang - Tiễn sân bay",
        description:
          "Buổi sáng tự do tắm biển, mua sắm đặc sản như yến sào, hải sản khô. 11h00 trả phòng, xe đưa đoàn ra sân bay Cam Ranh. Kết thúc chương trình, chia tay đoàn.",
      },
    ],
    departureStartDays: 8,
    departureEveryDays: 6,
    totalSlots: 40,
  },
  {
    title: "Đà Lạt - Thung lũng Tình Yêu - Langbiang 3 ngày 2 đêm",
    provinceName: "Lâm Đồng",
    tagNames: ["Núi", "Nghỉ dưỡng", "Cặp đôi", "Bạn bè", "Thiên nhiên"],
    durationDays: 3,
    durationNights: 2,
    basePrice: 3290000,
    description:
      "Hành trình về với thành phố ngàn hoa Đà Lạt mộng mơ với khí hậu se lạnh quanh năm. Du khách dạo bước giữa rừng thông xanh mát, chèo thuyền trên hồ Tuyền Lâm, ngắm đồi chè Cầu Đất và săn mây tại đỉnh Langbiang. Chương trình nhẹ nhàng, lãng mạn, rất phù hợp cho cặp đôi và nhóm bạn muốn nghỉ ngơi.",
    includeServices: [
      "Xe khách chất lượng cao khứ hồi",
      "Khách sạn trung tâm Đà Lạt, 2 đêm",
      "Xe jeep lên đỉnh Langbiang",
      "Hướng dẫn viên địa phương",
      "Các bữa ăn theo chương trình",
      "Vé tham quan các điểm trong lịch trình",
    ],
    excludeServices: [
      "Vé máy bay (nếu chọn khởi hành từ xa)",
      "Đồ uống, chi phí cá nhân",
      "Các trò chơi tự chọn tại các điểm tham quan",
    ],
    itinerary: [
      {
        title: "Ngày 1: Đến Đà Lạt - Thung lũng Tình Yêu - Đồi chè Cầu Đất",
        description:
          "Xe đón đoàn từ sáng sớm, đến Đà Lạt khoảng trưa, nhận phòng khách sạn và ăn trưa. Chiều tham quan Thung lũng Tình Yêu với hồ Đa Thiện thơ mộng, đồi thông và vườn hoa rực rỡ. Tiếp tục đến đồi chè Cầu Đất, chụp ảnh giữa những luống chè trải dài tít tắp. Tối tự do dạo chợ đêm Đà Lạt, thưởng thức sữa đậu nành nóng và bánh căn.",
      },
      {
        title: "Ngày 2: Langbiang - Hồ Tuyền Lâm - Thiền viện Trúc Lâm",
        description:
          "07h00 ăn sáng, di chuyển đến núi Langbiang. Đi xe jeep lên đỉnh Radar ngắm toàn cảnh Đà Lạt từ trên cao và săn mây buổi sáng. Trưa ăn đặc sản vùng cao. Chiều tham quan hồ Tuyền Lâm, ngồi thuyền ngắm cảnh và viếng Thiền viện Trúc Lâm yên tĩnh bên hồ. Tối nghỉ tại khách sạn.",
      },
      {
        title: "Ngày 3: Dinh Bảo Đại - Chợ Đà Lạt - về lại",
        description:
          "Sáng tham quan Dinh III Bảo Đại và vườn hoa thành phố. Mua sắm đặc sản tại chợ Đà Lạt. 11h00 trả phòng, ăn trưa và lên xe về. Kết thúc chương trình, chia tay đoàn tại điểm khởi hành.",
      },
    ],
    departureStartDays: 4,
    departureEveryDays: 3,
    totalSlots: 35,
  },
  {
    title: "Miền Tây sông nước - Cần Thơ - Chợ nổi Cái Răng 2 ngày 1 đêm",
    provinceName: "Cần Thơ",
    tagNames: [
      "Đặc sản địa phương",
      "Thiên nhiên",
      "Giá rẻ",
      "Gia đình",
      "Văn hóa - lịch sử",
    ],
    durationDays: 2,
    durationNights: 1,
    basePrice: 1450000,
    description:
      "Trải nghiệm nhịp sống sông nước miền Tây chân thật với chợ nổi Cái Răng họp từ tinh mơ trên sông Hậu, vườn trái cây sum suê và những căn nhà cổ trăm năm. Du khách ăn sáng hủ tiếu ngay trên ghe, nghe đờn ca tài tử và thưởng thức đặc sản miền Tây. Tour ngắn ngày, chi phí hợp lý, phù hợp cho gia đình và nhóm bạn.",
    includeServices: [
      "Xe đưa đón khứ hồi từ TP.HCM",
      "Thuyền tham quan chợ nổi và cồn Sơn",
      "Homestay/khách sạn 1 đêm tại Cần Thơ",
      "Hướng dẫn viên miền Tây vui tính",
      "Các bữa ăn đặc sản theo chương trình",
      "Đờn ca tài tử và trái cây miễn phí",
    ],
    excludeServices: [
      "Chi phí cá nhân, đồ uống",
      "Tiền tip hướng dẫn viên",
    ],
    itinerary: [
      {
        title: "Ngày 1: TP.HCM - Mỹ Tho - Cần Thơ",
        description:
          "06h00 xe đón đoàn tại TP.HCM, khởi hành đi Mỹ Tho. Lên thuyền dạo sông Tiền, tham quan cồn Thới Sơn, nghe đờn ca tài tử và thưởng thức mật ong trà. Đi xe ngựa qua làng quê, chèo xuồng ba lá len lỏi trong rạch dừa nước. Ăn trưa đặc sản miền Tây. Chiều di chuyển đến Cần Thơ, nhận phòng. Tối tự do dạo bến Ninh Kiều, ăn tối trên du thuyền sông Hậu.",
      },
      {
        title: "Ngày 2: Chợ nổi Cái Răng - Cồn Sơn - TP.HCM",
        description:
          "05h30 lên thuyền ra chợ nổi Cái Răng, ăn sáng hủ tiếu ngay trên ghe giữa chợ. Tham quan các ghe bán trái cây, tìm hiểu văn hoá thương hồ. Ghé cồn Sơn tham quan vườn trái cây, thử làm bánh dân gian và cho cá ăn. 10h00 trở về, ăn trưa tại Cần Thơ. 13h00 lên xe về TP.HCM, khoảng 17h00 kết thúc tour.",
      },
    ],
    departureStartDays: 4,
    departureEveryDays: 2,
    totalSlots: 45,
  },
  {
    title: "Huế - Đại Nội - Chùa Thiên Mụ - Sông Hương 2 ngày 1 đêm",
    provinceName: "Huế",
    tagNames: [
      "Văn hóa - lịch sử",
      "Đặc sản địa phương",
      "Gia đình",
      "Cặp đôi",
      "Giá rẻ",
    ],
    durationDays: 2,
    durationNights: 1,
    basePrice: 1790000,
    description:
      "Hành trình về miền di sản cố đô Huế với Đại Nội cổ kính, lăng tẩm các vị vua triều Nguyễn và chùa Thiên Mụ bên bờ sông Hương. Du khách nghe ca Huế trên sông, thưởng thức ẩm thực cung đình và khám phá nét trầm mặc của xứ Huế. Chương trình giàu giá trị văn hoá, phù hợp cho người yêu lịch sử và ẩm thực.",
    includeServices: [
      "Xe đưa đón theo chương trình",
      "Khách sạn trung tâm Huế 1 đêm",
      "Vé tham quan Đại Nội và lăng tẩm",
      "Thuyền ca Huế trên sông Hương",
      "Hướng dẫn viên thuyết minh lịch sử",
      "Các bữa ăn đặc sản Huế",
    ],
    excludeServices: [
      "Vé máy bay/tàu khứ hồi",
      "Chi phí cá nhân, đồ uống",
      "Tiền tip hướng dẫn viên",
    ],
    itinerary: [
      {
        title: "Ngày 1: Đại Nội - Chùa Thiên Mụ - Ca Huế sông Hương",
        description:
          "Sáng xe đón đoàn, nhận phòng khách sạn. Tham quan Đại Nội - hoàng thành triều Nguyễn với Ngọ Môn, điện Thái Hoà, Tử Cấm Thành. Ăn trưa đặc sản bún bò Huế và bánh bèo. Chiều viếng chùa Thiên Mụ cổ kính bên bờ sông Hương, tham quan lăng Tự Đức. Tối đi thuyền nghe ca Huế, thả đèn hoa đăng trên sông. Nghỉ đêm tại Huế.",
      },
      {
        title: "Ngày 2: Lăng Khải Định - Chợ Đông Ba - kết thúc",
        description:
          "Sáng tham quan lăng Khải Định với kiến trúc giao thoa Đông - Tây độc đáo. Ghé làng hương Thuỷ Xuân và làng nón Tây Hồ. Mua sắm đặc sản tại chợ Đông Ba. Ăn trưa, trả phòng và xe đưa đoàn ra ga/sân bay. Kết thúc chương trình.",
      },
    ],
    departureStartDays: 5,
    departureEveryDays: 4,
    totalSlots: 30,
  },
  {
    title: "Cao Bằng - Thác Bản Giốc - Động Ngườm Ngao 2 ngày 1 đêm",
    provinceName: "Cao Bằng",
    tagNames: ["Núi", "Thiên nhiên", "Phượt", "Phiêu lưu mạo hiểm", "Giá rẻ"],
    durationDays: 2,
    durationNights: 1,
    basePrice: 2190000,
    description:
      "Khám phá vùng đất địa đầu Tổ quốc Cao Bằng với thác Bản Giốc hùng vĩ - thác nước đẹp nhất Việt Nam nằm trên biên giới Việt - Trung. Du khách tham quan động Ngườm Ngao lung linh thạch nhũ, suối Lê Nin và di tích Pác Bó lịch sử. Cảnh sắc núi rừng trùng điệp đặc biệt ấn tượng vào mùa nước lũ.",
    includeServices: [
      "Xe đưa đón khứ hồi từ Hà Nội",
      "Khách sạn/nhà sàn 1 đêm tại Cao Bằng",
      "Vé tham quan thác Bản Giốc và động Ngườm Ngao",
      "Thuyền tham quan chân thác",
      "Hướng dẫn viên địa phương",
      "Các bữa ăn đặc sản vùng cao",
    ],
    excludeServices: [
      "Chi phí cá nhân, đồ uống",
      "Phí thuê trang phục dân tộc",
      "Tiền tip hướng dẫn viên",
    ],
    itinerary: [
      {
        title: "Ngày 1: Hà Nội - Cao Bằng - Động Ngườm Ngao",
        description:
          "06h00 xe đón đoàn tại Hà Nội, khởi hành đi Cao Bằng theo quốc lộ 3. Ăn trưa tại thị trấn Trùng Khánh. Chiều tham quan động Ngườm Ngao dài gần 2.144m với hệ thạch nhũ lung linh đủ hình thù. Tiếp tục đến khu du lịch thác Bản Giốc, ngắm thác đổ trắng xoá giữa núi rừng. Tối về nhận phòng nghỉ, ăn tối đặc sản vịt quay, bánh cuốn Cao Bằng.",
      },
      {
        title: "Ngày 2: Suối Lê Nin - Pác Bó - Hà Nội",
        description:
          "Sáng tham quan suối Lê Nin xanh ngắt và di tích Pác Bó - cội nguồn cách mạng Việt Nam với hang Cốc Bó và bàn đá Bác Hồ làm việc. Ăn trưa tại địa phương. 13h00 lên xe về Hà Nội, khoảng 20h00 về đến điểm đón, kết thúc tour.",
      },
    ],
    departureStartDays: 9,
    departureEveryDays: 7,
    totalSlots: 30,
  },
  {
    title: "Mộc Châu - Đồi chè trái tim - Hang Dơi 2 ngày 1 đêm",
    provinceName: "Sơn La",
    tagNames: ["Núi", "Thiên nhiên", "Cặp đôi", "Bạn bè", "Giá rẻ"],
    durationDays: 2,
    durationNights: 1,
    basePrice: 1650000,
    description:
      "Chạm vào cao nguyên Mộc Châu xanh mướt với đồi chè trái tim nổi tiếng, thác Dải Yếm trắng xoá và rừng thông bản Áng thơ mộng. Du khách thưởng thức sữa bò tươi, bò nướng lá mắc mật và ngắm cao nguyên trong sương sớm. Chuyến đi ngắn, gần Hà Nội, phù hợp cho cặp đôi và nhóm bạn muốn đổi gió cuối tuần.",
    includeServices: [
      "Xe đưa đón khứ hồi từ Hà Nội",
      "Homestay/khách sạn 1 đêm tại Mộc Châu",
      "Vé tham quan các điểm trong chương trình",
      "Hướng dẫn viên địa phương",
      "Các bữa ăn theo chương trình",
      "Thưởng thức sữa bò tươi tại nông trại",
    ],
    excludeServices: [
      "Chi phí cá nhân, đồ uống",
      "Các trò chơi tự chọn (đu quay, cầu kính...)",
      "Tiền tip hướng dẫn viên",
    ],
    itinerary: [
      {
        title: "Ngày 1: Hà Nội - Mộc Châu - Đồi chè trái tim",
        description:
          "06h30 xe đón đoàn tại Hà Nội, khởi hành đi Mộc Châu theo quốc lộ 6. Nghỉ chân tại đèo Thung Khe, ngắm toàn cảnh thung lũng Mai Châu. Ăn trưa tại Mộc Châu. Chiều tham quan đồi chè trái tim - điểm check-in nổi tiếng, tham quan nông trại bò sữa và thưởng thức sữa tươi. Ghé thác Dải Yếm và rừng thông bản Áng. Tối ăn bò nướng lá mắc mật, nghỉ đêm tại homestay.",
      },
      {
        title: "Ngày 2: Hang Dơi - Rừng thông bản Áng - Hà Nội",
        description:
          "Sáng tham quan hang Dơi với hệ thạch nhũ đẹp, ngắm cao nguyên Mộc Châu trong sương sớm. Ghé cầu kính Bạch Long (tự túc) nếu muốn trải nghiệm. Ăn trưa tại địa phương, mua đặc sản chè, sữa, mận. 13h30 lên xe về Hà Nội, khoảng 19h00 kết thúc chương trình.",
      },
    ],
    departureStartDays: 5,
    departureEveryDays: 3,
    totalSlots: 35,
  },
  {
    title: "Cát Bà - Vịnh Lan Hạ 2 ngày 1 đêm",
    provinceName: "Hải Phòng",
    tagNames: ["Biển", "Thiên nhiên", "Nghỉ dưỡng", "Gia đình", "Bạn bè"],
    durationDays: 2,
    durationNights: 1,
    basePrice: 2450000,
    description:
      "Khám phá đảo Cát Bà - quần đảo lớn nhất vịnh Bắc Bộ với vịnh Lan Hạ hoang sơ, nước biển trong xanh và những bãi cát trắng nguyên sơ. Du khách chèo kayak giữa vịnh, tham quan vườn quốc gia Cát Bà và ngắm hoàng hôn trên biển. Điểm đến lý tưởng cho kỳ nghỉ cuối tuần gần Hà Nội.",
    includeServices: [
      "Xe đưa đón khứ hồi từ Hà Nội",
      "Tàu cao tốc/lan khứ hồi ra đảo",
      "Khách sạn 3 sao trên đảo 1 đêm",
      "Tàu tham quan vịnh Lan Hạ",
      "Chèo kayak và bữa hải sản",
      "Hướng dẫn viên suốt tuyến",
    ],
    excludeServices: [
      "Vé tham quan vườn quốc gia Cát Bà",
      "Chi phí cá nhân, đồ uống",
      "Các trò chơi tự chọn",
    ],
    itinerary: [
      {
        title: "Ngày 1: Hà Nội - Cát Bà - Vịnh Lan Hạ",
        description:
          "06h00 xe đón đoàn tại Hà Nội đi Hải Phòng. 09h00 lên tàu cao tốc ra đảo Cát Bà, nhận phòng khách sạn. Ăn trưa hải sản tại thị trấn Cát Bà. Chiều lên tàu tham quan vịnh Lan Hạ, chèo kayak len lỏi giữa các đảo đá vôi, tắm biển tại bãi tắm hoang sơ. Tối tự do dạo phố, ăn hải sản nướng. Nghỉ đêm trên đảo.",
      },
      {
        title: "Ngày 2: Vườn quốc gia Cát Bà - Hà Nội",
        description:
          "Sáng tham quan vườn quốc gia Cát Bà với hệ động thực vật phong phú, leo lên đỉnh Ngự Lâm ngắm toàn cảnh đảo. Ghé bãi biển Cát Cò 1, 2, 3. Ăn trưa tại địa phương, mua đặc sản mực khô, tu hài. 14h00 lên tàu về đất liền, xe đưa đoàn về Hà Nội. Khoảng 19h30 kết thúc tour.",
      },
    ],
    departureStartDays: 7,
    departureEveryDays: 5,
    totalSlots: 40,
  },
  {
    title: "Tây Ninh - Núi Bà Đen - Tòa thánh Cao Đài 1 ngày",
    provinceName: "Tây Ninh",
    tagNames: [
      "Văn hóa - lịch sử",
      "Núi",
      "Gia đình",
      "Giá rẻ",
      "Bạn bè",
    ],
    durationDays: 1,
    durationNights: 0,
    basePrice: 690000,
    description:
      "Tour trong ngày khám phá vùng đất thánh Tây Ninh với núi Bà Đen - ngọn núi cao nhất Nam Bộ và Tòa thánh Cao Đài độc đáo. Du khách cáp treo lên đỉnh núi, chiêm bái tượng Phật Tây Bổ Đà Sơn nổi tiếng linh thiêng và ngắm toàn cảnh đồng bằng từ trên cao. Chương trình nhẹ nhàng, chi phí hợp lý, khởi hành từ TP.HCM.",
    includeServices: [
      "Xe đưa đón khứ hồi từ TP.HCM",
      "Vé cáp treo núi Bà Đen khứ hồi",
      "Hướng dẫn viên suốt tuyến",
      "Bữa trưa đặc sản Tây Ninh",
      "Vé tham quan Tòa thánh Cao Đài",
      "Nước uống và khăn lạnh",
    ],
    excludeServices: [
      "Chi phí cá nhân, đồ uống",
      "Vé các khu vui chơi trên núi",
      "Tiền tip hướng dẫn viên",
    ],
    itinerary: [
      {
        title: "Sáng: TP.HCM - Tòa thánh Cao Đài",
        description:
          "06h00 xe đón đoàn tại trung tâm TP.HCM, khởi hành đi Tây Ninh. 08h30 tham quan Tòa thánh Cao Đài - công trình kiến trúc độc đáo kết hợp nhiều tôn giáo, dự lễ phẩm nếu đúng giờ. Hướng dẫn viên thuyết minh về đạo Cao Đài và lịch sử hình thành.",
      },
      {
        title: "Trưa: Ăn trưa đặc sản",
        description:
          "11h30 đoàn dùng bữa trưa với đặc sản Tây Ninh như bánh canh Trảng Bàng, bò tơ và muối tôm. Nghỉ ngơi trước khi lên núi.",
      },
      {
        title: "Chiều: Núi Bà Đen - về TP.HCM",
        description:
          "13h00 di chuyển đến khu du lịch núi Bà Đen. Đi cáp treo lên đỉnh núi cao 986m, chiêm bái tượng Phật Tây Bổ Đà Sơn bằng đá sa thạch lớn nhất Việt Nam và tham quan hệ thống chùa linh thiêng. Ngắm toàn cảnh đồng bằng Nam Bộ và hồ Dầu Tiếng từ trên cao. 16h00 xuống núi, lên xe về TP.HCM. Khoảng 19h00 kết thúc tour.",
      },
    ],
    departureStartDays: 3,
    departureEveryDays: 2,
    totalSlots: 45,
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

    const result = await createTourFromLinksAction({ status: "idle" }, formData);
    if (result.status === "error") {
      console.error(
        `✗ ${tour.title}`,
        result.formError ?? result.fieldErrors,
      );
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
