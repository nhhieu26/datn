import { providerProfileRepo } from "@/entities/provider-profile";
import { getInvoice, InvoiceDashboardPage, invoiceKindOf } from "@/features/invoice";
import { auth } from "@/lib/auth";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Roamly - Hóa đơn đặt phòng | Kênh Đối tác",
};

export default async function ProviderHotelInvoicePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const { code } = await params;
  if (invoiceKindOf(decodeURIComponent(code)) !== "hotel") notFound();

  const providerProfile =
    await providerProfileRepo.findApprovedByUserIdAndBusinessType(session.user.id, "hotel");
  if (!providerProfile) notFound();

  const invoice = await getInvoice(code, { providerProfileId: providerProfile.id });
  if (!invoice) notFound();

  return (
    <InvoiceDashboardPage
      backHref={`/provider/bookings/hotels/${encodeURIComponent(invoice.code)}`}
      backLabel="Quay lại chi tiết đơn"
      invoice={invoice}
    />
  );
}
