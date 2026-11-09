import { buildItinerary } from "@/features/trip-planner/lib/build";
import { tripRouteSchema } from "@/features/trip-planner/lib/schema";

export const maxDuration = 60;

// Tính lại quãng đường khi người dùng tự sửa lộ trình (xóa điểm, đổi phương tiện)
export async function POST(req: Request) {
  const parsed = tripRouteSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });

  const { itinerary, mode, optimize } = parsed.data;
  const result = await buildItinerary(itinerary, mode, { strict: false, optimize });
  return Response.json(result);
}
