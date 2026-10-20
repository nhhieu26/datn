import { auth } from "@/lib/auth";
import { PENDING_COOKIE, readPendingLink } from "@/lib/paypal-pending";
import { providerProfileRepo } from "@/entities/provider-profile";
import { ProfileForm, ProfileIcon } from "@/features/provider/profiles";
import type { BusinessType } from "@/generated/prisma/client";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Roamly - Tạo Hồ sơ Doanh nghiệp | Kênh Đối tác",
};

const ALL_BUSINESS_TYPES: BusinessType[] = ["tour", "hotel", "restaurant"];

export default async function CreateProfilePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const existingTypes = await providerProfileRepo.findBusinessTypesByUserId(
    session.user.id
  );
  const { paypal: paypalStatus, type: preferredType } = await searchParams;
  // Đưa loại đang chọn ở menu lên đầu để form chọn sẵn loại đó.
  const availableBusinessTypes = ALL_BUSINESS_TYPES.filter(
    (type) => !existingTypes.includes(type)
  ).sort((a, b) => Number(b === preferredType) - Number(a === preferredType));

  if (availableBusinessTypes.length === 0) {
    return (
      <main className="flex-1 overflow-y-auto bg-background-1 font-inter text-foreground">
        <div className="mx-auto w-full max-w-340 p-4 sm:p-6">
          <div className="flex flex-col rounded-xl border border-card-line bg-card shadow-2xs">
            <div className="flex min-h-80 flex-col items-center justify-center p-4 text-center md:p-5">
              <span className="flex size-12 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                <ProfileIcon name="check" className="size-6" />
              </span>
              <h1 className="mt-4 text-base font-semibold text-foreground">
                Bạn đã tạo hồ sơ cho tất cả loại hình kinh doanh
              </h1>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground-1">
                Mỗi tài khoản chỉ có thể tạo một hồ sơ cho mỗi loại hình dịch
                vụ. Quay lại danh sách để theo dõi trạng thái thẩm định.
              </p>
              <Link
                className="mt-5 inline-flex items-center gap-x-2 rounded-lg border border-primary-line bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover focus:bg-primary-focus focus:outline-hidden"
                href="/provider/profiles"
              >
                <ProfileIcon name="arrowLeft" />
                Quay lại danh sách hồ sơ
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const paypal = readPendingLink(
    (await cookies()).get(PENDING_COOKIE)?.value,
    session.user.id
  );

  return (
    <main className="flex-1 overflow-y-auto bg-background-1 font-inter text-foreground">
      <ProfileForm
        availableBusinessTypes={availableBusinessTypes}
        mode="create"
        paypal={paypal}
        paypalStatus={typeof paypalStatus === "string" ? paypalStatus : undefined}
      />
    </main>
  );
}
