import { auth } from "@/lib/auth";
import {
  ReviewsPageContent,
  parseReviewsQuery,
} from "@/features/provider/reviews";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Roamly - Đánh giá khách sạn | Kênh Đối tác",
};

export default async function ProviderHotelReviewsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  return (
    <ReviewsPageContent
      kind="hotel"
      userId={session.user.id}
      query={parseReviewsQuery(await searchParams)}
      title="Đánh giá khách sạn"
      description="Xem đánh giá của khách sau khi lưu trú tại khách sạn của bạn."
    />
  );
}
