// Class dùng chung theo token Preline (giống destinations)
export const inputClass =
  "block w-full rounded-lg border-layer-line bg-layer px-3 py-2 text-foreground placeholder:text-muted-foreground-1 focus:border-primary-focus focus:ring-primary-focus disabled:pointer-events-none disabled:opacity-50 sm:text-sm";
export const selectClass = `${inputClass} pe-9`;
export const textareaClass = `${inputClass} resize-y py-2.5 leading-relaxed`;
export const labelClass = "mb-2 block text-sm font-medium text-foreground";
export const layerButtonClass =
  "inline-flex items-center justify-center gap-x-2 rounded-lg border border-layer-line bg-layer px-3 py-2 text-sm font-medium text-layer-foreground shadow-2xs hover:bg-layer-hover focus:bg-layer-focus focus:outline-hidden disabled:pointer-events-none disabled:opacity-50";
export const primaryButtonClass =
  "inline-flex items-center justify-center gap-x-2 rounded-lg border border-primary-line bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover focus:bg-primary-focus focus:outline-hidden disabled:pointer-events-none disabled:opacity-50";
export const dropdownItemClass =
  "flex w-full items-center gap-x-3 rounded-lg px-3 py-2 text-start text-sm text-dropdown-item-foreground hover:bg-dropdown-item-hover focus:bg-dropdown-item-focus focus:outline-hidden";
export const pageButtonClass =
  "inline-flex min-h-9.5 min-w-9.5 items-center justify-center rounded-lg px-2.5 py-2 text-sm text-foreground hover:bg-muted-hover focus:bg-muted-focus focus:outline-hidden disabled:pointer-events-none disabled:opacity-50";
export const cardClass =
  "flex flex-col rounded-xl border border-card-line bg-card shadow-2xs";

export function chipClass(selected: boolean) {
  return `inline-flex items-center gap-x-1.5 rounded-full border px-3 py-1.5 text-xs font-medium focus:outline-hidden ${
    selected
      ? "border-primary-line bg-primary-50 text-primary-700"
      : "border-layer-line bg-layer text-layer-foreground hover:bg-layer-hover"
  }`;
}
