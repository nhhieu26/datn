import { getInvoice, InvoiceSheet } from "@/features/invoice";
import { auth } from "@/lib/auth";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export const metadata: Metadata = { title: "Hóa đơn — Roamly" };

export default async function CustomerInvoicePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const { code } = await params;
  const invoice = await getInvoice(code, { customerId: session.user.id });
  if (!invoice) notFound();

  return (
    <main className="bg-[#f8f9fc] px-4 py-10 sm:py-14">
      <div className="mx-auto mb-5 flex max-w-220 items-center justify-between print:hidden">
        <Link
          className="inline-flex items-center gap-1 text-sm font-medium text-new-teal-cta hover:underline"
          href={`/bookings/${encodeURIComponent(invoice.code)}`}
        >
          <span aria-hidden className="material-symbols-outlined text-lg!">arrow_back</span>
          Quay lại đơn {invoice.code}
        </Link>
      </div>
      <InvoiceSheet invoice={invoice} />
    </main>
  );
}
