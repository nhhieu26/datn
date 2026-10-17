"use client";

import type { ServiceStatus } from "@/generated/prisma/client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import type { RestaurantListItem } from "../types";
import { RestaurantIcon, type RestaurantIconName } from "./restaurant-icon";

type HSWindow = Window & {
  HSDropdown?: { autoInit: () => void };
};

type RestaurantStatusMeta = {
  label: string;
  icon: RestaurantIconName;
  className: string;
  dotClass: string;
};

const statusMeta: Record<ServiceStatus, RestaurantStatusMeta> = {
  published: {
    label: "Đang mở bán",
    icon: "check",
    className: "bg-teal-100 text-teal-800",
    dotClass: "bg-teal-500",
  },
  paused: {
    label: "Tạm dừng",
    icon: "pause",
    className: "bg-red-100 text-red-800",
    dotClass: "bg-red-500",
  },
};

const statusFilters: { value: ServiceStatus | "all"; label: string }[] = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "published", label: "Đang mở bán" },
  { value: "paused", label: "Tạm dừng" },
];

const PAGE_SIZE_OPTIONS = [6, 12, 24];

const inputClass =
  "block rounded-lg border-layer-line bg-layer py-2 text-foreground placeholder:text-muted-foreground-1 focus:border-primary-focus focus:ring-primary-focus sm:text-sm";

const layerButtonClass =
  "inline-flex items-center justify-center gap-x-2 rounded-lg border border-layer-line bg-layer text-sm font-medium text-layer-foreground shadow-2xs hover:bg-layer-hover focus:bg-layer-focus focus:outline-hidden disabled:pointer-events-none disabled:opacity-50";

const primaryButtonClass =
  "inline-flex items-center justify-center gap-x-2 rounded-lg border border-primary-line bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover focus:bg-primary-focus focus:outline-hidden disabled:pointer-events-none disabled:opacity-50";

const dropdownItemClass =
  "flex w-full items-center gap-x-3 rounded-lg px-3 py-2 text-start text-sm text-dropdown-item-foreground hover:bg-dropdown-item-hover focus:bg-dropdown-item-focus focus:outline-hidden";

function StatusBadge({ status }: { status: ServiceStatus }) {
  const meta = statusMeta[status];
  return (
    <span
      className={`inline-flex items-center gap-x-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${meta.className}`}
    >
      <RestaurantIcon name={meta.icon} className="size-3" />
      {meta.label}
    </span>
  );
}

function RowActions({ restaurant }: { restaurant: RestaurantListItem }) {
  const dropdownId = `hs-restaurant-actions-${restaurant.id}`;

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
        <RestaurantIcon name="more" />
      </button>

      <div
        className="hs-dropdown-menu duration z-20 hidden min-w-44 rounded-xl border border-dropdown-line bg-dropdown opacity-0 shadow-xl transition-[opacity,margin] hs-dropdown-open:opacity-100"
        role="menu"
        aria-orientation="vertical"
        aria-labelledby={dropdownId}
      >
        <div className="space-y-0.5 p-1">
          <Link
            className={dropdownItemClass}
            href={`/provider/restaurants/${restaurant.id}/edit`}
          >
            <RestaurantIcon name="edit" />
            Chỉnh sửa
          </Link>
          <button className={dropdownItemClass} type="button">
            <RestaurantIcon name="eye" />
            Xem chi tiết
          </button>
          <button className={dropdownItemClass} type="button">
            <RestaurantIcon name="menu" />
            Xem thực đơn
          </button>
        </div>
        <div className="space-y-0.5 border-t border-dropdown-divider p-1">
          <button
            className="flex w-full items-center gap-x-3 rounded-lg px-3 py-2 text-start text-sm text-red-600 hover:bg-red-50 focus:bg-red-50 focus:outline-hidden"
            type="button"
          >
            <RestaurantIcon name="trash" />
            Xóa nhà hàng
          </button>
        </div>
      </div>
    </div>
  );
}

