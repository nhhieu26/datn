import {
  buildModerationUrl,
  loadModerationPage,
  loadModerationSummary,
  MODERATION_PAGE_SIZE,
  ModerationDashboard,
  parseModerationQuery,
} from "@/features/admin/moderation";
import { auth } from "@/lib/auth";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Kiểm duyệt nội dung | Roamly Admin",
  description: "Duyệt đánh giá và bình luận được AI gắn cờ trên Roamly.",
};

export default async function AdminModerationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  if (session?.user?.role !== "admin") redirect("/admin/sign-in");

  const query = parseModerationQuery(await searchParams);
  const [{ rows, total }, summary] = await Promise.all([
    loadModerationPage(query),
    loadModerationSummary(),
  ]);

  // Trang vượt quá tổng số trang (URL cũ, dữ liệu đã đổi) → về trang cuối
  const totalPages = Math.max(1, Math.ceil(total / MODERATION_PAGE_SIZE));
  if (query.page > totalPages) {
    redirect(buildModerationUrl(query, { page: totalPages }));
  }

  return <ModerationDashboard query={query} rows={rows} summary={summary} total={total} />;
}
