import Image from "next/image";
import Link from "next/link";
import type { ArticleSummary } from "../lib/view-model";
import { AuthorAvatar } from "./author-avatar";

export function ArticleCard({ article }: { article: ArticleSummary }) {
  return (
    <Link className="block h-full" href={`/articles/${article.slug}`}>
      <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-new-chip bg-white transition-all duration-300 hover:-translate-y-1.5 hover:border-new-teal/30 hover:shadow-xl">
        <div className="relative h-[200px] overflow-hidden">
          <Image
            alt={article.title}
            className="object-cover transition-transform duration-[800ms] group-hover:scale-105"
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
            src={article.coverUrl}
          />
        </div>
        <div className="flex flex-1 flex-col px-[18px] pt-5 pb-[18px]">
          <p className="mb-1.5 text-sm text-new-teal">{article.categoryLabel}</p>
          <h3 className="mb-5 line-clamp-2 text-lg leading-[1.4] font-bold text-new-title transition-colors group-hover:text-new-teal-cta">
            {article.title}
          </h3>
          <div className="mt-auto flex items-center justify-between gap-3 text-sm text-new-paragraph">
            <div className="flex min-w-0 items-center gap-2">
              <AuthorAvatar name={article.authorName} />
              <span className="truncate">{article.authorName}</span>
            </div>
            <span className="shrink-0">{article.readMinutes} phút đọc</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
