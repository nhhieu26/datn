"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { MAX_STOPS_PER_DAY, type TourStop } from "@/entities/tour/schema";
import { loadGoogleMaps } from "@/lib/google-maps-loader";
import { TourIcon } from "./tour-icon";

const VIETNAM_CENTER = { lat: 16.2, lng: 106.3 };
const PLACE_FIELDS = ["id", "displayName", "formattedAddress", "location"];
const SUGGEST_DEBOUNCE_MS = 250;
// Advanced Marker cần Map ID; DEMO_MAP_ID dùng được khi chưa tạo Map ID riêng
const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID";

type PlacesLib = google.maps.PlacesLibrary;
type MarkerLib = google.maps.MarkerLibrary;

type Details = {
  place: google.maps.places.Place;
  stop: TourStop;
  fromResults: boolean;
};

function toStop(place: google.maps.places.Place): TourStop | null {
  const loc = place.location;
  if (!place.id || !place.displayName || !loc) return null;
  return {
    placeId: place.id,
    name: place.displayName,
    address: place.formattedAddress ?? null,
    latitude: loc.lat(),
    longitude: loc.lng(),
  };
}

/** In đậm phần khớp với từ khóa, giống gợi ý của Google Maps */
function highlight(text: google.maps.places.FormattableText | null): ReactNode {
  if (!text) return null;
  const parts: ReactNode[] = [];
  let cursor = 0;
  [...text.matches]
    .sort((a, b) => a.startOffset - b.startOffset)
    .forEach((m, i) => {
      if (m.startOffset > cursor)
        parts.push(text.text.slice(cursor, m.startOffset));
      parts.push(
        <b className="font-semibold" key={i}>
          {text.text.slice(m.startOffset, m.endOffset)}
        </b>,
      );
      cursor = m.endOffset;
    });
  if (cursor < text.text.length) parts.push(text.text.slice(cursor));
  return parts;
}

/**
 * Bản đồ + tìm kiếm điểm tham quan, dựng bằng bộ Places UI Kit chính chủ của Google:
 * - Danh sách kết quả: PlaceSearchElement (gmp-place-search) + PlaceTextSearchRequestElement
 * - Chi tiết địa điểm: PlaceDetailsElement (gmp-place-details) ở bảng bên trái, như Google Maps
 * - Ghim: AdvancedMarkerElement + PinElement (ghim đỏ của Google; điểm đã chọn là ghim xanh đánh số)
 */
