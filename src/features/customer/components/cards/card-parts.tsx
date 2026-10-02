import Image from "next/image";
import type { ReactNode } from "react";

// ponytail: chưa có Review model nên rating/reviews là số giả, thay khi có dữ liệu thật
export const FAKE_RATING = 4.7;
export const FAKE_REVIEWS = 20;

export type Money = number | string | { toString(): string };

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

export function formatVnd(value: Money) {
  return currency.format(Number(value.toString()));
}

export function firstImage(images: unknown): string {
  return (
    (images as { url?: string }[] | null)?.[0]?.url ?? "/image-notfound.png"
  );
}

const ICON_PATHS = {
  clock: "M12 7v5l3 2",
  user: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  home: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  calendar:
    "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  sparkle:
    "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
  pin: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z",
};

export type CardIcon = keyof typeof ICON_PATHS;

function Icon({ icon, className }: { icon: CardIcon; className: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      {icon === "clock" && <circle cx="12" cy="12" r="9" />}
      <path d={ICON_PATHS[icon]} strokeLinecap="round" strokeLinejoin="round" />
      {icon === "pin" && (
        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

export function CardFrame({ children }: { children: ReactNode }) {
  return (
    <article className="bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition duration-200 flex flex-col border-gray-200">
      {children}
    </article>
  );
}

export function CardImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative h-56 w-full overflow-hidden">
      <Image
        alt={alt}
        className="object-cover"
        fill
        sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
        src={src}
      />
    </div>
  );
}

export function CardBody({
  title,
  location,
  chips,
  children,
}: {
  title: string;
  location: string;
  chips: [{ icon: CardIcon; label: string }, { icon: CardIcon; label: string }];
  children: ReactNode;
}) {
  return (
    <div className="p-5 flex-1 flex flex-col justify-between">
      <div>
        <h3 className="font-bold text-gray-900 text-lg leading-snug mb-1 line-clamp-1">
          {title}
        </h3>
        <div className="flex items-center text-xs text-new-teal font-medium mb-4">
          <Icon className="w-4 h-4 mr-1 text-new-teal shrink-0" icon="pin" />
          <span className="line-clamp-1">{location}</span>
        </div>
        <div className="flex items-center justify-between gap-2 rounded-lg p-2.5 text-xs text-gray-600 mb-4 bg-new-chip">
          {chips.map((chip) => (
            <div key={chip.label} className="flex items-center gap-1.5 min-w-0">
              <Icon className="w-4 h-4 text-gray-500 shrink-0" icon={chip.icon} />
              <span className="truncate">{chip.label}</span>
            </div>
          ))}
        </div>
      </div>
      {children}
    </div>
  );
}

export function CardFooter({
  label,
  price,
  unit,
  rating = FAKE_RATING,
  reviews = FAKE_REVIEWS,
}: {
  label: string;
  price?: string | null;
  unit?: string | null;
  rating?: number;
  reviews?: number;
}) {
  return (
    <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-sm">
      <div className="text-gray-600">
        {label}{" "}
        {price && (
          <>
            <span className="font-extrabold text-gray-900 text-base">{price}</span>{" "}
            {unit && <span className="text-xs">{unit}</span>}
          </>
        )}
      </div>
      <div className="flex items-center text-xs text-gray-700 font-medium">
        <span className="text-amber-500 mr-1">★</span>
        <span>
          {rating} ({reviews} Reviews)
        </span>
      </div>
    </div>
  );
}
