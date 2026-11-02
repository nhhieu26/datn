"use client";

import "leaflet/dist/leaflet.css";
import { MapPinIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export type ServiceMapKind = "Khách sạn" | "Nhà hàng" | "Điểm đến";

export type ServiceMapItem = {
  kind: ServiceMapKind;
  title: string;
  url: string;
  image: string;
  province: string;
  address?: string | null;
  meta?: string | null;
  highlight?: string | null;
  priceLabel: string;
  rating?: number | null;
  reviewCount?: number;
  latitude: number;
  longitude: number;
};

type LeafletModule = typeof import("leaflet");
type LeafletMap = import("leaflet").Map;
type LeafletMarker = import("leaflet").Marker;

const DEFAULT_CENTER = { lat: 20.2506, lng: 105.9102 };
const DEFAULT_ZOOM = 12;
const SINGLE_MARKER_ZOOM = 14;
const TILE_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}";
const TILE_ATTRIBUTION =
  "Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012";

const KIND_STYLE: Record<
  ServiceMapKind,
  { color: string; badgeBg: string; badgeText: string }
> = {
  "Khách sạn": {
    color: "#017b6e",
    badgeBg: "#e6f2f0",
    badgeText: "#017b6e",
  },
  "Nhà hàng": {
    color: "#f06449",
    badgeBg: "#fef0ed",
    badgeText: "#e05338",
  },
  "Điểm đến": {
    color: "#0d9488",
    badgeBg: "#ccfbf1",
    badgeText: "#0f766e",
  },
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function createPinIcon(
  L: LeafletModule,
  kind: ServiceMapKind,
  index: number,
  active: boolean,
) {
  const { color } = KIND_STYLE[kind];
  const scale = active ? "scale(1.18)" : "scale(1)";
  const ring = active
    ? "filter: drop-shadow(0 4px 8px rgba(15, 23, 42, 0.35));"
    : "filter: drop-shadow(0 2px 4px rgba(15, 23, 42, 0.22));";

  return L.divIcon({
    className: "",
    html: `<div style="transform:${scale};transform-origin:bottom center;transition:transform 150ms ease;${ring}">
      <svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.163 0 0 7.163 0 16c0 11.2 16 26 16 26s16-14.8 16-26C32 7.163 24.837 0 16 0z" fill="${color}" stroke="#ffffff" stroke-width="2"/>
        <circle cx="16" cy="15" r="9.5" fill="#ffffff"/>
        <text x="16" y="19" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="${color}">${index + 1}</text>
      </svg>
    </div>`,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -42],
  });
}

const KIND_ICON: Record<ServiceMapKind, { kind: string; meta: string }> = {
  "Khách sạn": { kind: "hotel", meta: "bed" },
  "Nhà hàng": { kind: "restaurant", meta: "schedule" },
  "Điểm đến": { kind: "landscape", meta: "schedule" },
};

function buildPopupHtml(item: ServiceMapItem): string {
  const title = escapeHtml(item.title);
  const url = escapeHtml(item.url);
  const image = escapeHtml(item.image || "/image-notfound.png");
  const locationText = escapeHtml(
    item.address ? `${item.address}, ${item.province}` : item.province,
  );
  const priceLabel = escapeHtml(item.priceLabel);
  const icons = KIND_ICON[item.kind];

  const metaHtml = item.meta
    ? `<div class="roamly-popup-chip-item">
         <span aria-hidden class="material-symbols-outlined">${icons.meta}</span>
         <p>${escapeHtml(item.meta)}</p>
       </div>`
    : "";

  const reviewCount = item.reviewCount ?? 0;
  const hasRating = item.rating != null && reviewCount > 0;
  const ratingHtml = `<div class="roamly-popup-rating">
      <span aria-hidden class="material-symbols-outlined roamly-popup-star-icon${hasRating ? " is-filled" : ""}">star</span>
      <p>${hasRating ? `${item.rating!.toFixed(1)} (${reviewCount})` : "Chưa có đánh giá"}</p>
    </div>`;

  return `
    <a href="${url}" target="_blank" rel="noreferrer" class="roamly-popup-card">
      <div class="roamly-popup-image-wrap">
        <img src="${image}" alt="${title}" class="roamly-popup-img" />
      </div>
      <div class="roamly-popup-body">
        <h4 class="roamly-popup-title">${title}</h4>
        <div class="roamly-popup-location">
          <span aria-hidden class="material-symbols-outlined">location_on</span>
          <div class="roamly-popup-loc-text">${locationText}</div>
        </div>
        <div class="roamly-popup-chip">
          <div class="roamly-popup-chip-item">
            <span aria-hidden class="material-symbols-outlined">${icons.kind}</span>
            <p>${escapeHtml(item.kind)}</p>
          </div>
          ${metaHtml}
        </div>
        <div class="roamly-popup-footer">
          <p class="roamly-popup-price">${priceLabel}</p>
          ${ratingHtml}
        </div>
      </div>
    </a>
  `;
}

