import { destinationRepo } from "@/entities/destination";
import {
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
    <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 lg:text-3xl">
              Quản lý địa điểm du lịch
            </h1>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500">
              Quản lý toàn bộ địa điểm tham quan đã đăng tải trên Roamly.
            </p>
          </div>
          <div className="shrink-0">
            <Link
              className="inline-flex transform items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-500/20 transition hover:bg-brand-600 hover:shadow-brand-500/30 active:scale-95"
              href="/admin/destinations/create"
            >
              <span className="material-symbols-outlined text-[20px]">
                add_circle
              </span>
              <span>Tạo địa điểm mới</span>
            </Link>
          </div>
        </div>

        <DestinationsSummaryCards summary={summary} />

        <DestinationsManager destinations={destinationListItems} />
      </div>
    </main>
  );
}
