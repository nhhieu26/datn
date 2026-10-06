"use client";

import { hasTourEnded } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ProviderBookingTransition, TourBookingListItem } from "../types";
import { TOUR_BOOKING_TRANSITIONS, getBookingStatusMeta } from "../utils";
import { StatusBadge } from "./booking-badges";
import { BookingStatusDialog } from "./booking-status-dialog";

const MENU_WIDTH = 240;

export function BookingStatusMenu({
  booking,
}: {
  booking: TourBookingListItem;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [target, setTarget] = useState<ProviderBookingTransition | null>(null);
  const transitions = TOUR_BOOKING_TRANSITIONS[booking.status] ?? [];
  const open = position !== null;

  useEffect(() => {
    if (!open) return;
    const close = () => setPosition(null);
    function onPointerDown(event: PointerEvent) {
      const node = event.target as Node;
      if (
        !menuRef.current?.contains(node) &&
        !buttonRef.current?.contains(node)
      ) {
        close();
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  if (transitions.length === 0) return <StatusBadge status={booking.status} />;

  const meta = getBookingStatusMeta(booking.status);
  const tourEnded = hasTourEnded(booking.tourEndsAt);

  function toggle() {
    if (open) {
      setPosition(null);
      return;
    }
    // Bảng có overflow-x-auto nên menu render qua portal với position: fixed
    const rect = buttonRef.current!.getBoundingClientRect();
    setPosition({
      top: rect.bottom + 6,
      left: Math.min(rect.left, window.innerWidth - MENU_WIDTH - 8),
    });
  }

  return (
    <>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        className={`inline-flex cursor-pointer items-center gap-1 rounded-full border py-1 pr-1.5 pl-3 text-xs font-semibold whitespace-nowrap shadow-xs transition hover:brightness-95 ${meta.className}`}
        onClick={toggle}
        ref={buttonRef}
        title="Đổi trạng thái"
        type="button"
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
        <span
          className={`material-symbols-outlined transition-transform ${open ? "rotate-180" : ""}`}
          style={{ fontSize: "16px" }}
        >
          expand_more
        </span>
      </button>

      {position
        ? createPortal(
            <div
              className="fixed z-40 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg"
              ref={menuRef}
              role="menu"
              style={{
                top: position.top,
                left: position.left,
                width: MENU_WIDTH,
              }}
            >
              <p className="px-2.5 pt-1 pb-1.5 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                Chuyển sang
              </p>
              {transitions.map((status) => {
                const option = getBookingStatusMeta(status);
                const disabled = status === "completed" && !tourEnded;
                return (
                  <button
                    className="flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
                    disabled={disabled}
                    key={status}
                    onClick={() => {
                      setPosition(null);
                      setTarget(status);
                    }}
                    role="menuitem"
                    type="button"
                  >
                    <span
                      className={`flex size-7 shrink-0 items-center justify-center rounded-full border ${option.className}`}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{
                          fontSize: "15px",
                          fontVariationSettings: option.filled
                            ? "'FILL' 1"
                            : undefined,
                        }}
                      >
                        {option.icon}
                      </span>
                    </span>
                    <span className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-800">
                        {option.label}
                      </span>
                      {disabled ? (
                        <span className="text-xs text-slate-500">
                          Tour chưa kết thúc
                        </span>
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>,
            document.body,
          )
        : null}

      {target
        ? createPortal(
            <BookingStatusDialog
              booking={booking}
              onClose={() => setTarget(null)}
              target={target}
            />,
            document.body,
          )
        : null}
    </>
  );
}
