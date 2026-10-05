import Link from "next/link";
import type { ReactNode } from "react";

export type BreadcrumbItem = { label: string; href?: string };

/** Banner tiêu đề + breadcrumb; mục cuối là trang hiện tại, các mục trước là link */
export function PageBanner({
  title,
  items,
  children,
}: {
  title: string;
  items: BreadcrumbItem[];
  children?: ReactNode;
}) {
  return (
    <section className="bg-new-banner-bg py-10 page-x">
      <div className="w-full">
        <h1 className="text-[30px] leading-[1.1] font-bold capitalize mb-1.5 text-new-title">
          {title}
        </h1>
        <nav aria-label="breadcrumb">
          <ul className="flex items-center font-[family-name:var(--font-kaushan)] text-sm leading-[1.4]">
            {items.map((item, i) => {
              const isLast = i === items.length - 1;
              return (
                <li key={item.label} className="flex items-center">
                  {i > 0 && (
                    <span
                      aria-hidden
                      className="material-symbols-outlined text-base px-2 text-new-title"
                    >
                      remove
                    </span>
                  )}
                  {isLast || !item.href ? (
                    <span
                      aria-current={isLast ? "page" : undefined}
                      className="text-new-coral"
                    >
                      {item.label}
                    </span>
                  ) : (
                    <Link
                      className="text-new-title hover:text-new-coral"
                      href={item.href}
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
        {children}
      </div>
    </section>
  );
}
