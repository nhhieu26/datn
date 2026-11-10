import { auth } from "@/lib/auth";
import { providerProfileRepo } from "@/entities/provider-profile";
import {
  CalendarDayPanel,
  CalendarMonth,
  CalendarServiceSelect,
  buildCalendarDays,
  buildMonthGrid,
  getCalendarEvents,
  getCalendarServiceOptions,
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

const SERVICE_LABELS: Record<BusinessType, { all: string; select: string }> = {
  tour: { all: "Tất cả tour", select: "Chọn tour" },
  hotel: { all: "Tất cả khách sạn", select: "Chọn khách sạn" },
  restaurant: { all: "Tất cả nhà hàng", select: "Chọn nhà hàng" },
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

  const serviceOptions = providerProfile
    ? await getCalendarServiceOptions(kind, providerProfile.id)
    : [];
  // Id không thuộc provider (hoặc đã bị xóa) thì không hiển thị
  if (
    query.service &&
    !serviceOptions.some((option) => option.id === query.service)
  ) {
    notFound();
  }

  const events = providerProfile
    ? await getCalendarEvents(
        kind,
        providerProfile.id,
        grid.from,
        grid.to,
        query.service,
      )
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Lịch đặt chỗ
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground-1">
              {DESCRIPTIONS[kind]}
            </p>
          </div>
          <CalendarServiceSelect
            allLabel={SERVICE_LABELS[kind].all}
            label={SERVICE_LABELS[kind].select}
            month={query.month}
            options={serviceOptions}
            slug={service}
            value={query.service}
          />
        </div>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <CalendarMonth
            slug={service}
            serviceId={query.service}
            month={query.month}
            days={days}
          />
          <CalendarDayPanel
            slug={service}
            serviceId={query.service}
            date={query.date}
            today={today}
            events={selectedEvents}
          />
        </div>
      </div>
    </main>
  );
}
