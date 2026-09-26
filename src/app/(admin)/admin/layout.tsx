import { AdminHeader, AdminSidebar } from "@/features/admin";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Roamly - Trung tâm Quản trị",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="admin-shell flex h-dvh w-full overflow-hidden bg-slate-50 font-sans text-slate-800 antialiased">
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />
      <AdminSidebar />
      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        <AdminHeader />
        {children}
      </div>
    </div>
  );
}
