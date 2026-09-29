import {
  CustomerAccountHeader,
  CustomerSidebar,
} from "@/features/customer/account";
import { auth } from "@/lib/auth";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Roamly - Hồ sơ của tôi",
};

export default async function AccountLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");
  if (session.user.role !== "customer") redirect("/");

  return (
    <div className="account-shell flex h-dvh w-full overflow-hidden bg-[#f5f6f8] font-sans text-slate-800 antialiased">
      <CustomerSidebar />
      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        <CustomerAccountHeader user={session.user} />
        {children}
      </div>
    </div>
  );
}
