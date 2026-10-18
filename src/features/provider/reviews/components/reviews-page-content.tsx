import { reviewRepo, type ReviewKind } from "@/entities/review";
import { providerProfileRepo } from "@/entities/provider-profile";
import { redirect } from "next/navigation";
import {
  REVIEWS_PAGE_SIZE,
  buildReviewsUrl,
  toReviewFilter,
  type ReviewsQuery,
} from "../search-params";
import { ReviewsList } from "./reviews-list";
import { ReviewsSummary } from "./reviews-summary";

export async function ReviewsPageContent({
  kind,
  userId,
  query,
  title,
  description,
}: {
  kind: ReviewKind;
  userId: string;
  query: ReviewsQuery;
  title: string;
  description: string;
}) {
  const profile = await providerProfileRepo.findApprovedByUserIdAndBusinessType(
    userId,
    kind,
  );

  const [{ items, total }, summary] = profile
    ? await Promise.all([
        reviewRepo.findPageByProviderProfileId(
          kind,
          profile.id,
          toReviewFilter(query),
          {
            skip: (query.page - 1) * REVIEWS_PAGE_SIZE,
            take: REVIEWS_PAGE_SIZE,
          },
        ),
        reviewRepo.summarizeByProviderProfileId(kind, profile.id),
      ])
    : [
        { items: [], total: 0 },
        { total: 0, average: 0, distribution: [0, 0, 0, 0, 0] as [number, number, number, number, number] },
      ];

  const totalPages = Math.max(1, Math.ceil(total / REVIEWS_PAGE_SIZE));
  if (query.page > totalPages) {
    redirect(buildReviewsUrl(query, { page: totalPages }));
  }

  return (
    <main className="flex-1 overflow-y-auto bg-background-1 font-inter text-foreground">
      <div className="mx-auto w-full max-w-340 space-y-4 p-4 sm:space-y-6 sm:p-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground-1">
            {description}
          </p>
        </div>
        <ReviewsSummary summary={summary} />
        <ReviewsList
          kind={kind}
          items={items}
          query={query}
          total={total}
          page={query.page}
          pageSize={REVIEWS_PAGE_SIZE}
        />
      </div>
    </main>
  );
}
