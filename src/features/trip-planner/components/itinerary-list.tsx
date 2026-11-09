"use client";

import {
  BedDoubleIcon,
  BikeIcon,
  CarIcon,
  ClockIcon,
  ExternalLinkIcon,
  FootprintsIcon,
  LandmarkIcon,
  RouteIcon,
  TrashIcon,
  TriangleAlertIcon,
  UtensilsIcon,
} from "lucide-react";
import { Fragment, useEffect, useRef } from "react";
import {
  formatDuration,
  formatKm,
  MODE_LABEL,
  SLOT_COLOR,
  SLOT_LABEL,
  totals,
} from "@/features/trip-planner/lib/format";
import { type Day, isMeal, type Leg, type Stop, type TravelMode } from "@/features/trip-planner/lib/itinerary";

const MODE_ICON = { car: CarIcon, motorbike: BikeIcon, walk: FootprintsIcon } as const;

function SlotIcon({ stop }: { stop: Stop }) {
  const Icon = stop.slot === "hotel" ? BedDoubleIcon : isMeal(stop.slot) ? UtensilsIcon : LandmarkIcon;
  return <Icon className="size-3.5" />;
}

export function ItineraryList({
  days,
  selectedDay,
  onSelectDay,
  mode,
  onModeChange,
  activeIndex,
  onActivate,
  onRemove,
  busy,
  warnings,
}: {
  days: Day[];
  selectedDay: number;
  onSelectDay: (day: number) => void;
  mode: TravelMode;
  onModeChange: (mode: TravelMode) => void;
  activeIndex: number | null;
  onActivate: (index: number | null) => void;
  onRemove: (index: number) => void;
  busy: boolean;
  warnings: string[];
}) {
  const day = days[selectedDay];
  const listRef = useRef<HTMLOListElement>(null);

  // Chọn pin trên bản đồ → cuộn tới điểm tương ứng
  useEffect(() => {
    if (activeIndex == null) return;
    listRef.current?.querySelector(`[data-stop="${activeIndex}"]`)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeIndex]);

  const sum = day ? totals(day.legs) : null;
  const ModeIcon = MODE_ICON[mode];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-1 gap-1.5 overflow-x-auto">
          {days.map((d, i) => (
            <button
              className={`shrink-0 rounded px-3 py-1.5 text-sm font-semibold transition-colors ${
                i === selectedDay ? "bg-new-teal-cta text-white" : "bg-white text-new-title hover:text-new-teal-cta"
              }`}
              key={i}
              onClick={() => onSelectDay(i)}
              type="button"
            >
              Ngày {i + 1}
              {d.date && <span className="ml-1 font-normal opacity-80">({d.date.slice(8, 10)}/{d.date.slice(5, 7)})</span>}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-1.5 text-sm text-new-title">
          <ModeIcon className="size-4 text-new-teal-cta" />
          <select
            aria-label="Phương tiện di chuyển"
            className="rounded border border-new-input-border bg-white py-1 pr-7 pl-2 text-sm focus:border-new-teal focus:outline-none"
            disabled={busy}
            onChange={(e) => onModeChange(e.target.value as TravelMode)}
            value={mode}
          >
            {(Object.keys(MODE_LABEL) as TravelMode[]).map((m) => (
              <option key={m} value={m}>
                {MODE_LABEL[m]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {day && sum && (
        <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-new-title">
          <span className="flex items-center gap-1">
            <ClockIcon className="size-3.5 text-new-teal-cta" /> {day.start}–{day.end}
          </span>
          <span className="flex items-center gap-1">
            <RouteIcon className="size-3.5 text-new-teal-cta" /> {formatKm(sum.distanceM)} · di chuyển{" "}
            {formatDuration(sum.durationMin)}
          </span>
          <span>{day.stops.length} điểm dừng</span>
          {busy && <span className="text-new-teal-cta">Đang tính lại quãng đường...</span>}
        </p>
      )}

      {warnings.length > 0 && (
        <ul className="mt-2 space-y-1 rounded bg-amber-50 px-3 py-2 text-xs text-amber-800">
          {warnings.map((w) => (
            <li className="flex gap-1.5" key={w}>
              <TriangleAlertIcon className="mt-0.5 size-3.5 shrink-0" />
              {w}
            </li>
          ))}
        </ul>
      )}

      <ol className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1" ref={listRef}>
        {day?.stops.map((stop, i) => (
          <Fragment key={`${stop.placeId}-${i}`}>
            <StopItem
              active={i === activeIndex}
              index={i}
              onActivate={onActivate}
              onRemove={busy || day.stops.length <= 1 ? undefined : () => onRemove(i)}
              stop={stop}
            />
            {i < day.stops.length - 1 && <LegRow leg={day.legs[i]} mode={mode} />}
          </Fragment>
        ))}
      </ol>
    </div>
  );
}

function StopItem({
  stop,
  index,
  active,
  onActivate,
  onRemove,
}: {
  stop: Stop;
  index: number;
  active: boolean;
  onActivate: (index: number | null) => void;
  onRemove?: () => void;
}) {
  const p = stop.place;
  const color = SLOT_COLOR[stop.slot];
  return (
    <li
      className="flex gap-3"
      data-stop={index}
      onBlur={() => onActivate(null)}
      onFocus={() => onActivate(index)}
      onMouseEnter={() => onActivate(index)}
      onMouseLeave={() => onActivate(null)}
    >
      <div className="flex w-12 shrink-0 flex-col items-center pt-2.5">
        <span className="text-sm font-bold text-new-title">{stop.time}</span>
        <span
          className="mt-1 flex size-6 items-center justify-center rounded-full text-[11px] font-bold text-white"
          style={{ backgroundColor: color }}
        >
          {index + 1}
        </span>
      </div>
      <div
        className={`group flex min-w-0 flex-1 gap-3 rounded border bg-white p-2.5 transition-all ${
          active ? "border-new-teal-cta ring-1 ring-new-teal-cta/30" : "border-new-chip"
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- ảnh proxy Google Places, kích thước nhỏ */}
        <img alt="" className="size-16 shrink-0 rounded object-cover" src={p.image ?? "/image-notfound.png"} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold" style={{ color }}>
            <SlotIcon stop={stop} />
            {SLOT_LABEL[stop.slot]}
            <span className="font-medium text-new-paragraph">· {formatDuration(stop.durationMin)}</span>
          </div>
          <a
            className="mt-0.5 flex items-center gap-1 text-sm font-semibold text-new-title hover:text-new-teal-cta"
            href={p.url}
            rel="noreferrer"
            target="_blank"
          >
            <span className="truncate">{p.name}</span>
            <ExternalLinkIcon className="size-3.5 shrink-0 text-new-placeholder" />
          </a>
          <p className="truncate text-xs">
            {p.type}
            {p.rating != null && p.reviewCount ? ` · ★ ${p.rating.toFixed(1)} (${p.reviewCount})` : ""}
          </p>
          {stop.note && <p className="mt-1 text-xs text-new-title">{stop.note}</p>}
        </div>
        {onRemove && (
          <button
            aria-label={`Xóa ${p.name} khỏi lộ trình`}
            className="self-start rounded p-1 text-new-placeholder opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100 focus:opacity-100"
            onClick={onRemove}
            type="button"
          >
            <TrashIcon className="size-4" />
          </button>
        )}
      </div>
    </li>
  );
}

function LegRow({ leg, mode }: { leg?: Leg | null; mode: TravelMode }) {
  const Icon = MODE_ICON[mode];
  return (
    <li className="flex gap-3">
      <div className="flex w-12 shrink-0 justify-center">
        <span className="h-full min-h-8 w-0.5 bg-new-chip" />
      </div>
      <p className="flex items-center gap-1.5 py-2 text-xs font-medium text-new-paragraph">
        <Icon className="size-3.5 text-new-teal-cta" />
        {!leg
          ? "Chưa tính được quãng đường"
          : leg.distanceM === 0
            ? "Cùng địa điểm"
            : `${formatKm(leg.distanceM)} · ${formatDuration(leg.durationS / 60)}`}
      </p>
    </li>
  );
}
