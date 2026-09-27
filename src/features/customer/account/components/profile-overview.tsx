import Image from "next/image";

type AccountUser = { name?: string | null; email?: string | null };

const stats = [
  { label: "Chuyến đi", value: "5", icon: "luggage" },
  { label: "Địa điểm đã lưu", value: "12", icon: "bookmark" },
  { label: "Đánh giá", value: "3", icon: "star" },
];

const accountFields = [
  { label: "Họ và tên", valueKey: "name" },
  { label: "Email", valueKey: "email" },
  { label: "Số điện thoại", valueKey: "phone" },
] as const;

export function ProfileOverview({
  user,
  onOpenPreferences,
}: {
  user: AccountUser;
  onOpenPreferences: () => void;
}) {
  const displayName = user.name || "Khách hàng";
  const email = user.email || "Chưa cập nhật";
  const initial = displayName.charAt(0).toUpperCase();

  const values: Record<(typeof accountFields)[number]["valueKey"], string> = {
    name: displayName,
    email,
    phone: "+84 912 345 678",
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="flex flex-col items-center rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm lg:col-span-4">
          <div className="relative mb-3.5">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-brand-500 text-3xl font-bold text-white ring-4 ring-brand-50">
              {initial}
            </div>
            <button
              type="button"
              aria-label="Đổi ảnh đại diện"
              className="absolute bottom-0 right-0 rounded-full border border-slate-200 bg-white p-1.5 text-slate-600 shadow-sm transition hover:text-brand-500"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
                <path
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </button>
          </div>
          <h2 className="text-base font-bold text-slate-900">{displayName}</h2>
          <p className="mt-0.5 text-xs text-slate-400">{email}</p>
          <div className="my-4 w-full border-t border-slate-100" />
          <div className="w-full space-y-2 px-2 text-left text-xs text-slate-500">
            <div className="flex items-center gap-2.5">
              <svg
                className="h-4 w-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
                <path
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
              </svg>
              <span>Hà Nội, Việt Nam</span>
            </div>
            <div className="flex items-center gap-2.5">
              <svg
                className="h-4 w-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
              </svg>
              <span>Thành viên từ tháng 9, 2025</span>
            </div>
          </div>
        </div>

        <div className="relative h-[260px] overflow-hidden rounded-2xl shadow-sm lg:col-span-8">
          <Image
            src="/hero.jpg"
            alt="Khung cảnh du lịch"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 66vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <div className="absolute bottom-5 right-5 flex items-center gap-6 rounded-2xl border border-white/60 bg-white/80 px-6 py-3.5 shadow-lg backdrop-blur-md sm:gap-8">
            {stats.map((stat, index) => (
              <div key={stat.label} className="flex items-center gap-6 sm:gap-8">
                {index > 0 ? <div className="h-6 w-px bg-slate-200" /> : null}
                <div className="text-center">
                  <span className="material-symbols-outlined mb-0.5 text-[18px] text-slate-700">
                    {stat.icon}
                  </span>
                  <span className="block text-base font-bold leading-tight text-slate-900">
                    {stat.value}
                  </span>
                  <span className="text-[10px] font-medium text-slate-500">
                    {stat.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-4">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Sở thích du lịch
              </h3>
              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-brand-600">
                Chưa thiết lập
              </span>
            </div>
            <p className="mb-6 text-xs leading-relaxed text-slate-500">
              Cho chúng tôi biết bạn yêu thích điều gì để cá nhân hóa các gợi ý
              dành cho bạn.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenPreferences}
            className="w-full rounded-xl bg-brand-500 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-brand-600"
          >
            Thiết lập sở thích
          </button>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-8">
          <h3 className="mb-4 text-sm font-bold text-slate-900">
            Thông tin tài khoản
          </h3>
          <div className="space-y-3.5 text-xs">
            {accountFields.map((field, index) => (
              <div
                key={field.label}
                className={`flex items-center justify-between py-1 ${
                  index < accountFields.length - 1
                    ? "border-b border-slate-50"
                    : ""
                }`}
              >
                <span className="font-medium text-slate-400">{field.label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800">
                    {values[field.valueKey]}
                  </span>
                  <svg
                    className="h-3.5 w-3.5 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M9 5l7 7-7 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
