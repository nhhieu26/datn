"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";

export type LatLng = { lat: number; lng: number };

const DEFAULT_CENTER: LatLng = { lat: 16.047079, lng: 108.20623 };
const DEFAULT_ZOOM = 12;
const TILE_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}";
const TILE_ATTRIBUTION =
  "Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 focus:outline-none";
const labelClass = "block text-xs font-bold text-slate-700 mb-1.5";

type LeafletModule = typeof import("leaflet");
type LeafletMap = import("leaflet").Map;
type LeafletMarker = import("leaflet").Marker;

type SearchResult = { label: string; lat: number; lng: number };

type PhotonFeature = {
  geometry: { coordinates: [number, number] };
  properties: {
    name?: string;
    street?: string;
    district?: string;
    city?: string;
    state?: string;
    country?: string;
  };
};

function formatLabel(properties: PhotonFeature["properties"]): string {
  return [
    properties.name,
    properties.street,
    properties.district,
    properties.city,
    properties.state,
    properties.country,
  ]
    .filter(Boolean)
    .join(", ");
}

function pinIcon(L: LeafletModule) {
  return L.divIcon({
    className: "",
    html: '<svg width="30" height="42" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C5.373 0 0 5.373 0 12c0 8.5 12 20 12 20s12-11.5 12-20c0-6.627-5.373-12-12-12z" fill="#e11d48"/><circle cx="12" cy="12" r="4.5" fill="#fff"/></svg>',
    iconSize: [30, 42],
    iconAnchor: [15, 42],
  });
}

function MapCanvas({
  center,
  marker,
  interactive = true,
  onPick,
}: {
  center: LatLng;
  marker: LatLng | null;
  interactive?: boolean;
  onPick?: (value: LatLng) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const leafletRef = useRef<LeafletModule | null>(null);
  const onPickRef = useRef(onPick);
  useEffect(() => {
    onPickRef.current = onPick;
  }, [onPick]);

  const createMarker = (L: LeafletModule, map: LeafletMap, point: LatLng) => {
    const instance = L.marker([point.lat, point.lng], {
      icon: pinIcon(L),
      draggable: interactive,
    }).addTo(map);
    if (interactive) {
      instance.on("dragend", () => {
        const position = instance.getLatLng();
        onPickRef.current?.({ lat: position.lat, lng: position.lng });
      });
    }
    markerRef.current = instance;
  };

  useEffect(() => {
    let disposed = false;

    import("leaflet").then((L) => {
      if (disposed || !containerRef.current || mapRef.current) return;
      leafletRef.current = L;

      const map = L.map(containerRef.current, {
        center: [center.lat, center.lng],
        zoom: DEFAULT_ZOOM,
        dragging: interactive,
        scrollWheelZoom: interactive,
        doubleClickZoom: interactive,
        boxZoom: interactive,
        keyboard: interactive,
        zoomControl: interactive,
        attributionControl: true,
      });
      L.tileLayer(TILE_URL, {
        attribution: TILE_ATTRIBUTION,
        maxZoom: 19,
      }).addTo(map);
      mapRef.current = map;

      if (onPickRef.current) {
        map.on("click", (event) => {
          onPickRef.current?.({ lat: event.latlng.lat, lng: event.latlng.lng });
        });
      }

      if (marker) createMarker(L, map, marker);
    });

    return () => {
      disposed = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
      leafletRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interactive]);

  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map) return;

    map.setView([center.lat, center.lng], map.getZoom());

    if (!marker) {
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }

    if (markerRef.current) {
      markerRef.current.setLatLng([marker.lat, marker.lng]);
    } else {
      createMarker(L, map, marker);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center.lat, center.lng, marker?.lat, marker?.lng, interactive]);

  return <div className="h-full w-full" ref={containerRef} />;
}

