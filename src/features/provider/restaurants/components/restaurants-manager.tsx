"use client";

import type { ServiceStatus } from "@/generated/prisma/client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import type { RestaurantListItem } from "../types";

type RestaurantStatusMeta = {
  label: string;
  icon: string;
  className: string;
  dotClass: string;
  filled?: boolean;
};

const statusMeta: Record<ServiceStatus, RestaurantStatusMeta> = {
  published: {
    label: "Đang mở bán",
    icon: "check_circle",
    className: "border-emerald-200/80 bg-emerald-50 text-emerald-700",
    dotClass: "bg-emerald-500",
    filled: true,
  },
  pending: {
    label: "Chờ duyệt",
    icon: "schedule",
    className: "border-amber-200/80 bg-amber-50 text-amber-700",
    dotClass: "bg-amber-500",
  },
  paused: {
    label: "Tạm dừng",
    icon: "pause_circle",
    className: "border-rose-200/80 bg-rose-50 text-rose-700",
    dotClass: "bg-rose-500",
  },
  rejected: {
    label: "Từ chối",
    icon: "cancel",
    className: "border-slate-200/80 bg-slate-100 text-slate-600",
    dotClass: "bg-slate-400",
  },
};

const statusFilters: { value: ServiceStatus | "all"; label: string }[] = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "published", label: "Đang mở bán" },
  { value: "pending", label: "Chờ duyệt" },
  { value: "paused", label: "Tạm dừng" },
  { value: "rejected", label: "Từ chối" },
];

const PAGE_SIZE_OPTIONS = [6, 12, 24];

function StatusBadge({ status }: { status: ServiceStatus }) {
  const meta = statusMeta[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold shadow-xs whitespace-nowrap ${meta.className}`}
    >
      <span
        className="material-symbols-outlined"
        style={{
          fontSize: "15px",
          fontVariationSettings: meta.filled ? "'FILL' 1" : undefined,
        }}
      >
        {meta.icon}
      </span>
      {meta.label}
    </span>
  );
}

function IconAction({
  icon,
  title,
  danger,
}: {
  icon: string;
  title: string;
  danger?: boolean;
}) {
  return (
    <button
      className={`rounded-lg p-1.5 text-slate-400 transition ${
        danger
          ? "hover:bg-rose-50 hover:text-rose-600"
          : "hover:bg-slate-100 hover:text-slate-700"
      }`}
      title={title}
      type="button"
    >
      <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
        {icon}
      </span>
    </button>
  );
}

function RestaurantRow({ restaurant }: { restaurant: RestaurantListItem }) {
  return (
    <tr className="transition-colors hover:bg-slate-50/70">
      <td className="px-5 py-5 align-middle">
        <div className="flex items-center gap-3.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={restaurant.name}
            className="h-12 w-12 shrink-0 rounded-xl object-cover shadow-sm ring-1 ring-slate-200/80"
            src={restaurant.imageUrl}
          />
          <div className="flex min-w-0 flex-col">
            <span className="font-mono text-[11px] font-bold tracking-wider text-brand-500 uppercase">
              {restaurant.code}
            </span>
            <span className="truncate text-sm font-bold text-slate-900">
              {restaurant.name}
            </span>
            <span className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-slate-500">
              <span
                className={`h-1.5 w-1.5 rounded-full ${statusMeta[restaurant.status].dotClass}`}
              />
              {restaurant.provinceName}
            </span>
          </div>
        </div>
      </td>

      <td className="px-4 py-5 align-middle whitespace-nowrap">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-900">
            {restaurant.lowestMenuPrice !== null
              ? formatCurrency(restaurant.lowestMenuPrice)
              : "Chưa có giá"}
            <span className="ml-1 text-xs font-normal text-slate-400">
              / món
            </span>
          </span>
          <span className="mt-0.5 truncate text-xs text-slate-400">
            {restaurant.address}
          </span>
        </div>
      </td>

      <td className="px-4 py-5 align-middle whitespace-nowrap">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-900">
            {restaurant.capacity}
          </span>
          <span className="mt-0.5 text-xs text-slate-400">khách</span>
        </div>
      </td>

      <td className="px-4 py-5 align-middle whitespace-nowrap">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-900">
            {restaurant.menuItemCount}
          </span>
          <span className="mt-0.5 truncate text-xs text-slate-400">
            {restaurant.tagNames.length > 0
              ? restaurant.tagNames.join(", ")
              : "món trong thực đơn"}
          </span>
        </div>
      </td>

      <td className="px-4 py-5 align-middle">
        <StatusBadge status={restaurant.status} />
      </td>

      <td className="px-5 py-5 text-right align-middle whitespace-nowrap">
        <div className="inline-flex items-center justify-end gap-1">
          <IconAction icon="edit" title="Chỉnh sửa" />
          <IconAction icon="visibility" title="Xem chi tiết" />
          <IconAction icon="restaurant_menu" title="Xem thực đơn" />
          <IconAction danger icon="delete" title="Xóa nhà hàng" />
        </div>
      </td>
    </tr>
  );
}

function RestaurantCard({ restaurant }: { restaurant: RestaurantListItem }) {
  const meta = statusMeta[restaurant.status];
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:shadow-lg">
      <div className="relative h-48 overflow-hidden bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={restaurant.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          src={restaurant.imageUrl}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold shadow-sm ${meta.className}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${meta.dotClass}`} />
            {meta.label}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/70 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
            <span className="material-symbols-outlined text-[14px]">
              groups
            </span>
            {restaurant.capacity} khách
          </span>
        </div>
        <div className="absolute right-3 bottom-3 left-3 flex items-center justify-between text-white">
          <span className="font-mono text-[11px] font-extrabold tracking-wider text-amber-300 uppercase">
            {restaurant.code}
          </span>
          <span className="text-xs opacity-90">
            {restaurant.menuItemCount} món
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between space-y-4 p-5">
        <div className="space-y-2">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <span className="material-symbols-outlined text-[16px] text-brand-500">
              location_on
            </span>
            <span>{restaurant.provinceName}</span>
          </div>
          <h3 className="line-clamp-2 text-[15px] font-bold text-slate-900 transition-colors group-hover:text-brand-600">
            {restaurant.name}
          </h3>
          <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">
            {restaurant.description}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-baseline justify-between rounded-xl bg-slate-50 px-3.5 py-2">
            <span className="text-xs text-slate-500">Giá thấp nhất</span>
            <span className="text-base font-bold text-brand-600">
              {restaurant.lowestMenuPrice !== null
                ? formatCurrency(restaurant.lowestMenuPrice)
                : "Chưa có giá"}
              <span className="ml-1 text-xs font-normal text-slate-400">
                / món
              </span>
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-200/80"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">
                edit
              </span>
              Chỉnh sửa
            </button>
            <button
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand-500 px-3 py-2 text-xs font-bold text-white shadow-sm shadow-brand-500/25 transition hover:bg-brand-600"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">
                restaurant_menu
              </span>
              Xem thực đơn
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RestaurantsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200/80 bg-white p-12 text-center shadow-sm">
      <span className="material-symbols-outlined text-[40px] text-slate-300">
        restaurant
      </span>
      <h3 className="text-base font-bold text-slate-900">
        Bạn chưa có nhà hàng nào
      </h3>
      <p className="max-w-sm text-sm text-slate-500">
        Tạo nhà hàng đầu tiên để bắt đầu kinh doanh dịch vụ ẩm thực trên Roamly.
      </p>
      <Link
        className="mt-1 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-500/20 transition hover:bg-brand-600"
        href="/provider/restaurants/create"
      >
        <span className="material-symbols-outlined text-[20px]">
          add_circle
        </span>
        Tạo Nhà hàng mới
      </Link>
    </div>
  );
}

