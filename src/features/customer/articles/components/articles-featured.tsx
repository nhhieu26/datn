"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { ArticleSummary } from "../lib/view-model";
import { AuthorAvatar } from "./author-avatar";

/** Khối nổi bật (news.html): ảnh lớn bên trái + 3 bài bên phải; rê chuột đổi ảnh. */
export function ArticlesFeatured({ articles }: { articles: ArticleSummary[] }) {
  const [active, setActive] = useState(0);
  if (articles.length === 0) return null;
  const current = articles[active] ?? articles[0];

  return (
    <div className="grid gap-6 lg:grid-cols-[1.42fr_1fr]">
      <Link
        className="group relative block min-h-[280px] overflow-hidden rounded-lg sm:min-h-[360px] lg:min-h-[468px]"
        href={`/articles/${current.slug}`}
      >
        {articles.map((article, i) => (
          <Image
            alt={article.title}
            className={`object-cover transition-all duration-700 group-hover:scale-105 ${
              i === active ? "opacity-100" : "opacity-0"
            }`}
            fill
            key={article.slug}
            priority={i === 0}
            sizes="(max-width: 1024px) 100vw, 60vw"
            src={article.coverUrl}
          />
        ))}
        <span className="sr-only">{current.title}</span>
      </Link>

      <ul className="flex flex-col gap-2">
        {articles.map((article, i) => (
          <li key={article.slug}>
            <Link
              className={`block rounded-lg px-4 py-4 transition-colors ${
                i === active
                  ? "bg-linear-to-b from-new-teal/15 to-white shadow-sm"
                  : "hover:bg-new-teal/5"
              }`}
              href={`/articles/${article.slug}`}
              onFocus={() => setActive(i)}
              onMouseEnter={() => setActive(i)}
            >
              <p className="mb-1.5 text-sm text-new-teal">{article.categoryLabel}</p>
              <h3 className="mb-4 line-clamp-2 text-lg leading-[1.4] font-bold text-new-title">
                {article.title}
              </h3>
              <div className="flex items-center justify-between gap-3 text-sm text-new-paragraph">
                <div className="flex min-w-0 items-center gap-2">
                  <AuthorAvatar name={article.authorName} />
                  <span className="truncate">{article.authorName}</span>
                </div>
                <span className="shrink-0">{article.readMinutes} phút đọc</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
