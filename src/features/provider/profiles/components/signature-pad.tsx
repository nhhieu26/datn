"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import type { ActionState } from "@/shared/lib/action-state";
import {
  removeProviderSignatureAction,
  saveProviderSignatureAction,
} from "../actions";
import { ProfileIcon } from "./profile-icon";

const INITIAL_STATE: ActionState = { status: "idle" };
const MAX_SIZE = 2 * 1024 * 1024;
const ACCEPT = "image/png,image/jpeg,image/webp";

const primaryButtonClass =
  "inline-flex items-center justify-center gap-x-2 rounded-lg border border-primary-line bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover focus:bg-primary-focus focus:outline-hidden disabled:pointer-events-none disabled:opacity-50";
const layerButtonClass =
  "inline-flex items-center justify-center gap-x-2 rounded-lg border border-layer-line bg-layer px-3 py-2 text-sm font-medium text-layer-foreground shadow-2xs hover:bg-layer-hover focus:bg-layer-focus focus:outline-hidden disabled:pointer-events-none disabled:opacity-50";

type Mode = "draw" | "upload";

/** Cắt phần trống quanh nét vẽ, trả về PNG nền trong suốt. */
function exportTrimmed(canvas: HTMLCanvasElement): Promise<Blob | null> {
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.resolve(null);
  const { width, height } = canvas;
  const { data } = ctx.getImageData(0, 0, width, height);
  let minX = width, minY = height, maxX = -1, maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 0) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return Promise.resolve(null);

  const pad = 8;
  const sx = Math.max(0, minX - pad);
  const sy = Math.max(0, minY - pad);
  const sw = Math.min(width, maxX + pad + 1) - sx;
  const sh = Math.min(height, maxY + pad + 1) - sy;
  const out = document.createElement("canvas");
  out.width = sw;
  out.height = sh;
  out.getContext("2d")?.drawImage(canvas, sx, sy, sw, sh, 0, 0, sw, sh);
  return new Promise((resolve) => out.toBlob(resolve, "image/png"));
}

