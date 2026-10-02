import { MainFooter, MainHeader } from "@/features/customer/components";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="bg-white text-gray-900 antialiased selection:bg-new-coral selection:text-white">
      <MainHeader />
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-4">
        {children}
      </div>
      <MainFooter />
    </div>
  );
}
