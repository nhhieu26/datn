import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { cache } from "react";
import { articleRepo, coverUrlOf } from "@/entities/article";
import {
  ArticleCard,
  ArticleComments,
  ArticleContent,
  ArticleMeta,
  ArticlesSidebar,
  ArticleTagsShare,
  AuthorBox,
  toArticleSummary,
} from "@/features/customer/articles";
import { FadeIn } from "@/features/customer/components/motion";
import { PageBanner } from "@/features/customer/components/page-banner";
import { auth } from "@/lib/auth";

const getArticle = cache((slug: string) => articleRepo.findPublishedBySlug(slug));

export async function generateMetadata({
  params,
}: PageProps<"/articles/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: "Không tìm thấy bài viết" };
  return {
    title: `${article.title} — Roamly`,
    description: article.excerpt,
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt,
      images: [coverUrlOf(article.coverImage)],
      publishedTime: article.publishedAt?.toISOString(),
    },
  };
}

export default async function ArticleDetailPage({
  params,
}: PageProps<"/articles/[slug]">) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const [comments, recentRows, relatedRows, session] = await Promise.all([
    articleRepo.findVisibleComments(article.id),
    articleRepo.findRecent(3, article.id),
    articleRepo.findRelated(article, 3),
    auth(),
    articleRepo.incrementView(article.id).catch(() => null),
  ]);

  return (
    <main>
      <PageBanner
        items={[
          { label: "Trang chủ", href: "/" },
          { label: "Bài viết", href: "/articles" },
          { label: "Chi tiết bài viết" },
        ]}
        title="Chi tiết bài viết"
      />
      <section className="page-x py-12 lg:py-[70px]">
        <div className="grid gap-8 lg:grid-cols-[2fr_1fr] xl:gap-10">
          <article className="min-w-0 space-y-10">
            <FadeIn duration={0.5} inView={false} y={14}>
              <div className="relative aspect-[16/10] overflow-hidden rounded-lg">
                <Image
                  alt={article.title}
                  className="object-cover"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  src={coverUrlOf(article.coverImage)}
                />
              </div>
              <div className="mt-6">
                <ArticleMeta
                  authorName={article.author.fullname}
                  publishedAt={article.publishedAt}
                  readMinutes={article.readMinutes}
                />
                <h2 className="mt-4 text-2xl leading-snug font-bold text-new-title sm:text-[28px]">
                  {article.title}
                </h2>
                {article.province ? (
                  <p className="mt-2 flex items-center gap-1 text-sm text-new-teal">
                    <span aria-hidden className="material-symbols-outlined text-base">
                      location_on
                    </span>
                    {article.province.name}
                  </p>
                ) : null}
              </div>
            </FadeIn>

            <ArticleContent html={article.content} />

            <ArticleTagsShare
              tags={article.tags.map((t) => t.tag.name)}
              title={article.title}
            />

            <AuthorBox name={article.author.fullname} />

            <ArticleComments
              articleId={article.id}
              comments={comments}
              isSignedIn={Boolean(session?.user)}
              slug={article.slug}
            />
          </article>

          <aside>
            <ArticlesSidebar recent={recentRows.map(toArticleSummary)} />
          </aside>
        </div>

        {relatedRows.length > 0 ? (
          <div className="mt-16">
            <h2 className="mb-6 text-2xl font-bold text-new-title">Bài viết liên quan</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedRows.map((row) => (
                <ArticleCard article={toArticleSummary(row)} key={row.id} />
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
