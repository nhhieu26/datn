"use client";

import {
  ExternalLink,
  FileText,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { ARTICLE_CATEGORY_LABELS } from "@/entities/article/schema";
import type { ArticleCategory } from "@/entities/article/type";
import { formatDate } from "@/lib/utils";
import { deleteArticleAction } from "../actions";
import type { ArticleAdminItem } from "../types";
import {
  dropdownItemClass,
  inputClass,
  layerButtonClass,
  pageButtonClass,
  primaryButtonClass,
} from "./styles";

type HSWindow = Window & { HSDropdown?: { autoInit: () => void } };
type StatusFilter = "all" | "published" | "draft";

const PAGE_SIZE = 10;

function StatusBadge({ published }: { published: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${
        published ? "bg-teal-100 text-teal-800" : "bg-yellow-100 text-yellow-800"
      }`}
    >
      {published ? "Đã xuất bản" : "Bản nháp"}
    </span>
  );
}

function RowActions({
  article,
  onDelete,
}: {
  article: ArticleAdminItem;
  onDelete: (article: ArticleAdminItem) => void;
}) {
  const id = `hs-article-actions-${article.id}`;
  return (
    <div className="hs-dropdown relative inline-flex [--placement:bottom-right]">
      <button
        aria-expanded="false"
        aria-haspopup="menu"
        aria-label="Thao tác"
        className={`hs-dropdown-toggle size-8 ${layerButtonClass} px-0`}
        id={id}
        type="button"
      >
        <MoreHorizontal className="size-4" />
      </button>
      <div
        aria-labelledby={id}
        className="hs-dropdown-menu duration z-20 hidden min-w-48 rounded-xl border border-dropdown-line bg-dropdown opacity-0 shadow-xl transition-[opacity,margin] hs-dropdown-open:opacity-100"
        role="menu"
      >
        <div className="space-y-0.5 p-1">
          <Link className={dropdownItemClass} href={`/admin/articles/${article.id}/edit`}>
            <Pencil className="size-4" />
            Chỉnh sửa
          </Link>
          {article.status === "published" ? (
            <Link
              className={dropdownItemClass}
              href={`/articles/${article.slug}`}
              rel="noreferrer"
              target="_blank"
            >
              <ExternalLink className="size-4" />
              Xem trang công khai
            </Link>
          ) : null}
          <button
            className={`${dropdownItemClass} text-red-600 hover:text-red-700`}
            onClick={() => onDelete(article)}
            type="button"
          >
            <Trash2 className="size-4" />
            Xoá bài viết
          </button>
        </div>
      </div>
    </div>
  );
}

export function ArticlesManager({ articles }: { articles: ArticleAdminItem[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [category, setCategory] = useState<ArticleCategory | "all">("all");
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<ArticleAdminItem | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, startDelete] = useTransition();

  const counts = useMemo(
    () => ({
      all: articles.length,
      published: articles.filter((a) => a.status === "published").length,
      draft: articles.filter((a) => a.status === "draft").length,
    }),
    [articles],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return articles.filter(
      (a) =>
        (status === "all" || a.status === status) &&
        (category === "all" || a.category === category) &&
        (!q ||
          a.title.toLowerCase().includes(q) ||
          a.excerpt.toLowerCase().includes(q)),
    );
  }, [articles, search, status, category]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const rows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    (window as HSWindow).HSDropdown?.autoInit();
  }, [rows]);

  const confirmDelete = () => {
    if (!pendingDelete) return;
    setDeleteError(null);
    startDelete(async () => {
      const result = await deleteArticleAction(pendingDelete.id);
      if (result.status === "error") {
        setDeleteError(result.formError ?? "Không thể xoá bài viết.");
        return;
      }
      setPendingDelete(null);
      router.refresh();
    });
  };

  return (
    <div className="mx-auto w-full max-w-340 space-y-4 p-4 sm:space-y-6 sm:p-6">
      <div className="grid gap-3 md:flex md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Bài viết giới thiệu</h1>
          <p className="mt-1 text-sm text-muted-foreground-1">
            Quản lý cẩm nang, giới thiệu điểm đến và kinh nghiệm du lịch.
          </p>
        </div>
        <Link className={`${primaryButtonClass} self-start`} href="/admin/articles/create">
          <Plus className="size-4" />
          Viết bài mới
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {(
          [
            ["Tổng bài viết", counts.all, "bg-primary-100 text-primary-700"],
            ["Đã xuất bản", counts.published, "bg-teal-100 text-teal-700"],
            ["Bản nháp", counts.draft, "bg-yellow-100 text-yellow-700"],
          ] as const
        ).map(([label, value, iconClass]) => (
          <div
            className="flex items-center gap-x-4 rounded-xl border border-card-line bg-card p-4 shadow-2xs"
            key={label}
          >
            <span className={`flex size-11 items-center justify-center rounded-lg ${iconClass}`}>
              <FileText className="size-5" />
            </span>
            <div>
              <p className="text-xs font-medium text-muted-foreground-1 uppercase">{label}</p>
              <p className="text-xl font-semibold text-foreground">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col rounded-xl border border-card-line bg-card shadow-2xs">
        <div className="space-y-3 border-b border-card-divider p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground-1" />
              <input
                className={`${inputClass} ps-10`}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Tìm theo tiêu đề, tóm tắt…"
                value={search}
              />
            </div>
            <select
              aria-label="Lọc theo danh mục"
              className={`${inputClass} pe-9 sm:w-56`}
              onChange={(e) => {
                setCategory(e.target.value as ArticleCategory | "all");
                setPage(1);
              }}
              value={category}
            >
              <option value="all">Tất cả danh mục</option>
              {Object.entries(ARTICLE_CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <nav className="flex w-fit max-w-full gap-x-1 overflow-x-auto rounded-lg bg-surface p-1" role="tablist">
            {(
              [
                ["all", "Tất cả", counts.all],
                ["published", "Đã xuất bản", counts.published],
                ["draft", "Bản nháp", counts.draft],
              ] as const
            ).map(([value, label, count]) => {
              const active = status === value;
              return (
                <button
                  aria-selected={active}
                  className={`inline-flex items-center gap-x-2 rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap focus:outline-hidden ${
                    active
                      ? "bg-layer text-layer-foreground shadow-2xs"
                      : "text-muted-foreground-2 hover:text-foreground"
                  }`}
                  key={value}
                  onClick={() => {
                    setStatus(value);
                    setPage(1);
                  }}
                  role="tab"
                  type="button"
                >
                  {label}
                  <span
                    className={`inline-flex min-w-5 justify-center rounded-full px-1.5 py-0.5 text-xs ${
                      active ? "bg-primary text-primary-foreground" : "bg-surface-1 text-surface-foreground"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-table-line">
            <thead className="bg-muted">
              <tr>
                {["Bài viết", "Danh mục", "Trạng thái", "Lượt xem", "Bình luận", "Ngày xuất bản", ""].map(
                  (label, i) => (
                    <th
                      className={`px-6 py-3 whitespace-nowrap ${i === 6 ? "text-end" : "text-start"}`}
                      key={label || i}
                      scope="col"
                    >
                      <span className="text-xs font-semibold text-foreground uppercase">
                        {label || "Thao tác"}
                      </span>
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-table-line">
              {rows.length === 0 ? (
                <tr>
                  <td className="px-6 py-10 text-center text-sm text-muted-foreground-1" colSpan={7}>
                    Chưa có bài viết nào phù hợp.
                  </td>
                </tr>
              ) : (
                rows.map((a) => (
                  <tr key={a.id}>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-x-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          alt=""
                          className="h-12 w-18 shrink-0 rounded-md object-cover"
                          src={a.coverUrl}
                        />
                        <div className="min-w-0 max-w-md">
                          <Link
                            className="line-clamp-1 text-sm font-semibold text-foreground hover:text-primary"
                            href={`/admin/articles/${a.id}/edit`}
                          >
                            {a.title}
                          </Link>
                          <p className="line-clamp-1 text-xs text-muted-foreground-1">
                            {a.authorName} · {a.readMinutes} phút đọc
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm whitespace-nowrap text-foreground">
                      {ARTICLE_CATEGORY_LABELS[a.category]}
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge published={a.status === "published"} />
                    </td>
                    <td className="px-6 py-3 text-sm text-foreground">{a.viewCount}</td>
                    <td className="px-6 py-3 text-sm text-foreground">
                      <span className="inline-flex items-center gap-x-1.5">
                        <MessageSquare className="size-3.5 text-muted-foreground-1" />
                        {a.commentCount}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm whitespace-nowrap text-muted-foreground-1">
                      {a.publishedAt ? formatDate(a.publishedAt) : "—"}
                    </td>
                    <td className="px-6 py-3 text-end">
                      <RowActions article={a} onDelete={setPendingDelete} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 ? (
          <div className="flex items-center justify-between gap-3 border-t border-card-divider px-4 py-3">
            <p className="text-sm text-muted-foreground-1">
              {filtered.length} bài viết · Trang {currentPage}/{totalPages}
            </p>
            <div className="flex gap-1">
              <button
                className={pageButtonClass}
                disabled={currentPage === 1}
                onClick={() => setPage(currentPage - 1)}
                type="button"
              >
                Trước
              </button>
              <button
                className={pageButtonClass}
                disabled={currentPage === totalPages}
                onClick={() => setPage(currentPage + 1)}
                type="button"
              >
                Sau
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {pendingDelete ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-80 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
        >
          <div className="w-full max-w-md rounded-xl border border-card-line bg-card p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-foreground">Xoá bài viết?</h3>
            <p className="mt-2 text-sm text-muted-foreground-1">
              Bài &ldquo;{pendingDelete.title}&rdquo; cùng toàn bộ bình luận sẽ bị xoá vĩnh viễn và
              không thể khôi phục.
            </p>
            {deleteError ? <p className="mt-3 text-sm text-red-600">{deleteError}</p> : null}
            <div className="mt-5 flex justify-end gap-2">
              <button
                className={layerButtonClass}
                disabled={isDeleting}
                onClick={() => {
                  setPendingDelete(null);
                  setDeleteError(null);
                }}
                type="button"
              >
                Huỷ
              </button>
              <button
                className="inline-flex items-center gap-x-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                disabled={isDeleting}
                onClick={confirmDelete}
                type="button"
              >
                <Trash2 className="size-4" />
                {isDeleting ? "Đang xoá…" : "Xoá"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
