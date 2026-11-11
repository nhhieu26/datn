import type { ActionState } from "@/shared/lib/action-state";

// Class theo markup chuẩn của Preline (Input / Button / Label).
export const inputClass =
  "block w-full rounded-lg border-layer-line bg-layer px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground-1 focus:border-primary-focus focus:ring-primary-focus disabled:pointer-events-none disabled:opacity-50 sm:py-3";

export const selectClass = inputClass;

export const labelClass = "mb-2 block text-sm font-medium text-foreground";

export const layerButtonClass =
  "inline-flex items-center justify-center gap-x-2 rounded-lg border border-layer-line bg-layer px-4 py-3 text-sm font-medium text-layer-foreground shadow-2xs hover:bg-layer-hover focus:bg-layer-focus focus:outline-hidden disabled:pointer-events-none disabled:opacity-50";

export const primaryButtonClass =
  "inline-flex items-center justify-center gap-x-2 rounded-lg border border-transparent bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary-hover focus:bg-primary-focus focus:outline-hidden disabled:pointer-events-none disabled:opacity-50";

export const dangerButtonClass =
  "inline-flex items-center justify-center gap-x-2 rounded-lg border border-transparent bg-red-500 px-4 py-3 text-sm font-medium text-white hover:bg-red-600 focus:bg-red-600 focus:outline-hidden disabled:pointer-events-none disabled:opacity-50";

export const smallLayerButtonClass =
  "inline-flex items-center gap-x-1.5 rounded-lg border border-layer-line bg-layer px-2.5 py-1.5 text-xs font-medium text-layer-foreground shadow-2xs hover:bg-layer-hover focus:bg-layer-focus focus:outline-hidden disabled:pointer-events-none disabled:opacity-50";

export const smallDangerButtonClass =
  "inline-flex items-center gap-x-1.5 rounded-lg border border-transparent bg-red-100 px-2.5 py-1.5 text-xs font-medium text-red-800 hover:bg-red-200 focus:bg-red-200 focus:outline-hidden disabled:pointer-events-none disabled:opacity-50";

export const cardClass =
  "flex flex-col rounded-xl border border-card-line bg-card shadow-2xs";

export function getActionErrorMessage(state: ActionState<unknown>): string {
  if (state.formError) return state.formError;
  const firstFieldError = Object.values(state.fieldErrors ?? {})[0]?.[0];
  return firstFieldError ?? "Đã có lỗi xảy ra. Vui lòng thử lại.";
}

export function FieldError({ errors }: { errors?: string[] }) {
  if (!errors || errors.length === 0) return null;
  return <p className="mt-1.5 text-xs text-red-600">{errors[0]}</p>;
}

export function SettingsToast({
  message,
  variant = "success",
  onClose,
}: {
  message: string;
  variant?: "success" | "error";
  onClose: () => void;
}) {
  const isError = variant === "error";
  return (
    <div
      className={`fixed end-5 top-20 z-80 max-w-sm rounded-lg border p-4 text-sm shadow-lg ${
        isError
          ? "border-red-200 bg-red-100 text-red-800"
          : "border-teal-200 bg-teal-100 text-teal-800"
      }`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex gap-x-3">
        <div className="shrink-0">
          <svg
            className="mt-0.5 size-4 shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {isError ? (
              <>
                <circle cx="12" cy="12" r="10" />
                <path d="m15 9-6 6" />
                <path d="m9 9 6 6" />
              </>
            ) : (
              <>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <path d="m9 11 3 3L22 4" />
              </>
            )}
          </svg>
        </div>
        <div className="flex-1">{message}</div>
        <button
          aria-label="Đóng thông báo"
          className="-m-1 inline-flex size-6 shrink-0 items-center justify-center rounded-lg opacity-60 hover:opacity-100 focus:opacity-100 focus:outline-hidden"
          onClick={onClose}
          type="button"
        >
          <svg
            className="size-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Modal theo markup Preline: backdrop + khung bg-overlay, header/body/footer.
export function SettingsModal({
  title,
  maxWidth = "max-w-md",
  children,
}: {
  title: React.ReactNode;
  maxWidth?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-80 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`pointer-events-auto flex w-full ${maxWidth} flex-col rounded-xl border border-overlay-line bg-overlay shadow-2xs`}
      >
        <div className="flex items-center justify-between border-b border-overlay-line px-4 py-3">
          <h3 className="font-bold text-foreground">{title}</h3>
        </div>
        {children}
      </div>
    </div>
  );
}
