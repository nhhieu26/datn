"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import type { DestinationListItem } from "../types";
import { DestinationIcon } from "./destination-icon";

type HSWindow = Window & {
  HSDropdown?: { autoInit: () => void };
};

type StatusFilter = "all" | "published" | "draft";

const PAGE_SIZE_OPTIONS = [6, 12, 24];

// Class dùng chung theo token Preline
const inputClass =
  "block rounded-lg border-layer-line bg-layer py-2 text-foreground placeholder:text-muted-foreground-1 focus:border-primary-focus focus:ring-primary-focus sm:text-sm";

const layerButtonClass =
  "inline-flex items-center justify-center gap-x-2 rounded-lg border border-layer-line bg-layer text-sm font-medium text-layer-foreground shadow-2xs hover:bg-layer-hover focus:bg-layer-focus focus:outline-hidden disabled:pointer-events-none disabled:opacity-50";

const primaryButtonClass =
  "inline-flex items-center justify-center gap-x-2 rounded-lg border border-primary-line bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover focus:bg-primary-focus focus:outline-hidden disabled:pointer-events-none disabled:opacity-50";

const dropdownItemClass =
  "flex w-full items-center gap-x-3 rounded-lg px-3 py-2 text-start text-sm text-dropdown-item-foreground hover:bg-dropdown-item-hover focus:bg-dropdown-item-focus focus:outline-hidden";

const pageButtonClass =
  "inline-flex min-h-9.5 min-w-9.5 items-center justify-center rounded-lg px-2.5 py-2 text-sm text-foreground hover:bg-muted-hover focus:bg-muted-focus focus:outline-hidden disabled:pointer-events-none disabled:opacity-50";

