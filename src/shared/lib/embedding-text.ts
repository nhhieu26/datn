// Văn bản đưa vào embedding cho từng loại dịch vụ. Dùng chung cho server action (tạo/sửa)
// và script tạo embedding hàng loạt để vector luôn được sinh từ cùng một nội dung.

type Named = { name: string };
type Text = string | null | undefined;

function joinLines(parts: Text[]): string {
  return parts.filter(Boolean).join("\n");
}

export function buildTourEmbeddingText(
  data: {
    title: string;
    description?: Text;
    itinerary: { title: string }[];
    includeServices: string[];
  },
  provinceName: string,
  tags: Named[],
): string {
  return joinLines([
    data.title,
    data.description,
    provinceName,
    tags.map((tag) => tag.name).join(", "),
    data.itinerary.map((day) => day.title).join(", "),
    data.includeServices.join(", "),
  ]);
}

export function buildHotelEmbeddingText(
  data: {
    name: string;
    description?: Text;
    address?: Text;
    amenities: string[];
    rooms: { name: string; description?: Text }[];
  },
  provinceName: string,
  tags: Named[],
): string {
  return joinLines([
    data.name,
    data.description,
    provinceName,
    data.address,
    tags.map((tag) => tag.name).join(", "),
    data.amenities.join(", "),
    data.rooms.map((room) => room.name).join(", "),
    data.rooms.map((room) => room.description).join(", "),
  ]);
}

/** Chuẩn hóa cột JSON `menu` của nhà hàng thành danh sách món có tên. */
export function parseMenu(menu: unknown): { name: string; description?: string }[] {
  if (!Array.isArray(menu)) return [];
  return menu.flatMap((item: { name?: unknown; description?: unknown }) =>
    typeof item?.name === "string"
      ? [
          {
            name: item.name,
            description:
              typeof item.description === "string" ? item.description : undefined,
          },
        ]
      : [],
  );
}

export function buildRestaurantEmbeddingText(
  data: {
    name: string;
    description?: Text;
    address?: Text;
    menu: { name: string; description?: Text }[];
  },
  provinceName: string,
  tags: Named[] = [],
): string {
  return joinLines([
    data.name,
    data.description,
    provinceName,
    data.address,
    tags.map((tag) => tag.name).join(", "),
    data.menu.map((item) => item.name).join(", "),
    data.menu.map((item) => item.description).join(", "),
  ]);
}

export function buildDestinationEmbeddingText(
  data: { name: string; description?: Text; address?: Text },
  provinceName: string,
  tags: Named[],
): string {
  return joinLines([
    data.name,
    data.description,
    provinceName,
    data.address,
    tags.map((tag) => tag.name).join(", "),
  ]);
}
