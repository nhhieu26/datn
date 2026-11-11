import Link from "next/link";
import type { ArticleSummary } from "../lib/view-model";
import { formatArticleDate } from "../lib/view-model";

const cardClass = "rounded-lg border border-new-chip bg-white p-5";

export function ArticlesSidebar({ recent }: { recent: ArticleSummary[] }) {
  return (
    <div className="space-y-6 lg:sticky lg:top-28">
      <div className={cardClass}>
        <h4 className="mb-4 border-b border-new-chip pb-3 text-lg font-bold text-new-title">
          Tìm kiếm
        </h4>
        <form action="/articles" className="relative" role="search">
          <span
            aria-hidden
            className="material-symbols-outlined pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-lg text-new-paragraph"
          >
            search
          </span>
          <input
            aria-label="Tìm bài viết"
            className="block w-full rounded-md border border-new-chip py-2.5 ps-10 pe-3 text-sm focus:border-new-teal focus:ring-new-teal"
            name="q"
            placeholder="Tìm bài viết…"
            type="search"
          />
        </form>

        {recent.length > 0 ? (
          <>
            <h4 className="mt-6 mb-1 border-b border-new-chip pb-3 text-lg font-bold text-new-title">
              Bài viết mới
            </h4>
            <ul className="divide-y divide-new-chip">
              {recent.map((a) => (
                <li className="py-4 last:pb-0" key={a.slug}>
                  <Link className="group block" href={`/articles/${a.slug}`}>
                    <h5 className="mb-2 line-clamp-2 font-bold leading-snug text-new-title transition-colors group-hover:text-new-teal">
                      {a.title}
                    </h5>
                    <div className="flex items-center justify-between text-xs text-new-paragraph">
                      <span className="flex items-center gap-1 text-new-teal">
                        <span aria-hidden className="material-symbols-outlined text-sm">
                          schedule
                        </span>
                        {formatArticleDate(a.publishedAt)}
                      </span>
                      <span>{a.readMinutes} phút đọc</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>

      <div className="relative overflow-hidden rounded-lg bg-new-teal p-7 text-white">
        <p className="mb-2 text-sm text-white/80">Lên đường cùng Roamly</p>
        <h4 className="mb-6 text-3xl leading-tight font-bold">
          Chuyến phiêu lưu tuyệt vời nhất
        </h4>
        <Link
          className="relative z-10 inline-flex rounded-full bg-new-coral px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
          href="/explore?kind=tour"
        >
          Đặt tour ngay
        </Link>
        <span
          aria-hidden
          className="material-symbols-outlined pointer-events-none absolute -end-4 -bottom-6 text-[140px] text-white/10"
        >
          travel_explore
        </span>
      </div>
    </div>
  );
}
