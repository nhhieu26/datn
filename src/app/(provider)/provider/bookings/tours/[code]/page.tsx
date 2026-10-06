import { providerProfileRepo } from "@/entities/provider-profile";
import { tourBookingRepo } from "@/entities/tour-booking";
import {
  BookingCustomerCard,
  BookingDetailHeader,
  BookingFinancialCard,
  BookingGuestsCard,
  BookingTimeline,
  mapTourBookingToDetail,
} from "@/features/provider/tour-bookings";
import { auth } from "@/lib/auth";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Roamly - Chi tiết đơn đặt tour | Kênh Đối tác",
};

function Card({
  title,
  icon,
  children,
  flush,
}: {
  title?: string;
  icon?: string;
  children: ReactNode;
  flush?: boolean;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
      {title && (
        <h3 className="flex items-center gap-2 px-6 pt-5 text-lg font-extrabold text-slate-900">
          {icon && (
            <span className="material-symbols-outlined text-brand-600">
              {icon}
            </span>
          )}
          {title}
        </h3>
      )}
      <div className={flush ? "pt-4" : "p-6"}>{children}</div>
    </section>
  );
}

export default async function ProviderTourBookingDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const { code } = await params;
  const providerProfile =
    await providerProfileRepo.findApprovedByUserIdAndBusinessType(
      session.user.id,
      "tour",
    );
  if (!providerProfile) notFound();

  await tourBookingRepo.releaseExpired();
  const record = await tourBookingRepo.findByCodeForProvider(
    decodeURIComponent(code),
    providerProfile.id,
  );
  if (!record) notFound();

  const booking = mapTourBookingToDetail(record);
  const note = [
    booking.note && { label: "Ghi chú của khách", text: booking.note },
    booking.cancelReason && { label: "Lý do hủy", text: booking.cancelReason },
  ].filter((n): n is { label: string; text: string } => Boolean(n));

  return (
    <main className="flex-1 overflow-y-auto px-8 py-7">
      <div className="mx-auto flex w-full max-w-7xl flex-col space-y-6">
        <Link
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600"
          href="/provider/bookings/tours"
        >
          <span className="material-symbols-outlined text-[18px]">
            arrow_back
          </span>
          Quay lại đơn đặt tour
        </Link>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="flex flex-col gap-6">
            <Card>
              <div className="flex flex-col gap-6">
                <BookingDetailHeader booking={booking} />
                <div className="border-t border-slate-100 pt-5">
                  <BookingTimeline booking={booking} />
                </div>
              </div>
            </Card>
            <Card flush icon="group" title="Danh sách khách">
              <BookingGuestsCard booking={booking} />
            </Card>
            <Card icon="account_balance_wallet" title="Tổng quan tài chính">
              <div className="pt-4">
                <BookingFinancialCard booking={booking} />
              </div>
            </Card>
          </div>

          <div className="flex flex-col gap-6">
            <Card title="Thông tin khách hàng">
              <BookingCustomerCard booking={booking} />
            </Card>
            {note.map((n) => (
              <div
                className="rounded-2xl border border-amber-200 bg-amber-50 p-5"
                key={n.label}
              >
                <p className="mb-2 text-xs font-bold tracking-wider text-amber-700 uppercase">
                  {n.label}
                </p>
                <p className="text-sm leading-relaxed whitespace-pre-line text-amber-900">
                  {n.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
