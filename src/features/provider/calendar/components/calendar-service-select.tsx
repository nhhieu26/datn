"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { buildCalendarUrl } from "../search-params";
import type { CalendarServiceOption } from "../types";

export function CalendarServiceSelect({
  slug,
  month,
  value,
  options,
  allLabel,
  label,
}: {
  slug: string;
  month: string;
  value: string | undefined;
  options: CalendarServiceOption[];
  /** Nhãn của lựa chọn "xem tất cả", ví dụ "Tất cả tour". */
  allLabel: string;
  /** Nhãn cho trình đọc màn hình. */
  label: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <select
      aria-busy={isPending}
      aria-label={label}
      className="block w-full rounded-lg border-layer-line bg-layer py-2 ps-3 pe-9 text-foreground focus:border-primary-focus focus:ring-primary-focus disabled:opacity-50 sm:w-72 sm:text-sm"
      disabled={isPending}
      onChange={(event) => {
        const service = event.target.value || undefined;
        startTransition(() =>
          router.push(buildCalendarUrl(slug, { month, service }), {
            scroll: false,
          }),
        );
      }}
      value={value ?? ""}
    >
      <option value="">{allLabel}</option>
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.name}
        </option>
      ))}
    </select>
  );
}
