import type { Metadata } from "next";
import { articleRepo } from "@/entities/article";
import { ArticlesManager, toArticleAdminItem } from "@/features/admin/articles";

export const metadata: Metadata = {
  title: "Quản lý bài viết | Roamly Admin",
  description: "Danh sách bài viết giới thiệu trên Roamly.",
};

export default async function AdminArticlesPage() {
  const articles = await articleRepo.findAllForAdmin();
  return (
    <main className="flex-1 overflow-y-auto bg-background-1 font-inter text-foreground">
      <ArticlesManager articles={articles.map(toArticleAdminItem)} />
    </main>
  );
}
