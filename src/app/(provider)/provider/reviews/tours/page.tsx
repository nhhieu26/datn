import { auth } from "@/lib/auth";
import {
  ReviewsPageContent,
  parseReviewsQuery,
} from "@/features/provider/reviews";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Roamly - Đánh giá tour | Kênh Đối tác",
};

export default async function ProviderTourReviewsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  return (
    <ReviewsPageContent
      kind="tour"
      userId={session.user.id}
      query={parseReviewsQuery(await searchParams)}
      title="Đánh giá tour"
      description="Xem đánh giá của khách sau khi hoàn thành các tour của bạn."
    />
  );
}
