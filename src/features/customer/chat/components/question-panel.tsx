"use client";

import { ArrowUpIcon } from "lucide-react";
import { useState } from "react";

const OPTION_CLASS =
  "w-full rounded border border-new-input-border px-4 py-2.5 text-left text-sm text-new-title transition-colors hover:border-new-teal-cta hover:text-new-teal-cta";

// Câu hỏi ngược của AI: 3 lựa chọn + "Khác..." để tự nhập
export function QuestionPanel({
  question,
  options,
  onAnswer,
}: {
  question?: string;
  options: string[];
  onAnswer: (answer: string) => void;
}) {
  const [custom, setCustom] = useState<string | null>(null);

  return (
    <div className="rounded bg-white p-4">
      <p className="mb-3 text-base font-semibold text-new-title">{question}</p>

      {custom === null ? (
        <div className="flex flex-col gap-2">
          {options.map((option) => (
            <button className={OPTION_CLASS} key={option} onClick={() => onAnswer(option)} type="button">
              {option}
            </button>
          ))}
          <button className={OPTION_CLASS} onClick={() => setCustom("")} type="button">
            Khác...
          </button>
        </div>
      ) : (
        <form
          className="flex flex-col gap-2.5"
          onSubmit={(e) => {
            e.preventDefault();
            if (custom.trim()) onAnswer(custom.trim());
          }}
        >
          <div className="flex gap-2.5">
            <input
              aria-label="Câu trả lời của bạn"
              autoFocus
              className="h-[49px] w-full rounded border border-new-input-border px-3.5 text-base text-new-title focus:border-new-teal focus:outline-none"
              onChange={(e) => setCustom(e.target.value)}
              placeholder="Nhập câu trả lời của bạn..."
              value={custom}
            />
            <button
              aria-label="Gửi câu trả lời"
              className="flex size-[49px] shrink-0 items-center justify-center rounded bg-new-teal-cta text-white disabled:opacity-50"
              disabled={!custom.trim()}
              type="submit"
            >
              <ArrowUpIcon className="size-5" />
            </button>
          </div>
          <button
            className="self-start text-sm font-medium text-new-teal-cta hover:underline"
            onClick={() => setCustom(null)}
            type="button"
          >
            Quay lại các lựa chọn
          </button>
        </form>
      )}
    </div>
  );
}
