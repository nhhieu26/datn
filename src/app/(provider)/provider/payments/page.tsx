import { providerProfileRepo } from "@/entities/provider-profile";
import { PayPalLinkCard } from "@/features/provider/payments";
import { auth } from "@/lib/auth";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Roamly - Thanh toán PayPal | Kênh Đối tác",
};

const STATUS_MESSAGES: Record<string, { text: string; className: string }> = {
  linked: {
    text: "Liên kết PayPal thành công.",
    className: "bg-emerald-50 text-emerald-700",
  },
  cancelled: {
    text: "Bạn đã hủy liên kết PayPal.",
    className: "bg-amber-50 text-amber-700",
  },
  unverified: {
    text: "Tài khoản PayPal chưa được xác minh nên không thể liên kết.",
    className: "bg-rose-50 text-rose-600",
  },
  error: {
    text: "Không thể liên kết PayPal. Vui lòng thử lại.",
    className: "bg-rose-50 text-rose-600",
  },
};

export default async function ProviderPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const { status } = await searchParams;
  const message = typeof status === "string" ? STATUS_MESSAGES[status] : undefined;
  const profiles = await providerProfileRepo.findAllByUserId(session.user.id);

  return (
    <main className="flex-1 overflow-y-auto px-8 py-7">
      <div className="mx-auto flex w-full max-w-7xl flex-col space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 lg:text-3xl">
            Thanh toán / PayPal
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500">
            Liên kết tài khoản PayPal cho từng hồ sơ doanh nghiệp để nhận tiền
            từ Roamly. Cần liên kết trước khi tạo tour, khách sạn hoặc nhà hàng.
          </p>
        </div>

        {message && (
          <p className={`rounded-xl px-4 py-2.5 text-[13px] font-medium ${message.className}`}>
            {message.text}
          </p>
        )}

        {profiles.length === 0 ? (
          <p className="text-sm text-slate-500">
            Bạn chưa có hồ sơ doanh nghiệp nào. Hãy tạo hồ sơ trước.
          </p>
        ) : (
          <div className="space-y-4">
            {profiles.map((p) => (
              <PayPalLinkCard
                key={p.id}
                item={{
                  id: p.id,
                  businessName: p.businessName,
                  businessType: p.businessType,
                  payoutEmail: p.payoutEmail,
                  linkedAt: p.paypalLinkedAt?.toISOString() ?? null,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
