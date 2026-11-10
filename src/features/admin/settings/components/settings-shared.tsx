import type { ActionState } from "@/shared/lib/action-state";

export const inputClass =
  "block w-full rounded-lg border border-layer-line bg-layer px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground-1 focus:border-primary-focus focus:ring-1 focus:ring-primary-focus focus:outline-hidden disabled:pointer-events-none disabled:opacity-50";

export const layerButtonClass =
  "inline-flex items-center justify-center gap-x-2 rounded-lg border border-layer-line bg-layer px-3 py-2 text-sm font-medium text-layer-foreground shadow-2xs hover:bg-layer-hover focus:bg-layer-focus focus:outline-hidden disabled:pointer-events-none disabled:opacity-50";

export const primaryButtonClass =
  "inline-flex items-center justify-center gap-x-2 rounded-lg border border-primary-line bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover focus:bg-primary-focus focus:outline-hidden disabled:pointer-events-none disabled:opacity-50";

export const dangerButtonClass =
  "inline-flex items-center justify-center gap-x-2 rounded-lg border border-red-200 bg-red-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-red-700 focus:bg-red-700 focus:outline-hidden disabled:pointer-events-none disabled:opacity-50";

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
  return (
    <div
      className="fixed end-5 top-20 z-80 max-w-sm rounded-xl border border-dropdown-line bg-dropdown shadow-lg"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-x-3 p-4">
        {variant === "error" ? (
          <svg
            className="mt-0.5 size-4 shrink-0 text-red-600"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" x2="12" y1="8" y2="12" />
            <line x1="12" x2="12.01" y1="16" y2="16" />
          </svg>
        ) : (
          <svg
            className="mt-0.5 size-4 shrink-0 text-teal-600"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        )}
        <p className="text-sm text-foreground">{message}</p>
        <button
          aria-label="Đóng thông báo"
          className="ms-auto inline-flex size-5 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground focus:text-foreground focus:outline-hidden"
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
