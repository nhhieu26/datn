export function formatTourCode(code: string): string {
  return `#${code}`;
}

export function formatTourPrice(value: number): string {
  return `${value.toLocaleString("vi-VN")} đ`;
}

export function formatDepartureDate(value: string | null): string {
  if (!value) return "Chưa lên lịch";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa lên lịch";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatDuration(days: number, nights: number): string {
  return nights > 0 ? `${days} ngày ${nights} đêm` : `${days} ngày`;
}
