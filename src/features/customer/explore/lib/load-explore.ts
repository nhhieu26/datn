import { destinationRepo } from "@/entities/destination";
import { hotelRepo } from "@/entities/hotel";
import { restaurantRepo } from "@/entities/restaurant";
import { tourRepo } from "@/entities/tour";
import { PAGE_SIZE, type ExploreItem, type ExploreKind } from "../data";
import {
  toDestinationItem,
  toHotelItem,
  toRestaurantItem,
  toTourItem,
} from "./to-explore-item";
import type { ExploreQuery } from "./search-params";

type Page = { items: ExploreItem[]; total: number };

async function loadKind(
  kind: ExploreKind,
  query: ExploreQuery,
  skip: number,
  take: number,
): Promise<Page> {
  const filter = {
    q: query.q || undefined,
    province: query.location || undefined,
    minPrice: query.minPrice,
    maxPrice: query.maxPrice,
    sort: query.sort,
    skip,
    take,
  };

  switch (kind) {
    case "tour": {
      const { items, total } = await tourRepo.findPaged({
        ...filter,
        from: query.from ? new Date(`${query.from}T00:00:00.000Z`) : undefined,
        to: query.to ? new Date(`${query.to}T23:59:59.999Z`) : undefined,
      });
      return {
        total,
        items: items.map(toTourItem),
      };
    }
    case "hotel": {
      const { items, total } = await hotelRepo.findPaged(filter);
      return {
        total,
        items: items.map(toHotelItem),
      };
    }
    case "restaurant": {
      const { items, total } = await restaurantRepo.findPaged(filter);
      return {
        total,
        items: items.map(toRestaurantItem),
      };
    }
    case "destination": {
      const { items, total } = await destinationRepo.findPaged(filter);
      return {
        total,
        items: items.map(toDestinationItem),
      };
    }
  }
}

export async function loadExplore(query: ExploreQuery): Promise<Page> {
  if (query.kind !== "all") {
    return loadKind(query.kind, query, (query.page - 1) * PAGE_SIZE, PAGE_SIZE);
  }

  // Gộp 4 loại: lấy đủ (skip + take) mục đầu của từng loại rồi sắp xếp chung và cắt trang
  const skip = (query.page - 1) * PAGE_SIZE;
  const kinds: ExploreKind[] = ["tour", "hotel", "restaurant", "destination"];
  const pages = await Promise.all(
    kinds.map((k) => loadKind(k, query, 0, skip + PAGE_SIZE)),
  );
  const merged = pages.flatMap((p) => p.items);
  const total = pages.reduce((sum, p) => sum + p.total, 0);

  const direction =
    query.sort === "price_asc" ? 1 : query.sort === "price_desc" ? -1 : 0;
  merged.sort((a, b) => {
    if (direction) {
      const pa = a.price ?? Infinity;
      const pb = b.price ?? Infinity;
      // mục không có giá luôn xếp cuối
      if (pa !== pb) {
        if (a.price === undefined) return 1;
        if (b.price === undefined) return -1;
        return (pa - pb) * direction;
      }
    }
    return b.createdAt - a.createdAt;
  });
  return { total, items: merged.slice(skip, skip + PAGE_SIZE) };
}
