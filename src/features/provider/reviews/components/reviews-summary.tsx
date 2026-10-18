import type { ProviderReviewSummary } from "@/entities/review";
import { StarRating } from "./star-rating";

export function ReviewsSummary({ summary }: { summary: ProviderReviewSummary }) {
  const { total, average, distribution } = summary;

  return (
    <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
      <div className="flex flex-col items-center justify-center rounded-xl border border-card-line bg-card p-6 text-center shadow-2xs">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground-1">
          Điểm trung bình
        </p>
        <p className="mt-2 text-5xl font-semibold text-foreground">
          {total ? average.toFixed(1) : "—"}
        </p>
        <div className="mt-3">
          <StarRating value={average} className="size-5" />
        </div>
        <p className="mt-3 text-sm text-muted-foreground-1">
          Dựa trên {total} đánh giá
        </p>
      </div>

      <div className="rounded-xl border border-card-line bg-card p-6 shadow-2xs lg:col-span-2">
        <h2 className="text-base font-semibold text-foreground">
          Phân bố đánh giá
        </h2>
        <ul className="mt-4 space-y-3">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = distribution[star - 1];
            const percent = total ? Math.round((count / total) * 100) : 0;
            return (
              <li key={star} className="flex items-center gap-x-3 text-sm">
                <span className="w-10 shrink-0 text-foreground">{star} ★</span>
                <div
                  className="flex h-2 flex-1 overflow-hidden rounded-full bg-muted"
                  role="progressbar"
                  aria-valuenow={percent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${star} sao`}
                >
                  <div
                    className="flex flex-col justify-center overflow-hidden whitespace-nowrap rounded-full bg-yellow-400"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="w-16 shrink-0 text-end text-muted-foreground-1">
                  {percent}% ({count})
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
