"use client";

import { useEffect, useRef, useState } from "react";
import { loadGoogleMaps } from "@/lib/google-maps-loader";
import {
  buildDirectionsUrl,
  getRouteStops,
  type RouteStop,
} from "../lib/google-maps";
import type { TourDetail } from "../lib/to-tour-detail";

// Advanced Marker cần Map ID; DEMO_MAP_ID dùng được khi chưa tạo Map ID riêng
const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID";
const VIETNAM_CENTER = { lat: 16.2, lng: 106.3 };
const ROUTE_COLOR = "#1a73e8";
// Màu ghim theo ngày để dễ phân biệt các chặng
const DAY_COLORS = [
  "#1a73e8",
  "#e8710a",
  "#188038",
  "#a142f4",
  "#d93025",
  "#12a4af",
  "#c5221f",
];
const dayColor = (day: number) => DAY_COLORS[(day - 1) % DAY_COLORS.length];

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

/**
 * Bản đồ lộ trình: ghim đánh số theo thứ tự tham quan (màu theo ngày) và đường nối các điểm.
 * Dùng đúng tọa độ provider đã chọn từ Google Maps, không để Google đoán vị trí từ chữ.
 */
export function TourRouteMap({
  itinerary,
  location,
}: {
  itinerary: TourDetail["itinerary"];
  location: string;
}) {
  const { stops, missingDays } = getRouteStops(itinerary);
  const directionsUrl = buildDirectionsUrl(stops, location);
  const days = [...new Set(stops.map((s) => s.day))];

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h4 className="text-2xl font-bold text-new-title">Bản đồ lộ trình</h4>
        <a
          className="inline-flex items-center gap-1.5 rounded bg-new-teal px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-new-teal-hover"
          href={directionsUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          <span aria-hidden className="material-symbols-outlined text-lg">
            directions
          </span>
          Mở trong Google Maps
        </a>
      </div>

      {stops.length === 0 ? (
        <p className="mb-4 text-sm text-new-muted">
          Nhà cung cấp chưa cập nhật điểm dừng chi tiết, bản đồ hiển thị khu vực{" "}
          {location}.
        </p>
      ) : missingDays.length > 0 ? (
        <p className="mb-4 text-sm text-new-muted">
          {missingDays.map((d) => `Ngày ${d}`).join(", ")} chưa có điểm trên bản
          đồ.
        </p>
      ) : null}

      {days.length > 1 ? (
        <ul className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-new-paragraph">
          {days.map((day) => (
            <li className="inline-flex items-center gap-1.5" key={day}>
              <span
                className="size-3 rounded-full"
                style={{ background: dayColor(day) }}
              />
              Ngày {day}
            </li>
          ))}
        </ul>
      ) : null}

      <RouteMapCanvas province={location} stops={stops} />
    </section>
  );
}

function RouteMapCanvas({
  stops: stopsProp,
  province,
}: {
  stops: RouteStop[];
  province: string;
}) {
  const mapEl = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  // Mảng điểm được tạo lại mỗi lần render → so sánh theo nội dung để không dựng lại bản đồ
  const stopsKey = JSON.stringify(stopsProp);

  useEffect(() => {
    const stops = JSON.parse(stopsKey) as RouteStop[];
    let cancelled = false;
    const cleanups: (() => void)[] = [];

    (async () => {
      const m = await loadGoogleMaps();
      const [{ AdvancedMarkerElement, PinElement }, { Place }] =
        await Promise.all([
          m.importLibrary("marker") as Promise<google.maps.MarkerLibrary>,
          m.importLibrary("places") as Promise<google.maps.PlacesLibrary>,
        ]);
      if (cancelled || !mapEl.current) return;

      const map = new m.Map(mapEl.current, {
        mapId: MAP_ID,
        center: stops[0]
          ? { lat: stops[0].latitude, lng: stops[0].longitude }
          : VIETNAM_CENTER,
        zoom: stops[0] ? 12 : 6,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      });

      if (stops.length === 0) {
        // Chưa có điểm: hiển thị khu vực tỉnh của tour
        const { places } = await Place.searchByText({
          textQuery: `${province}, Việt Nam`,
          fields: ["viewport"],
          maxResultCount: 1,
        });
        const viewport = places[0]?.viewport;
        if (viewport && !cancelled) map.fitBounds(viewport);
        return;
      }

      const path = stops.map((s) => ({ lat: s.latitude, lng: s.longitude }));

      // Đường nối các điểm theo thứ tự, có mũi tên chỉ hướng đi
      const route = new m.Polyline({
        map,
        path,
        geodesic: true,
        strokeColor: ROUTE_COLOR,
        strokeOpacity: 0.85,
        strokeWeight: 4,
        icons: [
          {
            icon: {
              path: m.SymbolPath.FORWARD_CLOSED_ARROW,
              scale: 3,
              strokeColor: ROUTE_COLOR,
              fillColor: ROUTE_COLOR,
              fillOpacity: 1,
            },
            offset: "50%",
            repeat: "120px",
          },
        ],
      });
      cleanups.push(() => route.setMap(null));

      const info = new m.InfoWindow();
      stops.forEach((stop, i) => {
        const marker = new AdvancedMarkerElement({
          map,
          position: path[i],
          title: `${stop.order}. ${stop.name}`,
          content: new PinElement({
            background: dayColor(stop.day),
            borderColor: "#ffffff",
            glyphText: String(stop.order),
            glyphColor: "#ffffff",
          }),
          zIndex: stops.length - i,
          gmpClickable: true,
        });
        marker.addEventListener("gmp-click", () => {
          info.setContent(
            `<div style="max-width:240px;font:13px/1.4 system-ui,sans-serif;color:#202124">
              <div style="font-size:12px;font-weight:600;color:${dayColor(stop.day)}">Ngày ${stop.day} · Điểm ${stop.order}</div>
              <div style="font-weight:600;margin-top:2px">${escapeHtml(stop.name)}</div>
              ${stop.address ? `<div style="color:#5f6368;margin-top:2px">${escapeHtml(stop.address)}</div>` : ""}
            </div>`,
          );
          info.open({ map, anchor: marker });
        });
        cleanups.push(() => (marker.map = null));
      });

      if (path.length > 1) {
        const bounds = new m.LatLngBounds();
        path.forEach((p) => bounds.extend(p));
        map.fitBounds(bounds, 56);
      }
    })().catch((e: Error) => !cancelled && setError(e.message));

    return () => {
      cancelled = true;
      cleanups.forEach((fn) => fn());
    };
  }, [stopsKey, province]);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-md border border-new-chip">
      <div className="size-full" ref={mapEl} />
      {error ? (
        <p className="absolute inset-0 flex items-center justify-center bg-white p-4 text-center text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
