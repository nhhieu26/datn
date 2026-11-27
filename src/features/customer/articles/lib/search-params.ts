import { ARTICLE_CATEGORIES } from "@/entities/article/schema";
import type { ArticleCategory } from "@/entities/article/type";

export const ARTICLES_PAGE_SIZE = 9;
const MAX_LIMIT = 90;

export type ArticlesQuery = {
  q: string;
  category?: ArticleCategory;
  limit: number;
};

type RawParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

export function parseArticlesQuery(raw: RawParams): ArticlesQuery {
  const category = first(raw.category);
  const limit = Math.floor(Number(first(raw.limit)));
  return {
    q: first(raw.q).slice(0, 100),
    category: (ARTICLE_CATEGORIES as readonly string[]).includes(category)
      ? (category as ArticleCategory)
      : undefined,
    limit:
      limit >= ARTICLES_PAGE_SIZE
        ? Math.min(limit, MAX_LIMIT)
        : ARTICLES_PAGE_SIZE,
  };
}

export function buildArticlesUrl(query: Partial<ArticlesQuery>): string {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.category) params.set("category", query.category);
  if (query.limit && query.limit > ARTICLES_PAGE_SIZE) {
    params.set("limit", String(query.limit));
  }
  const qs = params.toString();
  return qs ? `/articles?${qs}` : "/articles";
}
