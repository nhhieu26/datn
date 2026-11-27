// Import thẳng schema/type: file này chạy cả ở client, không được kéo theo repo (Prisma).
import { roleSchema, userStatusSchema } from "@/entities/user/schema";
import type { AdminUserFilter, Role, UserStatus } from "@/entities/user/type";

export const USERS_PAGE_SIZE = 10;
export const USERS_PATH = "/admin/users";

export type UsersQuery = {
  q: string;
  role: Role | "all";
  status: UserStatus | "all";
  page: number;
};

type RawParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export function parseUsersQuery(params: RawParams): UsersQuery {
  const role = roleSchema.safeParse(first(params.role));
  const status = userStatusSchema.safeParse(first(params.status));
  return {
    q: first(params.q).trim().slice(0, 100),
    role: role.success ? role.data : "all",
    status: status.success ? status.data : "all",
    page: Math.max(1, Math.floor(Number(first(params.page))) || 1),
  };
}

export function hasActiveFilters(query: UsersQuery) {
  return query.q !== "" || query.role !== "all" || query.status !== "all";
}

export function buildUsersUrl(
  query: UsersQuery,
  patch: Partial<UsersQuery> = {},
) {
  // Đổi bộ lọc thì về trang 1; `page` chỉ giữ khi được truyền trong patch
  const next = { ...query, page: 1, ...patch };
  const params = new URLSearchParams();
  if (next.q) params.set("q", next.q);
  if (next.role !== "all") params.set("role", next.role);
  if (next.status !== "all") params.set("status", next.status);
  if (next.page > 1) params.set("page", String(next.page));
  const search = params.toString();
  return search ? `${USERS_PATH}?${search}` : USERS_PATH;
}

export function toUserFilter(query: UsersQuery): AdminUserFilter {
  return {
    q: query.q || undefined,
    role: query.role === "all" ? undefined : query.role,
    status: query.status === "all" ? undefined : query.status,
  };
}
