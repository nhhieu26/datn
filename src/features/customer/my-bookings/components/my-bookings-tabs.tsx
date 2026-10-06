import Link from "next/link";
import {
  buildMyBookingsUrl,
  MY_BOOKINGS_TABS,
  type MyBookingsQuery,
} from "../search-params";

export function MyBookingsTabs({ query }: { query: MyBookingsQuery }) {
  return (
    <nav
      aria-label="Lọc theo trạng thái"
      className="hide-scrollbar mb-8 flex gap-1 overflow-x-auto border-b border-new-tab-border"
    >
      {MY_BOOKINGS_TABS.map((tab) => {
        const active = tab.key === query.tab;
        return (
          <Link
            key={tab.key}
            href={buildMyBookingsUrl(query, { tab: tab.key })}
            scroll={false}
            aria-current={active ? "page" : undefined}
            className={`-mb-px whitespace-nowrap border-b-2 px-3 py-3 text-base font-medium transition-colors ${
              active
                ? "border-new-teal-cta text-new-teal-cta"
                : "border-transparent text-new-title hover:text-new-teal-cta"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
