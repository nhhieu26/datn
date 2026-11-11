import { prisma } from "@/lib/prisma";
import * as notificationRepo from "./repo";

type ServiceKind = "tour" | "hotel" | "restaurant";

/**
 * Bọc các tác vụ gửi thông báo để lỗi phát sinh (nếu có) không bao giờ
 * làm gián đoạn giao dịch chính (đặt chỗ, thanh toán, duyệt hồ sơ...).
 */
export async function notifySafe(task: () => Promise<unknown>): Promise<void> {
  try {
    await task();
  } catch (error) {
    console.error("[notification] dispatch failed", error);
  }
}

function serviceSegment(kind: ServiceKind) {
  return kind === "tour"
    ? "tours"
    : kind === "hotel"
      ? "hotels"
      : "restaurants";
}

function providerBookingHref(kind: ServiceKind, code: string) {
  return `/provider/bookings/${serviceSegment(kind)}/${encodeURIComponent(code)}`;
}

function providerReviewHref(kind: ServiceKind) {
  return `/provider/reviews/${serviceSegment(kind)}`;
}

function customerBookingHref(code: string) {
  return `/bookings/${encodeURIComponent(code)}`;
}

async function findBookingBrief(kind: ServiceKind, code: string) {
  if (kind === "tour") {
    const row = await prisma.tourBooking.findUnique({
      where: { code },
      select: {
        code: true,
        customerId: true,
        contactName: true,
        tourTitle: true,
        providerProfile: { select: { userId: true, businessName: true } },
      },
    });
    return (
      row && {
        code: row.code,
        customerId: row.customerId,
        contactName: row.contactName,
        serviceName: row.tourTitle,
        providerUserId: row.providerProfile.userId,
        businessName: row.providerProfile.businessName,
      }
    );
  }

  if (kind === "hotel") {
    const row = await prisma.hotelBooking.findUnique({
      where: { code },
      select: {
        code: true,
        customerId: true,
        contactName: true,
        hotelName: true,
        roomName: true,
        providerProfile: { select: { userId: true, businessName: true } },
      },
    });
    return (
      row && {
        code: row.code,
        customerId: row.customerId,
        contactName: row.contactName,
        serviceName: `${row.hotelName} (${row.roomName})`,
        providerUserId: row.providerProfile.userId,
        businessName: row.providerProfile.businessName,
      }
    );
  }

  const row = await prisma.restaurantBooking.findUnique({
    where: { code },
    select: {
      code: true,
      customerId: true,
      contactName: true,
      restaurantName: true,
      providerProfile: { select: { userId: true, businessName: true } },
    },
  });
  return (
    row && {
      code: row.code,
      customerId: row.customerId,
      contactName: row.contactName,
      serviceName: row.restaurantName,
      providerUserId: row.providerProfile.userId,
      businessName: row.providerProfile.businessName,
    }
  );
}

/**
 * Khi khách hàng thanh toán thành công đơn Tour hoặc Khách sạn:
 * - Gửi thông báo thanh toán thành công cho Khách hàng.
 * - Gửi thông báo có đơn đặt mới cho Nhà cung cấp.
 */
export function notifyBookingPaid(input: {
  kind: "tour" | "hotel";
  bookingId: string;
}) {
  return notifySafe(async () => {
    if (input.kind === "tour") {
      const booking = await prisma.tourBooking.findUnique({
        where: { id: input.bookingId },
        select: {
          code: true,
          tourTitle: true,
          contactName: true,
          customerId: true,
          providerProfile: { select: { userId: true } },
        },
      });
      if (!booking) return;

      await notificationRepo.createMany([
        {
          userId: booking.customerId,
          type: "booking_paid",
          title: `Thanh toán thành công đơn #${booking.code}`,
          message: `Đơn đặt tour "${booking.tourTitle}" đã được thanh toán và đang chờ nhà cung cấp xác nhận.`,
          href: customerBookingHref(booking.code),
          metadata: { bookingCode: booking.code, kind: "tour" },
        },
        {
          userId: booking.providerProfile.userId,
          type: "booking_created",
          title: `Đơn đặt tour mới #${booking.code}`,
          message: `Khách hàng ${booking.contactName} vừa thanh toán đơn tour "${booking.tourTitle}".`,
          href: providerBookingHref("tour", booking.code),
          metadata: { bookingCode: booking.code, kind: "tour" },
        },
      ]);
      return;
    }

    const booking = await prisma.hotelBooking.findUnique({
      where: { id: input.bookingId },
      select: {
        code: true,
        hotelName: true,
        roomName: true,
        contactName: true,
        customerId: true,
        providerProfile: { select: { userId: true } },
      },
    });
    if (!booking) return;

    const serviceLabel = `${booking.hotelName} (${booking.roomName})`;
    await notificationRepo.createMany([
      {
        userId: booking.customerId,
        type: "booking_paid",
        title: `Thanh toán thành công đơn #${booking.code}`,
        message: `Đơn đặt phòng "${serviceLabel}" đã được thanh toán và đang chờ khách sạn xác nhận.`,
        href: customerBookingHref(booking.code),
        metadata: { bookingCode: booking.code, kind: "hotel" },
      },
      {
        userId: booking.providerProfile.userId,
        type: "booking_created",
        title: `Đơn đặt phòng mới #${booking.code}`,
        message: `Khách hàng ${booking.contactName} vừa thanh toán đơn phòng "${serviceLabel}".`,
        href: providerBookingHref("hotel", booking.code),
        metadata: { bookingCode: booking.code, kind: "hotel" },
      },
    ]);
  });
}

