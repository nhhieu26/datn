import Link from "next/link";

export function PayPalRequiredBanner() {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-amber-200/80 bg-amber-50 px-5 py-4 text-sm text-amber-800">
      <span aria-hidden className="material-symbols-outlined">
        warning
      </span>
      <p>
        Bạn cần liên kết tài khoản PayPal để tạo dịch vụ mới.{" "}
        <Link className="font-bold underline" href="/provider/payments">
          Liên kết ngay
        </Link>
      </p>
    </div>
  );
}
