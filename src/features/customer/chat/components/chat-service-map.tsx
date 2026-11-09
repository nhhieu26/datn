"use client";

import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap, Marker } from "leaflet";
import { MapPinIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { CardKind, MapCard } from "@/features/customer/chat/lib/cards";

type Leaflet = typeof import("leaflet");

const TILE_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}";
const TILE_ATTRIBUTION = "Tiles &copy; Esri";

const KIND_COLOR: Record<CardKind, string> = {
  Tour: "#017b6e",
  "Khách sạn": "#017b6e",
  "Nhà hàng": "#f06449",
  "Điểm đến": "#0d9488",
};

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function pinIcon(L: Leaflet, card: MapCard, index: number, active: boolean) {
  const color = KIND_COLOR[card.kind];
  return L.divIcon({
    className: "",
    html: `<div style="transform:scale(${active ? 1.18 : 1});transform-origin:bottom center;transition:transform 150ms;filter:drop-shadow(0 2px 4px rgba(15,23,42,.3))">
      <svg width="32" height="42" viewBox="0 0 32 42"><path d="M16 0C7.163 0 0 7.163 0 16c0 11.2 16 26 16 26s16-14.8 16-26C32 7.163 24.837 0 16 0z" fill="${color}" stroke="#fff" stroke-width="2"/>
      <circle cx="16" cy="15" r="9.5" fill="#fff"/><text x="16" y="19" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="${color}">${index + 1}</text></svg></div>`,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -42],
  });
}

function popupHtml(card: MapCard) {
  const rating = card.rating != null && card.reviewCount ? `★ ${card.rating.toFixed(1)} (${card.reviewCount})` : "";
  return `<a href="${escapeHtml(card.url)}" target="_blank" rel="noreferrer" class="roamly-popup-card">
    <div class="roamly-popup-image-wrap"><img src="${escapeHtml(card.image)}" alt="" class="roamly-popup-img" /></div>
    <div class="roamly-popup-body">
      <h4 class="roamly-popup-title">${escapeHtml(card.title)}</h4>
      <div class="roamly-popup-location"><div class="roamly-popup-loc-text">${escapeHtml(card.highlight ?? "")}</div></div>
      <div class="roamly-popup-footer"><p class="roamly-popup-price">${escapeHtml(card.kind)}</p><div class="roamly-popup-rating"><p>${rating}</p></div></div>
    </div></a>`;
}

export function ChatServiceMap({
  items,
  activeUrl,
  onSelectUrl,
}: {
  items: MapCard[];
  activeUrl: string | null;
  onSelectUrl: (url: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [leaflet, setLeaflet] = useState<{ L: Leaflet; map: LeafletMap } | null>(null);
  const markersRef = useRef(new Map<string, { marker: Marker; card: MapCard; index: number }>());
  const drawnKeyRef = useRef("");

  // Khởi tạo bản đồ một lần
  useEffect(() => {
    let map: LeafletMap | undefined;
    let disposed = false;
    import("leaflet").then((L) => {
      if (disposed || !containerRef.current) return;
      map = L.map(containerRef.current, { center: [20.25, 105.91], zoom: 12 });
      L.tileLayer(TILE_URL, { attribution: TILE_ATTRIBUTION, maxZoom: 19 }).addTo(map);
      setLeaflet({ L, map });
    });
    return () => {
      disposed = true;
      map?.remove();
    };
  }, []);

  // Vẽ lại marker khi danh sách địa điểm đổi (so theo URL để không vẽ lại mỗi lần render)
  const itemsKey = items.map((c) => c.url).join("|");

  useEffect(() => {
    if (!leaflet || drawnKeyRef.current === itemsKey) return;
    drawnKeyRef.current = itemsKey;
    const { L, map } = leaflet;
    const cards = items;
    const markers = markersRef.current;

    markers.forEach(({ marker }) => marker.remove());
    markers.clear();

    cards.forEach((card, index) => {
      const marker = L.marker([card.lat, card.lng], { icon: pinIcon(L, card, index, false) })
        .addTo(map)
        .bindPopup(popupHtml(card), { className: "roamly-map-popup", maxWidth: 230, minWidth: 230 })
        .on("click", () => onSelectUrl(card.url));
      markers.set(card.url, { marker, card, index });
    });

    if (cards.length === 1) map.setView([cards[0].lat, cards[0].lng], 14);
    else if (cards.length > 1) {
      map.fitBounds(L.latLngBounds(cards.map((c) => [c.lat, c.lng])), { padding: [44, 44], maxZoom: 15 });
    }
  }, [leaflet, items, itemsKey, onSelectUrl]);

  // Làm nổi marker đang được hover/chọn
  useEffect(() => {
    if (!leaflet) return;
    for (const [url, { marker, card, index }] of markersRef.current) {
      const active = url === activeUrl;
      marker.setIcon(pinIcon(leaflet.L, card, index, active)).setZIndexOffset(active ? 1000 : 0);
      if (active) {
        leaflet.map.panTo([card.lat, card.lng]);
        marker.openPopup();
      }
    }
  }, [leaflet, activeUrl, itemsKey]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-3 flex items-center gap-2">
        <MapPinIcon className="size-5 text-new-teal-cta" />
        <h2 className="text-lg font-semibold text-new-title">Bản đồ địa điểm gợi ý ({items.length})</h2>
      </div>
      <div className="relative isolate min-h-0 flex-1 overflow-hidden rounded border border-new-chip bg-white">
        <div className="h-full w-full" ref={containerRef} />
      </div>
    </div>
  );
}
