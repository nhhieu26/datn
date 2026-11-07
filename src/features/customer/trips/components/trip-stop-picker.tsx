"use client";

import { CheckIcon, StarIcon } from "lucide-react";
import { useState } from "react";
import type { StopPick, TripChatMessage } from "../lib/trip-ai";
import { KIND_LABEL } from "./trip-format";

type ChatPart = TripChatMessage["parts"][number];
export type AskUserPart = Extract<ChatPart, { type: "tool-askUser" }>;
type AskUserInput = NonNullable<Extract<AskUserPart, { state: "input-available" }>["input"]>;
type PickOption = AskUserInput["options"][number];

/** Thông tin hiển thị của địa điểm, lấy từ kết quả findPlaces trước đó trong hội thoại. */
export type PlaceDetail = {
  image: string | null;
  address: string | null;
  rating: number | null;
  reviewCount: number | null;
};

export const placeKey = (p: { source: string; refId: string }) => `${p.source}:${p.refId}`;

export function collectPlaceDetails(messages: TripChatMessage[]): Map<string, PlaceDetail> {
  const details = new Map<string, PlaceDetail>();
  for (const message of messages) {
    for (const part of message.parts) {
      if (part.type !== "tool-findPlaces" || part.state !== "output-available") continue;
      for (const place of part.output.places) {
        details.set(placeKey({ source: place.source, refId: place.id }), {
          image: "image" in place ? (place.image ?? null) : null,
          address: place.address || null,
          rating: "rating" in place ? (place.rating ?? null) : null,
          reviewCount: "reviewCount" in place ? (place.reviewCount ?? null) : null,
        });
      }
    }
  }
  return details;
}

/** Bảng chọn điểm dừng thay cho ô nhập khi AI hỏi người dùng muốn thêm địa điểm nào. */
export function StopPicker({
  input,
  details,
  addedKeys,
  dayCount,
  onAnswer,
}: {
  input: AskUserInput;
  details: Map<string, PlaceDetail>;
  addedKeys: Set<string>;
  dayCount: number;
  onAnswer: (answer: StopPick) => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [day, setDay] = useState(() => Math.min(Math.max(1, input.day), dayCount));

  const toggle = (key: string) =>
    setSelected((cur) => {
      const next = new Set(cur);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  function add() {
    const places = input.options
      .filter((o) => selected.has(placeKey(o)))
      .map(({ source, kind, refId, name }) => ({ source, kind, refId, name }));
    if (places.length > 0) onAnswer({ action: "add", day, places });
  }

  return (
    <div className="space-y-2 border-t border-new-chip p-3">
      <p className="text-sm font-semibold text-new-title">{input.question}</p>
      <ul className="max-h-72 space-y-1.5 overflow-y-auto">
        {input.options.map((option) => (
          <PickRow
            added={addedKeys.has(placeKey(option))}
            checked={selected.has(placeKey(option))}
            detail={details.get(placeKey(option))}
            key={placeKey(option)}
            onToggle={() => toggle(placeKey(option))}
            option={option}
          />
        ))}
      </ul>
      <div className="flex items-center gap-2">
        <label className="flex shrink-0 items-center gap-1.5 text-xs text-new-paragraph">
          Vào
          <select
            className="rounded border border-new-input-border bg-white px-1.5 py-1 text-xs text-new-title focus:border-new-teal focus:outline-none"
            onChange={(e) => setDay(Number(e.target.value))}
            value={day}
          >
            {Array.from({ length: dayCount }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                Ngày {i + 1}
              </option>
            ))}
          </select>
        </label>
        <button
          className="flex-1 rounded bg-new-teal-cta px-3 py-2 text-sm font-semibold text-white hover:bg-new-teal-hover disabled:opacity-50"
          disabled={selected.size === 0}
          onClick={add}
          type="button"
        >
          {selected.size > 0 ? `Thêm ${selected.size} điểm vào Ngày ${day}` : "Chọn địa điểm để thêm"}
        </button>
      </div>
      <div className="flex gap-2 text-xs">
        <button
          className="flex-1 rounded border border-new-chip px-3 py-1.5 font-medium text-new-title hover:border-new-teal-cta"
          onClick={() => onAnswer({ action: "more" })}
          type="button"
        >
          Gợi ý khác
        </button>
        <button
          className="flex-1 rounded border border-new-chip px-3 py-1.5 font-medium text-new-paragraph hover:border-new-teal-cta"
          onClick={() => onAnswer({ action: "cancel" })}
          type="button"
        >
          Bỏ qua
        </button>
      </div>
    </div>
  );
}

function PickRow({
  option,
  detail,
  checked,
  added,
  onToggle,
}: {
  option: PickOption;
  detail?: PlaceDetail;
  checked: boolean;
  added: boolean;
  onToggle: () => void;
}) {
  const meta = [
    KIND_LABEL[option.kind],
    option.source === "external" ? "Ngoài Roamly" : null,
    detail?.address ?? null,
  ].filter(Boolean);

  return (
    <li>
      <label
        className={`flex items-start gap-2.5 rounded border p-2 transition-colors ${
          added
            ? "cursor-not-allowed border-new-chip bg-new-section-bg opacity-60"
            : checked
              ? "cursor-pointer border-new-teal-cta bg-teal-50"
              : "cursor-pointer border-new-chip hover:border-new-teal-cta/60"
        }`}
      >
        <input checked={checked} className="sr-only" disabled={added} onChange={onToggle} type="checkbox" />
        <span
          aria-hidden
          className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border ${
            checked ? "border-new-teal-cta bg-new-teal-cta text-white" : "border-new-input-border bg-white"
          }`}
        >
          {checked && <CheckIcon className="size-3" />}
        </span>
        {detail?.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt="" className="size-12 shrink-0 rounded object-cover" src={detail.image} />
        )}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-new-title">{option.name}</span>
          <span className="block truncate text-xs text-new-paragraph">{meta.join(" · ")}</span>
          {added ? (
            <span className="block text-xs font-medium text-new-teal-cta">Đã có trong lộ trình</span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-new-paragraph">
              {detail?.rating != null && (
                <span className="flex shrink-0 items-center gap-0.5 font-medium text-new-title">
                  <StarIcon className="size-3 fill-amber-400 text-amber-400" />
                  {detail.rating.toFixed(1)}
                  {detail.reviewCount ? (
                    <span className="font-normal text-new-paragraph">({detail.reviewCount})</span>
                  ) : null}
                </span>
              )}
              {option.reason && <span className="line-clamp-2">{option.reason}</span>}
            </span>
          )}
        </span>
      </label>
    </li>
  );
}

/** Tóm tắt lựa chọn đã gửi, hiển thị như tin nhắn của người dùng. */
export function describePick(pick: StopPick): string {
  if (pick.action === "more") return "Gợi ý cho tôi địa điểm khác";
  if (pick.action === "cancel") return "Thôi, không thêm";
  return `Thêm vào Ngày ${pick.day}: ${pick.places.map((p) => p.name).join(", ")}`;
}
