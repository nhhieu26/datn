export function formatProfileCode(id: string): string {
  return `#${id.slice(0, 8).toUpperCase()}`;
}

export function formatSubmittedDate(date: Date): string {
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