/**
 * Khi khách hàng tạo đơn đặt bàn nhà hàng (`pending_confirmation`):
 * - Gửi thông báo đã gửi yêu cầu cho Khách hàng.
 * - Gửi thông báo có đơn đặt bàn mới cho Nhà hàng.
 */
export function notifyRestaurantBookingCreated(bookingId: string) {
  return notifySafe(async () => {
    const booking = await prisma.restaurantBooking.findUnique({
      where: { id: bookingId },
      select: {
        code: true,
        restaurantName: true,
        contactName: true,
        guests: true,
        startTime: true,
        customerId: true,
        providerProfile: { select: { userId: true } },
      },
    });
    if (!booking) return;

    await notificationRepo.createMany([
      {
        userId: booking.customerId,
        type: "booking_created",
        title: `Đã gửi yêu cầu đặt bàn #${booking.code}`,
        message: `Đơn đặt bàn tại "${booking.restaurantName}" (${booking.guests} khách, khung giờ ${booking.startTime}) đang chờ nhà hàng xác nhận.`,
        href: customerBookingHref(booking.code),
        metadata: { bookingCode: booking.code, kind: "restaurant" },
      },
      {
        userId: booking.providerProfile.userId,
        type: "booking_created",
        title: `Đơn đặt bàn mới #${booking.code}`,
        message: `Khách hàng ${booking.contactName} đặt bàn ${booking.guests} khách (khung giờ ${booking.startTime}) tại "${booking.restaurantName}".`,
        href: providerBookingHref("restaurant", booking.code),
        metadata: { bookingCode: booking.code, kind: "restaurant" },
      },
    ]);
  });
}

/**
 * Khi Nhà cung cấp cập nhật trạng thái đơn (`confirmed`, `cancelled`, `completed`):
 * - Gửi thông báo cho Khách hàng.
 */
export function notifyProviderUpdatedBooking(input: {
  kind: ServiceKind;
  code: string;
  status: "confirmed" | "cancelled" | "completed";
  reason?: string | null;
}) {
  return notifySafe(async () => {
    const brief = await findBookingBrief(input.kind, input.code);
    if (!brief) return;

    if (input.status === "confirmed") {
      await notificationRepo.create({
        userId: brief.customerId,
        type: "booking_confirmed",
        title: `Đơn #${brief.code} đã được xác nhận`,
        message: `Nhà cung cấp đã xác nhận đơn "${brief.serviceName}" của bạn.`,
        href: customerBookingHref(brief.code),
        metadata: { bookingCode: brief.code, kind: input.kind },
      });
      return;
    }

    if (input.status === "cancelled") {
      const reasonText = input.reason?.trim()
        ? ` Lý do: ${input.reason.trim()}`
        : "";
      await notificationRepo.create({
        userId: brief.customerId,
        type: "booking_cancelled",
        title: `Đơn #${brief.code} đã bị hủy`,
        message: `Nhà cung cấp đã hủy đơn "${brief.serviceName}".${reasonText}`,
        href: customerBookingHref(brief.code),
        metadata: { bookingCode: brief.code, kind: input.kind },
      });
      return;
    }

    await notificationRepo.create({
      userId: brief.customerId,
      type: "booking_completed",
      title: `Đơn #${brief.code} đã hoàn thành`,
      message: `Dịch vụ "${brief.serviceName}" đã hoàn thành. Hãy chia sẻ đánh giá trải nghiệm của bạn nhé!`,
      href: customerBookingHref(brief.code),
      metadata: { bookingCode: brief.code, kind: input.kind },
    });
  });
}

/**
 * Khi Khách hàng chủ động hủy đơn:
 * - Gửi thông báo cho Nhà cung cấp.
 */
