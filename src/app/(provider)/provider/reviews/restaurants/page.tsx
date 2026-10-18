import { auth } from "@/lib/auth";
import {
  ReviewsPageContent,
  parseReviewsQuery,
} from "@/features/provider/reviews";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Roamly - Đánh giá nhà hàng | Kênh Đối tác",
};

export default async function ProviderRestaurantReviewsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  return (
    <ReviewsPageContent
      kind="restaurant"
      userId={session.user.id}
      query={parseReviewsQuery(await searchParams)}
      title="Đánh giá nhà hàng"
      description="Xem đánh giá của khách sau khi dùng bữa tại nhà hàng của bạn."
    />
  );
}
