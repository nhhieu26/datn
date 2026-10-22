import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { createDestinationFromLinksAction } from "@/features/admin/destinations/actions";

const IMAGES = [
  "https://picsum.photos/1200/800",
  "https://picsum.photos/1200/800",
  "https://picsum.photos/1200/800",
];

const DESTINATIONS = [
  // ===== Ninh Bình =====
  {
    name: "Quần thể danh thắng Tràng An",
    provinceName: "Ninh Bình",
    address: "Trường Yên, Hoa Lư, Ninh Bình",
    description:
      "Tràng An là quần thể danh thắng hỗn hợp di sản thế giới gồm hệ thống núi đá vôi, sông ngòi và hang động ngập nước. Ngồi thuyền nan len lỏi qua các hang tối và thung lũng, du khách sẽ được chiêm ngưỡng cảnh sắc non nước hữu tình tuyệt đẹp, ghé thăm đền Trình, hang Sáng, hang Tối và động Địa Linh.",
    latitude: 20.251169680901878,
    longitude: 105.91577066994165,
    openTime: "07:00",
    closeTime: "17:00",
    ticketPrice: 250000,
    isPublished: true,
    tagNames: ["Thiên nhiên", "Văn hóa - lịch sử", "Gia đình", "Phượt"],
  },
  {
    name: "Chùa Bái Đính",
    provinceName: "Ninh Bình",
    address: "Gia Sinh, Gia Viễn, Ninh Bình",
    description:
      "Bái Đính là quần thể chùa lớn nhất Đông Nam Á với hàng trăm pho tượng La Hán bằng đá, hành lang dài hơn 1.000m, tượng Phật Di Lặc nặng 100 tấn và bảo tháp 13 tầng cao 99m. Nơi đây vừa là điểm hành hương tâm linh vừa là điểm tham quan kiến trúc ấn tượng.",
    latitude: 20.27531744920329,
    longitude: 105.86285381684128,
    openTime: "06:30",
    closeTime: "18:00",
    ticketPrice: null,
    isPublished: true,
    tagNames: ["Văn hóa - lịch sử", "Gia đình", "Một mình", "Giá rẻ"],
  },
  {
    name: "Hang Múa",
    provinceName: "Ninh Bình",
    address: "Khê Đầu Hạ, Ninh Xuân, Hoa Lư, Ninh Bình",
    description:
      "Hang Múa nổi tiếng với 486 bậc đá dẫn lên đỉnh núi, nơi có tượng rồng đá khổng lồ và tầm nhìn toàn cảnh cánh đồng lúa, dòng sông Ngô Đồng uốn lượn giữa núi non Tam Cốc. Đây được xem là điểm ngắm cảnh đẹp nhất Ninh Bình, đặc biệt lúc bình minh và hoàng hôn.",
    latitude: 20.21470832631175,
    longitude: 105.92178421033645,
    openTime: "06:00",
    closeTime: "18:30",
    ticketPrice: 100000,
    isPublished: true,
    tagNames: ["Thiên nhiên", "Cặp đôi", "Bạn bè", "Phiêu lưu mạo hiểm"],
  },
  {
    name: "Tam Cốc - Bích Động",
    provinceName: "Ninh Bình",
    address: "Ninh Hải, Hoa Lư, Ninh Bình",
    description:
      "Tam Cốc được mệnh danh là Vịnh Hạ Long trên cạn với dòng sông Ngô Đồng chảy qua ba hang đá vôi. Du khách ngồi thuyền thúng ngắm lúa chín vàng vào tháng 5 - 6, sau đó ghé thăm chùa Bích Động, ngôi chùa cổ nằm lưng chừng núi được mệnh danh là Nam thiên đệ nhị động.",
    latitude: 20.21610947125073,
    longitude: 105.93496240512927,
    openTime: "07:00",
    closeTime: "17:00",
    ticketPrice: 120000,
    isPublished: true,
    tagNames: ["Thiên nhiên", "Văn hóa - lịch sử", "Cặp đôi", "Gia đình"],
  },
  {
    name: "Khu du lịch sinh thái Vân Long",
    provinceName: "Ninh Bình",
    address: "Gia Vân, Gia Viễn, Ninh Bình",
    description:
      "Vân Long là khu đất ngập nước tự nhiên lớn nhất Bắc Bộ, nơi sinh sống của loài voọc mông trắng quý hiếm. Du khách đi thuyền trên đầm, xuyên qua hang Chợ Mơ, tham quan động Vân Trình và đạp xe giữa đồng quê yên bình.",
    latitude: 20.37090514827516,
    longitude: 105.86858924150407,
    openTime: "07:00",
    closeTime: "17:00",
    ticketPrice: 150000,
    isPublished: true,
    tagNames: ["Thiên nhiên", "Gia đình", "Cặp đôi", "Một mình"],
  },
  {
    name: "Cố đô Hoa Lư",
    provinceName: "Ninh Bình",
    address: "Trường Yên, Hoa Lư, Ninh Bình",
    description:
      "Cố đô Hoa Lư là kinh đô đầu tiên của nhà nước phong kiến Việt Nam thế kỷ X, gắn với các triều đại Đinh và Tiền Lê. Khu di tích gồm đền thờ vua Đinh Tiên Hoàng, đền vua Lê Đại Hành và nhiều công trình lịch sử được bảo tồn.",
    latitude: 20.284344606507883,
    longitude: 105.9082717168315,
    openTime: "07:00",
    closeTime: "17:00",
    ticketPrice: 20000,
    isPublished: true,
    tagNames: ["Văn hóa - lịch sử", "Gia đình", "Giá rẻ", "Thiên nhiên"],
  },
  {
    name: "Vườn quốc gia Cúc Phương",
    provinceName: "Ninh Bình",
    address: "Nho Quan, Ninh Bình",
    description:
      "Vườn quốc gia Cúc Phương là khu rừng nguyên sinh đầu tiên của Việt Nam với hệ động thực vật phong phú, nhiều loài quý hiếm. Du khách có thể đi bộ xuyên rừng, tham quan trung tâm cứu hộ linh trưởng, xem động Người Xưa và ngủ đêm tại khu nghỉ sinh thái.",
    latitude: 20.32173016256944,
    longitude: 105.61670663460511,
    openTime: "07:00",
    closeTime: "17:00",
    ticketPrice: 60000,
    isPublished: true,
    tagNames: ["Thiên nhiên", "Phiêu lưu mạo hiểm", "Gia đình", "Phượt"],
  },
  {
    name: "Nhà thờ đá Phát Diệm",
    provinceName: "Ninh Bình",
    address: "Thị trấn Phát Diệm, Kim Sơn, Ninh Bình",
    description:
      "Nhà thờ đá Phát Diệm là công trình kiến trúc độc đáo kết hợp phong cách Gothic phương Tây và nét điêu khắc đình chùa Việt Nam, xây dựng gần như hoàn toàn bằng đá và gỗ lim cuối thế kỷ XIX. Khuôn viên rộng có hồ nước, các nhà nguyện nhỏ và những lầu chuông đá cổ kính.",
    latitude: 20.09930811684162,
    longitude: 106.07315229385482,
    openTime: "07:00",
    closeTime: "17:00",
    ticketPrice: null,
    isPublished: true,
    tagNames: ["Văn hóa - lịch sử", "Một mình", "Giá rẻ", "Bạn bè"],
  },
  {
    name: "Thung Nham",
    provinceName: "Ninh Bình",
    address: "Ninh Hòa, Hoa Lư, Ninh Bình",
    description:
      "Thung Nham là khu sinh thái có vườn chim hàng nghìn con cò, vạc, cuốc làm tổ giữa núi đá vôi cùng hệ thống hang động và hồ nước trong xanh. Du khách có thể chèo thuyền, đạp xe, tham quan động Thiên Hà và ngắm đàn chim trở về vào chiều tối.",
    latitude: 20.2622,
    longitude: 105.9,
    openTime: "07:00",
    closeTime: "17:30",
    ticketPrice: 100000,
    isPublished: true,
    tagNames: ["Thiên nhiên", "Gia đình", "Cặp đôi", "Bạn bè"],
  },

  {
    name: "Đảo Khỉ Cát Bà",
    provinceName: "Hải Phòng",
    address: "Đảo Khỉ, thị trấn Cát Bà, Cát Hải, Hải Phòng",
    description:
      "Đảo Khỉ là hòn đảo nhỏ cách bến tàu du lịch Cát Bà khoảng 15 phút đi thuyền, được biết đến với bãi tắm đẹp và đàn khỉ rừng sống tự nhiên hàng trăm con. Du khách có thể tắm biển, chèo kayak và xem chương trình xiếc khỉ do khu du lịch tổ chức.",
    latitude: 20.7915,
    longitude: 107.088,
    openTime: "07:00",
    closeTime: "17:00",
    ticketPrice: 50000,
    isPublished: true,
    tagNames: ["Thiên nhiên", "Biển", "Gia đình", "Cặp đôi"],
  },
  {
    name: "Đền Bà Đế",
    provinceName: "Hải Phòng",
    address: "Phường Vạn Sơn, Đồ Sơn, Hải Phòng",
    description:
      "Đền Bà Đế thờ ba anh em Vũ Nước - Vũ Tiên Thân, những vị tướng truyền thuyết khai mở đất Đồ Sơn xưa, là di tích được xem là linh thiêng nhất khu vực. Đền nằm trên đồi cây xanh, là nơi người Đồ Sơn dâng lễ hội truyền thống hằng năm.",
    latitude: 20.7169,
    longitude: 106.7905,
    openTime: "06:00",
    closeTime: "18:00",
    ticketPrice: null,
    isPublished: true,
    tagNames: ["Văn hóa - lịch sử", "Gia đình", "Một mình", "Giá rẻ"],
  },
  {
    name: "Chùa Hang Kèn",
    provinceName: "Hải Phòng",
    address: "Phường Vạn Sơn, Đồ Sơn, Hải Phòng",
    description:
      "Chùa Hang Kèn nằm trên sườn núi Cộc Chà ở Đồ Sơn, nổi tiếng với hang đá hình ống kèn và тела tượng đá tổ sư. Đứng trước cửa chùa có thể ngắm toàn cảnh bãi biển Đồ Sơn và những biệt thự cổ ẩn mình trong cây xanh.",
    latitude: 20.7141,
    longitude: 106.7838,
    openTime: "07:00",
    closeTime: "18:00",
    ticketPrice: null,
    isPublished: true,
    tagNames: ["Văn hóa - lịch sử", "Một mình", "Giá rẻ", "Gia đình"],
  },
  {
    name: "Hang Trung Trang",
    provinceName: "Hải Phòng",
    address: "Vườn quốc gia Cát Bà, Trân Châu, Cát Hải, Hải Phòng",
    description:
      "Hang Trung Trang nằm giữa rừng quốc gia Cát Bà, là hang đá vôi dài hơn 100m với nhiều nhũ đá và lòng hang phẳng rộng. Hang gắn với giai thoại nữ tướng Lê Chân và những căn cứ kháng chiến thời chiến tranh, ẩm ướt mát dịu quanh năm và dễ tiếp cận từ lối vườn quốc gia.",
    latitude: 20.7995,
    longitude: 107.0,
    openTime: "07:00",
    closeTime: "17:00",
    ticketPrice: 80000,
    isPublished: true,
    tagNames: ["Thiên nhiên", "Phiêu lưu mạo hiểm", "Phượt", "Bạn bè"],
  },
  {
    name: "Làng chài Việt Hải",
    provinceName: "Hải Phòng",
    address: "Thôn Việt Hải, Trân Châu, Cát Hải, Hải Phòng",
    description:
      "Làng chài Việt Hải là khu làng cổ nằm lưng chừng núi giữa thung lũng hoang vắng của đảo Cát Bà, chỉ tiếp cận bằng trekking hoặc thuyền từ vịnh Lan Hạ. Du khách ghé nơi đây để trải nghiệm cuộc sống ngư dân, ăn cá rừng, chạo dọc mùng và ngủ homestay đêm.",
    latitude: 20.7867,
    longitude: 106.9948,
    openTime: "06:00",
    closeTime: "20:00",
    ticketPrice: null,
    isPublished: true,
    tagNames: ["Thiên nhiên", "Bạn bè", "Phượt", "Homestay"],
  },
  {
    name: "Động Thiên Hà",
    provinceName: "Ninh Bình",
    address: "Thôn Đồng Tâm, phường Tây Hoa Lư, Ninh Bình",
    description:
      "Động Thiên Hà nằm trong lòng dãy núi Tướng thuộc vùng lõi di sản Tràng An, dài gần 1km gồm 200m động khô và hơn 700m động nước với sông ngầm xuyên suốt. Du khách đi thuyền qua ván lệnh cửa động rồi bộ hành trên đường đá, chiêm ngưỡng nhũ đá lấp lánh ánh tím ánh vàng dưới giếng trời.",
    latitude: 20.2128,
    longitude: 105.8839,
    openTime: "07:30",
    closeTime: "17:00",
    ticketPrice: 250000,
    isPublished: true,
    tagNames: [
      "Thiên nhiên",
      "Phiêu lưu mạo hiểm",
      "Văn hóa - lịch sử",
      "Gia đình",
    ],
  },
  {
    name: "Động Thiên Tôn",
    provinceName: "Ninh Bình",
    address: "Chân núi Voi, phường Ninh Mỹ, Hoa Lư, Ninh Bình",
    description:
      "Động Thiên Tôn ở chân núi Voi, thuộc Hoa Lư tứ trấn, là di tích thờ thần Thiên Tôn trấn giữ cửa ngõ phía đông cố đô Hoa Lư. Trong động còn bảo tồn gác chuông cổ hơn 300 năm tuổi có khả năng phát ra 4 âm thanh, đỉnh núi có tượng Phật lớn nhìn xuống đồng ruộng.",
    latitude: 20.2992,
    longitude: 105.9428,
    openTime: "07:00",
    closeTime: "18:00",
    ticketPrice: null,
    isPublished: true,
    tagNames: ["Văn hóa - lịch sử", "Gia đình", "Một mình", "Giá rẻ"],
  },
  {
    name: "Phố cổ Hoa Lư",
    provinceName: "Ninh Bình",
    address: "Phường Hoa Lư, Ninh Bình",
    description:
      "Phố cổ Hoa Lư là tổ hợp phố đi bộ với kiến trúc cổ điện Á Đông bên dòng sông San Âm, gồm nhà gốm, quảng trường và các gian hàng phục dựng những nghề truyền thống Văn Lâm, Bồ Bát. Buổi tối phố rực rỡ đèn lồng, bán đặc sản cơm cháy, dê núi như một thành phố cổ thu nhỏ của thế kỷ X.",
    latitude: 20.29,
    longitude: 105.903,
    openTime: "05:00",
    closeTime: "22:00",
    ticketPrice: null,
    isPublished: true,
    tagNames: ["Văn hóa - lịch sử", "Trung tâm thành phố", "Cặp đôi", "Bạn bè"],
  },
  {
    name: "Chùa Non Nước",
    provinceName: "Ninh Bình",
    address: "Phường Tân Thành, Ninh Bình",
    description:
      "Chùa Non Nước nằm trên núi Dục Thánh cạnh bờ sông Đáy, là chùa cổ xây từ thế kỷ X với khu vườn tượng đá Phật giáo quý hiếm. Khuôn viên chùa còn có lăng mộ thi sĩ Trần Tế Xương, gắn với câu ca dao trứ danh: Đất Đô có núi non nước, nổi tiếng cảnh đẹp có tả có hình.",
    latitude: 20.2487,
    longitude: 105.9843,
    openTime: "06:00",
    closeTime: "18:00",
    ticketPrice: null,
    isPublished: true,
    tagNames: ["Văn hóa - lịch sử", "Một mình", "Gia đình", "Giá rẻ"],
  },
  {
    name: "Bảo tàng tỉnh Ninh Bình",
    provinceName: "Ninh Bình",
    address: "Số 1 Đường Hoa Lư, phường Đông Thành, Ninh Bình",
    description:
      "Bảo tàng tỉnh Ninh Bình tọa lạc liền kề quảng trường Đinh Tiên Hoàng, lưu giữ hàng nghìn hiện vật về triều Đinh, kháng chiến và các thành tựu kinh tế địa phương ngày nay. Đây là lựa chọn tuyệt vời để đặt điểm về hiểu người cổ thời phong kiến khi trú mưa ngay giữa lòng thành phố.",
    latitude: 20.2462,
    longitude: 105.976,
    openTime: "08:00",
    closeTime: "17:00",
    ticketPrice: 20000,
    isPublished: true,
    tagNames: [
      "Văn hóa - lịch sử",
      "Trung tâm thành phố",
      "Gia đình",
      "Một mình",
    ],
  },
  // ===== Hải Phòng =====
  {
    name: "Vườn quốc gia Cát Bà",
    provinceName: "Hải Phòng",
    address: "Xã Trân Châu, đảo Cát Bà, Hải Phòng",
    description:
      "Vườn quốc gia Cát Bà là khu dự trữ sinh quyển thế giới với rừng nhiệt đới nguyên sinh, hệ sinh thái núi đá vôi và là nơi sinh sống của loài voọc Cát Bà cực kỳ quý hiếm. Du khách có thể trekking lên đỉnh Ngự Lâm, khám phá hang Trung Trang và ngắm toàn cảnh đảo từ trên cao.",
    latitude: 20.79927601529326,
    longitude: 106.99919487405312,
    openTime: "07:00",
    closeTime: "17:00",
    ticketPrice: 40000,
    isPublished: true,
    tagNames: ["Thiên nhiên", "Phiêu lưu mạo hiểm", "Núi", "Phượt"],
  },
  {
    name: "Vịnh Lan Hạ",
    provinceName: "Hải Phòng",
    address: "Cát Hải, Hải Phòng",
    description:
      "Vịnh Lan Hạ nằm phía đông đảo Cát Bà với hàng trăm đảo đá vôi hình thù kỳ thú, làn nước xanh trong và những bãi cát hoang sơ. Cảnh sắc không kém Vịnh Hạ Long nhưng yên tĩnh hơn nhiều, thích hợp chèo kayak, tắm biển và nghỉ đêm trên du thuyền.",
    latitude: 20.78335874230108,
    longitude: 107.08330149180273,
    openTime: "07:00",
    closeTime: "17:00",
    ticketPrice: null,
    isPublished: true,
    tagNames: ["Biển", "Thiên nhiên", "Cặp đôi", "Nghỉ dưỡng", "Gia đình"],
  },
  {
    name: "Bãi biển Đồ Sơn",
    provinceName: "Hải Phòng",
    address: "Quận Đồ Sơn, Hải Phòng",
    description:
      "Đồ Sơn là khu nghỉ mát biển lâu đời nhất miền Bắc, nổi tiếng với ba bãi tắm, những dãy nhà nghỉ cổ kính từ thời Pháp và đền Bà Đế linh thiêng. Đây là nơi lý tưởng để tắm biển, ăn hải sản tươi và nghỉ dưỡng cuối tuần gần Hà Nội.",
    latitude: 20.71241876408735,
    longitude: 106.78823694092403,
    openTime: "05:00",
    closeTime: "22:00",
    ticketPrice: null,
    isPublished: true,
    tagNames: ["Biển", "Gần biển", "Gia đình", "Bạn bè", "Hải sản"],
  },
  {
    name: "Đảo Hòn Dấu",
    provinceName: "Hải Phòng",
    address: "Phường Vạn Hương, Đồ Sơn, Hải Phòng",
    description:
      "Hòn Dấu là hòn đảo nhỏ nằm gần bờ biển Đồ Sơn với ngọn hải đăng cổ hơn một thế kỷ tuổi, được xem là cột mốc đánh dấu Hải Phòng trên bản đồ hàng hải. Đảo có khung cảnh yên bình, rừng cây xanh mát và tầm nhìn thoáng ra biển.",
    latitude: 20.67510984201318,
    longitude: 106.80755321027445,
    openTime: "07:00",
    closeTime: "17:00",
    ticketPrice: 20000,
    isPublished: true,
    tagNames: ["Biển", "Thiên nhiên", "Văn hóa - lịch sử", "Một mình"],
  },
  {
    name: "Bãi tắm Cát Cò",
    provinceName: "Hải Phòng",
    address: "Thị trấn Cát Bà, Cát Hải, Hải Phòng",
    description:
      "Quần thể ba bãi tắm Cát Cò 1, 2, 3 nằm ngay trung tâm thị trấn Cát Bà với bờ cát trắng, nước trong và sóng nhẹ. Bãi tắm có nhiều dịch vụ ăn uống, thuê phao, mô tô nước và là nơi ngắm hoàng hôn rất đẹp.",
    latitude: 20.72461238509342,
    longitude: 107.04562837291054,
    openTime: "05:30",
    closeTime: "20:00",
    ticketPrice: 20000,
    isPublished: true,
    tagNames: ["Biển", "Gần biển", "Gia đình", "Cặp đôi", "Bạn bè"],
  },
  {
    name: "Pháo đài Thần Công",
    provinceName: "Hải Phòng",
    address: "Núi Ngự Lâm, thị trấn Cát Bà, Hải Phòng",
    description:
      "Pháo đài Thần Công là di tích quân sự thời chiến tranh chống Mỹ, nằm trên đỉnh đồi cao nhìn ra cảng Cát Bà. Hệ thống hầm hào, súng thần công và tầm nhìn toàn cảnh vịnh làm nơi đây trở thành điểm tham quan lịch sử và ngắm cảnh hấp dẫn.",
    latitude: 20.7286,
    longitude: 107.06,
    openTime: "07:00",
    closeTime: "17:00",
    ticketPrice: 20000,
    isPublished: true,
    tagNames: ["Văn hóa - lịch sử", "Núi", "Bạn bè", "Phượt"],
  },
  {
    name: "Nhà hát lớn Hải Phòng",
    provinceName: "Hải Phòng",
    address: "Số 1 Quang Trung, Hồng Bàng, Hải Phòng",
    description:
      "Nhà hát lớn Hải Phòng xây dựng năm 1912 theo phong cách kiến trúc Pháp cổ điển, là một trong những công trình biểu tượng của thành phố Cảng. Quảng trường phía trước là nơi người dân dạo chơi, chụp ảnh và là trung tâm của các hoạt động văn hóa, lễ hội.",
    latitude: 20.8590212384721,
    longitude: 106.68376218475921,
    openTime: "08:00",
    closeTime: "21:00",
    ticketPrice: null,
    isPublished: true,
    tagNames: ["Trung tâm thành phố", "Văn hóa - lịch sử", "Cặp đôi", "Bạn bè"],
  },
  {
    name: "Bảo tàng Hải Phòng",
    provinceName: "Hải Phòng",
    address: "Số 66 Điện Biên Phủ, Hồng Bàng, Hải Phòng",
    description:
      "Bảo tàng Hải Phòng nằm trong tòa nhà kiến trúc Pháp cổ, trưng bày hàng nghìn hiện vật về lịch sử, văn hóa và truyền thống đấu tranh của vùng đất cảng. Đây là điểm dừng chân thú vị để hiểu về trận Bạch Đằng, đời sống ngư dân và công nghiệp đóng tàu.",
    latitude: 20.85760318472011,
    longitude: 106.68363184720352,
    openTime: "08:00",
    closeTime: "17:00",
    ticketPrice: 30000,
    isPublished: true,
    tagNames: [
      "Văn hóa - lịch sử",
      "Trung tâm thành phố",
      "Gia đình",
      "Một mình",
    ],
  },
  {
    name: "Chùa Dư Hàng",
    provinceName: "Hải Phòng",
    address: "Số 121 Chùa Hàng, Lê Chân, Hải Phòng",
    description:
      "Chùa Dư Hàng là ngôi chùa cổ hơn 300 năm tuổi, thờ nữ tướng Lê Chân và nổi tiếng với kiến trúc gỗ chạm khắc tinh xảo cùng gác chuông ba tầng. Chùa tọa lạc giữa khu dân cư sầm uất, mang không khí thanh tịnh giữa lòng thành phố.",
    latitude: 20.85203815472981,
    longitude: 106.67304718472031,
    openTime: "06:00",
    closeTime: "18:00",
    ticketPrice: null,
    isPublished: true,
    tagNames: [
      "Văn hóa - lịch sử",
      "Trung tâm thành phố",
      "Một mình",
      "Giá rẻ",
    ],
  },
];

