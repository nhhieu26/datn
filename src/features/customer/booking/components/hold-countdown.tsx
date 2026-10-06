"use client";

import { useSyncExternalStore } from "react";

function subscribe(onTick: () => void) {
  const id = setInterval(onTick, 1000);
  return () => clearInterval(id);
}

const nowSeconds = () => Math.floor(Date.now() / 1000);

/** Số giây còn lại của thời gian giữ chỗ; null khi render ở server. */
export function useHoldRemaining(expiresAt: string): number | null {
  const now = useSyncExternalStore(subscribe, nowSeconds, () => null);
  if (now == null) return null;
  return Math.max(0, Math.floor(new Date(expiresAt).getTime() / 1000) - now);
}

function format(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function HoldCountdown({ remaining }: { remaining: number | null }) {
  const expired = remaining === 0;
  return (
    <div
      className={`flex items-center gap-3 rounded-lg p-4 text-sm ${expired ? "bg-new-coral/10 text-new-coral" : "bg-new-chip text-new-title"}`}
      role="status"
    >
      <span aria-hidden className="material-symbols-outlined">
        {expired ? "timer_off" : "timer"}
      </span>
      {expired ? (
        <span className="font-medium">
          Hết thời gian giữ chỗ. Vui lòng đặt lại tour.
        </span>
      ) : (
        <span>
          Chỗ của bạn được giữ trong{" "}
          <strong className="font-bold text-new-teal tabular-nums">
            {remaining == null ? "--:--" : format(remaining)}
          </strong>
          . Vui lòng hoàn tất thanh toán trước khi hết giờ.
        </span>
      )}
    </div>
  );
}
