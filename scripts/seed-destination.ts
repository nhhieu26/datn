import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { createDestinationFromLinksAction } from "@/features/admin/destinations/actions";

const IMAGES = [
  "https://picsum.photos/1200/800",
  "https://picsum.photos/1200/800",
  "https://picsum.photos/1200/800",
];

const DESTINATIONS = [
  {
    name: "Vịnh Hạ Long",
    provinceName: "Quảng Ninh",
    address: "Thành phố Hạ Long, Quảng Ninh",
    description:
      "Vịnh Hạ Long là di sản thiên nhiên thế giới được UNESCO công nhận, nổi tiếng với hàng nghìn đảo đá vôi và hang động kỳ vĩ nhô lên từ làn nước xanh ngọc bích. Du khách có thể tham gia du thuyền ngủ đêm, chèo kayak, thăm hang Sửng Sốt và làng chài Cửa Vạn.",
    latitude: 20.910056,
    longitude: 107.183899,
    ticketPrice: 290000,
    isPublished: true,
    tagNames: ["Biển", "Thiên nhiên", "Nghỉ dưỡng", "Gia đình", "Cặp đôi"],
  },
  {
    name: "Quần thể danh thắng Tràng An",
    provinceName: "Ninh Bình",
    address: "Trường Yên, Hoa Lư, Ninh Bình",
    description:
      "Tràng An là quần thể danh thắng hỗn hợp di sản thế giới gồm hệ thống núi đá vôi, sông ngòi và hang động ngập nước. Ngồi thuyền nan len lỏi qua các hang tối và thung lũng, du khách sẽ được chiêm ngưỡng cảnh sắc non nước hữu tình tuyệt đẹp.",
    latitude: 20.252796,
    longitude: 105.925057,
    ticketPrice: 250000,
    isPublished: true,
    tagNames: ["Thiên nhiên", "Văn hóa - lịch sử", "Gia đình", "Phượt"],
  },
  {
    name: "Cầu Rồng Đà Nẵng",
    provinceName: "Đà Nẵng",
    address: "Đường Nguyễn Văn Linh, Hải Châu, Đà Nẵng",
    description:
      "Cầu Rồng là biểu tượng kiến trúc độc đáo của Đà Nẵng với hình dáng rồng uốn lượn vươn ra biển. Vào cuối tuần, cầu phun lửa và nước tạo nên màn trình diễn mãn nhãn thu hút đông đảo du khách và người dân địa phương.",
    latitude: 16.061418,
    longitude: 108.227241,
    ticketPrice: null,
    isPublished: true,
    tagNames: ["Trung tâm thành phố", "Văn hóa - lịch sử", "Bạn bè", "Gia đình"],
  },
  {
    name: "Chợ nổi Cái Răng",
    provinceName: "Cần Thơ",
    address: "Cái Răng, Cần Thơ",
    description:
      "Chợ nổi Cái Răng là nét văn hóa đặc trưng của miền Tây sông nước, họp từ tinh mơ trên sông Hậu. Du khách đi thuyền len lỏi giữa các ghe hàng bán trái cây, bún, phở và đặc sản địa phương, trải nghiệm nhịp sống sông nước chân thật.",
    latitude: 9.997741,
    longitude: 105.749878,
    ticketPrice: 100000,
    isPublished: true,
    tagNames: ["Đặc sản địa phương", "Văn hóa - lịch sử", "Thiên nhiên", "Giá rẻ"],
  },
  {
    name: "Thánh địa Mỹ Sơn",
    provinceName: "Đà Nẵng",
    address: "Duy Xuyên, Đà Nẵng",
    description:
      "Thánh địa Mỹ Sơn là quần thể đền tháp Chăm Pa cổ kính được UNESCO công nhận, ẩn mình trong thung lũng rừng nhiệt đới. Các tháp gạch nung với nghệ thuật điêu khắc tinh xảo phản ánh nền văn minh Chăm Pa huy hoàng một thời.",
    latitude: 15.764683,
    longitude: 108.113165,
    ticketPrice: 150000,
    isPublished: true,
    tagNames: ["Văn hóa - lịch sử", "Thiên nhiên", "Phượt", "Một mình"],
  },
  {
    name: "Đồi chè Cầu Đất",
    provinceName: "Lâm Đồng",
    address: "Xuân Trường, Đà Lạt, Lâm Đồng",
    description:
      "Đồi chè Cầu Đất là điểm đến xanh mướt cách trung tâm Đà Lạt khoảng 20km, nổi tiếng với những luống chè trải dài tít tắp và biển mây sớm mai. Không khí se lạnh cùng khung cảnh thiên nhiên tĩnh lặng khiến nơi đây lý tưởng để chụp ảnh và nghỉ dưỡng.",
    latitude: 11.851105,
    longitude: 108.529739,
    ticketPrice: 50000,
    isPublished: true,
    tagNames: ["Thiên nhiên", "Cặp đôi", "Bạn bè", "Nghỉ dưỡng"],
  },
  {
    name: "Bà Nà Hills",
    provinceName: "Đà Nẵng",
    address: "Hòa Ninh, Hòa Vang, Đà Nẵng",
    description:
      "Bà Nà Hills là khu du lịch sinh thái trên núi cao nổi tiếng với Cầu Vàng nằm trên đôi bàn tay khổng lồ và làng Pháp cổ kính giữa mây ngàn. Du khách trải nghiệm tuyến cáp treo đạt nhiều kỷ lục thế giới và khu vui chơi Fantasy Park.",
    latitude: 15.997719,
    longitude: 107.988037,
    ticketPrice: 850000,
    isPublished: true,
    tagNames: ["Núi", "Sang trọng", "Gia đình", "Cặp đôi", "Nghỉ dưỡng"],
  },
  {
    name: "Thác Bản Giốc",
    provinceName: "Cao Bằng",
    address: "Đàm Thủy, Trùng Khánh, Cao Bằng",
    description:
      "Thác Bản Giốc là thác nước đẹp nhất Việt Nam nằm trên biên giới Việt - Trung, đổ xuống qua nhiều tầng đá vôi trắng xóa giữa núi rừng trùng điệp. Cảnh sắc hùng vĩ đặc biệt ấn tượng vào mùa nước lũ từ tháng 6 đến tháng 9.",
    latitude: 22.853722,
    longitude: 106.724108,
    ticketPrice: 45000,
    isPublished: true,
    tagNames: ["Thiên nhiên", "Núi", "Phượt", "Phiêu lưu mạo hiểm"],
  },
  {
    name: "Cố đô Hoa Lư",
    provinceName: "Ninh Bình",
    address: "Trường Yên, Hoa Lư, Ninh Bình",
    description:
      "Cố đô Hoa Lư là kinh đô đầu tiên của nhà nước phong kiến Việt Nam thế kỷ X, gắn với các triều đại Đinh và Tiền Lê. Khu di tích gồm đền thờ vua Đinh Tiên Hoàng, đền vua Lê Đại Hành và nhiều công trình lịch sử được bảo tồn.",
    latitude: 20.285511,
    longitude: 105.911049,
    ticketPrice: 20000,
    isPublished: true,
    tagNames: ["Văn hóa - lịch sử", "Gia đình", "Giá rẻ", "Thiên nhiên"],
  },
  {
    name: "Bãi biển Mỹ Khê",
    provinceName: "Đà Nẵng",
    address: "Võ Nguyên Giáp, Sơn Trà, Đà Nẵng",
    description:
      "Bãi biển Mỹ Khê từng được tạp chí Forbes bình chọn là một trong những bãi biển quyến rũ nhất hành tinh với cát trắng mịn, nước biển trong xanh và sóng êm. Đây là nơi lý tưởng để tắm biển, chơi thể thao nước và ngắm bình minh.",
    latitude: 16.054413,
    longitude: 108.248596,
    ticketPrice: null,
    isPublished: true,
    tagNames: ["Biển", "Gần biển", "Gia đình", "Cặp đôi", "Bạn bè"],
  },
  {
    name: "Hang Sơn Đoòng",
    provinceName: "Quảng Trị",
    address: "Sơn Trạch, Bố Trạch, Quảng Trị",
    description:
      "Sơn Đoòng là hang động tự nhiên lớn nhất thế giới với hệ thống sông ngầm, rừng nguyên sinh và thạch nhũ khổng lồ bên trong. Chuyến thám hiểm hang đòi hỏi thể lực tốt và thường kéo dài vài ngày với chi phí cao, chỉ số ít du khách mỗi năm được trải nghiệm.",
    latitude: 17.458176,
    longitude: 106.287018,
    ticketPrice: 72000000,
    isPublished: true,
    tagNames: ["Thiên nhiên", "Phiêu lưu mạo hiểm", "Núi", "Phượt"],
  },
  {
    name: "Vườn quốc gia Cúc Phương",
    provinceName: "Ninh Bình",
    address: "Nho Quan, Ninh Bình",
    description:
      "Vườn quốc gia Cúc Phương là khu rừng nguyên sinh đầu tiên của Việt Nam với hệ động thực vật phong phú, nhiều loài quý hiếm. Du khách có thể đi bộ xuyên rừng, tham quan trung tâm cứu hộ linh trưởng, xem động Người Xưa và ngủ đêm tại khu nghỉ sinh thái.",
    latitude: 20.246783,
    longitude: 105.713348,
    ticketPrice: 60000,
    isPublished: true,
    tagNames: ["Thiên nhiên", "Phiêu lưu mạo hiểm", "Gia đình", "Phượt"],
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
