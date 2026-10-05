import {
  formatVnd,
} from "@/features/customer/components/cards/card-parts";
import Link from "next/link";
import { MOCK_USD_RATE } from "../lib/booking-labels";

export function PaymentStep({
  totalAmount,
  agreed,
  error,
  onAgreeChange,
}: {
  totalAmount: number;
  agreed: boolean;
  error?: string;
  onAgreeChange: (v: boolean) => void;
}) {
  const usd = totalAmount / MOCK_USD_RATE;
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="mb-4 text-xl font-bold text-new-title">
          Phương thức thanh toán
        </h3>
        <div className="flex items-center gap-4 rounded-lg border-2 border-new-teal bg-white p-5">
          <span
            aria-hidden
            className="material-symbols-outlined text-3xl text-new-teal"
          >
            account_balance_wallet
          </span>
          <div className="flex-1">
            <p className="font-bold text-new-title">PayPal</p>
            <p className="text-sm text-new-paragraph">
              Bạn sẽ được chuyển sang PayPal để hoàn tất thanh toán an toàn.
            </p>
          </div>
          <span aria-hidden className="material-symbols-outlined text-new-teal">
            check_circle
          </span>
        </div>
      </div>

      <dl className="rounded-lg bg-new-chip p-5 text-sm">
        <div className="flex justify-between py-1.5 text-new-paragraph">
          <dt>Số tiền (VND)</dt>
          <dd className="font-medium text-new-title">{formatVnd(totalAmount)}</dd>
        </div>
        <div className="flex justify-between py-1.5 text-new-paragraph">
          <dt>Tỉ giá quy đổi</dt>
          <dd className="font-medium text-new-title">
            1 USD = {formatVnd(MOCK_USD_RATE)}
          </dd>
        </div>
        <div className="mt-2 flex justify-between border-t border-new-input-border pt-3 font-bold text-new-teal">
          <dt>Thanh toán thực tế (USD)</dt>
          <dd>${usd.toFixed(2)}</dd>
        </div>
      </dl>
      <p className="-mt-2 text-sm text-new-paragraph">
        PayPal không hỗ trợ VND nên khoản thanh toán được quy đổi sang USD.
      </p>

      <div>
        <label className="flex cursor-pointer items-center gap-3 text-new-paragraph">
          <input
            checked={agreed}
            className="size-5 rounded border-new-checkbox-border text-new-teal focus:ring-new-teal"
            onChange={(e) => onAgreeChange(e.target.checked)}
            type="checkbox"
          />
          <span>
            Tôi đồng ý với{" "}
            <Link className="text-new-teal" href="/">
              Điều khoản
            </Link>{" "}
            và{" "}
            <Link className="text-new-teal" href="/">
              Chính sách bảo mật
            </Link>
          </span>
        </label>
        {error && <p className="mt-2 text-sm text-new-coral">{error}</p>}
      </div>
    </div>
  );
}
