"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_CENTER,
  KIND_STYLE,
  TILE_ATTRIBUTION,
  TILE_URL,
  escapeHtml,
} from "@/features/customer/chat/components/chat-service-map";
import type { TripStopKind, TripStopView } from "../lib/types";
import { KIND_LABEL } from "./trip-format";

type LeafletModule = typeof import("leaflet");
type LeafletMap = import("leaflet").Map;
type LeafletLayer = import("leaflet").Layer;
type LeafletMarker = import("leaflet").Marker;

const KIND_COLOR: Record<TripStopKind, string> = {
  hotel: KIND_STYLE["Khách sạn"].color,
  restaurant: KIND_STYLE["Nhà hàng"].color,
  destination: KIND_STYLE["Điểm đến"].color,
};
export type TripMapStop = TripStopView & { label: string };

export type TripMapRoute = {
  day: number;
  color: string;
  // GeoJSON [lng, lat][] của đường đi theo đường bộ
  geometry: [number, number][];
};

function pinIcon(L: LeafletModule, stop: TripMapStop, active: boolean) {
  const color = KIND_COLOR[stop.kind];
  // Roamly: nền đặc; ngoài Roamly: nền trắng viền nét đứt (giống bản đồ ở /chat)
  const external = stop.source === "external";
  const fill = external ? "#ffffff" : color;
  const stroke = external ? color : "#ffffff";
  const dash = external ? ' stroke-dasharray="4 3"' : "";
  const inner = external ? color : "#ffffff";
  const text = external ? "#ffffff" : color;
  const shadow = active
    ? "drop-shadow(0 4px 8px rgba(15,23,42,.35))"
    : "drop-shadow(0 2px 4px rgba(15,23,42,.22))";
  return L.divIcon({
    className: "",
    html: `<div style="transform:scale(${active ? 1.18 : 1});transform-origin:bottom center;transition:transform 150ms ease;filter:${shadow}">
      <svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.163 0 0 7.163 0 16c0 11.2 16 26 16 26s16-14.8 16-26C32 7.163 24.837 0 16 0z" fill="${fill}" stroke="${stroke}" stroke-width="2"${dash}/>
        <circle cx="16" cy="15" r="9.5" fill="${inner}"/>
        <text x="16" y="19" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="${text}">${escapeHtml(stop.label)}</text>
      </svg>
    </div>`,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -40],
  });
}

function popupHtml(stop: TripMapStop): string {
  const external = stop.source === "external";
  return `<div style="min-width:180px;font-family:inherit">
    <p style="margin:0 0 2px;font-weight:600;color:#071516">${escapeHtml(stop.name)}</p>
    <p style="margin:0 0 6px;font-size:12px;color:#4b5051">Ngày ${stop.day} · ${escapeHtml(KIND_LABEL[stop.kind])}${external ? " · Ngoài Roamly" : " · Roamly"}</p>
    ${stop.address ? `<p style="margin:0 0 6px;font-size:12px;color:#4b5051">${escapeHtml(stop.address)}</p>` : ""}
    <a href="${escapeHtml(stop.url)}" target="_blank" rel="noreferrer" style="font-size:12px;font-weight:600;color:#017b6e">${external ? "Mở Google Maps" : "Xem chi tiết"}</a>
  </div>`;
}

export function TripMap({
  stops,
  routes,
  activeStopId,
  onSelectStop,
}: {
  stops: TripMapStop[];
  // Đường đi của các ngày đang hiển thị (bỏ qua ngày chưa tính được đường)
  routes: TripMapRoute[];
  activeStopId: string | null;
  onSelectStop: (id: string | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const leafletRef = useRef<LeafletModule | null>(null);
  const layersRef = useRef<LeafletLayer[]>([]);
  const markersRef = useRef(new Map<string, { marker: LeafletMarker; stop: TripMapStop }>());
  const onSelectRef = useRef(onSelectStop);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    onSelectRef.current = onSelectStop;
  }, [onSelectStop]);

  useEffect(() => {
    let disposed = false;
    import("leaflet").then((L) => {
      if (disposed || !containerRef.current || mapRef.current) return;
      leafletRef.current = L;
      const map = L.map(containerRef.current, {
        center: [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng],
        zoom: 11,
        zoomControl: false,
      });
      L.control.zoom({ position: "bottomright" }).addTo(map);
      L.tileLayer(TILE_URL, { attribution: TILE_ATTRIBUTION, maxZoom: 19 }).addTo(map);
      mapRef.current = map;
      setReady(true);
    });
    return () => {
      disposed = true;
      mapRef.current?.remove();
      mapRef.current = null;
      leafletRef.current = null;
    };
  }, []);

  // Vẽ lại đường đi + marker khi dữ liệu ngày đang xem thay đổi
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!ready || !L || !map) return;

    for (const layer of layersRef.current) layer.remove();
    layersRef.current = [];
    markersRef.current.clear();

    const points: [number, number][] = [];
    for (const route of routes) {
      if (route.geometry.length < 2) continue;
      const latLngs = route.geometry.map(([lng, lat]) => [lat, lng] as [number, number]);
      // Viền trắng dưới đường chính cho dễ nhìn trên nền bản đồ
      layersRef.current.push(
        L.polyline(latLngs, { color: "#ffffff", weight: 8, opacity: 0.9 }).addTo(map),
        L.polyline(latLngs, { color: route.color, weight: 5, opacity: 0.9 }).addTo(map),
      );
      points.push(...latLngs);
    }

    for (const stop of stops) {
      const marker = L.marker([stop.latitude, stop.longitude], {
        icon: pinIcon(L, stop, stop.id === activeStopId),
        zIndexOffset: stop.id === activeStopId ? 1000 : 0,
      }).addTo(map);
      marker.bindPopup(popupHtml(stop), { closeButton: false, autoPanPadding: [40, 40] });
      marker.on("click", () => onSelectRef.current(stop.id));
      layersRef.current.push(marker);
      markersRef.current.set(stop.id, { marker, stop });
      points.push([stop.latitude, stop.longitude]);
    }

    if (points.length === 1) map.setView(points[0], 14, { animate: true });
    else if (points.length > 1) {
      // Chừa chỗ bên trái cho panel lộ trình nổi trên bản đồ (màn hình lớn)
      const wide = map.getContainer().clientWidth >= 900;
      map.fitBounds(L.latLngBounds(points), {
        paddingTopLeft: [wide ? 400 : 40, 40],
        paddingBottomRight: [40, 40],
        maxZoom: 15,
        animate: true,
      });
    }
    // activeStopId xử lý ở effect riêng để không fit lại khung nhìn khi hover
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, stops, routes]);

  useEffect(() => {
    const L = leafletRef.current;
    if (!ready || !L) return;
    for (const [id, { marker, stop }] of markersRef.current) {
      marker.setIcon(pinIcon(L, stop, id === activeStopId));
      marker.setZIndexOffset(id === activeStopId ? 1000 : 0);
    }
    if (activeStopId) markersRef.current.get(activeStopId)?.marker.openPopup();
  }, [ready, activeStopId]);

  return <div className="h-full w-full" ref={containerRef} />;
}
