import { formatVnd } from "@/features/customer/components/cards/card-parts";
import type { ChatMessage } from "./tools";

export type CardKind = "Tour" | "Khách sạn" | "Nhà hàng" | "Điểm đến";

export type Card = {
  kind: CardKind;
  title: string;
  url: string;
  image: string;
  subtitle: string;
  highlight: string | null;
  label: string;
  rating: number | null;
  reviewCount: number | null;
  lat?: number;
  lng?: number;
};

export type MapCard = Card & { lat: number; lng: number };

const PLACE_KIND = { hotel: "Khách sạn", restaurant: "Nhà hàng", destination: "Điểm đến" } as const;
const MAX_CARDS = 5;

/** Gom kết quả các tool tìm kiếm trong một tin nhắn AI thành danh sách thẻ. */
export function getCards(message: ChatMessage): Card[] {
  const cards = new Map<string, Card>();

  for (const part of message.parts) {
    if (part.type === "tool-searchTours" && part.state === "output-available") {
      for (const t of part.output) {
        cards.set(t.url, {
          kind: "Tour",
          title: t.title,
          url: t.url,
          image: t.image,
          subtitle: `${t.province} • ${t.duration}`,
          highlight: t.description,
          label: t.price ? formatVnd(t.price) : "Liên hệ",
          rating: t.rating,
          reviewCount: t.reviewCount,
        });
      }
    }

    if (part.type === "tool-searchPlaces" && part.state === "output-available") {
      for (const p of part.output) {
        cards.set(p.url, {
          kind: PLACE_KIND[p.kind],
          title: p.name,
          url: p.url,
          image: p.image ?? "/image-notfound.png",
          subtitle: p.type,
          highlight: p.address,
          label: "Xem trên Google Maps",
          rating: p.rating,
          reviewCount: p.reviewCount,
          lat: p.lat,
          lng: p.lng,
        });
      }
    }
  }

  return [...cards.values()].slice(0, MAX_CARDS);
}

export const isMapCard = (card: Card): card is MapCard => card.lat != null && card.lng != null;
