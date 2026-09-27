"use client";

function formatPrice(value: string) {
  const amount = Number(value);
  if (!value || Number.isNaN(amount) || amount <= 0) return "Miễn phí";
  return `${amount.toLocaleString("vi-VN")} đ`;
}

export function DestinationPreviewCard({
  name,
  provinceName,
  address,
  description,
  ticketPrice,
  isPublished,
  tagNames,
  photoUrl,
  photoCount,
}: {
  name: string;
  provinceName?: string;
  address: string;
  description: string;
  ticketPrice: string;
  isPublished: boolean;
  tagNames: string[];
  photoUrl?: string;
  photoCount: number;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Xem trước giao diện
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          Cập nhật thời gian thực
        </span>
      </div>

      <div className="flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={name || "Ảnh xem trước địa điểm"}
              className="h-full w-full object-cover"
              src={photoUrl}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-slate-400">
              Chưa có ảnh xem trước
            </div>
          )}
          <div className="absolute top-3.5 right-3.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">
            {photoCount > 0 ? `1/${photoCount} ảnh` : "0 ảnh"}
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-between p-5">
          <div className="space-y-3.5">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-bold leading-snug tracking-tight text-slate-900">
                {name || "Tên địa điểm du lịch"}
              </h3>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  isPublished
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {isPublished ? "Đã xuất bản" : "Bản nháp"}
              </span>
            </div>

            <div className="flex items-center gap-1 text-xs text-slate-500">
              <svg
                className="h-3.5 w-3.5 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
                <path
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
              <span>{provinceName || "Chưa chọn tỉnh / thành"}</span>
            </div>

            {address ? (
              <p className="text-xs font-medium text-slate-500">{address}</p>
            ) : null}

            {tagNames.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {tagNames.map((tagName) => (
                  <span
                    className="inline-block rounded-full border border-emerald-200/60 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700"
                    key={tagName}
                  >
                    {tagName}
                  </span>
                ))}
              </div>
            ) : null}

            <p className="line-clamp-4 text-[11px] leading-relaxed text-slate-500">
              {description || "Mô tả địa điểm sẽ hiển thị tại đây."}
            </p>
          </div>

          <div className="-mx-5 -mb-5 mt-5 flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-5 py-4">
            <div>
              <span className="block text-[10px] font-medium text-slate-400">
                Giá vé tham quan
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-extrabold text-slate-900">
                  {formatPrice(ticketPrice)}
                </span>
                <span className="text-[11px] font-medium text-slate-500">
                  / khách
                </span>
              </div>
            </div>
            <span className="inline-flex items-center gap-2 rounded-2xl bg-brand-500 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-500/25">
              {photoCount} ảnh
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
