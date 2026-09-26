import { ProviderHeader, ProviderSidebar } from "@/features/provider";
import { auth } from "@/lib/auth";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Roamly - Kênh Đối tác",
};

export default async function ProviderLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");
  if (session.user.role !== "provider") redirect("/");

  return (
    <div className="provider-shell flex h-dvh w-full overflow-hidden bg-[#F8FAFC] font-sans text-slate-800 antialiased">
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />
      <ProviderSidebar user={session.user} />
      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        <ProviderHeader user={session.user} />
        {children}
      </div>
    </div>
  );
}
