import Image from "next/image";

const trips = [
  {
    title: "Vòng cung Hà Giang",
    date: "12/10 – 16/10/2025",
    image: "https://picsum.photos/seed/hagiang/600/400",
  },
  {
    title: "Đà Nẵng dạo chơi",
    date: "03/08 – 06/08/2025",
    image: "https://picsum.photos/seed/danang/600/400",
  },
  {
    title: "Sa Pa phiêu lưu",
    date: "01/05 – 04/05/2025",
    image: "https://picsum.photos/seed/sapa/600/400",
  },
];

const savedPlaces = [
  {
    name: "Vịnh Hạ Long",
    type: "Điểm đến",
    image: "https://picsum.photos/seed/halong/100/100",
  },
  {
    name: "Bà Nà Hills",
    type: "Điểm tham quan",
    image: "https://picsum.photos/seed/bana/100/100",
  },
  {
    name: "Phố cổ Hội An",
    type: "Điểm đến",
    image: "https://picsum.photos/seed/hoian/100/100",
  },
];

export function ProfileActivity() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="lg:col-span-8">
        <h3 className="mb-3.5 flex cursor-pointer items-center gap-1.5 text-sm font-bold text-slate-900 transition-colors hover:text-brand-500">
          Chuyến đi gần đây
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M14 5l7 7m0 0l-7 7m7-7H3"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {trips.map((trip) => (
            <div
              key={trip.title}
              className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
            >
              <Image
                src={trip.image}
                alt={trip.title}
                width={600}
                height={400}
                className="h-28 w-full object-cover"
              />
              <div className="p-3">
                <h4 className="text-xs font-bold leading-tight text-slate-900">
                  {trip.title}
                </h4>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[10px] font-medium text-slate-400">
                    {trip.date}
                  </span>
                  <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-600">
                    Hoàn thành
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm lg:col-span-4">
        <div className="mb-3 flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-slate-900">
            Địa điểm đã lưu
          </h3>
          <button
            type="button"
            className="text-[11px] font-semibold text-slate-400 transition-colors hover:text-brand-500"
          >
            Xem tất cả
          </button>
        </div>
        <div className="space-y-3">
          {savedPlaces.map((place) => (
            <div
              key={place.name}
              className="flex items-center justify-between rounded-xl p-1.5 transition-colors hover:bg-slate-50"
            >
              <div className="flex items-center gap-3">
                <Image
                  src={place.image}
                  alt={place.name}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-lg object-cover"
                />
                <div>
                  <h5 className="text-xs font-bold text-slate-900">
                    {place.name}
                  </h5>
                  <span className="text-[10px] text-slate-400">
                    {place.type}
                  </span>
                </div>
              </div>
              <button
                type="button"
                aria-label="Bỏ lưu"
                className="text-slate-400 transition-colors hover:text-slate-600"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
