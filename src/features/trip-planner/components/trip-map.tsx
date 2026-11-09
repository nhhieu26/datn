"use client";

import "leaflet/dist/leaflet.css";
import type { LayerGroup, Map as LeafletMap, Marker } from "leaflet";
import { useEffect, useRef, useState } from "react";
import { decodePolyline, SLOT_COLOR, SLOT_LABEL } from "@/features/trip-planner/lib/format";
import type { Day, Stop } from "@/features/trip-planner/lib/itinerary";

type Leaflet = typeof import("leaflet");

const TILE_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}";
const TILE_ATTRIBUTION = "Tiles &copy; Esri";
const ROUTE_COLOR = "#017b6e";

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function pinIcon(L: Leaflet, stop: Stop, label: string, active: boolean) {
  const color = SLOT_COLOR[stop.slot];
  return L.divIcon({
    className: "",
    html: `<div style="transform:scale(${active ? 1.2 : 1});transform-origin:bottom center;transition:transform 150ms;filter:drop-shadow(0 2px 4px rgba(15,23,42,.3))">
      <svg width="32" height="42" viewBox="0 0 32 42"><path d="M16 0C7.163 0 0 7.163 0 16c0 11.2 16 26 16 26s16-14.8 16-26C32 7.163 24.837 0 16 0z" fill="${color}" stroke="#fff" stroke-width="2"/>
      <circle cx="16" cy="15" r="9.5" fill="#fff"/><text x="16" y="19" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="700" fill="${color}">${label}</text></svg></div>`,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -42],
  });
}

function popupHtml(stop: Stop) {
  const p = stop.place;
  const rating = p.rating != null && p.reviewCount ? `★ ${p.rating.toFixed(1)} (${p.reviewCount})` : "";
  return `<a href="${escapeHtml(p.url)}" target="_blank" rel="noreferrer" class="roamly-popup-card">
    <div class="roamly-popup-image-wrap"><img src="${escapeHtml(p.image ?? "/image-notfound.png")}" alt="" class="roamly-popup-img" /></div>
    <div class="roamly-popup-body">
      <h4 class="roamly-popup-title">${escapeHtml(p.name)}</h4>
      <div class="roamly-popup-location"><div class="roamly-popup-loc-text">${escapeHtml(p.address)}</div></div>
      <div class="roamly-popup-footer"><p class="roamly-popup-price">${escapeHtml(`${stop.time} · ${SLOT_LABEL[stop.slot]}`)}</p><div class="roamly-popup-rating"><p>${rating}</p></div></div>
    </div></a>`;
}

/** Nhãn số trên pin; cùng một nơi xuất hiện nhiều lần (khách sạn đầu/cuối ngày) thì gộp nhãn. */
function pinLabels(stops: Stop[]) {
  const labels = new Map<string, number[]>();
  stops.forEach((s, i) => labels.set(s.placeId, [...(labels.get(s.placeId) ?? []), i + 1]));
  return labels;
}

export function TripMap({
  day,
  activeIndex,
  onSelect,
}: {
  day: Day | null;
  activeIndex: number | null;
  onSelect: (index: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [leaflet, setLeaflet] = useState<{ L: Leaflet; map: LeafletMap; layer: LayerGroup } | null>(null);
  const markersRef = useRef(new Map<string, { marker: Marker; stop: Stop; label: string }>());
  const onSelectRef = useRef(onSelect);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  // Khởi tạo bản đồ một lần
  useEffect(() => {
    let map: LeafletMap | undefined;
    let disposed = false;
    import("leaflet").then((L) => {
      if (disposed || !containerRef.current) return;
      map = L.map(containerRef.current, { center: [16.05, 106.5], zoom: 5 });
      L.tileLayer(TILE_URL, { attribution: TILE_ATTRIBUTION, maxZoom: 19 }).addTo(map);
      setLeaflet({ L, map, layer: L.layerGroup().addTo(map) });
    });
    return () => {
      disposed = true;
      map?.remove();
    };
  }, []);

  // Vẽ lại pin + đường đi khi ngày đang xem thay đổi
  useEffect(() => {
    if (!leaflet) return;
    const { L, map, layer } = leaflet;
    layer.clearLayers();
    markersRef.current.clear();
    if (!day || day.stops.length === 0) return;

    const bounds = L.latLngBounds([]);
    day.legs.forEach((leg) => {
      if (!leg?.polyline) return;
      const path = decodePolyline(leg.polyline);
      L.polyline(path, { color: "#fff", weight: 7, opacity: 0.9 }).addTo(layer);
      L.polyline(path, { color: ROUTE_COLOR, weight: 4, opacity: 0.9 }).addTo(layer);
      path.forEach((p) => bounds.extend(p));
    });

    const labels = pinLabels(day.stops);
    day.stops.forEach((stop, index) => {
      if (markersRef.current.has(stop.placeId)) return;
      const label = labels.get(stop.placeId)!.join(",");
      const marker = L.marker([stop.place.lat, stop.place.lng], { icon: pinIcon(L, stop, label, false) })
        .addTo(layer)
        .bindPopup(popupHtml(stop), { className: "roamly-map-popup", maxWidth: 230, minWidth: 230 })
        .on("click", () => onSelectRef.current(index));
      markersRef.current.set(stop.placeId, { marker, stop, label });
      bounds.extend([stop.place.lat, stop.place.lng]);
    });

    if (markersRef.current.size === 1) map.setView([day.stops[0].place.lat, day.stops[0].place.lng], 14);
    else map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
  }, [leaflet, day]);

  // Làm nổi pin của điểm đang hover/chọn
  useEffect(() => {
    if (!leaflet || !day) return;
    const activeId = activeIndex != null ? day.stops[activeIndex]?.placeId : undefined;
    for (const [placeId, { marker, stop, label }] of markersRef.current) {
      const active = placeId === activeId;
      marker.setIcon(pinIcon(leaflet.L, stop, label, active)).setZIndexOffset(active ? 1000 : 0);
      if (active) marker.openPopup();
    }
  }, [leaflet, day, activeIndex]);

  return (
    <div className="relative isolate h-full min-h-0 overflow-hidden rounded border border-new-chip bg-white">
      <div className="h-full w-full" ref={containerRef} />
      {!day && (
        <div className="pointer-events-none absolute inset-0 z-[500] flex items-center justify-center bg-white/60 p-6 text-center text-sm font-medium text-new-title">
          Lộ trình sẽ hiển thị trên bản đồ sau khi Roamly AI lập xong.
        </div>
      )}
    </div>
  );
}
