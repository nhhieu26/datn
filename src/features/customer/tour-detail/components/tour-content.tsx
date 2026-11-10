"use client";

import { FadeIn, SmoothCollapse } from "@/features/customer/components/motion";
import Link from "next/link";
import { useState } from "react";
import type { TourDetail } from "../lib/to-tour-detail";

// ponytail: chưa có trường chính sách trong DB nên dùng nội dung chung cho mọi tour
const POLICIES = [
  "Hủy miễn phí trước giờ khởi hành 24 giờ; sau thời điểm này phí hủy theo quy định của nhà cung cấp.",
  "Khách cần có mặt tại điểm tập trung đúng giờ, tour không hoàn tiền nếu khách đến muộn.",
  "Lịch trình có thể thay đổi nhẹ tùy thời tiết và điều kiện thực tế để đảm bảo an toàn.",
];

const sectionTitle = "mb-4 text-2xl font-bold text-new-title";

function ServiceList({
  title,
  items,
  icon,
  iconClass,
}: {
  title: string;
  items: string[];
  icon: string;
  iconClass: string;
}) {
  return (
    <div className="flex-1">
      <h4 className={sectionTitle}>{title}</h4>
      <ul className="flex flex-col gap-3">
        {items.length === 0 && <li className="text-new-muted">Không có</li>}
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-new-paragraph">
            <span
              aria-hidden
              className={`material-symbols-outlined text-xl ${iconClass}`}
            >
              {icon}
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ItineraryDayItem({
  day,
  index,
  defaultOpen,
}: {
  day: TourDetail["itinerary"][number];
  index: number;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-md bg-new-itinerary-bg overflow-hidden transition-colors hover:bg-new-itinerary-bg/85">
      <button
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between gap-3 px-5 py-4 text-left font-bold text-new-title"
        onClick={() => setOpen((o) => !o)}
        type="button"
      >
        <span>
          Ngày {index + 1} - {day.title}
        </span>
        <span
          aria-hidden
          className={`material-symbols-outlined transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          expand_more
        </span>
      </button>
      <SmoothCollapse open={open}>
        <p className="px-5 pb-5 leading-7 whitespace-pre-line text-new-paragraph">
          {day.description}
        </p>
      </SmoothCollapse>
    </div>
  );
}

export function TourContent({ tour }: { tour: TourDetail }) {
  return (
    <div className="flex flex-col gap-8">
      <FadeIn y={16}>
        <section>
          <h4 className={sectionTitle}>Giới thiệu</h4>
          <p className="leading-7 whitespace-pre-line text-new-paragraph">
            {tour.description || "Chưa có mô tả cho tour này."}
          </p>
        </section>
      </FadeIn>

      <FadeIn delay={0.05} y={16}>
        <section className="flex flex-wrap justify-between gap-5 rounded-md border border-new-chip p-[30px]">
          <ServiceList
            icon="check_circle"
            iconClass="text-new-teal"
            items={tour.includeServices}
            title="Bao gồm"
          />
          <div className="hidden w-px self-stretch bg-linear-to-b from-transparent via-new-paragraph/40 to-transparent md:block" />
          <ServiceList
            icon="cancel"
            iconClass="text-new-coral"
            items={tour.excludeServices}
            title="Không bao gồm"
          />
        </section>
      </FadeIn>

      <FadeIn delay={0.08} y={16}>
        <section>
          <h4 className={sectionTitle}>Lịch trình</h4>
          <div className="flex flex-col gap-3">
            {tour.itinerary.map((day, i) => (
              <ItineraryDayItem
                key={day.title}
                day={day}
                defaultOpen={i === 0}
                index={i}
              />
            ))}
          </div>
        </section>
      </FadeIn>

      <FadeIn delay={0.1} y={16}>
        <section>
          <h4 className={sectionTitle}>Chính sách</h4>
          <ol className="list-decimal space-y-2 pl-5 text-new-paragraph">
            {POLICIES.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ol>
        </section>
      </FadeIn>

      {tour.tags.length > 0 && (
        <FadeIn delay={0.12} y={12}>
          <div className="flex flex-wrap items-center gap-3 border-t border-new-chip pt-5">
            <span className="font-bold text-new-title">Thẻ:</span>
            {tour.tags.map((t) => (
              <Link
                href={`/explore?kind=tour&tag=${encodeURIComponent(t)}`}
                key={t}
                className="rounded bg-new-chip px-3 py-1 text-sm text-new-title transition-colors hover:bg-new-teal-cta hover:text-white"
              >
                {t}
              </Link>
            ))}
          </div>
        </FadeIn>
      )}
    </div>
  );
}
