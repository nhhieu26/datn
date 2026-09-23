import { auth } from "@/lib/auth";
import {
  MOCK_TOURS,
  ToursManager,
  ToursSummaryCards,
  getToursSummary,
} from "@/features/provider/tours";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Roamly - Quản lý Tour du lịch | Kênh Đối tác",
};

export default async function ProviderToursPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const summary = getToursSummary(MOCK_TOURS);

  return (
    <main className="flex-1 overflow-y-auto px-8 py-7">
      <div className="mx-auto flex w-full max-w-7xl flex-col space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 lg:text-3xl">
              Quản lý Tour du lịch
            </h1>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500">
              Quản lý, theo dõi trạng thái hoạt động và tình trạng đặt chỗ của
              các tour du lịch trên Roamly.
            </p>
          </div>
          <div className="shrink-0">
            <Link
              className="inline-flex transform items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-500/20 transition hover:bg-brand-600 hover:shadow-brand-500/30 active:scale-95"
              href="/provider/tours/create"
            >
              <span className="material-symbols-outlined text-[20px]">
                add_circle
              </span>
              <span>Tạo Tour mới</span>
            </Link>
          </div>
        </div>

        <ToursSummaryCards summary={summary} />

        <ToursManager tours={MOCK_TOURS} />
      </div>
    </main>
  );
}
