"use client";

import { ArrowUpIcon, CalendarDaysIcon, MapPinIcon, RouteIcon, TrashIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";
import { FadeIn } from "@/features/customer/components/motion";
import { PageBanner } from "@/features/customer/components/page-banner";
import { formatKm, totals } from "@/features/trip-planner/lib/format";
import { createTrip, deleteTrip, setPendingPrompt } from "@/features/trip-planner/lib/storage";
import { useTrips } from "@/features/trip-planner/lib/use-trips";
import { AnimatePresence, motion } from "motion/react";

export function TripList() {
  const router = useRouter();
  const stored = useTrips();
  const [input, setInput] = useState("");

  // Bỏ qua lộ trình tạo ra nhưng chưa trò chuyện lần nào
  const trips = useMemo(
    () =>
      stored === undefined
        ? undefined
        : Object.values(stored)
            .filter((t) => t.messages?.length > 0)
            .sort((a, b) => b.updatedAt - a.updatedAt),
    [stored],
  );

  function start(e: FormEvent) {
    e.preventDefault();
    const trip = createTrip();
    if (input.trim()) setPendingPrompt(trip.id, input.trim());
    router.push(`/trip-planner/${trip.id}`);
  }

  return (
    <div className="font-[family-name:var(--font-dm-sans)] text-new-paragraph">
      <PageBanner items={[{ label: "Trang chủ", href: "/" }, { label: "Lộ trình" }]} title="Lộ trình của tôi" />

      <section className="page-x flex flex-col gap-8 py-10">
        <FadeIn duration={0.45} inView={false} y={14}>
          <form className="rounded-md bg-new-section-bg p-6" onSubmit={start}>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-new-title">
              <RouteIcon className="size-5 text-new-teal-cta" /> Tạo lộ trình mới
            </h2>
            <p className="mt-1 text-sm">
              Roamly AI tìm khách sạn, nhà hàng, điểm tham quan, sắp xếp đủ bữa ăn và tối ưu quãng đường thực tế.
            </p>
            <div className="mt-4 flex gap-2.5">
              <input
                aria-label="Mô tả chuyến đi"
                className="h-[49px] w-full rounded border border-new-input-border bg-white px-3.5 text-base text-new-title placeholder:text-new-placeholder focus:border-new-teal focus:outline-none"
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ví dụ: 2 ngày 1 đêm ở Ninh Bình, thích hang động..."
                value={input}
              />
              <motion.button
                aria-label="Bắt đầu lập lộ trình"
                className="flex size-[49px] shrink-0 cursor-pointer items-center justify-center rounded bg-new-teal-cta text-white hover:bg-new-teal-hover"
                type="submit"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
              >
                <ArrowUpIcon className="size-5" />
              </motion.button>
            </div>
          </form>
        </FadeIn>

        <FadeIn delay={0.08} duration={0.5} inView={false} y={14}>
          <div>
            <h2 className="mb-4 text-lg font-semibold text-new-title">Lộ trình đã lưu trên trình duyệt này</h2>
            {trips === undefined ? (
              <div className="h-32 animate-pulse rounded-md bg-new-section-bg" />
            ) : trips.length === 0 ? (
              <p className="rounded-md bg-new-section-bg p-6 text-sm">Bạn chưa có lộ trình nào.</p>
            ) : (
              <motion.ul layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence initial={false} mode="popLayout">
                  {trips.map((trip) => {
                    const days = trip.itinerary?.days ?? [];
                    const km = totals(days.flatMap((d) => d.legs)).distanceM;
                    const stops = days.reduce((n, d) => n + d.stops.length, 0);
                    return (
                      <motion.li
                        key={trip.id}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="group relative rounded-md bg-new-section-bg p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                        initial={{ opacity: 0, scale: 0.97, y: 12 }}
                        layout
                      >
                        <Link className="block pr-8" href={`/trip-planner/${trip.id}`}>
                          <p className="truncate font-semibold text-new-title transition-colors group-hover:text-new-teal-cta">
                            {trip.title}
                          </p>
                          <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs font-medium">
                            <span className="flex items-center gap-1">
                              <CalendarDaysIcon className="size-3.5 text-new-teal-cta" />
                              {days.length > 0 ? `${days.length} ngày` : "Chưa có lịch trình"}
                            </span>
                            {stops > 0 && (
                              <span className="flex items-center gap-1">
                                <MapPinIcon className="size-3.5 text-new-teal-cta" /> {stops} điểm · {formatKm(km)}
                              </span>
                            )}
                          </p>
                          <p className="mt-2 text-xs">
                            Cập nhật {new Date(trip.updatedAt).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })}
                          </p>
                        </Link>
                        <button
                          aria-label={`Xóa lộ trình ${trip.title}`}
                          className="absolute top-4 right-4 cursor-pointer rounded p-1 text-new-placeholder transition-colors hover:text-red-500"
                          onClick={() => deleteTrip(trip.id)}
                          type="button"
                        >
                          <TrashIcon className="size-4" />
                        </button>
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </motion.ul>
            )}
          </div>
        </FadeIn>
      </section>
    </div>
  );
}
