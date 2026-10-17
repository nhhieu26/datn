import { auth } from "@/lib/auth";
import { tourRepo } from "@/entities/tour";
import { providerProfileRepo } from "@/entities/provider-profile";
import {
  TourIcon,
  ToursManager,
  ToursSummaryCards,
  getToursSummary,
  mapTourToListItem,
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

  const providerProfile =
    await providerProfileRepo.findApprovedByUserIdAndBusinessType(
      session.user.id,
      "tour",
    );

  const tours = providerProfile
    ? await tourRepo.findAllByProviderProfileId(providerProfile.id)
    : [];
  const tourListItems = tours.map(mapTourToListItem);

  const summary = getToursSummary(tourListItems);

  return (
    <main className="flex-1 overflow-y-auto bg-background-1 font-inter text-foreground">
      <div className="mx-auto w-full max-w-340 space-y-4 p-4 sm:space-y-6 sm:p-6">
        <div className="grid gap-3 md:flex md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Quản lý Tour du lịch
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground-1">
              Quản lý, theo dõi trạng thái hoạt động và tình trạng đặt chỗ của
              các tour du lịch trên Roamly.
            </p>
          </div>
          <Link
            className="inline-flex shrink-0 items-center gap-x-2 self-start rounded-lg border border-primary-line bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover focus:bg-primary-focus focus:outline-hidden md:self-auto"
            href="/provider/tours/create"
          >
            <TourIcon name="plus" />
            Tạo Tour mới
          </Link>
        </div>

        <ToursSummaryCards summary={summary} />

        <ToursManager tours={tourListItems} />
      </div>
    </main>
  );
}
