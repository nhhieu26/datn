"use client";

import type { Tag } from "@/entities/tag";

export function InterestsModal({
  open,
  onClose,
  tags,
  selectedTags,
}: {
  open: boolean;
  onClose: () => void;
  tags: Tag[];
  selectedTags: string[];
}) {
  if (!open) return null;

  return (
    <div
      role="presentation"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[2px]"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="interests-heading"
        className="relative max-h-[90vh] w-full max-w-[510px] overflow-y-auto rounded-[28px] border border-slate-100 bg-white p-8 shadow-2xl"
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

        <h2
          id="interests-heading"
          className="text-[22px] font-bold leading-snug tracking-tight text-slate-900"
        >
          Bạn quan tâm đến điều gì?
        </h2>
        <p className="mt-1.5 pr-6 text-xs leading-relaxed text-slate-500">
          Danh sách tag du lịch và sở thích hiện tại của bạn.
        </p>

        <div className="mb-8 mt-6 flex flex-wrap gap-2.5 select-none">
          {tags.map((tag) => {
            const active = selectedTags.includes(tag.name);
            return (
              <span
                key={tag.id}
                className={`inline-flex items-center rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
                  active
                    ? "border-brand-500 bg-brand-50 text-brand-600 shadow-sm"
                    : "border-slate-200 bg-white text-slate-700"
                }`}
              >
                {tag.name}
              </span>
            );
          })}
          {tags.length === 0 && (
            <p className="text-xs text-slate-500">Chưa có tag nào.</p>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-50 pt-2">
          <span className="text-xs font-medium tracking-tight text-slate-500">
            {selectedTags.length} sở thích đã lưu
          </span>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ff4d1d] to-[#ff6b3d] px-6 py-2.5 text-xs font-semibold text-white shadow-md shadow-orange-500/25 transition-all hover:opacity-95 active:scale-95"
          >
            <span>Đóng</span>
          </button>
        </div>
      </div>
    </div>
  );
}
