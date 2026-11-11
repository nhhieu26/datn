import type { Metadata } from "next";
import { provinceRepo } from "@/entities/province";
import { tagRepo } from "@/entities/tag";
import { ArticleForm } from "@/features/admin/articles";

export const metadata: Metadata = {
  title: "Viết bài mới | Roamly Admin",
};

export default async function CreateArticlePage() {
  const [provinces, tags] = await Promise.all([
    provinceRepo.findAll(),
    tagRepo.findAll(),
  ]);
  return (
    <main className="flex-1 overflow-y-auto bg-background-1 font-inter text-foreground">
      <ArticleForm provinces={provinces} tags={tags} />
    </main>
  );
}
