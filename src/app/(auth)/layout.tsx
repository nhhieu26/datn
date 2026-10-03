import { MainFooter, MainHeader } from "@/features/customer/components";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="bg-white text-gray-900 antialiased selection:bg-new-coral selection:text-white">
      <MainHeader />
      <div className="page-x py-4">{children}</div>
      <MainFooter />
    </div>
  );
}
