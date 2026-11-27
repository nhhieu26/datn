import {
  findRecentBookings,
  type RecentBooking,
} from "@/entities/recent-bookings";
import { userRepo } from "@/entities/user";
import { UserDetail } from "@/features/admin";
import type { AdminUserDetail } from "@/features/admin/users";
import { auth } from "@/lib/auth";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Chi tiết người dùng | Roamly Admin",
  description: "Xem thông tin và trạng thái tài khoản người dùng trên Roamly.",
};

const RECENT_BOOKINGS = 8;

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (session?.user?.role !== "admin") redirect("/admin/sign-in");

  const { id } = await params;
  const user = await userRepo.findDetailForAdmin(id);
  if (!user) notFound();

  // Khách hàng: booking họ đã đặt. Đối tác: booking các hồ sơ của họ nhận được.
  let bookings: RecentBooking[] = [];
  if (user.role === "customer") {
    bookings = await findRecentBookings({ customerId: user.id }, RECENT_BOOKINGS);
  } else if (user.role === "provider") {
    bookings = await findRecentBookings(
      { providerUserId: user.id },
      RECENT_BOOKINGS,
    );
  }

  const { _count, ...rest } = user;
  const detail: AdminUserDetail = {
    ...rest,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    counts: _count,
    recentBookings: bookings.map((booking) => ({
      ...booking,
      serviceDate: booking.serviceDate.toISOString(),
      createdAt: booking.createdAt.toISOString(),
    })),
  };

  return <UserDetail currentAdminId={session.user.id} user={detail} />;
}
