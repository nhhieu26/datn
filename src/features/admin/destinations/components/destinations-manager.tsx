"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { DestinationListItem } from "../types";

const PAGE_SIZE_OPTIONS = [6, 12, 24];

function StatusBadge({ isPublished }: { isPublished: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold shadow-xs whitespace-nowrap ${
        isPublished
          ? "border-emerald-200/80 bg-emerald-50 text-emerald-700"
          : "border-slate-200/80 bg-slate-100 text-slate-600"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isPublished ? "bg-emerald-500" : "bg-slate-400"
        }`}
      />
      {isPublished ? "Đã xuất bản" : "Bản nháp"}
    </span>
  );
}

function DestinationRow({ destination }: { destination: DestinationListItem }) {
  return (
    <tr className="transition-colors hover:bg-slate-50/70">
      <td className="px-5 py-5 align-middle">
        <div className="flex items-center gap-3.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={destination.name}
            className="h-12 w-12 shrink-0 rounded-xl object-cover shadow-sm ring-1 ring-slate-200/80"
            src={destination.imageUrl}
          />
          <div className="flex min-w-0 flex-col">
            <span className="font-mono text-[11px] font-bold tracking-wider text-brand-500 uppercase">
              {destination.code}
            </span>
            <span className="truncate text-sm font-bold text-slate-900">
              {destination.name}
            </span>
            <span className="mt-0.5 max-w-[220px] truncate text-xs text-slate-500">
              {destination.category}
            </span>
          </div>
        </div>
      </td>

      <td className="px-4 py-5 align-middle">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-900">
            {destination.provinceName}
          </span>
          <span className="mt-0.5 max-w-[240px] truncate text-xs text-slate-400">
            {destination.address}
          </span>
        </div>
      </td>

      <td className="px-4 py-5 align-middle whitespace-nowrap">
        <span className="text-sm font-bold text-slate-900">
          {destination.ticketPrice === null
            ? "Miễn phí"
            : formatCurrency(destination.ticketPrice)}
        </span>
      </td>

      <td className="px-4 py-5 align-middle whitespace-nowrap">
        <StatusBadge isPublished={destination.isPublished} />
      </td>

      <td className="px-5 py-5 align-middle whitespace-nowrap">
        <span className="text-sm text-slate-600">
          {formatDate(destination.createdAt)}
        </span>
      </td>
    </tr>
  );
}

function DestinationCard({ destination }: { destination: DestinationListItem }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:shadow-lg">
      <div className="relative h-48 overflow-hidden bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={destination.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          src={destination.imageUrl}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold shadow-sm ${
              destination.isPublished
                ? "border-emerald-200/80 bg-emerald-50 text-emerald-700"
                : "border-slate-200/80 bg-slate-100 text-slate-600"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                destination.isPublished ? "bg-emerald-500" : "bg-slate-400"
              }`}
            />
            {destination.isPublished ? "Đã xuất bản" : "Bản nháp"}
          </span>
        </div>
        <div className="absolute right-3 bottom-3 left-3 flex items-center justify-between text-white">
          <span className="font-mono text-[11px] font-extrabold tracking-wider text-amber-300 uppercase">
            {destination.code}
          </span>
          <span className="text-xs opacity-90">
            {destination.provinceName}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between space-y-4 p-5">
        <div className="space-y-2">
          <h3 className="line-clamp-2 text-[15px] font-bold text-slate-900 transition-colors group-hover:text-brand-600">
            {destination.name}
          </h3>
          <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">
            {destination.description}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {destination.category
              .split(", ")
              .slice(0, 3)
              .map((tagName) => (
                <span
                  className="inline-block rounded-full border border-emerald-200/60 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700"
                  key={tagName}
                >
                  {tagName}
                </span>
              ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-baseline justify-between rounded-xl bg-slate-50 px-3.5 py-2">
            <span className="text-xs text-slate-500">Giá vé tham quan</span>
            <span className="text-base font-bold text-brand-600">
              {destination.ticketPrice === null
                ? "Miễn phí"
                : formatCurrency(destination.ticketPrice)}
            </span>
          </div>
          <p className="text-[11px] font-medium text-slate-400">
            {destination.address}
          </p>
        </div>
      </div>
    </div>
  );
}

function DestinationsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200/80 bg-white p-12 text-center shadow-sm">
      <span className="material-symbols-outlined text-[40px] text-slate-300">
        travel_explore
      </span>
      <h3 className="text-base font-bold text-slate-900">
        Chưa có địa điểm du lịch nào
      </h3>
      <p className="max-w-sm text-sm text-slate-500">
        Tạo địa điểm đầu tiên để giới thiệu điểm tham quan tới du khách.
      </p>
      <Link
        className="mt-1 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-500/20 transition hover:bg-brand-600"
        href="/admin/destinations/create"
      >
        <span className="material-symbols-outlined text-[20px]">
          add_circle
        </span>
        Tạo Địa điểm mới
      </Link>
    </div>
  );
}

