import Image from "next/image";
import Link from "next/link";
import type { ExploreItem } from "@/features/customer/explore/data";
import { Rating } from "./card-parts";

export function DestinationCard({ item }: { item: ExploreItem }) {
  const card = (
    <article className="group rounded-lg border border-new-chip overflow-hidden">
      <div className="relative h-[200px] overflow-hidden">
        <Image
          alt={item.title}
          className="object-cover transition-transform duration-[800ms] group-hover:scale-105"
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
          src={item.image}
        />
      </div>
      <div className="pt-5 pr-4 pb-4 pl-[15px]">
        <h4 className="mb-0.5 text-lg font-bold leading-[1.2] text-new-title">
          {item.title}
        </h4>
        <div className="mb-3 flex items-center gap-1 text-new-teal-cta">
          <span aria-hidden className="material-symbols-outlined text-base">
            location_on
          </span>
          <div className="text-sm leading-[1.8]">{item.location}</div>
        </div>
        <div className="mb-4 flex items-center justify-between rounded bg-new-chip px-4 py-1 whitespace-nowrap">
          <div className="flex items-center gap-1 text-new-title">
            <span aria-hidden className="material-symbols-outlined text-xl">
              confirmation_number
            </span>
            <p className="text-sm">{item.meta[0]}</p>
          </div>
          <div className="flex items-center gap-1 text-new-title">
            <span aria-hidden className="material-symbols-outlined text-xl">
              location_on
            </span>
            <p className="text-sm">{item.meta[1]}</p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 whitespace-nowrap">
          <p className="text-sm font-medium text-new-teal-cta">Khám phá ngay</p>
          <Rating />
        </div>
      </div>
    </article>
  );
  return item.href ? <Link href={item.href}>{card}</Link> : card;
}
