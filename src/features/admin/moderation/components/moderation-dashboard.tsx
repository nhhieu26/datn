"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { setArticleCommentStatusAction } from "@/features/admin/articles/actions";
import { ApprovalIcon } from "@/features/admin/profile-approval/components/approval-icon";
import {
  inputClass,
  layerButtonClass,
} from "@/features/admin/profile-approval/components/approval-shared";
import { SettingsToast } from "@/features/admin/settings/components/settings-shared";
import { UsersPagination } from "@/features/admin/users/components/users-pagination";
import { categoryLabel } from "@/lib/moderation/types";
import { formatDateTime } from "@/lib/utils";
import { setReviewStatusAction } from "../actions";
import {
  buildModerationUrl,
  hasActiveFilters,
  MODERATION_PAGE_SIZE,
  MODERATION_PATH,
  type ModerationQuery,
} from "../search-params";
import type { ModerationRow, ModerationRowSource, ModerationRowStatus, ModerationSummary } from "../types";
import { ModerationSummaryCards } from "./moderation-summary-cards";

const STATUS_META: Record<ModerationRowStatus, { label: string; className: string }> = {
  pending: { label: "Chờ duyệt", className: "bg-yellow-100 text-yellow-800" },
  rejected: { label: "Đã ẩn", className: "bg-red-100 text-red-800" },
  approved: { label: "Đã duyệt", className: "bg-teal-100 text-teal-800" },
};

const SOURCE_LABEL: Record<ModerationRowSource, string> = {
  keyword: "Bộ lọc từ khóa",
  ai: "AI",
  admin: "Quản trị viên",
  fallback: "AI lỗi → chờ duyệt",
};

const TABS: { value: ModerationQuery["tab"]; label: string }[] = [
  { value: "reviews", label: "Đánh giá dịch vụ" },
  { value: "comments", label: "Bình luận bài viết" },
];

