"use client";

import { useState } from "react";

const buttonClass =
  "inline-flex items-center justify-center gap-x-2 rounded-lg border border-layer-line bg-layer px-3 py-2 text-sm font-medium text-layer-foreground shadow-2xs hover:bg-layer-hover focus:bg-layer-focus focus:outline-hidden disabled:pointer-events-none disabled:opacity-50";

/** Tải file Excel của danh sách đơn đang lọc (truyền lại query string của trang). */
export function ExportBookingsButton({ endpoint }: { endpoint: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleExport() {
    setPending(true);
    setError("");
    try {
      const res = await fetch(`${endpoint}${window.location.search}`);
      if (!res.ok) throw new Error();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const filename =
        /filename="([^"]+)"/.exec(disposition)?.[1] ?? "don-dat.xlsx";
      const url = URL.createObjectURL(await res.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Không xuất được file, vui lòng thử lại.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        aria-busy={pending}
        className={buttonClass}
        disabled={pending}
        onClick={handleExport}
        title="Xuất toàn bộ đơn theo bộ lọc hiện tại ra file Excel"
      >
        <svg
          className="size-4 shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" x2="12" y1="15" y2="3" />
        </svg>
        {pending ? "Đang xuất…" : "Xuất Excel"}
      </button>
      {error ? (
        <span role="alert" className="text-sm text-red-600">
          {error}
        </span>
      ) : null}
    </>
  );
}
