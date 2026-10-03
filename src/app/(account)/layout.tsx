import { tagRepo } from "@/entities/tag";
import { userRepo } from "@/entities/user";
import { CustomerSidebar } from "@/features/customer/account";
import { MainFooter, MainHeader } from "@/features/customer/components";
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

  const [user, tags] = await Promise.all([
    userRepo.findProfileById(session.user.id),
    tagRepo.findAll(),
  ]);
  if (!user) redirect("/sign-in");

  const savedTags = (user.preferences as { tags?: unknown })?.tags;
  const selectedTags = Array.isArray(savedTags)
    ? savedTags.filter(
        (tag): tag is string =>
          typeof tag === "string" && tags.some((item) => item.name === tag),
      )
    : [];

  return (
    <div className="bg-white font-sans text-slate-800 antialiased">
      <MainHeader />
      <main className="page-x py-10">
        <div className="flex flex-col gap-[30px] lg:flex-row lg:items-start">
          <CustomerSidebar
            fullname={user.fullname}
            tags={tags}
            selectedTags={selectedTags}
          />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </main>
      <MainFooter />
    </div>
  );
}
