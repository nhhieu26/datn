/**
 * Seed thông báo mẫu cho khách hàng, nhà cung cấp và quản trị viên dựa trên
 * dữ liệu đơn đặt, đánh giá và hồ sơ đối tác đã có trong CSDL.
 *
 * Chạy riêng:
 *   bun scripts/seed-notification.ts
 */
import "dotenv/config";
import type { NotificationType, Prisma } from "../src/generated/prisma/client";
import { prisma } from "../src/lib/prisma";

const HOUR_MS = 60 * 60 * 1000;

export async function seedNotifications() {
  // Xóa thông báo seed cũ (đánh dấu qua metadata.seeded = true)
  await prisma.notification.deleteMany({
    where: {
      metadata: {
        path: ["seeded"],
        equals: true,
      },
    },
  });

  const rows: Prisma.NotificationCreateManyInput[] = [];
  const now = Date.now();

  // 1. Thông báo cho Admin từ các hồ sơ đối tác đang chờ duyệt
  const [admins, pendingProfiles, approvedProfiles, rejectedProfiles] =
    await Promise.all([
      prisma.user.findMany({
        where: { role: "admin", status: "active" },
        select: { id: true },
      }),
      prisma.providerProfile.findMany({
        where: { approvalStatus: "pending" },
        select: { id: true, businessName: true, businessType: true },
        take: 5,
      }),
      prisma.providerProfile.findMany({
        where: { approvalStatus: "approved" },
        select: { id: true, userId: true, businessName: true },
        take: 5,
      }),
      prisma.providerProfile.findMany({
        where: { approvalStatus: "rejected" },
        select: {
          id: true,
          userId: true,
          businessName: true,
          rejectionReason: true,
        },
        take: 5,
      }),
    ]);

  for (const admin of admins) {
    pendingProfiles.forEach((profile, index) => {
      rows.push({
        userId: admin.id,
        type: "profile_submitted",
        title: "Hồ sơ đối tác mới chờ duyệt",
        message: `Doanh nghiệp "${profile.businessName}" vừa gửi hồ sơ xét duyệt.`,
        href: `/admin/profile-approval/${encodeURIComponent(profile.id)}`,
        readAt: index > 1 ? new Date(now - index * HOUR_MS) : null,
        createdAt: new Date(now - (index + 1) * 2 * HOUR_MS),
        metadata: { seeded: true, profileId: profile.id },
      });
    });
  }

  // 2. Thông báo duyệt / từ chối hồ sơ cho Provider
  for (const profile of approvedProfiles) {
    rows.push({
      userId: profile.userId,
      type: "profile_approved",
      title: "Hồ sơ doanh nghiệp đã được duyệt",
      message: `Hồ sơ "${profile.businessName}" đã được phê duyệt. Bạn đã có thể đăng bán dịch vụ.`,
      href: `/provider/profiles/${encodeURIComponent(profile.id)}`,
      readAt: new Date(now - 24 * HOUR_MS),
      createdAt: new Date(now - 48 * HOUR_MS),
      metadata: { seeded: true, profileId: profile.id },
    });
  }

  for (const profile of rejectedProfiles) {
    rows.push({
      userId: profile.userId,
      type: "profile_rejected",
      title: "Hồ sơ doanh nghiệp bị từ chối",
      message: `Hồ sơ "${profile.businessName}" chưa được duyệt.${
        profile.rejectionReason ? ` Lý do: ${profile.rejectionReason}` : ""
      }`,
      href: `/provider/profiles/${encodeURIComponent(profile.id)}`,
      readAt: null,
      createdAt: new Date(now - 6 * HOUR_MS),
      metadata: { seeded: true, profileId: profile.id },
    });
  }

  // 3. Thông báo đơn đặt Tour cho Customer và Provider
  const tourBookings = await prisma.tourBooking.findMany({
    where: { status: { in: ["paid", "confirmed", "completed", "cancelled"] } },
    orderBy: { createdAt: "desc" },
    take: 8,
    select: {
      code: true,
      status: true,
      tourTitle: true,
      contactName: true,
      customerId: true,
      cancelReason: true,
      providerProfile: { select: { userId: true } },
    },
  });

  tourBookings.forEach((b, index) => {
    const customerType: NotificationType =
      b.status === "paid"
        ? "booking_paid"
        : b.status === "confirmed"
          ? "booking_confirmed"
          : b.status === "completed"
            ? "booking_completed"
            : "booking_cancelled";

    const customerTitle =
      b.status === "paid"
        ? `Thanh toán thành công đơn #${b.code}`
        : b.status === "confirmed"
          ? `Đơn #${b.code} đã được xác nhận`
          : b.status === "completed"
            ? `Đơn #${b.code} đã hoàn thành`
            : `Đơn #${b.code} đã bị hủy`;

    const customerMessage =
      b.status === "paid"
        ? `Đơn đặt tour "${b.tourTitle}" đã được thanh toán và đang chờ nhà cung cấp xác nhận.`
        : b.status === "confirmed"
          ? `Nhà cung cấp đã xác nhận đơn tour "${b.tourTitle}" của bạn.`
          : b.status === "completed"
            ? `Dịch vụ "${b.tourTitle}" đã hoàn thành. Hãy chia sẻ đánh giá trải nghiệm của bạn nhé!`
            : `Đơn đặt tour "${b.tourTitle}" đã bị hủy.${b.cancelReason ? ` Lý do: ${b.cancelReason}` : ""}`;

    rows.push({
      userId: b.customerId,
      type: customerType,
      title: customerTitle,
      message: customerMessage,
      href: `/bookings/${encodeURIComponent(b.code)}`,
      readAt: index > 2 ? new Date(now - index * HOUR_MS) : null,
      createdAt: new Date(now - (index + 1) * 3 * HOUR_MS),
      metadata: { seeded: true, bookingCode: b.code, kind: "tour" },
    });

    rows.push({
      userId: b.providerProfile.userId,
      type: b.status === "cancelled" ? "booking_cancelled" : "booking_created",
      title:
        b.status === "cancelled"
          ? `Đơn đặt tour #${b.code} đã hủy`
          : `Đơn đặt tour mới #${b.code}`,
      message:
        b.status === "cancelled"
          ? `Đơn đặt tour "${b.tourTitle}" của ${b.contactName} đã chuyển sang trạng thái hủy.`
          : `Khách hàng ${b.contactName} đã đặt và thanh toán tour "${b.tourTitle}".`,
      href: `/provider/bookings/tours/${encodeURIComponent(b.code)}`,
      readAt: index > 2 ? new Date(now - index * HOUR_MS) : null,
      createdAt: new Date(now - (index + 1) * 3 * HOUR_MS),
      metadata: { seeded: true, bookingCode: b.code, kind: "tour" },
    });
  });

  // 4. Thông báo đơn đặt Phòng cho Customer và Provider
  const hotelBookings = await prisma.hotelBooking.findMany({
    where: { status: { in: ["paid", "confirmed", "completed", "cancelled"] } },
    orderBy: { createdAt: "desc" },
    take: 6,
    select: {
      code: true,
      status: true,
      hotelName: true,
      roomName: true,
      contactName: true,
      customerId: true,
      providerProfile: { select: { userId: true } },
    },
  });

  hotelBookings.forEach((b, index) => {
    const label = `${b.hotelName} (${b.roomName})`;
    rows.push({
      userId: b.customerId,
      type: b.status === "completed" ? "booking_completed" : "booking_confirmed",
      title:
        b.status === "completed"
          ? `Đơn #${b.code} đã hoàn thành`
          : `Đơn đặt phòng #${b.code} đã xác nhận`,
      message:
        b.status === "completed"
          ? `Kỳ nghỉ tại "${label}" đã hoàn thành. Hãy để lại đánh giá của bạn nhé!`
          : `Khách sạn đã xác nhận đơn đặt phòng "${label}" của bạn.`,
      href: `/bookings/${encodeURIComponent(b.code)}`,
      readAt: index > 1 ? new Date(now - index * HOUR_MS) : null,
      createdAt: new Date(now - (index + 2) * 4 * HOUR_MS),
      metadata: { seeded: true, bookingCode: b.code, kind: "hotel" },
    });

    rows.push({
      userId: b.providerProfile.userId,
      type: "booking_created",
      title: `Đơn đặt phòng mới #${b.code}`,
      message: `Khách hàng ${b.contactName} vừa thanh toán đơn phòng "${label}".`,
      href: `/provider/bookings/hotels/${encodeURIComponent(b.code)}`,
      readAt: index > 1 ? new Date(now - index * HOUR_MS) : null,
      createdAt: new Date(now - (index + 2) * 4 * HOUR_MS),
      metadata: { seeded: true, bookingCode: b.code, kind: "hotel" },
    });
  });

  // 5. Thông báo đơn đặt Bàn cho Customer và Provider
  const restaurantBookings = await prisma.restaurantBooking.findMany({
    orderBy: { createdAt: "desc" },
    take: 6,
    select: {
      code: true,
      status: true,
      restaurantName: true,
      contactName: true,
      guests: true,
      startTime: true,
      customerId: true,
      providerProfile: { select: { userId: true } },
    },
  });

  restaurantBookings.forEach((b, index) => {
    rows.push({
      userId: b.providerProfile.userId,
      type: "booking_created",
      title: `Đơn đặt bàn mới #${b.code}`,
      message: `Khách hàng ${b.contactName} đặt bàn ${b.guests} khách (khung giờ ${b.startTime}) tại "${b.restaurantName}".`,
      href: `/provider/bookings/restaurants/${encodeURIComponent(b.code)}`,
      readAt: index > 1 ? new Date(now - index * HOUR_MS) : null,
      createdAt: new Date(now - (index + 1) * 5 * HOUR_MS),
      metadata: { seeded: true, bookingCode: b.code, kind: "restaurant" },
    });
  });

  // 6. Thông báo đánh giá mới cho Provider
  const recentReviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    take: 6,
    select: {
      rating: true,
      customer: { select: { fullname: true } },
      tour: {
        select: {
          title: true,
          providerProfile: { select: { userId: true } },
        },
      },
      hotel: {
        select: {
          name: true,
          providerProfile: { select: { userId: true } },
        },
      },
      restaurant: {
        select: {
          name: true,
          providerProfile: { select: { userId: true } },
        },
      },
    },
  });

  recentReviews.forEach((r, index) => {
    const target = r.tour
      ? {
          userId: r.tour.providerProfile.userId,
          name: r.tour.title,
          href: "/provider/reviews/tours",
          kind: "tour",
        }
      : r.hotel
        ? {
            userId: r.hotel.providerProfile.userId,
            name: r.hotel.name,
            href: "/provider/reviews/hotels",
            kind: "hotel",
          }
        : r.restaurant
          ? {
              userId: r.restaurant.providerProfile.userId,
              name: r.restaurant.name,
              href: "/provider/reviews/restaurants",
              kind: "restaurant",
            }
          : null;
    if (!target) return;

    rows.push({
      userId: target.userId,
      type: "review_created",
      title: `Đánh giá mới (${r.rating}★) cho "${target.name}"`,
      message: `Khách hàng ${r.customer.fullname} vừa gửi đánh giá ${r.rating} sao cho dịch vụ của bạn.`,
      href: target.href,
      readAt: index > 1 ? new Date(now - index * HOUR_MS) : null,
      createdAt: new Date(now - (index + 1) * 2 * HOUR_MS),
      metadata: { seeded: true, kind: target.kind, rating: r.rating },
    });
  });

  if (rows.length > 0) {
    await prisma.notification.createMany({ data: rows });
  }

  console.log(`✓ Seeded ${rows.length} notifications.`);
}

if (process.argv[1]?.endsWith("seed-notification.ts")) {
  seedNotifications()
    .catch((err) => {
      console.error(err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
