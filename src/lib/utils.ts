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

export function formatDateTime(value: Date | string | null): string {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Asia/Ho_Chi_Minh",
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

export function formatRelativeTime(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diffMin < 1) return "Vừa xong";
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} giờ trước`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay} ngày trước`;
  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) return `${diffMonth} tháng trước`;
  return `${Math.floor(diffMonth / 12)} năm trước`;
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

export function formatTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Ngày cuối của tour: returnDate nếu có, ngược lại departureDate + (durationDays − 1) ngày. */
export function getTourEndDate(
  departureDate: Date,
  returnDate: Date | null,
  durationDays: number | null,
): Date {
  if (returnDate) return returnDate;
  return new Date(
    departureDate.getTime() + Math.max((durationDays ?? 1) - 1, 0) * DAY_MS,
  );
}

/** Tour coi là đã kết thúc khi đã qua hết ngày cuối. */
export function hasTourEnded(endDate: Date | string, now = new Date()): boolean {
  return now.getTime() >= new Date(endDate).getTime() + DAY_MS;
}

/** Đơn đặt phòng coi là đã trả phòng từ ngày check-out (giờ Việt Nam). */
export function hasCheckedOut(checkOutDate: Date | string, now = new Date()): boolean {
  return todayIsoDate(now) >= new Date(checkOutDate).toISOString().slice(0, 10);
}

/** Customer chỉ được tự hủy đơn trước giờ khởi hành ít nhất số giờ này. */
export const CUSTOMER_CANCEL_CUTOFF_HOURS = 24;

/** Customer chỉ được tự hủy đơn đặt bàn trước giờ đặt ít nhất số giờ này. */
export const RESTAURANT_CANCEL_CUTOFF_HOURS = 2;

export function canCustomerCancelBefore(
  departureDate: Date | string,
  now = new Date(),
  cutoffHours = CUSTOMER_CANCEL_CUTOFF_HOURS,
): boolean {
  return (
    new Date(departureDate).getTime() - cutoffHours * 60 * 60 * 1000 >
    now.getTime()
  );
}

/** Thời điểm đặt bàn: ngày (lưu 00:00 UTC hoặc YYYY-MM-DD) + giờ HH:mm theo giờ Việt Nam. */
export function reservationInstant(date: Date | string, startTime: string): Date {
  const day = date instanceof Date ? date.toISOString().slice(0, 10) : date;
  return new Date(`${day}T${startTime}:00+07:00`);
}

/** Ngày hôm nay theo giờ Việt Nam, dạng YYYY-MM-DD (so sánh được với <input type="date">). */
export function todayIsoDate(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(now);
}
