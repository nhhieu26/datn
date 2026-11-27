import { userRepo } from "@/entities/user";
import { UsersDashboard } from "@/features/admin";
import {
  buildUsersUrl,
  parseUsersQuery,
  toUserFilter,
  USERS_PAGE_SIZE,
  type AdminUserRow,
} from "@/features/admin/users";
import { auth } from "@/lib/auth";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Quản lý người dùng | Roamly Admin",
  description: "Tra cứu và khoá/mở khoá tài khoản người dùng trên Roamly.",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  if (session?.user?.role !== "admin") redirect("/admin/sign-in");

  const query = parseUsersQuery(await searchParams);
  const filter = toUserFilter(query);

  const [users, total, summary] = await Promise.all([
    userRepo.findManyForAdmin(filter, {
      skip: (query.page - 1) * USERS_PAGE_SIZE,
      take: USERS_PAGE_SIZE,
    }),
    userRepo.countForAdmin(filter),
    userRepo.countSummaryForAdmin(),
  ]);

  // Trang vượt quá tổng số trang (URL cũ, dữ liệu đã đổi) → về trang cuối
  const totalPages = Math.max(1, Math.ceil(total / USERS_PAGE_SIZE));
  if (query.page > totalPages) {
    redirect(buildUsersUrl(query, { page: totalPages }));
  }

  const rows: AdminUserRow[] = users.map((user) => ({
    ...user,
    createdAt: user.createdAt.toISOString(),
  }));

  return (
    <UsersDashboard
      currentAdminId={session.user.id}
      query={query}
      summary={summary}
      total={total}
      users={rows}
    />
  );
}
