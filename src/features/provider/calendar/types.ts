import type { BookingStatus } from "@/generated/prisma/enums";

export type CalendarEvent = {
  code: string;
  status: BookingStatus;
  title: string;
  subtitle: string | null;
  /** Mô tả thời gian: ngày khởi hành, khoảng lưu trú hoặc giờ đặt bàn. */
  schedule: string;
  guests: number;
  contactName: string;
  amount: string | null;
  /** Ngày bắt đầu (YYYY-MM-DD). */
  start: string;
  /** Ngày kết thúc, không tính (YYYY-MM-DD). */
  end: string;
};

export type CalendarDay = {
  iso: string;
  day: number;
  inMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  events: CalendarEvent[];
};
