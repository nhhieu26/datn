"use client";

import { useState, useTransition } from "react";
import type { SystemSettings } from "@/entities/system-setting";
import { formatCurrency } from "@/lib/utils";
import {
  resetOperationalSettingsAction,
  saveOperationalSettingsAction,
} from "../actions";
import {
  FieldError,
  getActionErrorMessage,
  inputClass,
  layerButtonClass,
  primaryButtonClass,
} from "./settings-shared";

const SAMPLE_BOOKING_AMOUNT = 5_000_000;

export function OperationalSettingsTab({
  settings,
  onSettingsUpdated,
  onNotify,
}: {
  settings: SystemSettings;
  onSettingsUpdated: (next: SystemSettings) => void;
  onNotify: (message: string, variant?: "success" | "error") => void;
}) {
  const [commissionPercent, setCommissionPercent] = useState(() =>
    String(Number((settings.commissionRate * 100).toFixed(2))),
  );
  const [usdRate, setUsdRate] = useState(() => String(settings.usdRate));
  const [bookingHoldMinutes, setBookingHoldMinutes] = useState(() =>
    String(settings.bookingHoldMinutes),
  );
  const [customerCancelCutoffHours, setCustomerCancelCutoffHours] = useState(
    () => String(settings.customerCancelCutoffHours),
  );
  const [restaurantCancelCutoffHours, setRestaurantCancelCutoffHours] =
    useState(() => String(settings.restaurantCancelCutoffHours));
  const [serviceDeleteGraceDays, setServiceDeleteGraceDays] = useState(() =>
    String(settings.serviceDeleteGraceDays),
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isPending, startTransition] = useTransition();

  const syncFormState = (next: SystemSettings) => {
    setCommissionPercent(
      String(Number((next.commissionRate * 100).toFixed(2))),
    );
    setUsdRate(String(next.usdRate));
    setBookingHoldMinutes(String(next.bookingHoldMinutes));
    setCustomerCancelCutoffHours(String(next.customerCancelCutoffHours));
    setRestaurantCancelCutoffHours(String(next.restaurantCancelCutoffHours));
    setServiceDeleteGraceDays(String(next.serviceDeleteGraceDays));
  };

  const parsedCommission = Math.min(
    50,
    Math.max(0, Number(commissionPercent) || 0),
  );
  const parsedUsdRate = Math.max(1000, Number(usdRate) || 25_000);
  const sampleFee = Math.round(
    (SAMPLE_BOOKING_AMOUNT * parsedCommission) / 100,
  );
  const sampleProviderAmount = SAMPLE_BOOKING_AMOUNT - sampleFee;
  const sampleUsdCharged = (SAMPLE_BOOKING_AMOUNT / parsedUsdRate).toFixed(2);
  const sampleUsdPayout = (sampleProviderAmount / parsedUsdRate).toFixed(2);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFieldErrors({});
    startTransition(async () => {
      const result = await saveOperationalSettingsAction({
        commissionPercent,
        usdRate,
        bookingHoldMinutes,
        customerCancelCutoffHours,
        restaurantCancelCutoffHours,
        serviceDeleteGraceDays,
      });
      if (result.status === "error" || !result.data) {
        setFieldErrors(result.fieldErrors ?? {});
        onNotify(getActionErrorMessage(result), "error");
        return;
      }
      syncFormState(result.data);
      onSettingsUpdated(result.data);
      onNotify("Đã lưu cấu hình vận hành và thanh toán.");
    });
  };

  const handleReset = () => {
    setFieldErrors({});
    startTransition(async () => {
      const result = await resetOperationalSettingsAction();
      if (result.status === "error" || !result.data) {
        onNotify(getActionErrorMessage(result), "error");
        return;
      }
      syncFormState(result.data);
      onSettingsUpdated(result.data);
      onNotify("Đã khôi phục thông số vận hành về mặc định.");
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-8">
        {/* Card 1: Thanh toán & Hoa hồng */}
        <section className="rounded-xl border border-card-line bg-card p-5 shadow-2xs sm:p-6">
          <div className="border-b border-card-line pb-4">
            <h2 className="text-base font-semibold text-foreground">
              Cấu hình Thanh toán & Hoa hồng sàn
            </h2>
            <p className="mt-1 text-sm text-muted-foreground-1">
              Áp dụng trực tiếp cho các đơn đặt Tour và Khách sạn mới tạo trên
              hệ thống.
            </p>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="commissionPercent"
                className="block text-sm font-medium text-foreground"
              >
                Tỉ lệ hoa hồng sàn (%)
              </label>
              <div className="relative mt-1.5">
                <input
                  id="commissionPercent"
                  type="number"
                  step="0.1"
                  min="0"
                  max="50"
                  value={commissionPercent}
                  onChange={(e) => setCommissionPercent(e.target.value)}
                  disabled={isPending}
                  className={`${inputClass} pe-10`}
                />
                <span className="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-3 text-sm text-muted-foreground-1">
                  %
                </span>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground-1">
                Phí nền tảng khấu trừ trên mỗi đơn thành công (mặc định 10%).
              </p>
              <FieldError errors={fieldErrors.commissionPercent} />
            </div>

            <div>
              <label
                htmlFor="usdRate"
                className="block text-sm font-medium text-foreground"
              >
                Tỉ giá quy đổi PayPal (VND / 1 USD)
              </label>
              <div className="relative mt-1.5">
                <input
                  id="usdRate"
                  type="number"
                  step="100"
                  min="1000"
                  max="1000000"
                  value={usdRate}
                  onChange={(e) => setUsdRate(e.target.value)}
                  disabled={isPending}
                  className={`${inputClass} pe-14`}
                />
                <span className="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-3 text-xs font-medium text-muted-foreground-1">
                  VND
                </span>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground-1">
                Dùng để quy đổi VND sang USD khi tạo lệnh thu/chi qua PayPal.
              </p>
              <FieldError errors={fieldErrors.usdRate} />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="bookingHoldMinutes"
                className="block text-sm font-medium text-foreground"
              >
                Thời gian giữ chỗ chờ thanh toán (phút)
              </label>
              <div className="relative mt-1.5 max-w-xs">
                <input
                  id="bookingHoldMinutes"
                  type="number"
                  min="1"
                  max="120"
                  value={bookingHoldMinutes}
                  onChange={(e) => setBookingHoldMinutes(e.target.value)}
                  disabled={isPending}
                  className={`${inputClass} pe-14`}
                />
                <span className="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-3 text-xs font-medium text-muted-foreground-1">
                  phút
                </span>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground-1">
                Sau thời gian này nếu khách chưa thanh toán, đơn sẽ chuyển sang{" "}
                <code className="rounded bg-surface px-1 py-0.5 text-xs">
                  expired
                </code>{" "}
                và hoàn lại chỗ/phòng trống.
              </p>
              <FieldError errors={fieldErrors.bookingHoldMinutes} />
            </div>
          </div>
        </section>

        {/* Card 2: Chính sách Hủy đơn & Xóa mềm dịch vụ */}
        <section className="rounded-xl border border-card-line bg-card p-5 shadow-2xs sm:p-6">
          <div className="border-b border-card-line pb-4">
            <h2 className="text-base font-semibold text-foreground">
              Chính sách Hủy đơn & Chu kỳ xóa dịch vụ
            </h2>
            <p className="mt-1 text-sm text-muted-foreground-1">
              Quy định thời hạn tối thiểu để khách hàng tự hủy đơn và thời gian
              chờ xóa mềm dịch vụ của đối tác.
            </p>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            <div>
              <label
                htmlFor="customerCancelCutoffHours"
                className="block text-sm font-medium text-foreground"
              >
                Hạn hủy Tour & Khách sạn
              </label>
              <div className="relative mt-1.5">
                <input
                  id="customerCancelCutoffHours"
                  type="number"
                  min="0"
                  max="720"
                  value={customerCancelCutoffHours}
                  onChange={(e) => setCustomerCancelCutoffHours(e.target.value)}
                  disabled={isPending}
                  className={`${inputClass} pe-12`}
                />
                <span className="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-3 text-xs font-medium text-muted-foreground-1">
                  giờ
                </span>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground-1">
                Số giờ tối thiểu trước giờ khởi hành / ngày nhận phòng.
              </p>
              <FieldError errors={fieldErrors.customerCancelCutoffHours} />
            </div>

            <div>
              <label
                htmlFor="restaurantCancelCutoffHours"
                className="block text-sm font-medium text-foreground"
              >
                Hạn hủy đặt bàn Nhà hàng
              </label>
              <div className="relative mt-1.5">
                <input
                  id="restaurantCancelCutoffHours"
                  type="number"
                  min="0"
                  max="168"
                  value={restaurantCancelCutoffHours}
                  onChange={(e) =>
                    setRestaurantCancelCutoffHours(e.target.value)
                  }
                  disabled={isPending}
                  className={`${inputClass} pe-12`}
                />
                <span className="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-3 text-xs font-medium text-muted-foreground-1">
                  giờ
                </span>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground-1">
                Số giờ tối thiểu trước khung giờ đặt bàn nhà hàng.
              </p>
              <FieldError errors={fieldErrors.restaurantCancelCutoffHours} />
            </div>

            <div>
              <label
                htmlFor="serviceDeleteGraceDays"
                className="block text-sm font-medium text-foreground"
              >
                Thời gian chờ xóa dịch vụ
              </label>
              <div className="relative mt-1.5">
                <input
                  id="serviceDeleteGraceDays"
                  type="number"
                  min="1"
                  max="365"
                  value={serviceDeleteGraceDays}
                  onChange={(e) => setServiceDeleteGraceDays(e.target.value)}
                  disabled={isPending}
                  className={`${inputClass} pe-14`}
                />
                <span className="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-3 text-xs font-medium text-muted-foreground-1">
                  ngày
                </span>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground-1">
                Số ngày tạm dừng trước khi Cron xóa mềm dịch vụ đối tác.
              </p>
              <FieldError errors={fieldErrors.serviceDeleteGraceDays} />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-card-line pt-4">
            <button
              type="button"
              disabled={isPending}
              onClick={handleReset}
              className={layerButtonClass}
            >
              Khôi phục mặc định
            </button>
            <button
              type="submit"
              disabled={isPending}
              className={primaryButtonClass}
            >
              {isPending ? "Đang lưu..." : "Lưu cấu hình vận hành"}
            </button>
          </div>
        </section>
      </div>

      {/* Cột phải: Bảng mô phỏng doanh thu & dòng tiền */}
      <div className="space-y-6 lg:col-span-4">
        <aside className="rounded-xl border border-card-line bg-card p-5 shadow-2xs sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-foreground">
              Mô phỏng tính phí đơn hàng
            </h3>
            <span className="inline-flex items-center rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-medium text-teal-800">
              Trực tiếp
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground-1">
            Ví dụ với một đơn đặt Tour/Khách sạn trị giá{" "}
            <span className="font-semibold text-foreground">
              {formatCurrency(SAMPLE_BOOKING_AMOUNT)}
            </span>
            :
          </p>

          <dl className="mt-4 space-y-3 rounded-lg border border-layer-line bg-surface/60 p-4 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground-1">Khách thanh toán (VND)</dt>
              <dd className="font-semibold text-foreground">
                {formatCurrency(SAMPLE_BOOKING_AMOUNT)}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground-1">
                Quy đổi thu qua PayPal
              </dt>
              <dd className="font-mono text-xs font-semibold text-primary">
                ${sampleUsdCharged} USD
              </dd>
            </div>
            <div className="border-t border-layer-line pt-2.5 flex items-center justify-between">
              <dt className="text-muted-foreground-1">
                Hoa hồng sàn ({parsedCommission}%)
              </dt>
              <dd className="font-semibold text-amber-700">
                - {formatCurrency(sampleFee)}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="font-medium text-foreground">Đối tác thực nhận</dt>
              <dd className="font-semibold text-teal-700">
                {formatCurrency(sampleProviderAmount)}
              </dd>
            </div>
            <div className="flex items-center justify-between text-xs">
              <dt className="text-muted-foreground-1">Payout qua PayPal</dt>
              <dd className="font-mono font-medium text-teal-700">
                ${sampleUsdPayout} USD
              </dd>
            </div>
          </dl>

          <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50/70 p-3.5 text-xs leading-relaxed text-slate-700">
            <p className="font-semibold text-slate-900">Lưu ý nghiệp vụ:</p>
            <ul className="mt-1.5 list-disc space-y-1 ps-4">
              <li>
                Các đơn đã tạo trước khi thay đổi vẫn giữ nguyên mức hoa hồng và
                tỉ giá tại thời điểm đặt chỗ.
              </li>
              <li>
                Khi khách hủy đơn hợp lệ (trước{" "}
                <strong>{customerCancelCutoffHours || 0} giờ</strong>), hệ thống
                hoàn 100% số tiền khách đã thanh toán.
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </form>
  );
}