function RestaurantRow({ restaurant }: { restaurant: RestaurantListItem }) {
  return (
    <tr className="hover:bg-layer-hover">
      <td className="min-w-80 px-6 py-4 align-middle">
        <div className="flex items-center gap-x-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={restaurant.name}
            className="size-11 shrink-0 rounded-lg object-cover"
            src={restaurant.imageUrl}
          />
          <div className="min-w-0 grow">
            <span className="inline-flex rounded-md bg-surface px-1.5 py-0.5 font-mono text-xs font-medium text-surface-foreground">
              {restaurant.code}
            </span>
            <span className="mt-1 block truncate text-sm font-semibold text-foreground">
              {restaurant.name}
            </span>
            <span className="mt-0.5 inline-flex items-center gap-x-1.5 text-xs text-muted-foreground-1">
              <span
                className={`size-1.5 rounded-full ${statusMeta[restaurant.status].dotClass}`}
              />
              {restaurant.provinceName}
            </span>
            {restaurant.tagNames.length > 0 ? (
              <span className="mt-0.5 block truncate text-xs text-muted-foreground-1">
                {restaurant.tagNames.join(", ")}
              </span>
            ) : null}
          </div>
        </div>
      </td>

      <td className="max-w-64 px-6 py-4 align-middle">
        <span className="block text-sm font-medium whitespace-nowrap text-foreground">
          {restaurant.lowestMenuPrice !== null
            ? formatCurrency(restaurant.lowestMenuPrice)
            : "Chưa có giá"}
          <span className="ms-1 text-xs font-normal text-muted-foreground-1">
            / món
          </span>
        </span>
        <span className="block truncate text-xs text-muted-foreground-1">
          {restaurant.address}
        </span>
      </td>

      <td className="px-6 py-4 align-middle whitespace-nowrap">
        <span className="block text-sm font-medium text-foreground">
          {restaurant.capacity}
        </span>
        <span className="block text-xs text-muted-foreground-1">khách</span>
      </td>

      <td className="px-6 py-4 align-middle whitespace-nowrap">
        <span className="block text-sm font-medium text-foreground">
          {restaurant.menuItemCount}
        </span>
        <span className="block text-xs text-muted-foreground-1">
          món trong thực đơn
        </span>
      </td>

      <td className="px-6 py-4 align-middle">
        <StatusBadge status={restaurant.status} />
      </td>

      <td className="px-6 py-4 text-end align-middle whitespace-nowrap">
        <RowActions restaurant={restaurant} />
      </td>
    </tr>
  );
}

function RestaurantsEmptyState() {
  return (
    <div className="flex flex-col rounded-xl border border-card-line bg-card shadow-2xs">
      <div className="flex min-h-80 flex-col items-center justify-center p-4 text-center md:p-5">
        <span className="flex size-12 items-center justify-center rounded-full bg-surface text-muted-foreground-2">
          <RestaurantIcon name="utensils" className="size-6" />
        </span>
        <h3 className="mt-4 text-base font-semibold text-foreground">
          Bạn chưa có nhà hàng nào
        </h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground-1">
          Tạo nhà hàng đầu tiên để bắt đầu kinh doanh dịch vụ ẩm thực trên
          Roamly.
        </p>
        <Link
          className={`mt-5 ${primaryButtonClass}`}
          href="/provider/restaurants/create"
        >
          <RestaurantIcon name="plus" />
          Tạo Nhà hàng mới
        </Link>
      </div>
    </div>
  );
}

