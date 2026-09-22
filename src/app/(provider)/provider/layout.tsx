import { ProviderHeader, ProviderSidebar } from "@/features/provider";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Roamly - Kênh Đối tác",
};

export default function ProviderLayout({ children }: { children: ReactNode }) {
  return (
    <div className="provider-shell flex h-dvh w-full overflow-hidden bg-[#F8FAFC] font-sans text-slate-800 antialiased">
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />
      <ProviderSidebar />
      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        <ProviderHeader />
        {children}
      </div>
    </div>
  );
}
