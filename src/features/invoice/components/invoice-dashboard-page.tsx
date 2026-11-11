import Link from "next/link";
import type { InvoiceData } from "../types";
import { InvoiceSheet } from "./invoice-sheet";

/** Khung trang hóa đơn trong layout quản trị (nhà cung cấp / admin). */
export function InvoiceDashboardPage({
  invoice,
  backHref,
  backLabel,
}: {
  invoice: InvoiceData;
  backHref: string;
  backLabel: string;
}) {
  return (
    <main className="flex-1 overflow-y-auto bg-background-1 font-inter text-foreground">
      <div className="mx-auto w-full max-w-340 space-y-5 p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
          <h1 className="text-2xl font-semibold text-foreground">Hóa đơn {invoice.code}</h1>
          <Link
            className="inline-flex w-fit items-center gap-x-2 rounded-lg border border-layer-line bg-layer px-3 py-2 text-sm font-medium text-layer-foreground shadow-2xs hover:bg-layer-hover focus:bg-layer-focus focus:outline-hidden"
            href={backHref}
          >
            ← {backLabel}
          </Link>
        </div>
        <InvoiceSheet invoice={invoice} />
      </div>
    </main>
  );
}
