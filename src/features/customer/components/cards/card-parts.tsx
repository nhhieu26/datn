// ponytail: chưa có Review model nên rating/reviews là số giả, thay khi có dữ liệu thật
export const FAKE_RATING = 4.7;
export const FAKE_REVIEWS = 20;

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

export function formatVnd(value: number) {
  return currency.format(value);
}

export function firstImage(images: unknown): string {
  return (
    (images as { url?: string }[] | null)?.[0]?.url ?? "/image-notfound.png"
  );
}

export function formatPrice(price?: number) {
  return price ? formatVnd(price) : "Liên hệ";
}

export function Rating() {
  return (
    <div className="flex items-center gap-1.5 text-new-star">
      <span aria-hidden className="material-symbols-outlined text-base">
        star
      </span>
      <p className="text-sm font-medium text-new-title">
        {FAKE_RATING} ({FAKE_REVIEWS})
      </p>
    </div>
  );
}
