import { PopularPackagesSection } from "@/features/customer/landing";
import { RECOMMENDED_COPY } from "@/features/customer/landing/lib/package-copy";
import { auth } from "@/lib/auth";
import { getRecommendations } from "../lib/recommend";

/** Khu "Dành cho bạn" trên trang chủ; không hiển thị gì khi chưa đăng nhập hoặc chưa có lịch sử. */
export async function RecommendedSection() {
  const session = await auth();
  if (session?.user?.role !== "customer" || !session.user.id) return null;

  const packages = await getRecommendations(session.user.id);
  if (!packages) return null;

  return (
    <PopularPackagesSection
      copyByKind={RECOMMENDED_COPY}
      hideEmptyTabs
      id="recommended-packages"
      packages={packages}
    />
  );
}