export function DestinationsManager({
  destinations,
}: {
  destinations: DestinationListItem[];
}) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">(
    "all"
  );
  const [view, setView] = useState<"table" | "card">("table");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  const categories = useMemo(
    () =>
      [
        ...new Set(
          destinations
            .map((destination) => destination.category)
            .filter((category) => category !== "Chưa phân loại")
            .flatMap((category) => category.split(", "))
        ),
      ].sort(),
    [destinations]
  );

  const filteredDestinations = useMemo(() => {
    const query = search.trim().toLowerCase();
    return destinations.filter((destination) => {
      const matchesSearch =
        query.length === 0 ||
        destination.name.toLowerCase().includes(query) ||
        destination.code.toLowerCase().includes(query) ||
        destination.provinceName.toLowerCase().includes(query) ||
        destination.address.toLowerCase().includes(query);
      const matchesCategory =
        categoryFilter === "all" ||
        destination.category.includes(categoryFilter);
      const matchesStatus =
        statusFilter === "all" || destination.isPublished === (statusFilter === "published");
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [destinations, search, categoryFilter, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredDestinations.length / pageSize)
  );
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedDestinations = filteredDestinations.slice(
    startIndex,
    startIndex + pageSize
  );

  const handleReset = () => {
    setSearch("");
    setCategoryFilter("all");
    setStatusFilter("all");
    setPage(1);
  };

  const statusFilters: { value: "all" | "published" | "draft"; label: string }[] = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "published", label: "Đã xuất bản" },
    { value: "draft", label: "Bản nháp" },
  ];

  if (destinations.length === 0) {
    return <DestinationsEmptyState />;
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="flex flex-col items-stretch gap-3 border-b border-slate-200/80 p-4 lg:flex-row lg:items-center">
        <div className="flex items-center self-start rounded-full border border-slate-200 bg-slate-50 p-1 lg:self-center">
          <button
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
              view === "table"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
            onClick={() => setView("table")}
            type="button"
          >
            <span
              className={`material-symbols-outlined text-[18px] ${
                view === "table" ? "text-brand-500" : ""
              }`}
            >
              table_rows
            </span>
            Bảng
          </button>
          <button
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
              view === "card"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
            onClick={() => setView("card")}
            type="button"
          >
            <span
              className={`material-symbols-outlined text-[18px] ${
                view === "card" ? "text-brand-500" : ""
              }`}
            >
              grid_view
            </span>
            Thẻ
          </button>
        </div>

        <div className="flex flex-1 flex-col items-center gap-2.5 sm:flex-row">
          <div className="relative w-full sm:flex-1">
            <span className="material-symbols-outlined absolute top-1/2 left-3.5 -translate-y-1/2 text-[20px] text-slate-400">
              search
            </span>
            <input
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-4 pl-10 text-sm text-slate-800 transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Tìm kiếm theo tên, mã, tỉnh/thành, địa chỉ..."
              type="text"
              value={search}
            />
          </div>
          <div className="relative w-full sm:w-auto">
            <select
              className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-8 pl-3.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100/70 focus:border-brand-500 focus:outline-none sm:w-auto"
              onChange={(event) => {
                setCategoryFilter(event.target.value);
                setPage(1);
              }}
              value={categoryFilter}
            >
              <option value="all">Tất cả danh mục</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-[18px] text-slate-400">
              expand_more
            </span>
          </div>
          <div className="relative w-full sm:w-auto">
            <select
              className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-8 pl-3.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100/70 focus:border-brand-500 focus:outline-none sm:w-auto"
              onChange={(event) => {
                setStatusFilter(
                  event.target.value as "all" | "published" | "draft"
                );
                setPage(1);
              }}
              value={statusFilter}
            >
              {statusFilters.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-[18px] text-slate-400">
              expand_more
            </span>
          </div>
          <button
            className="flex items-center justify-center self-stretch rounded-xl border border-slate-200 px-2.5 text-slate-500 shadow-sm transition hover:bg-slate-100 hover:text-slate-800"
            onClick={handleReset}
            title="Đặt lại bộ lọc"
            type="button"
          >
            <span className="material-symbols-outlined block text-[18px]">
              refresh
            </span>
          </button>
        </div>
      </div>

      {view === "table" ? (
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[950px] table-fixed border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200/70 bg-slate-50/80 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                <th className="w-[330px] px-5 py-4" scope="col">
                  Địa điểm & Danh mục
                </th>
                <th className="w-[260px] px-4 py-4" scope="col">
                  Tỉnh / Thành & Địa chỉ
                </th>
                <th
                  className="w-[140px] px-4 py-4 whitespace-nowrap"
                  scope="col"
                >
                  Giá vé
                </th>
                <th
                  className="w-[140px] px-4 py-4 whitespace-nowrap"
                  scope="col"
                >
                  Trạng thái
                </th>
                <th className="w-[130px] px-5 py-4 whitespace-nowrap" scope="col">
                  Ngày tạo
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {paginatedDestinations.length === 0 ? (
                <tr>
                  <td
                    className="px-6 py-10 text-center text-sm text-slate-500"
                    colSpan={5}
                  >
                    Không tìm thấy địa điểm phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                paginatedDestinations.map((destination) => (
                  <DestinationRow
                    key={destination.id}
                    destination={destination}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-4">
          {paginatedDestinations.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">
              Không tìm thấy địa điểm phù hợp với bộ lọc.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {paginatedDestinations.map((destination) => (
                <DestinationCard
                  key={destination.id}
                  destination={destination}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200/80 p-4 sm:flex-row">
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <span>
            Hiển thị{" "}
            <span className="font-semibold text-slate-900">
              {filteredDestinations.length === 0 ? 0 : startIndex + 1} -{" "}
              {Math.min(startIndex + pageSize, filteredDestinations.length)}
            </span>{" "}
            trên tổng số{" "}
            <span className="font-semibold text-slate-900">
              {filteredDestinations.length}
            </span>{" "}
            địa điểm
          </span>
          <div className="hidden items-center gap-2 sm:flex">
            <span>Xem:</span>
            <select
              className="cursor-pointer rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-700 focus:border-brand-500 focus:outline-none"
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
              value={pageSize}
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size} / trang
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={currentPage <= 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">
              chevron_left
            </span>
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map(
            (pageNumber) => (
              <button
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition ${
                  pageNumber === currentPage
                    ? "bg-brand-500 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
                key={pageNumber}
                onClick={() => setPage(pageNumber)}
                type="button"
              >
                {pageNumber}
              </button>
            )
          )}
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">
              chevron_right
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