export function ChatServiceMap({
  items,
  activeUrl,
  onSelectUrl,
}: {
  items: ServiceMapItem[];
  activeUrl?: string | null;
  onSelectUrl?: (url: string | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const leafletRef = useRef<LeafletModule | null>(null);
  const markersRef = useRef<
    Map<string, { marker: LeafletMarker; item: ServiceMapItem; index: number }>
  >(new Map());
  const onSelectUrlRef = useRef(onSelectUrl);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    onSelectUrlRef.current = onSelectUrl;
  }, [onSelectUrl]);

  const fitAllMarkers = useCallback(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map || items.length === 0) return;

    if (items.length === 1) {
      map.setView(
        [items[0].latitude, items[0].longitude],
        SINGLE_MARKER_ZOOM,
        { animate: true },
      );
      return;
    }

    const bounds = L.latLngBounds(
      items.map((item) => [item.latitude, item.longitude] as [number, number]),
    );
    map.fitBounds(bounds, { padding: [44, 44], maxZoom: 15, animate: true });
  }, [items]);

  // Khởi tạo bản đồ Leaflet
  useEffect(() => {
    let disposed = false;
    const markers = markersRef.current;

    import("leaflet").then((L) => {
      if (disposed || !containerRef.current || mapRef.current) return;
      leafletRef.current = L;

      const map = L.map(containerRef.current, {
        center: [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng],
        zoom: DEFAULT_ZOOM,
        scrollWheelZoom: true,
        zoomControl: true,
        attributionControl: true,
      });

      L.tileLayer(TILE_URL, {
        attribution: TILE_ATTRIBUTION,
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;
      setMapReady(true);
    });

    return () => {
      disposed = true;
      markers.clear();
      mapRef.current?.remove();
      mapRef.current = null;
      leafletRef.current = null;
    };
  }, []);

  // Vẽ lại các marker và căn chỉnh khung nhìn khi danh sách dịch vụ thay đổi
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!mapReady || !L || !map) return;

    for (const entry of markersRef.current.values()) {
      entry.marker.remove();
    }
    markersRef.current.clear();

    items.forEach((item, index) => {
      const marker = L.marker([item.latitude, item.longitude], {
        icon: createPinIcon(L, item.kind, index, item.url === activeUrl),
        zIndexOffset: item.url === activeUrl ? 1000 : 0,
      }).addTo(map);

      marker.bindPopup(buildPopupHtml(item), {
        className: "roamly-map-popup",
        maxWidth: 230,
        minWidth: 230,
        closeButton: true,
        autoPanPadding: [20, 20],
      });

      marker.on("click", () => {
        onSelectUrlRef.current?.(item.url);
      });

      markersRef.current.set(item.url, { marker, item, index });
    });

    fitAllMarkers();
    // Chỉ chạy lại khi danh sách địa điểm thực sự thay đổi hoặc khi bản đồ sẵn sàng
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, items, fitAllMarkers]);

  // Đồng bộ trạng thái active và di chuyển tới marker khi hover/chọn dịch vụ
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!mapReady || !L || !map) return;

    for (const [url, entry] of markersRef.current.entries()) {
      const isActive = url === activeUrl;
      entry.marker.setIcon(
        createPinIcon(L, entry.item.kind, entry.index, isActive),
      );
      entry.marker.setZIndexOffset(isActive ? 1000 : 0);
    }

    if (!activeUrl) return;
    const target = markersRef.current.get(activeUrl);
    if (!target) return;

    map.panTo([target.item.latitude, target.item.longitude], {
      animate: true,
    });
    target.marker.openPopup();
  }, [mapReady, activeUrl]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MapPinIcon className="size-5 text-new-teal-cta" />
          <h2 className="text-lg font-semibold text-new-title">
            Bản đồ dịch vụ gợi ý ({items.length})
          </h2>
        </div>
        <span className="hidden text-xs text-new-paragraph sm:inline">
          Chạm vào marker hoặc thẻ dịch vụ để xem vị trí
        </span>
      </div>

      <div className="relative isolate min-h-0 flex-1 overflow-hidden rounded border border-new-chip bg-white">
        <div className="h-full w-full" ref={containerRef} />
      </div>
    </div>
  );
}
