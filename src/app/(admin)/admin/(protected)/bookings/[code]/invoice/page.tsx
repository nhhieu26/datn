import { getInvoice, InvoiceDashboardPage } from "@/features/invoice";
import { auth } from "@/lib/auth";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Hóa đơn đặt chỗ | Roamly Admin",
};

export default async function AdminInvoicePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const session = await auth();
  if (session?.user?.role !== "admin") redirect("/admin/sign-in");

  const { code } = await params;
  const invoice = await getInvoice(code, { all: true });
  if (!invoice) notFound();

  return <InvoiceDashboardPage backHref="/admin" backLabel="Về tổng quan" invoice={invoice} />;
}
