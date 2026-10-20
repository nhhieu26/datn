import { auth } from "@/lib/auth";
import { providerProfileRepo } from "@/entities/provider-profile";
import {
  CalendarDayPanel,
  CalendarMonth,
  buildCalendarDays,
  buildMonthGrid,
  getCalendarEvents,
  parseCalendarQuery,
} from "@/features/provider/calendar";
import type { BusinessType } from "@/generated/prisma/client";
import { todayIsoDate } from "@/lib/utils";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Roamly - Lịch đặt chỗ | Kênh Đối tác",
};

const SERVICE_KINDS: Record<string, BusinessType> = {
  tours: "tour",
  hotels: "hotel",
  restaurants: "restaurant",
};

const DESCRIPTIONS: Record<BusinessType, string> = {
  tour: "Xem các đơn đặt tour theo ngày khởi hành.",
  hotel: "Xem các đơn đặt phòng theo từng đêm lưu trú.",
  restaurant: "Xem các đơn đặt bàn theo ngày và khung giờ.",
};

export default async function ProviderCalendarPage({
  params,
  searchParams,
}: {
  params: Promise<{ service: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const { service } = await params;
  const kind = SERVICE_KINDS[service];
  if (!kind) notFound();

  const today = todayIsoDate();
  const query = parseCalendarQuery(await searchParams, today);
  const grid = buildMonthGrid(query.month);

  const providerProfile =
    await providerProfileRepo.findApprovedByUserIdAndBusinessType(
      session.user.id,
      kind,
    );
  const events = providerProfile
    ? await getCalendarEvents(kind, providerProfile.id, grid.from, grid.to)
    : [];

  const days = buildCalendarDays(grid.days, events, {
    month: query.month,
    selected: query.date,
    today,
  });
  const selectedEvents = days.find((d) => d.isSelected)?.events ?? [];

  return (
    <main className="flex-1 overflow-y-auto bg-background-1 font-inter text-foreground">
      <div className="mx-auto w-full max-w-340 space-y-4 p-4 sm:space-y-6 sm:p-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Lịch đặt chỗ
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground-1">
            {DESCRIPTIONS[kind]}
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <CalendarMonth slug={service} month={query.month} days={days} />
          <CalendarDayPanel
            slug={service}
            date={query.date}
            today={today}
            events={selectedEvents}
          />
        </div>
      </div>
    </main>
  );
}
