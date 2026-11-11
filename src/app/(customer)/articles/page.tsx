import type { Metadata } from "next";
import Link from "next/link";
import { articleRepo } from "@/entities/article";
import {
  ArticleCard,
  ArticlesFeatured,
  ARTICLES_PAGE_SIZE,
  buildArticlesUrl,
  CategoryChips,
  parseArticlesQuery,
  toArticleSummary,
} from "@/features/customer/articles";
import { FadeIn } from "@/features/customer/components/motion";
import { PageBanner } from "@/features/customer/components/page-banner";

export const metadata: Metadata = {
  title: "Bài viết du lịch — Roamly",
  description:
    "Cẩm nang, giới thiệu điểm đến, ẩm thực và kinh nghiệm du lịch Việt Nam từ Roamly.",
};

const FEATURED_COUNT = 3;

export default async function ArticlesPage({ searchParams }: PageProps<"/articles">) {
  const query = parseArticlesQuery(await searchParams);
  const isFiltering = Boolean(query.q || query.category);

  // Không lọc: 3 bài mới nhất làm khối nổi bật, lưới bắt đầu từ bài thứ 4
  const skip = isFiltering ? 0 : FEATURED_COUNT;
  const [featuredRows, { items, total }] = await Promise.all([
    isFiltering ? Promise.resolve([]) : articleRepo.findRecent(FEATURED_COUNT),
    articleRepo.findPublishedPaged({
      q: query.q || undefined,
      category: query.category,
      skip,
      take: query.limit,
    }),
  ]);
  const featured = featuredRows.map(toArticleSummary);
  const articles = items.map(toArticleSummary);
  const hasMore = skip + articles.length < total;
  const isEmpty = featured.length === 0 && articles.length === 0;

  return (
    <main>
      <PageBanner
        items={[{ label: "Trang chủ", href: "/" }, { label: "Bài viết" }]}
        title="Bài viết"
      />
      <section className="page-x py-12 lg:py-[70px]">
        {featured.length > 0 ? (
          <FadeIn duration={0.5} inView={false} y={14}>
            <ArticlesFeatured articles={featured} />
          </FadeIn>
        ) : null}

        <div
          className={`flex flex-col gap-4 md:flex-row md:items-center md:justify-between ${
            featured.length > 0 ? "mt-14" : ""
          }`}
        >
          <CategoryChips query={query} />
          {query.q ? (
            <p className="text-sm text-new-paragraph">
              {total} kết quả cho &ldquo;
              <span className="font-semibold text-new-title">{query.q}</span>&rdquo;
              {" · "}
              <Link
                className="text-new-teal hover:underline"
                href={buildArticlesUrl({ category: query.category })}
              >
                Xoá tìm kiếm
              </Link>
            </p>
          ) : null}
        </div>

        {isEmpty ? (
          <div className="mt-10 rounded-lg border border-dashed border-new-chip py-16 text-center text-new-paragraph">
            <span aria-hidden className="material-symbols-outlined mb-2 text-4xl text-new-teal">
              article
            </span>
            <p>Chưa có bài viết phù hợp.</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article, i) => (
              <FadeIn delay={(i % 3) * 0.06} key={article.slug} y={16}>
                <ArticleCard article={article} />
              </FadeIn>
            ))}
          </div>
        )}

        {hasMore ? (
          <div className="mt-12 flex justify-center">
            <Link
              className="inline-flex items-center gap-2 rounded-md bg-new-teal px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-new-teal-cta"
              href={buildArticlesUrl({ ...query, limit: query.limit + ARTICLES_PAGE_SIZE })}
              scroll={false}
            >
              <span aria-hidden className="material-symbols-outlined text-lg">
                autorenew
              </span>
              Xem thêm
            </Link>
          </div>
        ) : null}
      </section>
    </main>
  );
}
