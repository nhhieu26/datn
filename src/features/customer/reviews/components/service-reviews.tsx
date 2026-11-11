import Link from "next/link";
import { reviewRepo, type ReviewKind } from "@/entities/review";
import { auth } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { SERVICE_PATH } from "../paths";
import { ReviewForm } from "./review-form";
import { ReviewList } from "./review-list";

export const REVIEWS_PAGE_SIZE = 5;

/** Đọc số review cần hiện từ searchParam `reviews` (bội số của page size). */
export function parseReviewsTake(value: string | string[] | undefined) {
  const n = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(n) && n > REVIEWS_PAGE_SIZE
    ? Math.min(n, 100)
    : REVIEWS_PAGE_SIZE;
}

export async function ServiceReviews({
  kind,
  serviceId,
  slug,
  total,
  take,
}: {
  kind: ReviewKind;
  serviceId: string;
  slug: string;
  total: number;
  take: number;
}) {
  const [reviews, session] = await Promise.all([
    reviewRepo.findManyByService(kind, serviceId, take),
    auth(),
  ]);
  const user = session?.user;
  const [bookings, ownUnpublished] =
    user?.role === "customer"
      ? await Promise.all([
          reviewRepo.findReviewableBookings(user.id, kind, serviceId),
          reviewRepo.findOwnUnpublished(user.id, kind, serviceId),
        ])
      : [[], []];

  const moreHref =
    reviews.length < total
      ? `${SERVICE_PATH[kind]}/${slug}?reviews=${take + REVIEWS_PAGE_SIZE}#reviews`
      : null;

  return (
    <section className="scroll-mt-28" id="reviews">
      <ReviewList moreHref={moreHref} reviews={reviews} total={total} />
      {ownUnpublished.length > 0 ? (
        <ul className="mt-6 flex flex-col gap-3">
          {ownUnpublished.map((r) => (
            <li
              className={`rounded-lg border px-5 py-4 text-sm ${
                r.status === "pending"
                  ? "border-amber-200 bg-amber-50 text-amber-800"
                  : "border-rose-200 bg-rose-50 text-rose-800"
              }`}
              key={r.id}
            >
              <p className="font-semibold">
                {r.status === "pending"
                  ? "Đánh giá của bạn đang chờ kiểm duyệt"
                  : "Đánh giá của bạn không được hiển thị do vi phạm tiêu chuẩn cộng đồng"}
              </p>
              {r.status === "rejected" && r.moderationReason ? (
                <p className="mt-1">Lý do: {r.moderationReason}</p>
              ) : null}
              <p className="mt-2 line-clamp-2 italic opacity-80">
                {r.rating}★ · “{r.content}”
              </p>
            </li>
          ))}
        </ul>
      ) : null}
      {bookings.length > 0 ? (
        <ReviewForm
          bookings={bookings.map((b) => ({
            code: b.code,
            label: formatDate(b.date),
          }))}
          kind={kind}
        />
      ) : !user ? (
        <p className="mt-10 rounded-lg bg-new-chip px-5 py-6 text-sm text-new-paragraph sm:px-10">
          <Link
            className="font-semibold text-new-teal-cta hover:underline"
            href="/sign-in"
          >
            Đăng nhập
          </Link>{" "}
          và hoàn thành đơn đặt để viết đánh giá.
        </p>
      ) : null}
    </section>
  );
}
