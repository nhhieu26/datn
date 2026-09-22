import { MainFooter, MainHeader } from "@/features/customer/components";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="bg-[#FBFBFC] text-gray-900 antialiased selection:bg-[#FF5C39] selection:text-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-4">
        <MainHeader />
        {children}
        <MainFooter />
      </div>
    </div>
  );
}
