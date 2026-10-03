import type { RestaurantDetail } from "./restaurant-detail";

// ponytail: UI-only mock, chưa nối backend. Thay bằng dữ liệu từ restaurantRepo khi có.
function hhmm(x: number) {
  return `${String(Math.floor(x / 60)).padStart(2, "0")}:${String(x % 60).padStart(2, "0")}`;
}

const timeSlots: RestaurantDetail["timeSlots"] = [];
for (let m = 6 * 60; m < 22 * 60 + 30; m += 30) {
  timeSlots.push({ startTime: hhmm(m), endTime: hhmm(m + 30) });
}

export const MOCK_RESTAURANT: RestaurantDetail = {
  name: "Nhà hàng Ý La Trattoria",
  slug: "la-trattoria",
  location: "Hà Nội",
  address: "12 Tràng Tiền, Hoàn Kiếm",
  phone: "0243 123 4567",
  latitude: 21.025,
  longitude: 105.855,
  description:
    "La Trattoria mang đến hương vị ẩm thực Ý chính gốc giữa lòng Hà Nội. Thực đơn gồm pizza nướng lò củi, mì Ý thủ công và các món hải sản tươi, được chế biến từ nguyên liệu nhập khẩu và nông sản địa phương.\nKhông gian ấm cúng với sân vườn nhỏ, phù hợp cho bữa tối lãng mạn, họp mặt gia đình hoặc tiệc nhóm bạn.",
  capacity: 80,
  images: [1, 2, 3, 4].map((i) => ({
    url: `https://picsum.photos/seed/restaurant-${i}/1200/800`,
  })),
  menu: [
    { name: "Pizza Margherita", description: "Sốt cà chua, mozzarella, húng quế", price: 189000 },
    { name: "Spaghetti Carbonara", description: "Trứng, pecorino, thịt xông khói", price: 169000 },
    { name: "Risotto nấm truffle", description: "Gạo Arborio, nấm, dầu truffle", price: 229000 },
    { name: "Lasagna bò bằm", description: "Nhiều lớp phô mai nướng", price: 199000 },
    { name: "Salad Caprese", description: "Cà chua, mozzarella tươi, balsamic", price: 119000 },
    { name: "Tiramisu", description: "Bánh tráng miệng truyền thống của Ý", price: 89000 },
  ],
  tags: ["Món Ý", "Pizza", "Lãng mạn", "Sân vườn"],
  timeSlots,
};
