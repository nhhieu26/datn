import { destinationRepo } from "@/entities/destination";
import {
  DestinationIcon,
  DestinationsManager,
  DestinationsSummaryCards,
  getDestinationsSummary,
  mapDestinationToListItem,
} from "@/features/admin/destinations";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Quản lý địa điểm du lịch | Roamly Admin",
  description: "Danh sách địa điểm du lịch trên Roamly.",
};

export default async function AdminDestinationsPage() {
  const destinations = await destinationRepo.findAll();
  const destinationListItems = destinations.map(mapDestinationToListItem);
  const summary = getDestinationsSummary(destinationListItems);

  return (
    <main className="flex-1 overflow-y-auto bg-background-1 font-inter text-foreground">
      <div className="mx-auto w-full max-w-340 space-y-4 p-4 sm:space-y-6 sm:p-6">
        <div className="grid gap-3 md:flex md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Quản lý địa điểm du lịch
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground-1">
              Quản lý toàn bộ địa điểm tham quan đã đăng tải trên Roamly.
            </p>
          </div>
          <Link
            className="inline-flex shrink-0 items-center justify-center gap-x-2 self-start rounded-lg border border-primary-line bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover focus:bg-primary-focus focus:outline-hidden md:self-auto"
            href="/admin/destinations/create"
          >
            <DestinationIcon name="plus" />
            Tạo địa điểm mới
          </Link>
        </div>

        <DestinationsSummaryCards summary={summary} />

        <DestinationsManager destinations={destinationListItems} />
      </div>
    </main>
  );
}