export function RestaurantsManager({
  restaurants,
}: {
  restaurants: RestaurantListItem[];
}) {
  const [search, setSearch] = useState("");
  const [provinceFilter, setProvinceFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<ServiceStatus | "all">(
    "all",
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  const provinces = useMemo(
    () => [...new Set(restaurants.map((restaurant) => restaurant.provinceName))],
    [restaurants],
  );

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
      const matchesProvince =
        provinceFilter === "all" || restaurant.provinceName === provinceFilter;
      const matchesStatus =
        statusFilter === "all" || restaurant.status === statusFilter;
      return matchesSearch && matchesProvince && matchesStatus;
    });
  }, [restaurants, search, provinceFilter, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRestaurants.length / pageSize),
  );
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedRestaurants = filteredRestaurants.slice(
    startIndex,
    startIndex + pageSize,
  );

  // Dòng mới hiện ra sau khi lọc/chuyển trang cần được Preline khởi tạo dropdown
  useEffect(() => {
    (window as HSWindow).HSDropdown?.autoInit();
  }, [paginatedRestaurants]);

  const handleReset = () => {
    setSearch("");
    setProvinceFilter("all");
    setStatusFilter("all");
    setPage(1);
  };

  if (restaurants.length === 0) {
    return <RestaurantsEmptyState />;
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-card-line bg-card shadow-2xs">
      <div className="grid gap-3 border-b border-card-line px-6 py-4 lg:flex lg:items-center lg:justify-between">
        <div className="relative w-full md:max-w-sm">
          <div className="pointer-events-none absolute inset-y-0 start-0 z-20 flex items-center ps-3.5">
            <RestaurantIcon
              name="search"
              className="size-4 text-muted-foreground"
            />
          </div>
          <label className="sr-only" htmlFor="hs-restaurants-search">
            Tìm kiếm nhà hàng
          </label>
          <input
            className={`${inputClass} w-full ps-10 pe-4`}
            id="hs-restaurants-search"
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Tìm theo tên, mã, địa điểm, tag..."
            type="text"
            value={search}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Lọc theo tỉnh thành"
            className={`${inputClass} ps-3 pe-9`}
            onChange={(event) => {
              setProvinceFilter(event.target.value);
              setPage(1);
            }}
            value={provinceFilter}
          >
            <option value="all">Tất cả tỉnh thành</option>
            {provinces.map((province) => (
              <option key={province} value={province}>
                {province}
              </option>
            ))}
          </select>
          <select
            aria-label="Lọc theo trạng thái"
            className={`${inputClass} ps-3 pe-9`}
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
          <button
            className={`px-3 py-2 ${layerButtonClass}`}
            onClick={handleReset}
            type="button"
          >
            <RestaurantIcon name="reset" />
            Đặt lại
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-table-line">
          <thead className="bg-muted">
            <tr>
              {[
                "Nhà hàng & Địa điểm",
                "Giá thấp nhất / Địa chỉ",
                "Sức chứa",
                "Thực đơn",
                "Trạng thái",
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
            {paginatedRestaurants.length === 0 ? (
              <tr>
                <td
                  className="px-6 py-10 text-center text-sm text-muted-foreground-1"
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

      <div className="grid gap-3 border-t border-card-line px-6 py-4 md:flex md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <p className="text-sm text-muted-foreground-1">
            Hiển thị{" "}
            <span className="font-semibold text-foreground">
              {filteredRestaurants.length === 0 ? 0 : startIndex + 1} -{" "}
              {Math.min(startIndex + pageSize, filteredRestaurants.length)}
            </span>{" "}
            / {filteredRestaurants.length} nhà hàng
          </p>
          <select
            aria-label="Số nhà hàng mỗi trang"
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
            className="inline-flex min-h-9.5 min-w-9.5 items-center justify-center rounded-lg px-2.5 py-2 text-sm text-foreground hover:bg-muted-hover focus:bg-muted-focus focus:outline-hidden disabled:pointer-events-none disabled:opacity-50"
            disabled={currentPage <= 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            type="button"
          >
            <RestaurantIcon name="chevronLeft" className="size-3.5" />
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map(
            (pageNumber) => (
              <button
                aria-current={pageNumber === currentPage ? "page" : undefined}
                className={`flex min-h-9.5 min-w-9.5 items-center justify-center rounded-lg px-3 py-2 text-sm focus:outline-hidden ${
                  pageNumber === currentPage
                    ? "bg-surface text-surface-foreground focus:bg-surface-focus"
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
            className="inline-flex min-h-9.5 min-w-9.5 items-center justify-center rounded-lg px-2.5 py-2 text-sm text-foreground hover:bg-muted-hover focus:bg-muted-focus focus:outline-hidden disabled:pointer-events-none disabled:opacity-50"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            type="button"
          >
            <RestaurantIcon name="chevronRight" className="size-3.5" />
          </button>
        </nav>
      </div>
    </div>
  );
}