export function LocationPicker({
  value,
  onChange,
}: {
  value: LatLng | null;
  onChange: (value: LatLng) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<LatLng | null>(value);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const skipSearchRef = useRef(false);
  const didAutoLocateRef = useRef(false);

  useEffect(() => {
    if (value || didAutoLocateRef.current) return;
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    didAutoLocateRef.current = true;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onChange({ lat: position.coords.latitude, lng: position.coords.longitude });
      },
      () => {
        // permission denied or unavailable — keep the default center
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const openModal = () => {
    setDraft(value);
    setQuery("");
    setResults([]);
    setOpen(true);
  };

  const selectResult = (result: SearchResult) => {
    skipSearchRef.current = true;
    setQuery(result.label);
    setResults([]);
    setDraft({ lat: result.lat, lng: result.lng });
  };

  const confirm = () => {
    if (!draft) return;
    onChange(draft);
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (skipSearchRef.current) {
      skipSearchRef.current = false;
      return;
    }
    const keyword = query.trim();
    if (!open || keyword.length < 3) {
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const response = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(keyword)}&limit=5`,
          { signal: controller.signal },
        );
        const data = (await response.json()) as { features?: PhotonFeature[] };
        setResults(
          (data.features ?? []).map((feature) => ({
            label: formatLabel(feature.properties),
            lat: feature.geometry.coordinates[1],
            lng: feature.geometry.coordinates[0],
          })),
        );
      } catch {
        // aborted or network error — keep current results
      } finally {
        setSearching(false);
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, open]);

  return (
    <div>
      <label className={labelClass}>
        Vị trí trên bản đồ <span className="text-brand-500">*</span>
      </label>

      <div className="relative isolate h-48 w-full cursor-pointer overflow-hidden rounded-xl border border-slate-200">
        <MapCanvas
          center={value ?? DEFAULT_CENTER}
          interactive={false}
          marker={value}
          onPick={openModal}
        />
        <div className="pointer-events-none absolute inset-0 flex items-end justify-center">
          <span className="mb-3 rounded-full bg-white/95 px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
            {value ? "Nhấn để thay đổi vị trí" : "Nhấn để chọn vị trí trên bản đồ"}
          </span>
        </div>
      </div>

      {value ? (
        <p className="mt-1.5 text-[11px] font-semibold text-slate-400">
          {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
        </p>
      ) : null}

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div
            aria-label="Chọn vị trí trên bản đồ"
            aria-modal="true"
            className="flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
            role="dialog"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h3 className="text-base font-bold text-slate-900">
                Chọn vị trí trên bản đồ
              </h3>
              <button
                className="text-slate-400 transition hover:text-slate-600"
                onClick={() => setOpen(false)}
                type="button"
              >
                ✕
              </button>
            </div>

            <div className="relative border-b border-slate-100 px-5 py-3">
              <input
                className={inputClass}
                onChange={(event) => {
                  skipSearchRef.current = false;
                  setQuery(event.target.value);
                }}
                placeholder="Tìm địa chỉ, địa điểm..."
                type="text"
                value={query}
              />
              {searching ? (
                <span className="absolute top-1/2 right-8 -translate-y-1/2 text-[11px] font-semibold text-slate-400">
                  Đang tìm...
                </span>
              ) : null}
              {results.length > 0 && query.trim().length >= 3 ? (
                <ul className="absolute top-full right-5 left-5 z-10 mt-1 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
                  {results.map((result, index) => (
                    <li key={`${result.lat}-${result.lng}-${index}`}>
                      <button
                        className="block w-full px-4 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                        onClick={() => selectResult(result)}
                        type="button"
                      >
                        {result.label}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <div className="relative isolate h-80 w-full">
              <MapCanvas
                center={draft ?? DEFAULT_CENTER}
                interactive
                marker={draft}
                onPick={setDraft}
              />
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-slate-100 px-5 py-4">
              <span className="text-xs font-semibold text-slate-500">
                {draft
                  ? `${draft.lat.toFixed(6)}, ${draft.lng.toFixed(6)}`
                  : "Nhấn vào bản đồ hoặc kéo ghim để chọn vị trí"}
              </span>
              <div className="flex gap-2">
                <button
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  onClick={() => setOpen(false)}
                  type="button"
                >
                  Hủy
                </button>
                <button
                  className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-50"
                  disabled={!draft}
                  onClick={confirm}
                  type="button"
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
