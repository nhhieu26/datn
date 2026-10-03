export function Pagination() {
  return (
    <div className="flex justify-center pt-[50px]">
      <button
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded bg-new-teal-cta hover:bg-new-teal-hover text-white text-sm font-medium transition-colors"
        type="button"
      >
        <span aria-hidden className="material-symbols-outlined text-base">
          progress_activity
        </span>
        Xem thêm
      </button>
    </div>
  );
}
