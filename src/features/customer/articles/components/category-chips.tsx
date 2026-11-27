import Link from "next/link";
import { ARTICLE_CATEGORIES, ARTICLE_CATEGORY_LABELS } from "@/entities/article/schema";
import { buildArticlesUrl, type ArticlesQuery } from "../lib/search-params";

export function CategoryChips({ query }: { query: ArticlesQuery }) {
  const items = [
    { value: undefined, label: "Tất cả" },
    ...ARTICLE_CATEGORIES.map((c) => ({ value: c, label: ARTICLE_CATEGORY_LABELS[c] })),
  ];
  return (
    <nav aria-label="Danh mục bài viết" className="flex flex-wrap gap-2">
      {items.map((item) => {
        const active = query.category === item.value;
        return (
          <Link
            aria-current={active ? "page" : undefined}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              active
                ? "border-new-teal bg-new-teal text-white"
                : "border-new-chip bg-white text-new-title hover:border-new-teal hover:text-new-teal"
            }`}
            href={buildArticlesUrl({ q: query.q, category: item.value })}
            key={item.label}
            scroll={false}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