export function ModerationDashboard({
  rows,
  total,
  summary,
  query,
}: {
  rows: ModerationRow[];
  total: number;
  summary: ModerationSummary;
  query: ModerationQuery;
}) {
  const router = useRouter();
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [isNavigating, startNavigation] = useTransition();
  const [, startAction] = useTransition();

  const totalPages = Math.max(1, Math.ceil(total / MODERATION_PAGE_SIZE));
  const firstIndex = total === 0 ? 0 : (query.page - 1) * MODERATION_PAGE_SIZE + 1;
  const lastIndex = firstIndex === 0 ? 0 : firstIndex + rows.length - 1;

  const navigate = (url: string) => startNavigation(() => router.push(url));

  const setStatus = (row: ModerationRow, status: "approved" | "rejected") => {
    setBusyId(row.id);
    setError("");
    startAction(async () => {
      const result =
        row.target === "review"
          ? await setReviewStatusAction(row.id, status)
          : await setArticleCommentStatusAction(row.id, status);
      setBusyId(null);
      if (result.status === "error") {
        setError(result.formError ?? "Thao tác thất bại.");
        return;
      }
      setToast(status === "approved" ? "Đã duyệt nội dung." : "Đã ẩn nội dung.");
      router.refresh();
    });
  };

  return (
    <main className="flex-1 overflow-y-auto bg-background-1 font-inter text-foreground">
      <div className="mx-auto w-full max-w-340 space-y-4 p-4 sm:space-y-6 sm:p-6">
        {toast ? <SettingsToast message={toast} onClose={() => setToast("")} /> : null}

        <div>
          <h1 className="text-2xl font-semibold text-foreground">Kiểm duyệt nội dung</h1>
          <p className="mt-1 text-sm text-muted-foreground-1">
            Đánh giá và bình luận được lọc từ khóa rồi phân tích bằng AI khi gửi. Nội dung AI chưa
            chắc chắn hoặc tự động ẩn sẽ xuất hiện ở đây để quản trị viên xem xét.
          </p>
        </div>

        <ModerationSummaryCards summary={summary} />

        <section
          aria-busy={isNavigating}
          className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-card-line bg-card shadow-2xs"
        >
          <div className="flex gap-x-1 overflow-x-auto border-b border-card-line px-4 pt-3 sm:px-6">
            {TABS.map((tab) => {
              const active = tab.value === query.tab;
              const pending = tab.value === "reviews" ? summary.pendingReviews : summary.pendingComments;
              return (
                <Link
                  aria-current={active ? "page" : undefined}
                  className={`-mb-px inline-flex items-center gap-x-2 border-b-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap ${
                    active
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground-1 hover:text-foreground"
                  }`}
                  href={buildModerationUrl(query, { tab: tab.value })}
                  key={tab.value}
                >
                  {tab.label}
                  {pending > 0 ? (
                    <span className="rounded-full bg-yellow-100 px-1.5 py-0.5 text-xs text-yellow-800">
                      {pending}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>

          <FilterBar key={`${query.tab}-${query.q}`} onNavigate={navigate} query={query} />

          {error ? <p className="px-6 pt-3 text-sm text-red-600">{error}</p> : null}

          <div className={isNavigating ? "opacity-60 transition-opacity" : ""}>
            {rows.length === 0 ? (
              <p className="px-6 py-12 text-center text-sm text-muted-foreground-1">
                {hasActiveFilters(query)
                  ? "Không có nội dung nào khớp bộ lọc."
                  : "Không có nội dung nào đang chờ duyệt."}
              </p>
            ) : (
              <ul className="divide-y divide-card-line">
                {rows.map((row) => (
                  <ModerationItem
                    busy={busyId === row.id}
                    key={row.id}
                    onSetStatus={(status) => setStatus(row, status)}
                    row={row}
                  />
                ))}
              </ul>
            )}
          </div>

          <div className="grid gap-3 border-t border-card-line px-6 py-4 md:flex md:items-center md:justify-between">
            <p className="text-sm text-muted-foreground-1">
              Hiển thị{" "}
              <span className="font-semibold text-foreground">
                {firstIndex}–{lastIndex}
              </span>{" "}
              / {total} nội dung
            </p>
            <UsersPagination
              href={(page) => buildModerationUrl(query, { page })}
              page={query.page}
              totalPages={totalPages}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function FilterBar({
  query,
  onNavigate,
}: {
  query: ModerationQuery;
  onNavigate: (url: string) => void;
}) {
  const [search, setSearch] = useState(query.q);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onNavigate(buildModerationUrl(query, { q: search.trim() }));
  };

  return (
    <div className="grid gap-3 border-b border-card-line px-6 py-4 md:flex md:items-center md:justify-between">
      <form className="flex w-full items-center gap-2 md:max-w-md" onSubmit={handleSubmit} role="search">
        <div className="relative grow">
          <div className="pointer-events-none absolute inset-y-0 start-0 z-20 flex items-center ps-3.5">
            <ApprovalIcon className="size-4 text-muted-foreground" name="search" />
          </div>
          <label className="sr-only" htmlFor="hs-moderation-search">
            Tìm nội dung
          </label>
          <input
            className={`${inputClass} w-full ps-10 pe-4`}
            id="hs-moderation-search"
            maxLength={100}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm theo nội dung, tên người viết..."
            type="search"
            value={search}
          />
        </div>
        <button className={`px-3 py-2 ${layerButtonClass}`} type="submit">
          Tìm
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <select
          aria-label="Lọc theo trạng thái"
          className={`${inputClass} ps-3 pe-9`}
          onChange={(event) =>
            onNavigate(
              buildModerationUrl(query, { status: event.target.value as ModerationQuery["status"] }),
            )
          }
          value={query.status}
        >
          <option value="pending">Chờ duyệt</option>
          <option value="rejected">Đã ẩn</option>
          <option value="approved">Đã duyệt</option>
          <option value="all">Tất cả trạng thái</option>
        </select>
        <select
          aria-label="Lọc theo nguồn quyết định"
          className={`${inputClass} ps-3 pe-9`}
          onChange={(event) =>
            onNavigate(
              buildModerationUrl(query, { source: event.target.value as ModerationQuery["source"] }),
            )
          }
          value={query.source}
        >
          <option value="all">Mọi nguồn quyết định</option>
          <option value="ai">AI</option>
          <option value="fallback">AI lỗi</option>
          <option value="admin">Quản trị viên</option>
        </select>
        {hasActiveFilters(query) ? (
          <Link
            className={`px-3 py-2 ${layerButtonClass}`}
            href={query.tab === "reviews" ? MODERATION_PATH : `${MODERATION_PATH}?tab=${query.tab}`}
          >
            <ApprovalIcon name="reset" />
            Đặt lại
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function ModerationItem({
  row,
  busy,
  onSetStatus,
}: {
  row: ModerationRow;
  busy: boolean;
  onSetStatus: (status: "approved" | "rejected") => void;
}) {
  const status = STATUS_META[row.status];

  return (
    <li className="flex flex-col gap-3 px-6 py-4 lg:flex-row lg:items-start">
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          <span className="font-semibold text-foreground">{row.authorName}</span>
          <span className="text-xs text-muted-foreground-1">{row.authorEmail}</span>
          <span className="text-xs text-muted-foreground-1">· {formatDateTime(row.createdAt)}</span>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}
          >
            {status.label}
          </span>
        </div>

        <p className="text-xs text-muted-foreground-1">
          {row.subjectLabel}:{" "}
          {row.subjectHref ? (
            <Link className="font-medium text-primary hover:underline" href={row.subjectHref} target="_blank">
              {row.subject}
            </Link>
          ) : (
            <span className="font-medium text-foreground">{row.subject}</span>
          )}
          {row.bookingCode ? <> · Đơn #{row.bookingCode}</> : null}
          {row.rating ? <> · {row.rating}★</> : null}
        </p>

        <p className="rounded-lg bg-surface px-3 py-2 text-sm whitespace-pre-line text-foreground">
          {row.content}
        </p>

        {row.source || row.categories.length > 0 || row.reason ? (
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {row.source ? (
              <span className="rounded-md border border-line-2 px-2 py-0.5 font-medium text-muted-foreground-2">
                {SOURCE_LABEL[row.source]}
              </span>
            ) : null}
            {row.categories.map((c) => (
              <span className="rounded-md bg-orange-50 px-2 py-0.5 font-medium text-orange-700" key={c}>
                {categoryLabel(c)}
              </span>
            ))}
            {row.reason ? <span className="text-muted-foreground-1">{row.reason}</span> : null}
          </div>
        ) : null}
      </div>

      <div className="flex shrink-0 gap-2">
        {row.status !== "approved" ? (
          <button
            className={`px-3 py-2 ${layerButtonClass} text-teal-700`}
            disabled={busy}
            onClick={() => onSetStatus("approved")}
            type="button"
          >
            <ApprovalIcon name="check" />
            Duyệt
          </button>
        ) : null}
        {row.status !== "rejected" ? (
          <button
            className={`px-3 py-2 ${layerButtonClass} text-red-600`}
            disabled={busy}
            onClick={() => onSetStatus("rejected")}
            type="button"
          >
            <ApprovalIcon name="ban" />
            Ẩn
          </button>
        ) : null}
      </div>
    </li>
  );
}
