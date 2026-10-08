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

export function Rating({ avg, count }: { avg: number; count: number }) {
  return (
    <div className="flex items-center gap-1.5 text-new-star">
      <span
        aria-hidden
        className="material-symbols-outlined text-base"
        style={count ? { fontVariationSettings: "'FILL' 1" } : undefined}
      >
        star
      </span>
      <p className="text-sm font-medium text-new-title">
        {count ? `${avg.toFixed(1)} (${count})` : "Chưa có đánh giá"}
      </p>
    </div>
  );
}
