"use client";

import type {
  NotificationFilter,
  NotificationItem,
  NotificationType,
} from "@/entities/notification";
import { formatRelativeTime } from "@/lib/utils";
import {
  AlertTriangle,
  Bell,
  CalendarPlus,
  CheckCheck,
  CheckCircle2,
  CreditCard,
  FileCheck2,
  FileClock,
  FileX2,
  MessageSquare,
  ShieldAlert,
  Sparkles,
  Star,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "../actions";

const POLL_INTERVAL_MS = 30_000;

type NotificationBellProps = {
  variant?: "customer" | "dashboard";
};

function getTypeVisual(type: NotificationType) {
  switch (type) {
    case "booking_created":
      return {
        icon: CalendarPlus,
        bgClass: "bg-sky-50 text-sky-600",
      };
    case "booking_paid":
      return {
        icon: CreditCard,
        bgClass: "bg-emerald-50 text-emerald-600",
      };
    case "booking_confirmed":
      return {
        icon: CheckCircle2,
        bgClass: "bg-teal-50 text-teal-600",
      };
    case "booking_completed":
      return {
        icon: Sparkles,
        bgClass: "bg-indigo-50 text-indigo-600",
      };
    case "booking_cancelled":
      return {
        icon: XCircle,
        bgClass: "bg-rose-50 text-rose-600",
      };
    case "review_created":
      return {
        icon: Star,
        bgClass: "bg-amber-50 text-amber-600",
      };
    case "profile_submitted":
      return {
        icon: FileClock,
        bgClass: "bg-blue-50 text-blue-600",
      };
    case "profile_approved":
      return {
        icon: FileCheck2,
        bgClass: "bg-emerald-50 text-emerald-600",
      };
    case "profile_rejected":
      return {
        icon: FileX2,
        bgClass: "bg-rose-50 text-rose-600",
      };
    case "article_comment_created":
      return {
        icon: MessageSquare,
        bgClass: "bg-teal-50 text-teal-600",
      };
    case "content_flagged":
      return {
        icon: ShieldAlert,
        bgClass: "bg-orange-50 text-orange-600",
      };
    case "transfer_failed":
      return {
        icon: AlertTriangle,
        bgClass: "bg-red-50 text-red-600",
      };
    default:
      return {
        icon: Bell,
        bgClass: "bg-slate-100 text-slate-600",
      };
  }
}

export function NotificationBell({
  variant = "dashboard",
}: NotificationBellProps) {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications?take=25", {
        cache: "no-store",
      });
      if (!res.ok) return;
      const payload = (await res.json()) as {
        ok?: boolean;
        data?: { items: NotificationItem[]; unreadCount: number };
      };
      if (payload.ok && payload.data) {
        setItems(payload.data.items);
        setUnreadCount(payload.data.unreadCount);
      }
    } catch {
      // Bỏ qua lỗi mạng tạm thời khi polling
    } finally {
      setLoading(false);
    }
  }, []);

  // Tải thông báo khi mở trang, đổi route, polling 30s và khi quay lại tab
  useEffect(() => {
    let active = true;

    const load = () => {
      fetch("/api/notifications?take=25", { cache: "no-store" })
        .then((res) => (res.ok ? res.json() : null))
        .then(
          (
            payload: {
              ok?: boolean;
              data?: { items: NotificationItem[]; unreadCount: number };
            } | null
          ) => {
            if (!active) return;
            if (payload?.ok && payload.data) {
              setItems(payload.data.items);
              setUnreadCount(payload.data.unreadCount);
            }
          }
        )
        .catch(() => {
          // Bỏ qua lỗi mạng tạm thời khi polling
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    };

    load();

    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        load();
      }
    }, POLL_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        load();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      active = false;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [pathname]);

  // Đóng dropdown khi click ra ngoài hoặc bấm Escape
  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleToggle = () => {
    const nextOpen = !open;
    setOpen(nextOpen);
    if (nextOpen) {
      void fetchNotifications();
    }
  };

  const handleItemClick = (item: NotificationItem) => {
    if (!item.readAt) {
      const nowIso = new Date().toISOString();
      setItems((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, readAt: nowIso } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      void markNotificationReadAction(item.id);
    }
    setOpen(false);
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0 || markingAll) return;
    setMarkingAll(true);
    const nowIso = new Date().toISOString();
    setItems((prev) =>
      prev.map((n) => (n.readAt ? n : { ...n, readAt: nowIso }))
    );
    setUnreadCount(0);
    try {
      await markAllNotificationsReadAction();
    } finally {
      setMarkingAll(false);
    }
  };

  const displayedItems =
    filter === "unread" ? items.filter((item) => !item.readAt) : items;

  const triggerClass =
    variant === "customer"
      ? "relative w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 text-gray-700 hover:text-new-coral hover:border-new-coral/50 transition cursor-pointer"
      : "relative inline-flex size-9.5 items-center justify-center gap-x-2 rounded-full border border-transparent text-sm font-semibold text-foreground hover:bg-muted-hover focus:bg-muted-focus focus:outline-hidden cursor-pointer";

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        className={triggerClass}
        aria-label="Thông báo"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <Bell className="size-4 shrink-0" />
        {unreadCount > 0 && (
          <span
            data-testid="notification-unread-badge"
            className="absolute -top-1 -end-1 inline-flex min-w-4.5 h-4.5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Danh sách thông báo"
          className="absolute end-0 mt-2.5 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl z-50"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900">
                Thông báo
              </h3>
              {unreadCount > 0 && (
                <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
                  {unreadCount} mới
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={markingAll}
                className="inline-flex items-center gap-1 text-xs font-medium text-teal-600 hover:text-teal-700 disabled:opacity-50 cursor-pointer"
              >
                <CheckCheck className="size-3.5" />
                Đánh dấu đã đọc
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 border-b border-slate-100 bg-slate-50/60 px-3 py-1.5">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition cursor-pointer ${
                filter === "all"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Tất cả ({items.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("unread")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition cursor-pointer ${
                filter === "unread"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Chưa đọc ({unreadCount})
            </button>
          </div>

          <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="px-4 py-8 text-center text-xs text-slate-500">
                Đang tải thông báo...
              </div>
            ) : displayedItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
                <div className="mb-2.5 flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <Bell className="size-5" />
                </div>
                <p className="text-sm font-medium text-slate-700">
                  {filter === "unread"
                    ? "Không có thông báo chưa đọc"
                    : "Chưa có thông báo nào"}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Các cập nhật mới về đơn đặt chỗ và hồ sơ sẽ xuất hiện tại đây.
                </p>
              </div>
            ) : (
              displayedItems.map((item) => {
                const { icon: Icon, bgClass } = getTypeVisual(item.type);
                const isUnread = !item.readAt;
                const itemClass = `flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-slate-50 cursor-pointer ${
                  isUnread ? "bg-teal-50/35" : "bg-white"
                }`;
                const inner = (
                  <>
                    <div
                      className={`mt-0.5 flex size-8.5 shrink-0 items-center justify-center rounded-full ${bgClass}`}
                    >
                      <Icon className="size-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-xs leading-snug ${
                            isUnread
                              ? "font-semibold text-slate-900"
                              : "font-medium text-slate-700"
                          }`}
                        >
                          {item.title}
                        </p>
                        {isUnread && (
                          <span
                            aria-label="Chưa đọc"
                            className="mt-1 size-2 shrink-0 rounded-full bg-teal-600"
                          />
                        )}
                      </div>

                      <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-slate-600">
                        {item.message}
                      </p>

                      <p className="mt-1 text-[11px] text-slate-400">
                        {formatRelativeTime(item.createdAt)}
                      </p>
                    </div>
                  </>
                );

                return item.href ? (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => handleItemClick(item)}
                    className={itemClass}
                  >
                    {inner}
                  </Link>
                ) : (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleItemClick(item)}
                    className={itemClass}
                  >
                    {inner}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
