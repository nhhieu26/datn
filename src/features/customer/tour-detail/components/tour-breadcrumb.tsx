import Link from "next/link";

export function TourBreadcrumb() {
  return (
    <section className="page-x bg-new-hero-bg py-12 text-center">
      <h1 className="mb-3 text-4xl font-bold text-new-title">Chi tiết tour</h1>
      <nav aria-label="breadcrumb">
        <ul className="flex items-center justify-center gap-2 text-new-paragraph">
          <li>
            <Link className="hover:text-new-teal" href="/">
              Trang chủ
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="font-medium text-new-teal">
            Chi tiết tour
          </li>
        </ul>
      </nav>
    </section>
  );
}
