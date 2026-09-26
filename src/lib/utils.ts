export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function formatEntityCode(prefix: string, id: string): string {
  return `${prefix}-${id.slice(0, 8).toUpperCase()}`;
}

export function formatDate(value: Date | string | null): string {
  if (!value) return "Chưa lên lịch";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa lên lịch";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatUpdatedLabel(date: Date): string {
  const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diffMin < 1) return "Cập nhật vừa xong";
  if (diffMin < 60) return `Cập nhật ${diffMin} phút trước`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `Cập nhật ${diffHr} giờ trước`;
  const diffDay = Math.floor(diffHr / 24);
  return `Cập nhật ${diffDay} ngày trước`;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

export function formatTourDuration(days: number, nights: number): string {
  return nights > 0 ? `${days} ngày ${nights} đêm` : `${days} ngày`;
}
