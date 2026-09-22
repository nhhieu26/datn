import { auth } from "@/lib/auth";
import { providerProfileRepo } from "@/entities/provider-profile";
import { ProfileForm } from "@/features/provider/profiles";
import type { BusinessType } from "@/generated/prisma/client";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Roamly - Tạo Hồ sơ Doanh nghiệp | Kênh Đối tác",
};

const ALL_BUSINESS_TYPES: BusinessType[] = ["tour", "hotel", "restaurant"];

export default async function CreateProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const existingTypes = await providerProfileRepo.findBusinessTypesByUserId(
    session.user.id
  );
  const availableBusinessTypes = ALL_BUSINESS_TYPES.filter(
    (type) => !existingTypes.includes(type)
  );

  if (availableBusinessTypes.length === 0) {
    return (
      <main className="flex-1 overflow-y-auto px-8 py-7">
        <div className="mx-auto flex w-full max-w-2xl flex-col items-center space-y-4 rounded-2xl border border-slate-200/80 bg-white p-10 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-500">
            <span className="material-symbols-outlined text-[28px]">
              check_circle
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            Bạn đã tạo hồ sơ cho tất cả loại hình kinh doanh
          </h1>
          <p className="text-sm text-slate-500">
            Mỗi tài khoản chỉ có thể tạo một hồ sơ cho mỗi loại hình dịch vụ.
            Quay lại danh sách để theo dõi trạng thái thẩm định.
          </p>
          <Link
            className="inline-flex items-center gap-2 rounded-2xl bg-brand-500 px-6 py-3 text-sm font-bold text-white shadow-md shadow-brand-500/25 transition-all hover:bg-brand-600 active:scale-95"
            href="/provider/profiles"
          >
            Quay lại danh sách hồ sơ
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto px-8 py-7">
      <ProfileForm availableBusinessTypes={availableBusinessTypes} mode="create" />
    </main>
  );
}