export async function seedDestinations() {
  const provinceByName = new Map(
    (await prisma.province.findMany()).map((p) => [p.name, p.id]),
  );
  const tagByName = new Map(
    (await prisma.tag.findMany()).map((t) => [t.name, t.id]),
  );

  for (const destination of DESTINATIONS) {
    const formData = new FormData();
    formData.set("name", destination.name);
    formData.set("provinceId", provinceByName.get(destination.provinceName)!);
    formData.set("address", destination.address);
    formData.set("description", destination.description);
    formData.set("latitude", String(destination.latitude));
    formData.set("longitude", String(destination.longitude));
    formData.set("openTime", destination.openTime);
    formData.set("closeTime", destination.closeTime);
    formData.set(
      "ticketPrice",
      destination.ticketPrice === null ? "" : String(destination.ticketPrice),
    );
    formData.set("isPublished", String(destination.isPublished));
    formData.set(
      "tagIds",
      JSON.stringify(destination.tagNames.map((name) => tagByName.get(name))),
    );
    formData.set("imageUrls", JSON.stringify(IMAGES));

    const result = await createDestinationFromLinksAction(
      { status: "idle" },
      formData,
    );
    if (result.status === "error") {
      console.error(
        `✗ ${destination.name}`,
        result.formError ?? result.fieldErrors,
      );
    }
  }
}