function StopSearchMap({
  stops,
  onChange,
  provinceName,
}: {
  stops: TourStop[];
  onChange: (stops: TourStop[]) => void;
  provinceName?: string;
}) {
  const listboxId = useId();
  const mapEl = useRef<HTMLDivElement>(null);
  const resultsEl = useRef<HTMLDivElement>(null);
  const detailsEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const libRef = useRef<PlacesLib | null>(null);
  const markerLibRef = useRef<MarkerLib | null>(null);
  const sessionRef = useRef<google.maps.places.AutocompleteSessionToken | null>(
    null,
  );
  const programmaticMoveRef = useRef(false);
  const fitResultsRef = useRef(false);
  const showDetailsRef = useRef<
    (place: google.maps.places.Place, fromResults: boolean) => void
  >(() => {});
  const stopMarkersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const resultMarkersRef = useRef(
    new Map<
      string,
      {
        marker: google.maps.marker.AdvancedMarkerElement;
        pin: google.maps.marker.PinElement;
      }
    >(),
  );
  const candidateRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(
    null,
  );
  const suggestReqRef = useRef(0);
  const skipSuggestRef = useRef(false);

  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<
    google.maps.places.PlacePrediction[]
  >([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const [resultsQuery, setResultsQuery] = useState<string | null>(null);
  const [resultPlaces, setResultPlaces] = useState<google.maps.places.Place[]>(
    [],
  );
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [details, setDetails] = useState<Details | null>(null);
  const [showSearchArea, setShowSearchArea] = useState(false);

  const latest = useRef({ hasResults: false });
  useEffect(() => {
    latest.current = { hasResults: resultsQuery !== null };
  });

  /** Di chuyển bản đồ bằng code — không tính là người dùng kéo/zoom */
  const moveMap = (fn: () => void) => {
    programmaticMoveRef.current = true;
    fn();
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const m = await loadGoogleMaps();
      const [places, markerLib] = await Promise.all([
        m.importLibrary("places") as Promise<PlacesLib>,
        m.importLibrary("marker") as Promise<MarkerLib>,
      ]);
      if (cancelled || !mapEl.current) return;
      libRef.current = places;
      markerLibRef.current = markerLib;
      sessionRef.current = new places.AutocompleteSessionToken();

      const initial = stops;
      const map = new m.Map(mapEl.current, {
        mapId: MAP_ID,
        center: initial[0]
          ? { lat: initial[0].latitude, lng: initial[0].longitude }
          : VIETNAM_CENTER,
        zoom: initial[0] ? 13 : 6,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        clickableIcons: true,
      });
      mapRef.current = map;
      programmaticMoveRef.current = true;
      if (initial.length > 1) {
        const bounds = new m.LatLngBounds();
        initial.forEach((s) =>
          bounds.extend({ lat: s.latitude, lng: s.longitude }),
        );
        map.fitBounds(bounds, 64);
      } else if (!initial[0] && provinceName) {
        // Mở bản đồ ở tỉnh của tour
        const { places: found } = await places.Place.searchByText({
          textQuery: `${provinceName}, Việt Nam`,
          fields: ["viewport"],
          maxResultCount: 1,
        });
        const viewport = found[0]?.viewport;
        if (viewport && !cancelled) moveMap(() => map.fitBounds(viewport));
      }

      // Người dùng kéo/zoom khi đang có kết quả → hiện "Tìm kiếm khu vực này"
      map.addListener("idle", () => {
        if (programmaticMoveRef.current) {
          programmaticMoveRef.current = false;
          return;
        }
        if (latest.current.hasResults) setShowSearchArea(true);
      });
      map.addListener("dragstart", () => {
        programmaticMoveRef.current = false;
      });

      // Bấm vào địa điểm có sẵn trên bản đồ → mở chi tiết ở bảng bên trái
      map.addListener(
        "click",
        (event: google.maps.MapMouseEvent | google.maps.IconMouseEvent) => {
          if (!("placeId" in event) || !event.placeId) return;
          event.stop();
          showDetailsRef.current(
            new places.Place({ id: event.placeId }),
            false,
          );
        },
      );

      setReady(true);
    })().catch((e: Error) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
    // Chỉ khởi tạo một lần mỗi lần mở popup
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mở chi tiết địa điểm ở bảng bên trái (gán trong effect vì chỉ gọi từ sự kiện)
  useEffect(() => {
    showDetailsRef.current = (place, fromResults) => {
      const lib = libRef.current;
      const map = mapRef.current;
      if (!lib || !map || !detailsEl.current) return;

      const panel = new lib.PlaceDetailsElement();
      panel.style.colorScheme = "light";
      panel.append(
        new lib.PlaceDetailsPlaceRequestElement({ place }),
        new lib.PlaceAllContentElement(),
      );
      detailsEl.current.replaceChildren(panel);
      detailsEl.current.scrollTop = 0;

      void place
        .fetchFields({ fields: PLACE_FIELDS })
        .then(() => {
          const stop = toStop(place);
          if (!stop) return;
          setDetails({ place, stop, fromResults });
          const position = { lat: stop.latitude, lng: stop.longitude };
          moveMap(() => {
            if (!fromResults && (map.getZoom() ?? 0) < 15) map.setZoom(15);
            if (!fromResults || !map.getBounds()?.contains(position))
              map.panTo(position);
          });
        })
        .catch(() => setSearchError("Không tải được thông tin địa điểm"));
    };
  }, []);

  // Gợi ý khi gõ, ưu tiên vùng bản đồ đang xem
  useEffect(() => {
    if (skipSuggestRef.current) {
      skipSuggestRef.current = false;
      return;
    }
    const input = query.trim();
    const lib = libRef.current;
    const reqId = ++suggestReqRef.current;
    if (!input || !lib) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const bounds = mapRef.current?.getBounds();
        const { suggestions: list } =
          await lib.AutocompleteSuggestion.fetchAutocompleteSuggestions({
            input,
            sessionToken: sessionRef.current ?? undefined,
            includedRegionCodes: ["vn"],
            language: "vi",
            region: "vn",
            ...(bounds ? { locationBias: bounds } : {}),
          });
        if (reqId !== suggestReqRef.current) return;
        setSuggestions(
          list
            .map((s) => s.placePrediction)
            .filter((p): p is google.maps.places.PlacePrediction => p !== null)
            .slice(0, 5),
        );
        setActiveIndex(-1);
      } catch {
        if (reqId === suggestReqRef.current) setSuggestions([]);
      }
    }, SUGGEST_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query, ready]);

  const setQuerySilently = (value: string) => {
    if (value !== query) skipSuggestRef.current = true;
    setQuery(value);
    setSuggestions([]);
    setDropdownOpen(false);
    setActiveIndex(-1);
  };

  const runSearch = (text: string, restrictToView = false) => {
    const lib = libRef.current;
    const map = mapRef.current;
    const textQuery = text.trim();
    if (!lib || !map || !textQuery || !resultsEl.current) return;

    setDetails(null);
    setShowSearchArea(false);
    setSearching(true);
    setSearchError(null);
    setResultsQuery(textQuery);
    setResultPlaces([]);
    fitResultsRef.current = !restrictToView;

    const bounds = map.getBounds() ?? undefined;
    const search = new lib.PlaceSearchElement({
      selectable: true,
      orientation: "VERTICAL",
    });
    search.style.colorScheme = "light";
    const content = new lib.PlaceContentConfigElement();
    content.append(
      new lib.PlaceMediaElement({ lightboxPreferred: false }),
      new lib.PlaceRatingElement(),
      new lib.PlaceTypeElement(),
      new lib.PlaceAddressElement(),
      new lib.PlaceOpenNowStatusElement(),
    );
    search.append(
      new lib.PlaceTextSearchRequestElement({
        textQuery,
        maxResultCount: 20,
        ...(bounds
          ? restrictToView
            ? { locationRestriction: bounds }
            : { locationBias: bounds }
          : {}),
      }),
      content,
    );
    search.addEventListener("gmp-load", () => {
      setSearching(false);
      setResultPlaces([...search.places]);
    });
    search.addEventListener("gmp-error", () => {
      setSearching(false);
      setSearchError("Không tìm được địa điểm. Thử lại sau.");
    });
    search.addEventListener("gmp-select", (event) => {
      showDetailsRef.current(
        (event as google.maps.places.PlaceSelectEvent).place,
        true,
      );
    });
    resultsEl.current.replaceChildren(search);
    resultsEl.current.scrollTop = 0;
  };

  const selectPrediction = (prediction: google.maps.places.PlacePrediction) => {
    setQuerySilently(prediction.mainText?.text ?? prediction.text.text);
    setResultsQuery(null);
    setResultPlaces([]);
    resultsEl.current?.replaceChildren();
    showDetailsRef.current(prediction.toPlace(), false);
    // Phiên gợi ý kết thúc sau fetchFields → tạo phiên mới
    if (libRef.current)
      sessionRef.current = new libRef.current.AutocompleteSessionToken();
  };

  const submitQuery = (text = query) => {
    if (!text.trim()) return;
    setQuerySilently(text);
    runSearch(text);
  };

  const clearSearch = () => {
    setQuerySilently("");
    setResultsQuery(null);
    setResultPlaces([]);
    setSearchError(null);
    setShowSearchArea(false);
    setDetails(null);
    resultsEl.current?.replaceChildren();
    detailsEl.current?.replaceChildren();
  };

  const closeDetails = () => {
    setDetails(null);
    detailsEl.current?.replaceChildren();
  };

  const full = stops.length >= MAX_STOPS_PER_DAY;
  const detailsAdded = details
    ? stops.some((s) => s.placeId === details.stop.placeId)
    : false;
  const addDetails = () => {
    if (!details || full || detailsAdded) return;
    onChange([...stops, details.stop]);
  };

  // Ô gợi ý: dòng 0 = "Tìm <từ khóa>", sau đó là các địa điểm
  const optionCount = query.trim() ? suggestions.length + 1 : 0;
  const showDropdown = dropdownOpen && optionCount > 0;
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      if (!optionCount) return;
      event.preventDefault();
      setDropdownOpen(true);
      const step = event.key === "ArrowDown" ? 1 : -1;
      // Xoay vòng giữa -1 (không chọn), 0 (dòng "Tìm …") và các gợi ý
      setActiveIndex(
        (i) => ((i + 1 + step + optionCount + 1) % (optionCount + 1)) - 1,
      );
    } else if (event.key === "Enter") {
      // Chặn submit form tạo tour
      event.preventDefault();
      const prediction =
        activeIndex >= 1 ? suggestions[activeIndex - 1] : undefined;
      if (prediction) selectPrediction(prediction);
      else submitQuery();
    } else if (event.key === "Escape") {
      // Esc đóng gợi ý trước, chưa đóng popup
      if (showDropdown) event.stopPropagation();
      setDropdownOpen(false);
      setActiveIndex(-1);
    }
  };

  // Ghim xanh đánh số cho các điểm đã chọn
  useEffect(() => {
    const map = mapRef.current;
    const lib = markerLibRef.current;
    if (!ready || !map || !lib) return;
    stopMarkersRef.current.forEach((marker) => (marker.map = null));
    stopMarkersRef.current = stops.map((stop, i) => {
      const pin = new lib.PinElement({
        background: "#1a73e8",
        borderColor: "#0b57d0",
        glyphText: String(i + 1),
        glyphColor: "#fff",
      });
      const marker = new lib.AdvancedMarkerElement({
        map,
        position: { lat: stop.latitude, lng: stop.longitude },
        title: stop.name,
        content: pin,
        zIndex: 1000 + i,
        gmpClickable: true,
      });
      marker.addEventListener("gmp-click", () => {
        const Place = libRef.current?.Place;
        if (Place)
          showDetailsRef.current(new Place({ id: stop.placeId }), false);
      });
      return marker;
    });
  }, [ready, stops]);

  // Ghim đỏ của Google cho từng kết quả tìm kiếm
  useEffect(() => {
    const map = mapRef.current;
    const lib = markerLibRef.current;
    const markers = resultMarkersRef.current;
    if (!ready || !map || !lib) return;
    markers.forEach(({ marker }) => (marker.map = null));
    markers.clear();
    const bounds = new google.maps.LatLngBounds();
    resultPlaces.forEach((place) => {
      if (!place.id || !place.location) return;
      bounds.extend(place.location);
      const pin = new lib.PinElement({ scale: 0.85 });
      const marker = new lib.AdvancedMarkerElement({
        map,
        position: place.location,
        title: place.displayName ?? "",
        content: pin,
        gmpClickable: true,
      });
      marker.addEventListener("gmp-click", () =>
        showDetailsRef.current(place, true),
      );
      markers.set(place.id, { marker, pin });
    });
    if (fitResultsRef.current && !bounds.isEmpty()) {
      fitResultsRef.current = false;
      moveMap(() => {
        if (resultPlaces.length === 1) {
          map.setCenter(bounds.getCenter());
          map.setZoom(15);
        } else {
          map.fitBounds(bounds, 48);
        }
      });
    }
  }, [ready, resultPlaces]);

  // Ghim của địa điểm đang xem: phóng to ghim kết quả, hoặc đặt ghim riêng nếu không thuộc kết quả
  useEffect(() => {
    const map = mapRef.current;
    const lib = markerLibRef.current;
    if (!ready || !map || !lib) return;
    const selectedId = details?.stop.placeId;
    resultMarkersRef.current.forEach(({ marker, pin }, id) => {
      pin.scale = id === selectedId ? 1.25 : 0.85;
      marker.zIndex = id === selectedId ? 900 : null;
    });
    if (candidateRef.current) candidateRef.current.map = null;
    candidateRef.current = null;
    if (
      details &&
      !resultMarkersRef.current.has(details.stop.placeId) &&
      !stops.some((s) => s.placeId === details.stop.placeId)
    ) {
      candidateRef.current = new lib.AdvancedMarkerElement({
        map,
        position: { lat: details.stop.latitude, lng: details.stop.longitude },
        title: details.stop.name,
        content: new lib.PinElement({ scale: 1.25 }),
        zIndex: 900,
      });
    }
  }, [ready, details, resultPlaces, stops]);

  const hasResults = resultsQuery !== null;

  return (
    <div className="flex size-full flex-col bg-white text-gray-900 [color-scheme:light] sm:flex-row">
      {/* Bảng bên trái như Google Maps: ô tìm kiếm + kết quả / chi tiết */}
      <aside className="order-last flex min-h-0 flex-1 flex-col border-t border-gray-200 sm:order-first sm:w-[400px] sm:flex-none sm:border-t-0 sm:border-r">
        <div className="relative shrink-0 p-3">
          <div className="flex h-12 items-center gap-1 rounded-full bg-white ps-4 pe-1 shadow-[0_2px_4px_rgba(0,0,0,0.2),0_-1px_0_rgba(0,0,0,0.02)] focus-within:shadow-[0_2px_6px_rgba(0,0,0,0.3)]">
            <input
              aria-autocomplete="list"
              aria-controls={listboxId}
              aria-expanded={showDropdown}
              className="h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-[15px] shadow-none ring-0 focus:border-0 focus:ring-0 focus:outline-none text-gray-900 outline-none placeholder:text-gray-500"
              disabled={!ready}
              onBlur={() => setDropdownOpen(false)}
              onChange={(event) => {
                setQuery(event.target.value);
                setDropdownOpen(true);
              }}
              onFocus={() => setDropdownOpen(true)}
              onKeyDown={onKeyDown}
              placeholder={
                ready ? "Tìm kiếm trên Google Maps" : "Đang tải bản đồ…"
              }
              role="combobox"
              type="text"
              value={query}
            />
            <button
              aria-label="Tìm kiếm"
              className="flex size-10 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100"
              onClick={() => submitQuery()}
              onMouseDown={(event) => event.preventDefault()}
              type="button"
            >
              <TourIcon className="size-5" name="search" />
            </button>
            {query || hasResults || details ? (
              <button
                aria-label="Xóa tìm kiếm"
                className="flex size-10 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100"
                onClick={clearSearch}
                onMouseDown={(event) => event.preventDefault()}
                type="button"
              >
                <TourIcon className="size-4" name="x" />
              </button>
            ) : null}
          </div>

          {showDropdown ? (
            <ul
              className="absolute inset-x-3 top-[62px] z-20 overflow-hidden rounded-xl bg-white py-2 shadow-[0_4px_12px_rgba(0,0,0,0.25)]"
              id={listboxId}
              role="listbox"
            >
              <li
                aria-selected={activeIndex === 0}
                className={`flex cursor-pointer items-center gap-4 px-4 py-2.5 text-sm ${activeIndex === 0 ? "bg-gray-100" : "hover:bg-gray-50"}`}
                onClick={() => submitQuery()}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(0)}
                role="option"
              >
                <TourIcon
                  className="size-4 shrink-0 text-gray-500"
                  name="search"
                />
                <span className="truncate">{query.trim()}</span>
              </li>
              {suggestions.map((prediction, i) => (
                <li
                  aria-selected={activeIndex === i + 1}
                  className={`flex cursor-pointer items-center gap-4 px-4 py-2.5 ${activeIndex === i + 1 ? "bg-gray-100" : "hover:bg-gray-50"}`}
                  key={prediction.placeId}
                  onClick={() => selectPrediction(prediction)}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActiveIndex(i + 1)}
                  role="option"
                >
                  <svg
                    aria-hidden
                    className="size-4 shrink-0 text-gray-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
                  </svg>
                  <span className="min-w-0 truncate text-sm">
                    <span className="text-gray-900">
                      {highlight(prediction.mainText ?? prediction.text)}
                    </span>
                    {prediction.secondaryText ? (
                      <span className="ms-1.5 text-gray-500">
                        {prediction.secondaryText.text}
                      </span>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {/* Chi tiết địa điểm (PlaceDetailsElement) */}
        <div className={details ? "flex min-h-0 flex-1 flex-col" : "hidden"}>
          <div className="flex shrink-0 items-center gap-2 border-y border-gray-200 px-2 py-1.5">
            <button
              className="inline-flex h-8 items-center gap-1 rounded-full px-3 text-sm font-medium text-[#1a73e8] hover:bg-[#e8f0fe]"
              onClick={closeDetails}
              type="button"
            >
              ← {details?.fromResults && hasResults ? "Kết quả" : "Quay lại"}
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto" ref={detailsEl} />
          <div className="shrink-0 border-t border-gray-200 p-3">
            <button
              className={`flex h-10 w-full items-center justify-center gap-2 rounded-full text-sm font-medium ${
                detailsAdded
                  ? "bg-[#e6f4ea] text-[#137333]"
                  : full
                    ? "bg-gray-100 text-gray-400"
                    : "bg-[#0b57d0] text-white hover:bg-[#0842a0]"
              }`}
              disabled={detailsAdded || full}
              onClick={addDetails}
              type="button"
            >
              <TourIcon
                className="size-4"
                name={detailsAdded ? "check" : "plus"}
              />
              {detailsAdded
                ? "Đã có trong lịch trình"
                : full
                  ? `Đã đủ ${MAX_STOPS_PER_DAY} điểm`
                  : "Thêm vào lịch trình"}
            </button>
          </div>
        </div>

        {/* Danh sách kết quả (PlaceSearchElement) — giữ nguyên khi mở chi tiết để quay lại */}
        <div
          className={
            !details && hasResults ? "flex min-h-0 flex-1 flex-col" : "hidden"
          }
        >
          <p className="shrink-0 border-y border-gray-200 px-4 py-2 text-sm font-medium text-gray-700">
            {searching ? "Đang tìm…" : `Kết quả cho “${resultsQuery}”`}
          </p>
          {searchError ? (
            <p className="p-4 text-sm text-red-600">{searchError}</p>
          ) : null}
          {!searching && !searchError && resultPlaces.length === 0 ? (
            <p className="p-4 text-sm text-gray-600">
              Không tìm thấy kết quả. Thử từ khóa khác hoặc di chuyển bản đồ.
            </p>
          ) : null}
          <div className="min-h-0 flex-1 overflow-y-auto" ref={resultsEl} />
        </div>

        {!details && !hasResults ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center text-sm text-gray-500">
            <TourIcon className="size-8 text-gray-300" name="compass" />
            <p>
              Tìm địa điểm hoặc bấm vào một địa điểm trên bản đồ để xem chi tiết
              và thêm vào lịch trình.
            </p>
          </div>
        ) : null}
      </aside>

      <div className="relative h-[45%] shrink-0 sm:h-auto sm:min-w-0 sm:flex-1">
        <div className="size-full" ref={mapEl} />
        {showSearchArea && !searching ? (
          <button
            className="absolute top-3 left-1/2 z-10 flex h-9 -translate-x-1/2 items-center gap-1.5 rounded-full bg-white px-4 text-sm font-medium text-[#1a73e8] shadow-[0_2px_6px_rgba(0,0,0,0.3)] hover:bg-gray-50"
            onClick={() => resultsQuery && runSearch(resultsQuery, true)}
            type="button"
          >
            <TourIcon className="size-4" name="search" />
            Tìm kiếm khu vực này
          </button>
        ) : null}
        {error ? (
          <p className="absolute inset-0 z-30 flex items-center justify-center bg-white p-4 text-center text-sm text-red-600">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}

/** Chip các điểm đã chọn ở chân popup */
function StopChips({
  stops,
  onChange,
}: {
  stops: TourStop[];
  onChange: (stops: TourStop[]) => void;
}) {
  return (
    <ol className="flex flex-wrap gap-2">
      {stops.map((stop, i) => (
        <li
          className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-overlay-line bg-surface py-1 ps-1 pe-2 text-sm text-foreground"
          key={stop.placeId}
          title={stop.address ?? undefined}
        >
          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#1a73e8] text-[11px] font-bold text-white">
            {i + 1}
          </span>
          <span className="truncate">{stop.name}</span>
          <button
            aria-label={`Xóa ${stop.name}`}
            className="text-muted-foreground-1 hover:text-red-600"
            onClick={() => onChange(stops.filter((_, j) => j !== i))}
            type="button"
          >
            <TourIcon className="size-3.5" name="x" />
          </button>
        </li>
      ))}
    </ol>
  );
}

function SortableStopRow({
  stop,
  index,
  onRemove,
}: {
  stop: TourStop;
  index: number;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stop.placeId });

  return (
    <li
      className={`flex items-center gap-2 rounded-lg border border-layer-line bg-layer py-2 ps-1 pe-2 ${
        isDragging ? "relative z-10 shadow-lg ring-1 ring-primary" : ""
      }`}
      ref={setNodeRef}
      style={{
        // Chỉ dịch theo trục dọc
        transform: transform
          ? `translate3d(0, ${transform.y}px, 0)`
          : undefined,
        transition,
      }}
    >
      <button
        aria-label={`Kéo để đổi thứ tự ${stop.name}`}
        className="flex h-8 w-6 shrink-0 cursor-grab touch-none items-center justify-center rounded text-muted-foreground-1 hover:bg-layer-hover hover:text-foreground active:cursor-grabbing"
        ref={setActivatorNodeRef}
        type="button"
        {...attributes}
        {...listeners}
      >
        <svg
          aria-hidden
          className="size-4"
          fill="currentColor"
          viewBox="0 0 16 16"
        >
          <circle cx="5.5" cy="3.5" r="1.25" />
          <circle cx="10.5" cy="3.5" r="1.25" />
          <circle cx="5.5" cy="8" r="1.25" />
          <circle cx="10.5" cy="8" r="1.25" />
          <circle cx="5.5" cy="12.5" r="1.25" />
          <circle cx="10.5" cy="12.5" r="1.25" />
        </svg>
      </button>
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#1a73e8] text-xs font-bold text-white">
        {index + 1}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {stop.name}
        </p>
        {stop.address ? (
          <p className="truncate text-xs text-muted-foreground-1">
            {stop.address}
          </p>
        ) : null}
      </div>
      <button
        aria-label={`Xóa ${stop.name}`}
        className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground-1 hover:bg-red-50 hover:text-red-600"
        onClick={onRemove}
        type="button"
      >
        <TourIcon className="size-4" name="x" />
      </button>
    </li>
  );
}

/** Danh sách điểm đã chọn, kéo thả (chuột, cảm ứng, bàn phím) để đổi thứ tự tham quan */
function SortableStopList({
  stops,
  onChange,
}: {
  stops: TourStop[];
  onChange: (stops: TourStop[]) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = stops.findIndex((s) => s.placeId === active.id);
    const to = stops.findIndex((s) => s.placeId === over.id);
    if (from < 0 || to < 0) return;
    onChange(arrayMove(stops, from, to));
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
      sensors={sensors}
    >
      <SortableContext
        items={stops.map((s) => s.placeId)}
        strategy={verticalListSortingStrategy}
      >
        <ol className="space-y-1.5">
          {stops.map((stop, i) => (
            <SortableStopRow
              index={i}
              key={stop.placeId}
              onRemove={() => onChange(stops.filter((_, j) => j !== i))}
              stop={stop}
            />
          ))}
        </ol>
      </SortableContext>
    </DndContext>
  );
}

/**
 * Danh sách điểm tham quan của một ngày (kéo thả để sắp xếp) + nút mở popup tìm kiếm trên Google Maps.
 * Thêm/xóa trong popup áp dụng ngay vào lịch trình.
 */
export function TourStopPicker({
  stops,
  onChange,
  provinceName,
  legacyLocation,
  dayLabel,
}: {
  stops: TourStop[];
  onChange: (stops: TourStop[]) => void;
  /** Tỉnh của tour, để mở bản đồ đúng khu vực */
  provinceName?: string;
  /** Địa điểm dạng chữ của dữ liệu cũ, chỉ để gợi ý */
  legacyLocation?: string;
  /** VD: "Ngày 1", hiện trên tiêu đề popup */
  dayLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [open]);

  return (
    <div className="space-y-2">
      {stops.length > 0 ? (
        <>
          <SortableStopList onChange={onChange} stops={stops} />
          {stops.length > 1 ? (
            <p className="text-xs text-muted-foreground-1">
              Kéo biểu tượng ⋮⋮ để sắp xếp thứ tự tham quan.
            </p>
          ) : null}
        </>
      ) : legacyLocation ? (
        <p className="text-xs text-muted-foreground-1">
          Địa điểm cũ (dạng chữ):{" "}
          <span className="font-medium">{legacyLocation}</span>
        </p>
      ) : null}

      <button
        className="inline-flex items-center gap-x-2 rounded-lg border border-layer-line bg-layer px-3 py-2 text-sm font-medium text-layer-foreground shadow-2xs hover:bg-layer-hover focus:outline-hidden"
        onClick={() => setOpen(true)}
        type="button"
      >
        <TourIcon
          className="size-4"
          name={stops.length > 0 ? "edit" : "plus"}
        />
        {stops.length > 0 ? "Chỉnh sửa địa điểm" : "Thêm địa điểm"}
        <span className="text-xs text-muted-foreground-1">
          ({stops.length}/{MAX_STOPS_PER_DAY})
        </span>
      </button>

      {open
        ? createPortal(
            <div
              className="fixed inset-0 z-80 flex items-center justify-center bg-gray-900/50 p-2 sm:p-4"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) setOpen(false);
              }}
            >
              <div
                aria-labelledby={titleId}
                aria-modal="true"
                className="flex h-full max-h-[900px] w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-overlay-line bg-overlay shadow-2xl"
                role="dialog"
              >
                <div className="flex items-center justify-between gap-3 border-b border-overlay-line px-4 py-3">
                  <h3 className="font-semibold text-foreground" id={titleId}>
                    Chọn điểm tham quan{dayLabel ? ` · ${dayLabel}` : ""}
                  </h3>
                  <button
                    aria-label="Đóng"
                    className="inline-flex size-8 items-center justify-center rounded-full bg-surface text-surface-foreground hover:bg-surface-hover focus:outline-hidden"
                    onClick={() => setOpen(false)}
                    type="button"
                  >
                    <TourIcon className="size-4" name="x" />
                  </button>
                </div>

                <div className="min-h-0 flex-1">
                  <StopSearchMap
                    onChange={onChange}
                    provinceName={provinceName}
                    stops={stops}
                  />
                </div>

                <div className="flex flex-col gap-3 border-t border-overlay-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    {stops.length > 0 ? (
                      <div className="max-h-20 overflow-y-auto">
                        <StopChips onChange={onChange} stops={stops} />
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground-1">
                        Tìm hoặc bấm vào địa điểm trên bản đồ để thêm vào lịch
                        trình.
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center justify-end gap-3">
                    <span className="text-xs text-muted-foreground-1">
                      {stops.length}/{MAX_STOPS_PER_DAY} điểm
                    </span>
                    <button
                      className="inline-flex items-center gap-x-2 rounded-lg border border-primary-line bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover focus:outline-hidden"
                      onClick={() => setOpen(false)}
                      type="button"
                    >
                      Xong
                    </button>
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
