import { auth } from "@/lib/auth";
import { providerProfileRepo } from "@/entities/provider-profile";
import {
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
    <main className="flex-1 overflow-y-auto px-8 py-7">
      <div className="mx-auto flex w-full max-w-7xl flex-col space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 lg:text-3xl">
              Hồ sơ Doanh nghiệp
            </h1>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500">
              Quản lý và theo dõi trạng thái thẩm định hồ sơ cho từng phân hệ
              dịch vụ kinh doanh trên Roamly.
            </p>
          </div>
          <div className="shrink-0">
            <Link
              className="inline-flex transform items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-500/20 transition hover:bg-brand-600 hover:shadow-brand-500/30 active:scale-95"
              href="/provider/profiles/create"
            >
              <span className="material-symbols-outlined text-[20px]">
                add_circle
              </span>
              <span>Thêm hồ sơ mới</span>
            </Link>
          </div>
        </div>

        <ProfilesSummaryCards summary={summary} />

        <div className="flex items-start gap-3.5 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/70 to-indigo-50/40 p-4 shadow-sm">
          <div className="mt-0.5 shrink-0 rounded-lg bg-blue-500/10 p-1.5 text-blue-600">
            <span className="material-symbols-outlined text-[20px]">info</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-700 sm:text-sm">
            <strong className="font-semibold text-slate-900">
              Quy tắc hồ sơ dịch vụ:
            </strong>{" "}
            Mỗi danh mục tương ứng một hồ sơ độc lập. Bạn có thể cấu hình thông
            tin riêng cho từng phân hệ (Tour du lịch, Khách sạn &amp; Lưu trú,
            Nhà hàng &amp; Ẩm thực) để tối ưu vận hành và thuế suất.
          </p>
        </div>

        <ProfilesTable profiles={profiles} />
      </div>
    </main>
  );
}
