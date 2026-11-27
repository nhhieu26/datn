import { ApprovalIcon } from "@/features/admin/profile-approval/components/approval-icon";
import {
  smallDangerButtonClass,
  smallLayerButtonClass,
} from "@/features/admin/settings/components/settings-shared";
import { formatDate, formatEntityCode, formatTime } from "@/lib/utils";
import Link from "next/link";
import { USERS_PATH } from "../search-params";
import type { AdminUserRow } from "../types";
import {
  canToggleStatus,
  RoleBadge,
  UserAvatar,
  UserStatusBadge,
} from "./users-shared";

const COLUMNS = ["Người dùng", "Số điện thoại", "Vai trò", "Trạng thái", "Ngày tạo"];

export function UsersTable({
  users,
  currentAdminId,
  hasFilters,
  onToggleStatus,
}: {
  users: AdminUserRow[];
  currentAdminId: string;
  hasFilters: boolean;
  onToggleStatus: (user: AdminUserRow) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-table-line">
        <thead className="bg-muted">
          <tr>
            {COLUMNS.map((label) => (
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
          {users.length === 0 ? (
            <tr>
              <td className="px-6 py-14" colSpan={COLUMNS.length + 1}>
                <div className="flex flex-col items-center text-center">
                  <span className="flex size-12 items-center justify-center rounded-full bg-surface text-muted-foreground-2">
                    <ApprovalIcon name="search" className="size-6" />
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-foreground">
                    {hasFilters
                      ? "Không tìm thấy người dùng phù hợp"
                      : "Chưa có người dùng nào"}
                  </h3>
                  {hasFilters ? (
                    <p className="mt-1 text-sm text-muted-foreground-1">
                      Thử thay đổi từ khóa hoặc bộ lọc đang chọn.
                    </p>
                  ) : null}
                </div>
              </td>
            </tr>
          ) : (
            users.map((user) => {
              const detailHref = `${USERS_PATH}/${user.id}`;
              const isSelf = user.id === currentAdminId;
              return (
                <tr className="hover:bg-layer-hover" key={user.id}>
                  <td className="min-w-70 px-6 py-4 align-middle">
                    <div className="flex items-center gap-x-3">
                      <UserAvatar name={user.fullname} />
                      <div className="min-w-0 grow">
                        <div className="flex items-center gap-x-1.5">
                          <Link
                            className="block max-w-60 truncate text-sm font-semibold text-foreground hover:text-primary-600 focus:text-primary-600 focus:outline-hidden"
                            href={detailHref}
                          >
                            {user.fullname}
                          </Link>
                          {isSelf ? (
                            <span className="inline-flex rounded-md bg-surface px-1.5 py-0.5 text-xs font-medium text-surface-foreground">
                              Bạn
                            </span>
                          ) : null}
                        </div>
                        <span className="block max-w-60 truncate text-xs text-muted-foreground-1">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-middle whitespace-nowrap">
                    <span className="block text-sm text-foreground">
                      {user.phone}
                    </span>
                    <span className="block font-mono text-xs text-muted-foreground-1">
                      {formatEntityCode("US", user.id)}
                    </span>
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <UserStatusBadge status={user.status} />
                  </td>
                  <td className="px-6 py-4 align-middle whitespace-nowrap">
                    <span className="block text-sm text-foreground">
                      {formatDate(user.createdAt)}
                    </span>
                    <span className="block text-xs text-muted-foreground-1">
                      {formatTime(user.createdAt)}
                    </span>
                  </td>
                  <td className="px-6 py-4 align-middle whitespace-nowrap">
                    <div className="flex items-center justify-end gap-x-2">
                      <Link className={smallLayerButtonClass} href={detailHref}>
                        <ApprovalIcon name="eye" className="size-3.5" />
                        Chi tiết
                      </Link>
                      {canToggleStatus(user, currentAdminId) ? (
                        <button
                          className={
                            user.status === "banned"
                              ? smallLayerButtonClass
                              : smallDangerButtonClass
                          }
                          onClick={() => onToggleStatus(user)}
                          type="button"
                        >
                          <ApprovalIcon
                            name={user.status === "banned" ? "check" : "ban"}
                            className="size-3.5"
                          />
                          {user.status === "banned" ? "Mở khoá" : "Khoá"}
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