export function notifyCustomerCancelledBooking(input: {
  kind: ServiceKind;
  code: string;
  reason: string;
}) {
  return notifySafe(async () => {
    const brief = await findBookingBrief(input.kind, input.code);
    if (!brief) return;

    await notificationRepo.create({
      userId: brief.providerUserId,
      type: "booking_cancelled",
      title: `Khách hàng hủy đơn #${brief.code}`,
      message: `Khách hàng ${brief.contactName} đã hủy đơn "${brief.serviceName}". Lý do: ${input.reason}`,
      href: providerBookingHref(input.kind, brief.code),
      metadata: { bookingCode: brief.code, kind: input.kind },
    });
  });
}

/**
 * Khi Khách hàng gửi đánh giá mới cho đơn đã hoàn thành:
 * - Gửi thông báo cho Nhà cung cấp.
 */
export function notifyReviewCreated(input: {
  kind: ServiceKind;
  bookingCode: string;
  rating: number;
}) {
  return notifySafe(async () => {
    const brief = await findBookingBrief(input.kind, input.bookingCode);
    if (!brief) return;

    await notificationRepo.create({
      userId: brief.providerUserId,
      type: "review_created",
      title: `Đánh giá mới (${input.rating}★) cho "${brief.serviceName}"`,
      message: `Khách hàng ${brief.contactName} vừa gửi đánh giá ${input.rating} sao cho đơn #${brief.code}.`,
      href: providerReviewHref(input.kind),
      metadata: {
        bookingCode: brief.code,
        kind: input.kind,
        rating: input.rating,
      },
    });
  });
}

/**
 * Khi Nhà cung cấp gửi mới hoặc cập nhật hồ sơ doanh nghiệp sang trạng thái `pending`:
 * - Gửi thông báo cho tất cả Quản trị viên.
 */
export function notifyProfileSubmitted(input: {
  profileId: string;
  businessName: string;
  businessType: string;
  isResubmit?: boolean;
}) {
  return notifySafe(async () => {
    await notificationRepo.notifyAdmins({
      type: "profile_submitted",
      title: input.isResubmit
        ? "Hồ sơ đối tác cập nhật chờ duyệt"
        : "Hồ sơ đối tác mới chờ duyệt",
      message: `Doanh nghiệp "${input.businessName}" vừa gửi hồ sơ xét duyệt.`,
      href: `/admin/profile-approval/${encodeURIComponent(input.profileId)}`,
      metadata: {
        profileId: input.profileId,
        businessType: input.businessType,
      },
    });
  });
}

/**
 * Khi Quản trị viên duyệt một hoặc nhiều hồ sơ doanh nghiệp:
 * - Gửi thông báo cho từng Nhà cung cấp tương ứng.
 */
export function notifyProfilesApproved(profileIds: string[]) {
  return notifySafe(async () => {
    if (profileIds.length === 0) return;
    const profiles = await prisma.providerProfile.findMany({
      where: { id: { in: profileIds } },
      select: { id: true, userId: true, businessName: true },
    });
    await notificationRepo.createMany(
      profiles.map((profile) => ({
        userId: profile.userId,
        type: "profile_approved" as const,
        title: "Hồ sơ doanh nghiệp đã được duyệt",
        message: `Hồ sơ "${profile.businessName}" đã được phê duyệt. Bạn đã có thể đăng bán dịch vụ.`,
        href: `/provider/profiles/${encodeURIComponent(profile.id)}`,
        metadata: { profileId: profile.id },
      }))
    );
  });
}

/**
 * Khi Quản trị viên từ chối hồ sơ doanh nghiệp:
 * - Gửi thông báo kèm lý do cho Nhà cung cấp.
 */
export function notifyProfileRejected(input: {
  profileId: string;
  reason: string;
}) {
  return notifySafe(async () => {
    const profile = await prisma.providerProfile.findUnique({
      where: { id: input.profileId },
      select: { id: true, userId: true, businessName: true },
    });
    if (!profile) return;

    await notificationRepo.create({
      userId: profile.userId,
      type: "profile_rejected",
      title: "Hồ sơ doanh nghiệp bị từ chối",
      message: `Hồ sơ "${profile.businessName}" chưa được duyệt. Lý do: ${input.reason}`,
      href: `/provider/profiles/${encodeURIComponent(profile.id)}`,
      metadata: { profileId: profile.id },
    });
  });
}

/**
 * Cảnh báo khi giao dịch hoàn tiền (Refund) hoặc giải ngân (Payout) bị thất bại:
 * - Gửi cho cả Nhà cung cấp và Quản trị viên.
 */
