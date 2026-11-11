import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { articleRepo } from "@/entities/article";
import { provinceRepo } from "@/entities/province";
import { tagRepo } from "@/entities/tag";
import {
  ArticleCommentsPanel,
  ArticleForm,
  coverUrlOf,
} from "@/features/admin/articles";

export const metadata: Metadata = {
  title: "Chỉnh sửa bài viết | Roamly Admin",
};

export default async function EditArticlePage({
  params,
  searchParams,
}: PageProps<"/admin/articles/[id]/edit">) {
  const { id } = await params;
  const { saved } = await searchParams;
  const [article, comments, provinces, tags] = await Promise.all([
    articleRepo.findById(id),
    articleRepo.findAllComments(id),
    provinceRepo.findAll(),
    tagRepo.findAll(),
  ]);
  if (!article) notFound();

  return (
    <main className="flex-1 overflow-y-auto bg-background-1 font-inter text-foreground">
      <ArticleForm
        articleId={article.id}
        initialValues={{
          title: article.title,
          excerpt: article.excerpt,
          content: article.content,
          category: article.category,
          status: article.status,
          provinceId: article.provinceId ?? "",
          tagIds: article.tags.map((t) => t.tagId),
          coverUrl: coverUrlOf(article.coverImage),
        }}
        justCreated={saved === "1"}
        mode="edit"
        provinces={provinces}
        slug={article.slug}
        tags={tags}
      />
      <ArticleCommentsPanel
        comments={comments.map((c) => ({
          id: c.id,
          authorName: c.user.fullname,
          content: c.content,
          status: c.status,
          moderationSource: c.moderationSource,
          moderationReason: c.moderationReason,
          moderationCategories: c.moderationCategories,
          createdAt: c.createdAt.toISOString(),
        }))}
      />
    </main>
  );
}
