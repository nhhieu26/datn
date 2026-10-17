import { auth } from "@/lib/auth";
import { providerProfileRepo } from "@/entities/provider-profile";
import {
  ProfileIcon,
  ProfilesSummaryCards,
  ProfilesTable,
} from "@/features/provider/profiles";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Roamly - Quản lý Hồ sơ Doanh nghiệp | Kênh Đối tác",
};

export default async function ProviderProfilesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const profiles = await providerProfileRepo.findAllByUserId(session.user.id);

  const summary = {
    total: profiles.length,
    approved: profiles.filter((p) => p.approvalStatus === "approved").length,
    pending: profiles.filter((p) => p.approvalStatus === "pending").length,
    rejected: profiles.filter(
      (p) =>
        p.approvalStatus === "rejected" || p.approvalStatus === "not_submitted"
    ).length,
  };

  return (
    <main className="flex-1 overflow-y-auto bg-background-1 font-inter text-foreground">
      <div className="mx-auto w-full max-w-340 space-y-4 p-4 sm:space-y-6 sm:p-6">
        <div className="grid gap-3 md:flex md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Hồ sơ Doanh nghiệp
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground-1">
              Quản lý và theo dõi trạng thái thẩm định hồ sơ cho từng phân hệ
              dịch vụ kinh doanh trên Roamly.
            </p>
          </div>
          <Link
            className="inline-flex shrink-0 items-center gap-x-2 self-start rounded-lg border border-primary-line bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover focus:bg-primary-focus focus:outline-hidden md:self-auto"
            href="/provider/profiles/create"
          >
            <ProfileIcon name="plus" />
            Thêm hồ sơ mới
          </Link>
        </div>

        <ProfilesSummaryCards summary={summary} />

        <div
          className="rounded-lg border border-primary-200 bg-primary-50 p-4 text-sm text-primary-800"
          role="alert"
        >
          <div className="flex">
            <ProfileIcon name="info" className="mt-0.5 size-4" />
            <div className="ms-3">
              <h3 className="font-semibold">Quy tắc hồ sơ dịch vụ</h3>
              <p className="mt-1 text-primary-700">
                Mỗi danh mục tương ứng một hồ sơ độc lập. Bạn có thể cấu hình
                thông tin riêng cho từng phân hệ (Tour du lịch, Khách sạn &amp;
                Lưu trú, Nhà hàng &amp; Ẩm thực) để tối ưu vận hành và thuế
                suất.
              </p>
            </div>
          </div>
        </div>

        <ProfilesTable profiles={profiles} />
      </div>
    </main>
  );
}
