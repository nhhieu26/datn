"use client";

import { SettingsToast } from "@/features/admin/settings/components/settings-shared";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  buildUsersUrl,
  hasActiveFilters,
  USERS_PAGE_SIZE,
  type UsersQuery,
} from "../search-params";
import type { AdminUserRow, AdminUsersSummary } from "../types";
import { UserStatusModal } from "./user-status-modal";
import { UsersFilterBar } from "./users-filter-bar";
import { UsersPagination } from "./users-pagination";
import { UsersSummaryCards } from "./users-summary-cards";
import { UsersTable } from "./users-table";

export function UsersDashboard({
  users,
  total,
  summary,
  query,
  currentAdminId,
}: {
  users: AdminUserRow[];
  total: number;
  summary: AdminUsersSummary;
  query: UsersQuery;
  currentAdminId: string;
}) {
  const router = useRouter();
  const [target, setTarget] = useState<AdminUserRow | null>(null);
  const [toast, setToast] = useState("");
  const [isNavigating, startNavigation] = useTransition();

  const totalPages = Math.max(1, Math.ceil(total / USERS_PAGE_SIZE));
  const firstIndex = total === 0 ? 0 : (query.page - 1) * USERS_PAGE_SIZE + 1;
  const lastIndex = firstIndex === 0 ? 0 : firstIndex + users.length - 1;

  const navigate = (url: string) => {
    startNavigation(() => router.push(url));
  };

  return (
    <main className="flex-1 overflow-y-auto bg-background-1 font-inter text-foreground">
      <div className="mx-auto w-full max-w-340 space-y-4 p-4 sm:space-y-6 sm:p-6">
        {toast ? (
          <SettingsToast message={toast} onClose={() => setToast("")} />
        ) : null}

        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Quản lý người dùng
          </h1>
          <p className="mt-1 text-sm text-muted-foreground-1">
            Tra cứu tài khoản khách hàng, đối tác và khoá các tài khoản vi phạm.
          </p>
        </div>

        <UsersSummaryCards summary={summary} />

        <section
          aria-busy={isNavigating}
          className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-card-line bg-card shadow-2xs"
        >
          {/* key: đồng bộ lại ô tìm kiếm khi URL đổi (đặt lại, back/forward) */}
          <UsersFilterBar key={query.q} onNavigate={navigate} query={query} />
          <div className={isNavigating ? "opacity-60 transition-opacity" : ""}>
            <UsersTable
              currentAdminId={currentAdminId}
              hasFilters={hasActiveFilters(query)}
              onToggleStatus={setTarget}
              users={users}
            />
          </div>
          <div className="grid gap-3 border-t border-card-line px-6 py-4 md:flex md:items-center md:justify-between">
            <p className="text-sm text-muted-foreground-1">
              Hiển thị{" "}
              <span className="font-semibold text-foreground">
                {firstIndex}–{lastIndex}
              </span>{" "}
              / {total} người dùng
            </p>
            <UsersPagination
              href={(page) => buildUsersUrl(query, { page })}
              page={query.page}
              totalPages={totalPages}
            />
          </div>
        </section>
      </div>

      {target ? (
        <UserStatusModal
          onClose={() => setTarget(null)}
          onSuccess={(message) => {
            setTarget(null);
            setToast(message);
            router.refresh();
          }}
          user={target}
        />
      ) : null}
    </main>
  );
}
