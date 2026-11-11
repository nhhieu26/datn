"use client";

import { ApprovalIcon } from "@/features/admin/profile-approval/components/approval-icon";
import {
  inputClass,
  layerButtonClass,
} from "@/features/admin/profile-approval/components/approval-shared";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import {
  buildUsersUrl,
  hasActiveFilters,
  USERS_PATH,
  type UsersQuery,
} from "../search-params";

export function UsersFilterBar({
  query,
  onNavigate,
}: {
  query: UsersQuery;
  onNavigate: (url: string) => void;
}) {
  const [search, setSearch] = useState(query.q);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onNavigate(buildUsersUrl(query, { q: search.trim() }));
  };

  return (
    <div className="grid gap-3 border-b border-card-line px-6 py-4 md:flex md:items-center md:justify-between">
      <form
        className="flex w-full items-center gap-2 md:max-w-md"
        onSubmit={handleSubmit}
        role="search"
      >
        <div className="relative grow">
          <div className="pointer-events-none absolute inset-y-0 start-0 z-20 flex items-center ps-3.5">
            <ApprovalIcon name="search" className="size-4 text-muted-foreground" />
          </div>
          <label className="sr-only" htmlFor="hs-users-search">
            Tìm kiếm người dùng
          </label>
          <input
            className={`${inputClass} w-full ps-10 pe-4`}
            id="hs-users-search"
            maxLength={100}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm theo tên, email, số điện thoại..."
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
          aria-label="Lọc theo vai trò"
          className={`${inputClass} ps-3 pe-9`}
          onChange={(event) =>
            onNavigate(
              buildUsersUrl(query, {
                role: event.target.value as UsersQuery["role"],
              }),
            )
          }
          value={query.role}
        >
          <option value="all">Tất cả vai trò</option>
          <option value="customer">Khách hàng</option>
          <option value="provider">Đối tác</option>
          <option value="admin">Quản trị viên</option>
        </select>
        <select
          aria-label="Lọc theo trạng thái"
          className={`${inputClass} ps-3 pe-9`}
          onChange={(event) =>
            onNavigate(
              buildUsersUrl(query, {
                status: event.target.value as UsersQuery["status"],
              }),
            )
          }
          value={query.status}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Chưa kích hoạt</option>
          <option value="banned">Đã bị khoá</option>
        </select>
        {hasActiveFilters(query) ? (
          <Link className={`px-3 py-2 ${layerButtonClass}`} href={USERS_PATH}>
            <ApprovalIcon name="reset" />
            Đặt lại
          </Link>
        ) : null}
      </div>
    </div>
  );
}
