export function ProfileActivity() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="lg:col-span-8">
        <h3 className="mb-3.5 text-sm font-bold text-slate-900">
          Chuyến đi gần đây
        </h3>
        <div className="rounded-2xl border border-slate-100 bg-white p-6 text-xs text-slate-500 shadow-sm">
          Bạn chưa có chuyến đi nào.
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm lg:col-span-4">
        <h3 className="mb-3 px-1 text-sm font-bold text-slate-900">
          Địa điểm đã lưu
        </h3>
        <p className="px-1 text-xs text-slate-500">
          Bạn chưa lưu địa điểm nào.
        </p>
      </div>
    </div>
  );
}
