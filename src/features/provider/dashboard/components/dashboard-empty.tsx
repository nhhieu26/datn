import Link from "next/link";
import type { BusinessType } from "@/generated/prisma/client";
import { getServiceMeta } from "@/features/provider/utils";

export function DashboardEmpty({ kind }: { kind: BusinessType }) {
  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-6">
      <div className="mx-auto mt-10 flex max-w-lg flex-col items-center rounded-xl border border-card-line bg-card p-8 text-center shadow-2xs">
        <h1 className="text-lg font-semibold text-foreground">Chưa có hồ sơ được duyệt</h1>
        <p className="mt-2 text-sm text-muted-foreground-1">
          Bạn chưa có hồ sơ doanh nghiệp được duyệt cho loại dịch vụ{" "}
          <span className="font-medium text-foreground">{getServiceMeta(kind).label}</span>. Hoàn tất
          hồ sơ để bắt đầu theo dõi hoạt động kinh doanh.
        </p>
        <Link
          href={`/provider/profiles?type=${kind}`}
          className="mt-5 inline-flex items-center gap-x-2 rounded-lg border border-transparent bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover focus:bg-primary-focus focus:outline-hidden"
        >
          Đến Hồ sơ doanh nghiệp
        </Link>
      </div>
    </main>
  );
}
