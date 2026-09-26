export function AdminHeader() {
  return (
    <header className="z-20 flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white px-5 sm:px-8">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <span className="material-symbols-outlined text-[20px] text-brand-500 xl:hidden">
          shield_person
        </span>
        <span className="hidden sm:inline">Quản trị</span>
        <span className="hidden text-slate-300 sm:inline">/</span>
        <span className="font-bold text-slate-900">Duyệt hồ sơ đối tác</span>
      </div>

      <div className="flex items-center gap-3">
        <button
          className="relative rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          type="button"
          aria-label="Thông báo"
        >
          <span className="material-symbols-outlined text-[21px]">notifications</span>
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-brand-500 ring-2 ring-white" />
        </button>
        <div className="h-6 w-px bg-slate-200" />
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white shadow-sm ring-2 ring-brand-100">
            AD
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-xs font-bold text-slate-900">Admin Roamly</p>
            <p className="text-[10px] text-slate-500">Quản trị viên</p>
          </div>
        </div>
      </div>
    </header>
  );
}
