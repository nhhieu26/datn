"use client";

import { useState } from "react";

const TAGS = [
  "Biển",
  "Núi",
  "Phượt",
  "Nghỉ dưỡng",
  "Sang trọng",
  "Giá rẻ",
  "Gia đình",
  "Cặp đôi",
  "Bạn bè",
  "Một mình",
  "Ẩm thực đường phố",
  "Đặc sản địa phương",
  "Chay",
  "Hải sản",
  "Homestay",
  "Resort",
  "Khách sạn 5 sao",
  "Gần biển",
  "Trung tâm thành phố",
  "Thiên nhiên",
  "Văn hóa - lịch sử",
  "Phiêu lưu mạo hiểm",
];

const MAX_SELECTED = 5;

export function InterestsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<string[]>([
    "Biển",
    "Nghỉ dưỡng",
    "Gần biển",
  ]);

  if (!open) return null;

  const toggle = (tag: string) =>
    setSelected((prev) =>
      prev.includes(tag)
        ? prev.filter((item) => item !== tag)
        : prev.length < MAX_SELECTED
          ? [...prev, tag]
          : prev,
    );

  return (
    <div
      role="presentation"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[2px]"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="relative w-full max-w-[510px] rounded-[28px] border border-slate-100 bg-white p-8 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="absolute right-6 top-6 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M6 18L18 6M6 6l12 12"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
        </button>

        <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-brand-100 to-orange-100/70 text-brand-500 shadow-inner">
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
          </svg>
        </div>

        <h2 className="text-[22px] font-bold leading-snug tracking-tight text-slate-900">
          Bạn quan tâm đến điều gì?
        </h2>
        <p className="mt-1.5 pr-6 text-xs leading-relaxed text-slate-500">
          Chọn một vài sở thích để chúng tôi hiểu bạn hơn và cá nhân hóa gợi ý
          du lịch của bạn.
        </p>

        <div className="mb-8 mt-6 flex flex-wrap gap-2.5 select-none">
          {TAGS.map((tag) => {
            const active = selected.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggle(tag)}
                className={`inline-flex items-center rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
                  active
                    ? "border-brand-500 bg-brand-50 text-brand-600 shadow-sm hover:bg-brand-100"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <span>{tag}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between border-t border-slate-50 pt-2">
          <span className="text-xs font-medium tracking-tight text-slate-500">
            {selected.length}/{MAX_SELECTED} đã chọn
          </span>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ff4d1d] to-[#ff6b3d] px-6 py-2.5 text-xs font-semibold text-white shadow-md shadow-orange-500/25 transition-all hover:opacity-95 active:scale-95"
          >
            <span>Tiếp tục</span>
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M14 5l7 7m0 0l-7 7m7-7H3"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