export function SignaturePad({
  profileId,
  signatureUrl,
}: {
  profileId: string;
  signatureUrl: string | null;
}) {
  const [mode, setMode] = useState<Mode>("draw");
  const [hasStrokes, setHasStrokes] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [state, setState] = useState<ActionState>(INITIAL_STATE);
  const [isRemoving, startRemove] = useTransition();
  const [isSaving, startSave] = useTransition();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  // Khởi tạo canvas theo devicePixelRatio để nét vẽ sắc nét.
  useEffect(() => {
    if (mode !== "draw") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.round(rect.width * ratio);
    canvas.height = Math.round(rect.height * ratio);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(ratio, ratio);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#0f172a";
  }, [mode]);

  // Thu hồi object URL của ảnh xem trước cũ.
  useEffect(() => {
    if (!uploadPreview) return;
    return () => URL.revokeObjectURL(uploadPreview);
  }, [uploadPreview]);

  function selectUpload(file: File | null) {
    if (file) setState(INITIAL_STATE);
    setUploadFile(file);
    setUploadPreview(file ? URL.createObjectURL(file) : null);
  }

  function switchMode(next: Mode) {
    setMode(next);
    setState(INITIAL_STATE);
    setHasStrokes(false);
    setClientError(null);
  }

  function pointOf(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    setState(INITIAL_STATE);
    drawingRef.current = true;
    const p = pointOf(e);
    lastPointRef.current = p;
    // Chấm một điểm khi chỉ chạm.
    const ctx = e.currentTarget.getContext("2d");
    ctx?.beginPath();
    ctx?.arc(p.x, p.y, 1.25, 0, Math.PI * 2);
    ctx?.fill();
    setHasStrokes(true);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current || !lastPointRef.current) return;
    const ctx = e.currentTarget.getContext("2d");
    if (!ctx) return;
    const p = pointOf(e);
    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastPointRef.current = p;
  }

  function handlePointerUp() {
    drawingRef.current = false;
    lastPointRef.current = null;
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    canvas?.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
    setHasStrokes(false);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setClientError(null);
    const file = e.target.files?.[0] ?? null;
    e.target.value = "";
    if (!file) return;
    if (!ACCEPT.split(",").includes(file.type) || file.size > MAX_SIZE) {
      setClientError("Ảnh chữ ký phải là PNG/JPG/WebP và dưới 2MB.");
      return;
    }
    selectUpload(file);
  }

  async function handleSave() {
    setClientError(null);
    let file: File | null = uploadFile;
    if (mode === "draw") {
      const canvas = canvasRef.current;
      const blob = canvas ? await exportTrimmed(canvas) : null;
      if (!blob) {
        setClientError("Vui lòng vẽ chữ ký trước khi lưu.");
        return;
      }
      file = new File([blob], "signature.png", { type: "image/png" });
    }
    if (!file) {
      setClientError("Vui lòng chọn ảnh chữ ký.");
      return;
    }
    const formData = new FormData();
    formData.set("signature", file);
    startSave(async () => {
      const result = await saveProviderSignatureAction(profileId, INITIAL_STATE, formData);
      setState(result);
      if (result.status === "success") {
        selectUpload(null);
        clearCanvas();
      }
    });
  }

  function handleRemove() {
    setRemoveError(null);
    setState(INITIAL_STATE);
    startRemove(async () => {
      const result = await removeProviderSignatureAction(profileId);
      if (result.status === "error") {
        setRemoveError(result.formError ?? "Không thể xóa chữ ký.");
      }
    });
  }

  const serverError = state.status === "error"
    ? (state.fieldErrors?.signature?.[0] ?? state.formError)
    : null;
  const error = clientError ?? serverError ?? removeError;
  const canSave = mode === "draw" ? hasStrokes : Boolean(uploadFile);

  const tabClass = (active: boolean) =>
    `flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus:outline-hidden ${
      active
        ? "bg-layer text-foreground shadow-2xs"
        : "text-muted-foreground-1 hover:text-foreground"
    }`;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground-1">
        Chữ ký sẽ được in trên hóa đơn của các đơn đặt thuộc hồ sơ này.
      </p>

      <div>
        <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground-1 uppercase">
          Chữ ký hiện tại
        </p>
        {signatureUrl ? (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-card-line bg-white p-3">
            <div className="flex h-16 min-w-0 flex-1 items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="Chữ ký hiện tại"
                className="max-h-full max-w-full object-contain"
                src={signatureUrl}
              />
            </div>
            <button
              className={layerButtonClass}
              disabled={isRemoving || isSaving}
              onClick={handleRemove}
              type="button"
            >
              <ProfileIcon name="trash" />
              {isRemoving ? "Đang xóa..." : "Xóa"}
            </button>
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-card-line p-3 text-sm text-muted-foreground-1">
            Chưa có chữ ký — hóa đơn sẽ để trống phần ký tên.
          </p>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex gap-1 rounded-lg bg-surface p-1" role="tablist">
          <button
            aria-selected={mode === "draw"}
            className={tabClass(mode === "draw")}
            onClick={() => switchMode("draw")}
            role="tab"
            type="button"
          >
            Vẽ tay
          </button>
          <button
            aria-selected={mode === "upload"}
            className={tabClass(mode === "upload")}
            onClick={() => switchMode("upload")}
            role="tab"
            type="button"
          >
            Tải ảnh lên
          </button>
        </div>

        {mode === "draw" ? (
          <div>
            <canvas
              aria-label="Khung vẽ chữ ký"
              className="h-40 w-full cursor-crosshair touch-none rounded-lg border border-dashed border-card-line bg-white"
              onPointerCancel={handlePointerUp}
              onPointerDown={handlePointerDown}
              onPointerLeave={handlePointerUp}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              ref={canvasRef}
            />
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground-1">
              <span>Dùng chuột hoặc ngón tay để ký.</span>
              <button
                className="font-medium text-primary-600 hover:underline disabled:opacity-50"
                disabled={!hasStrokes}
                onClick={clearCanvas}
                type="button"
              >
                Xóa nét vẽ
              </button>
            </div>
          </div>
        ) : (
          <label className="flex h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-card-line bg-white p-3 text-sm text-muted-foreground-1 hover:bg-layer-hover">
            {uploadPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt="Xem trước chữ ký"
                className="max-h-full max-w-full object-contain"
                src={uploadPreview}
              />
            ) : (
              <>
                <ProfileIcon name="upload" className="size-5" />
                <span>Chọn ảnh PNG/JPG/WebP (≤ 2MB)</span>
                <span className="text-xs">Nên dùng PNG nền trong suốt</span>
              </>
            )}
            <input accept={ACCEPT} className="sr-only" onChange={handleFileChange} type="file" />
          </label>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {state.status === "success" && !error && (
        <p className="text-sm text-teal-600">Đã lưu chữ ký.</p>
      )}

      <button
        className={`${primaryButtonClass} w-full`}
        disabled={!canSave || isSaving || isRemoving}
        onClick={handleSave}
        type="button"
      >
        {isSaving ? "Đang lưu..." : signatureUrl ? "Thay chữ ký" : "Lưu chữ ký"}
      </button>
    </div>
  );
}
