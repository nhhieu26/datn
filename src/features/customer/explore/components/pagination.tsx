const PAGES = [1, 2, 3, 4];

export function Pagination() {
  return (
    <nav
      aria-label="Pagination"
      className="flex justify-center items-center gap-2 pt-10 pb-6"
    >
      <button
        className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 text-sm"
        type="button"
      >
        ‹
      </button>
      {PAGES.map((page, index) => (
        <button
          key={page}
          className={
            index === 0
              ? "w-9 h-9 flex items-center justify-center rounded-full bg-slate-900 text-white font-medium text-sm shadow-sm"
              : "w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium"
          }
          type="button"
        >
          {page}
        </button>
      ))}
      <button
        className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 text-sm"
        type="button"
      >
        ›
      </button>
    </nav>
  );
}