export function notifyTransferFailed(input: {
  transferType: "refund" | "payout";
  kind: "tour" | "hotel";
  bookingCode: string;
  reason?: string | null;
}) {
  return notifySafe(async () => {
    const brief = await findBookingBrief(input.kind, input.bookingCode);
    if (!brief) return;

    const label =
      input.transferType === "refund" ? "Hoàn tiền" : "Giải ngân (Payout)";
    const reasonText = input.reason?.trim() ? ` (${input.reason.trim()})` : "";
    const title = `Cảnh báo: ${label} thất bại đơn #${brief.code}`;
    const message = `Giao dịch ${label.toLowerCase()} cho đơn "${brief.serviceName}" (#${brief.code}) không thành công${reasonText}.`;

    await Promise.all([
      notificationRepo.create({
        userId: brief.providerUserId,
        type: "transfer_failed",
        title,
        message,
        href: providerBookingHref(input.kind, brief.code),
        metadata: {
          bookingCode: brief.code,
          kind: input.kind,
          transferType: input.transferType,
        },
      }),
      notificationRepo.notifyAdmins({
        type: "transfer_failed",
        title,
        message,
        href: `/admin/bookings/${encodeURIComponent(brief.code)}/invoice`,
        metadata: {
          bookingCode: brief.code,
          kind: input.kind,
          transferType: input.transferType,
        },
      }),
    ]);
  });
}

/**
 * Cảnh báo khi nhận Webhook PayPal báo Refund hoặc Payout thất bại.
 */
export function notifyWebhookTransferFailed(input: {
  transferType: "refund" | "payout";
  idOrGatewayId: {
    id?: string | null;
    gatewayId?: string | null;
    batchId?: string | null;
  };
  reason?: string | null;
}) {
  return notifySafe(async () => {
    if (input.transferType === "refund") {
      const or = [
        ...(input.idOrGatewayId.id ? [{ id: input.idOrGatewayId.id }] : []),
        ...(input.idOrGatewayId.gatewayId
          ? [{ gatewayRefundId: input.idOrGatewayId.gatewayId }]
          : []),
      ];
      if (or.length === 0) return;

      const refund = await prisma.refund.findFirst({
        where: { OR: or },
        select: {
          tourBooking: { select: { code: true } },
          hotelBooking: { select: { code: true } },
        },
      });
      if (refund?.tourBooking) {
        await notifyTransferFailed({
          transferType: "refund",
          kind: "tour",
          bookingCode: refund.tourBooking.code,
          reason: input.reason,
        });
      } else if (refund?.hotelBooking) {
        await notifyTransferFailed({
          transferType: "refund",
          kind: "hotel",
          bookingCode: refund.hotelBooking.code,
          reason: input.reason,
        });
      }
      return;
    }

    const or = [
      ...(input.idOrGatewayId.id ? [{ id: input.idOrGatewayId.id }] : []),
      ...(input.idOrGatewayId.batchId
        ? [{ gatewayBatchId: input.idOrGatewayId.batchId }]
        : []),
    ];
    if (or.length === 0) return;

    const payouts = await prisma.payout.findMany({
      where: { OR: or },
      select: {
        tourBooking: { select: { code: true } },
        hotelBooking: { select: { code: true } },
      },
    });
    for (const payout of payouts) {
      if (payout.tourBooking) {
        await notifyTransferFailed({
          transferType: "payout",
          kind: "tour",
          bookingCode: payout.tourBooking.code,
          reason: input.reason,
        });
      } else if (payout.hotelBooking) {
        await notifyTransferFailed({
          transferType: "payout",
          kind: "hotel",
          bookingCode: payout.hotelBooking.code,
          reason: input.reason,
        });
      }
    }
  });
}

/**
 * Khi Khách hàng bình luận một bài viết giới thiệu:
 * - Gửi thông báo cho tất cả Quản trị viên để kiểm duyệt (ẩn/xoá nếu cần).
 * Bình luận do chính quản trị viên viết thì không cần thông báo.
 */
export function notifyArticleCommentCreated(input: {
  articleId: string;
  articleTitle: string;
  commentId: string;
  commenterName: string;
  commenterRole: string;
  content: string;
}) {
  return notifySafe(async () => {
    if (input.commenterRole === "admin") return;
    const preview =
      input.content.length > 120
        ? `${input.content.slice(0, 117)}…`
        : input.content;

    await notificationRepo.notifyAdmins({
      type: "article_comment_created",
      title: `Bình luận mới: "${input.articleTitle}"`,
      message: `${input.commenterName}: ${preview}`,
      href: `/admin/articles/${encodeURIComponent(input.articleId)}/edit#comments`,
      metadata: { articleId: input.articleId, commentId: input.commentId },
    });
  });
}
