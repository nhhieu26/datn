import { MainFooter, MainHeader } from "@/features/customer/components";

export default function CustomerLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="bg-white text-gray-900 antialiased selection:bg-new-coral selection:text-white">
      <MainHeader />
      {children}
      <MainFooter />
    </div>
  );
}
