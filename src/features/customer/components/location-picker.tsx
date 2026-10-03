"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type LocationPickerProps = {
  locations: string[];
  value: string | null;
  onChange: (value: string | null) => void;
  /** Vùng nút bấm; nhận trạng thái mở để xoay mũi tên */
  renderTrigger: (state: { open: boolean; value: string | null }) => ReactNode;
  className?: string;
};

export function LocationPicker({
  locations,
  value,
  onChange,
  renderTrigger,
  className = "",
}: LocationPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const filtered = locations.filter((name) =>
    name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  function select(next: string | null) {
    onChange(next);
    setOpen(false);
    setQuery("");
  }

  function optionClass(active: boolean) {
    return `block w-full text-left px-4 py-3 text-sm font-medium transition ${
      active ? "bg-new-teal text-white" : "text-gray-700 hover:bg-gray-50"
    }`;
  }

  return (
    <div ref={ref} className={className}>
      <button
        className="w-full text-left cursor-pointer"
        onClick={() => setOpen((o) => !o)}
        type="button"
      >
        {renderTrigger({ open, value })}
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden text-left">
          <div className="p-2 border-b border-gray-100">
            <input
              autoFocus
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:border-new-teal focus:ring-0"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm địa điểm..."
              type="text"
              value={query}
            />
          </div>
          <div className="max-h-56 overflow-y-auto">
            {!query.trim() && (
              <button
                className={optionClass(value === null)}
                onClick={() => select(null)}
                type="button"
              >
                Tất cả địa điểm
              </button>
            )}
            {filtered.map((name) => (
              <button
                key={name}
                className={optionClass(name === value)}
                onClick={() => select(name)}
                type="button"
              >
                {name}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-4 py-3 text-sm text-gray-500">
                Không tìm thấy địa điểm
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