export function RestaurantsManager({
  restaurants,
}: {
  restaurants: RestaurantListItem[];
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ServiceStatus | "all">(
    "all"
  );
  const [view, setView] = useState<"table" | "card">("table");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  const filteredRestaurants = useMemo(() => {
    const query = search.trim().toLowerCase();
    return restaurants.filter((restaurant) => {
      const matchesSearch =
        query.length === 0 ||
        restaurant.name.toLowerCase().includes(query) ||
        restaurant.code.toLowerCase().includes(query) ||
        restaurant.provinceName.toLowerCase().includes(query) ||
        restaurant.address.toLowerCase().includes(query) ||
        restaurant.tagNames.some((tag) => tag.toLowerCase().includes(query));
      const matchesStatus =
        statusFilter === "all" || restaurant.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [restaurants, search, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRestaurants.length / pageSize)
  );
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedRestaurants = filteredRestaurants.slice(
    startIndex,
    startIndex + pageSize
  );

  const handleReset = () => {
    setSearch("");
    setStatusFilter("all");
    setPage(1);
  };

  if (restaurants.length === 0) {
    return <RestaurantsEmptyState />;
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
              placeholder="Tìm kiếm theo tên nhà hàng, mã, địa điểm, tag..."
              type="text"
              value={search}
            />
          </div>
          <div className="relative w-full sm:w-auto">
            <select
              className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-8 pl-3.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100/70 focus:border-brand-500 focus:outline-none sm:w-auto"
              onChange={(event) => {
                setStatusFilter(event.target.value as ServiceStatus | "all");
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
          <table className="w-full min-w-[1050px] table-fixed border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200/70 bg-slate-50/80 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                <th className="w-[340px] px-5 py-4" scope="col">
                  Nhà hàng &amp; Địa điểm
                </th>
                <th
                  className="w-[190px] px-4 py-4 whitespace-nowrap"
                  scope="col"
                >
                  Giá thấp nhất / Địa chỉ
                </th>
                <th
                  className="w-[130px] px-4 py-4 whitespace-nowrap"
                  scope="col"
                >
                  Sức chứa
                </th>
                <th
                  className="w-[130px] px-4 py-4 whitespace-nowrap"
                  scope="col"
                >
                  Thực đơn
                </th>
                <th
                  className="w-[140px] px-4 py-4 whitespace-nowrap"
                  scope="col"
                >
                  Trạng thái
                </th>
                <th className="w-[160px] px-5 py-4 text-right" scope="col">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {paginatedRestaurants.length === 0 ? (
                <tr>
                  <td
                    className="px-6 py-10 text-center text-sm text-slate-500"
                    colSpan={6}
                  >
                    Không tìm thấy nhà hàng phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                paginatedRestaurants.map((restaurant) => (
                  <RestaurantRow key={restaurant.id} restaurant={restaurant} />
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-4">
          {paginatedRestaurants.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">
              Không tìm thấy nhà hàng phù hợp với bộ lọc.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {paginatedRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
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
              {filteredRestaurants.length === 0 ? 0 : startIndex + 1} -{" "}
              {Math.min(startIndex + pageSize, filteredRestaurants.length)}
            </span>{" "}
            trên tổng số{" "}
            <span className="font-semibold text-slate-900">
              {filteredRestaurants.length}
            </span>{" "}
            nhà hàng
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