function StatusBadge({ isPublished }: { isPublished: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-x-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${
        isPublished
          ? "bg-teal-100 text-teal-800"
          : "bg-yellow-100 text-yellow-800"
      }`}
    >
      <DestinationIcon
        name={isPublished ? "check" : "draft"}
        className="size-3"
      />
      {isPublished ? "Đã xuất bản" : "Bản nháp"}
    </span>
  );
}

function RowActions({ destination }: { destination: DestinationListItem }) {
  const dropdownId = `hs-destination-actions-${destination.id}`;

  return (
    <div className="hs-dropdown relative inline-flex [--placement:bottom-right]">
      <button
        id={dropdownId}
        type="button"
        className={`hs-dropdown-toggle size-8 ${layerButtonClass}`}
        aria-haspopup="menu"
        aria-expanded="false"
        aria-label="Thao tác"
      >
        <DestinationIcon name="more" />
      </button>

      <div
        className="hs-dropdown-menu duration z-20 hidden min-w-48 rounded-xl border border-dropdown-line bg-dropdown opacity-0 shadow-xl transition-[opacity,margin] hs-dropdown-open:opacity-100"
        role="menu"
        aria-orientation="vertical"
        aria-labelledby={dropdownId}
      >
        <div className="space-y-0.5 p-1">
          <Link
            className={dropdownItemClass}
            href={`/admin/destinations/${destination.id}/edit`}
          >
            <DestinationIcon name="draft" />
            Chỉnh sửa
          </Link>
          {destination.isPublished ? (
            <Link
              className={dropdownItemClass}
              href={`/destinations/${destination.slug}`}
              rel="noreferrer"
              target="_blank"
            >
              <DestinationIcon name="externalLink" />
              Xem trang công khai
            </Link>
          ) : (
            <span className={`${dropdownItemClass} pointer-events-none opacity-50`}>
              <DestinationIcon name="externalLink" />
              Chưa xuất bản
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function DestinationRow({ destination }: { destination: DestinationListItem }) {
  return (
    <tr className="hover:bg-layer-hover">
      <td className="min-w-80 px-6 py-4 align-middle">
        <div className="flex items-center gap-x-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={destination.name}
            className="size-11 shrink-0 rounded-lg object-cover"
            src={destination.imageUrl}
          />
          <div className="min-w-0 grow">
            <span className="inline-flex rounded-md bg-surface px-1.5 py-0.5 font-mono text-xs font-medium text-surface-foreground">
              {destination.code}
            </span>
            <span className="mt-1 block max-w-60 truncate text-sm font-semibold text-foreground">
              {destination.name}
            </span>
            <span className="mt-0.5 inline-flex max-w-60 items-center gap-x-1.5 text-xs text-muted-foreground-1">
              <DestinationIcon name="tag" className="size-3" />
              <span className="truncate">{destination.category}</span>
            </span>
          </div>
        </div>
      </td>

      <td className="max-w-72 px-6 py-4 align-middle">
        <span className="inline-flex items-center gap-x-1.5 text-sm font-medium whitespace-nowrap text-foreground">
          <DestinationIcon
            name="mapPin"
            className="size-3.5 text-muted-foreground-1"
          />
          {destination.provinceName}
        </span>
        <span className="block truncate text-xs text-muted-foreground-1">
          {destination.address}
        </span>
      </td>

      <td className="px-6 py-4 align-middle whitespace-nowrap">
        <span className="block text-sm font-medium text-foreground">
          {destination.ticketPrice === null
            ? "Miễn phí"
            : formatCurrency(destination.ticketPrice)}
        </span>
        <span className="block text-xs text-muted-foreground-1">/ khách</span>
      </td>

      <td className="px-6 py-4 align-middle">
        <StatusBadge isPublished={destination.isPublished} />
      </td>

      <td className="px-6 py-4 align-middle whitespace-nowrap">
        <span className="block text-sm text-foreground">
          {formatDate(destination.createdAt)}
        </span>
        <span className="block text-xs text-muted-foreground-1">
          {formatTime(destination.createdAt)}
        </span>
      </td>

      <td className="px-6 py-4 text-end align-middle whitespace-nowrap">
        <RowActions destination={destination} />
      </td>
    </tr>
  );
}

function DestinationsEmptyState() {
  return (
    <div className="flex flex-col rounded-xl border border-card-line bg-card shadow-2xs">
      <div className="flex min-h-80 flex-col items-center justify-center p-4 text-center md:p-5">
        <span className="flex size-12 items-center justify-center rounded-full bg-surface text-muted-foreground-2">
          <DestinationIcon name="compass" className="size-6" />
        </span>
        <h3 className="mt-4 text-base font-semibold text-foreground">
          Chưa có địa điểm du lịch nào
        </h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground-1">
          Tạo địa điểm đầu tiên để giới thiệu điểm tham quan tới du khách.
        </p>
        <Link
          className={`mt-5 ${primaryButtonClass}`}
          href="/admin/destinations/create"
        >
          <DestinationIcon name="plus" />
          Tạo địa điểm mới
        </Link>
      </div>
    </div>
  );
}

export function DestinationsManager({
  destinations,
}: {
  destinations: DestinationListItem[];
}) {
  const router = useRouter();
  const [isRefreshing, startRefresh] = useTransition();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  const categories = useMemo(
    () =>
      [
        ...new Set(
          destinations
            .map((destination) => destination.category)
            .filter((category) => category !== "Chưa phân loại")
            .flatMap((category) => category.split(", ")),
        ),
      ].sort(),
    [destinations],
  );

  const counts = useMemo(
    () => ({
      all: destinations.length,
      published: destinations.filter((destination) => destination.isPublished)
        .length,
      draft: destinations.filter((destination) => !destination.isPublished)
        .length,
    }),
    [destinations],
  );

  const filteredDestinations = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("vi");
    return destinations.filter((destination) => {
      const haystack = [
        destination.name,
        destination.code,
        destination.provinceName,
        destination.address,
      ]
        .join(" ")
        .toLocaleLowerCase("vi");
      const matchesCategory =
        categoryFilter === "all" ||
        destination.category.split(", ").includes(categoryFilter);
      const matchesStatus =
        statusFilter === "all" ||
        destination.isPublished === (statusFilter === "published");
      return (
        (!query || haystack.includes(query)) && matchesCategory && matchesStatus
      );
    });
  }, [destinations, search, categoryFilter, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredDestinations.length / pageSize),
  );
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedDestinations = filteredDestinations.slice(
    startIndex,
    startIndex + pageSize,
  );

  // Dòng mới hiện ra sau khi lọc/chuyển trang cần được Preline khởi tạo dropdown
  useEffect(() => {
    (window as HSWindow).HSDropdown?.autoInit();
  }, [paginatedDestinations]);

  const handleReset = () => {
    setSearch("");
    setCategoryFilter("all");
    setStatusFilter("all");
    setPage(1);
    startRefresh(() => router.refresh());
  };

  if (destinations.length === 0) {
    return <DestinationsEmptyState />;
  }

  return (
    <section className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-card-line bg-card shadow-2xs">
      <div className="grid gap-3 border-b border-card-line px-6 py-4">
        <div className="grid gap-3 md:flex md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <div className="pointer-events-none absolute inset-y-0 start-0 z-20 flex items-center ps-3.5">
              <DestinationIcon
                name="search"
                className="size-4 text-muted-foreground"
              />
            </div>
            <label className="sr-only" htmlFor="hs-destinations-search">
              Tìm kiếm địa điểm
            </label>
            <input
              className={`${inputClass} w-full ps-10 pe-4`}
              id="hs-destinations-search"
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Tìm theo tên, mã, tỉnh/thành, địa chỉ..."
              type="text"
              value={search}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Lọc theo danh mục"
              className={`${inputClass} ps-3 pe-9`}
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
            <button
              aria-busy={isRefreshing}
              className={`px-3 py-2 ${layerButtonClass}`}
              disabled={isRefreshing}
              onClick={handleReset}
              title="Đặt lại bộ lọc và làm mới dữ liệu"
              type="button"
            >
              <DestinationIcon
                name="reset"
                className={isRefreshing ? "size-4 shrink-0 animate-spin" : undefined}
              />
              {isRefreshing ? "Đang tải…" : "Đặt lại"}
            </button>
          </div>
        </div>

        <nav
          aria-label="Lọc theo trạng thái"
          className="flex w-fit max-w-full gap-x-1 overflow-x-auto rounded-lg bg-surface p-1"
          role="tablist"
        >
          {(
            [
              ["all", "Tất cả", counts.all],
              ["published", "Đã xuất bản", counts.published],
              ["draft", "Bản nháp", counts.draft],
            ] as const
          ).map(([value, label, count]) => {
            const active = statusFilter === value;
            return (
              <button
                aria-selected={active}
                className={`inline-flex items-center gap-x-2 rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap focus:outline-hidden ${
                  active
                    ? "bg-layer text-layer-foreground shadow-2xs"
                    : "text-muted-foreground-2 hover:text-foreground focus:text-foreground"
                }`}
                key={value}
                onClick={() => {
                  setStatusFilter(value);
                  setPage(1);
                }}
                role="tab"
                type="button"
              >
                {label}
                <span
                  className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-medium ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface-1 text-surface-foreground"
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
              {[
                "Địa điểm & Danh mục",
                "Tỉnh / Thành & Địa chỉ",
                "Giá vé",
                "Trạng thái",
                "Ngày tạo",
              ].map((label) => (
                <th
                  key={label}
                  className="px-6 py-3 text-start whitespace-nowrap"
                  scope="col"
                >
                  <span className="text-xs font-semibold text-foreground uppercase">
                    {label}
                  </span>
                </th>
              ))}
              <th className="px-6 py-3 text-end" scope="col">
                <span className="text-xs font-semibold text-foreground uppercase">
                  Thao tác
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-table-line">
            {paginatedDestinations.length === 0 ? (
              <tr>
                <td className="px-6 py-14" colSpan={6}>
                  <div className="flex flex-col items-center text-center">
                    <span className="flex size-12 items-center justify-center rounded-full bg-surface text-muted-foreground-2">
                      <DestinationIcon name="search" className="size-6" />
                    </span>
                    <h3 className="mt-4 text-base font-semibold text-foreground">
                      Không tìm thấy địa điểm phù hợp
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground-1">
                      Thử thay đổi từ khóa hoặc bộ lọc đang chọn.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedDestinations.map((destination) => (
                <DestinationRow key={destination.id} destination={destination} />
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 border-t border-card-line px-6 py-4 md:flex md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <p className="text-sm text-muted-foreground-1">
            Hiển thị{" "}
            <span className="font-semibold text-foreground">
              {filteredDestinations.length === 0 ? 0 : startIndex + 1} -{" "}
              {Math.min(startIndex + pageSize, filteredDestinations.length)}
            </span>{" "}
            / {filteredDestinations.length} địa điểm
          </p>
          <select
            aria-label="Số địa điểm mỗi trang"
            className={`${inputClass} py-1.5 ps-3 pe-9`}
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

        <nav aria-label="Phân trang" className="flex items-center gap-x-1">
          <button
            aria-label="Trang trước"
            className={pageButtonClass}
            disabled={currentPage <= 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            type="button"
          >
            <DestinationIcon name="chevronLeft" className="size-3.5" />
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map(
            (pageNumber) => (
              <button
                aria-current={pageNumber === currentPage ? "page" : undefined}
                className={`flex min-h-9.5 min-w-9.5 items-center justify-center rounded-lg px-3 py-2 text-sm focus:outline-hidden ${
                  pageNumber === currentPage
                    ? "bg-muted text-foreground"
                    : "text-foreground hover:bg-muted-hover focus:bg-muted-focus"
                }`}
                key={pageNumber}
                onClick={() => setPage(pageNumber)}
                type="button"
              >
                {pageNumber}
              </button>
            ),
          )}
          <button
            aria-label="Trang sau"
            className={pageButtonClass}
            disabled={currentPage >= totalPages}
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            type="button"
          >
            <DestinationIcon name="chevronRight" className="size-3.5" />
          </button>
        </nav>
      </div>
    </section>
  );
}
