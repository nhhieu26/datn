"use client";

import { useState } from "react";

const MIN = 0;
const MAX = 20_000_000;
const STEP = 100_000;

const THUMB =
  "pointer-events-none absolute inset-0 h-5 w-full appearance-none bg-transparent " +
  "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-new-teal-cta [&::-webkit-slider-thumb]:shadow " +
  "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-new-teal-cta";

function formatMoney(value: number) {
  return `${new Intl.NumberFormat("vi-VN").format(value)}đ`;
}

type PriceRangeSliderProps = {
  minPrice?: number;
  maxPrice?: number;
  /** gọi khi người dùng thả thanh kéo; undefined = không giới hạn đầu đó */
  onCommit: (minPrice?: number, maxPrice?: number) => void;
};

/** Thanh kéo 2 đầu: đầu trái ở 0 và đầu phải ở tối đa nghĩa là không giới hạn */
export function PriceRangeSlider({
  minPrice,
  maxPrice,
  onCommit,
}: PriceRangeSliderProps) {
  const [lo, setLo] = useState(Math.min(minPrice ?? MIN, MAX - STEP));
  const [hi, setHi] = useState(Math.min(maxPrice ?? MAX, MAX));

  function commit(nextLo = lo, nextHi = hi) {
    onCommit(
      nextLo <= MIN ? undefined : nextLo,
      nextHi >= MAX ? undefined : nextHi,
    );
  }

  const left = ((lo - MIN) / (MAX - MIN)) * 100;
  const right = ((hi - MIN) / (MAX - MIN)) * 100;

  return (
    <div>
      <div className="relative mx-2.5 h-5">
        <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded bg-new-chip" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded bg-new-teal-cta"
          style={{ left: `${left}%`, width: `${right - left}%` }}
        />
        <input
          aria-label="Giá thấp nhất (VND)"
          className={THUMB}
          max={MAX}
          min={MIN}
          onChange={(e) => setLo(Math.min(Number(e.target.value), hi - STEP))}
          onKeyUp={() => commit()}
          onPointerUp={() => commit()}
          step={STEP}
          type="range"
          value={lo}
        />
        <input
          aria-label="Giá cao nhất (VND)"
          className={THUMB}
          max={MAX}
          min={MIN}
          onChange={(e) => setHi(Math.max(Number(e.target.value), lo + STEP))}
          onKeyUp={() => commit()}
          onPointerUp={() => commit()}
          step={STEP}
          type="range"
          value={hi}
        />
      </div>
      <div className="mt-3 flex items-center justify-between text-sm font-medium text-new-paragraph">
        <span>{formatMoney(lo)}</span>
        <span>{hi >= MAX ? `${formatMoney(MAX)}+` : formatMoney(hi)}</span>
      </div>
    </div>
  );
}
