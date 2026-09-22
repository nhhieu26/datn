import { MainFooter } from "@/features/khach-hang/components/main-footer";
import { MainHeader } from "@/features/khach-hang/components/main-header";

export default function KhachHangLayout({
  children,
}: LayoutProps<"/khach-hang">) {
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
