"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { loadGoogleMaps } from "@/lib/google-maps-loader";
import {
  PLACE_AUTOFILL_FIELDS,
  toPlaceAutofill,
  type PlaceAutofill,
} from "@/shared/lib/google-place-autofill";

export type PlaceAutofillKind = "hotel" | "restaurant" | "destination";

const SUGGEST_DEBOUNCE_MS = 250;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const ACCEPTED_PHOTO_TYPES = ["image/jpeg", "image/png"];

const PRIMARY_TYPES: Record<PlaceAutofillKind, string[] | undefined> = {
  hotel: ["lodging"],
  restaurant: ["restaurant", "cafe", "bar", "bakery", "meal_takeaway"],
  // Điểm tham quan rất đa dạng (bảo tàng, chùa, bãi biển, công viên…) → không lọc
  destination: undefined,
};

const PLACEHOLDERS: Record<PlaceAutofillKind, string> = {
  hotel: "VD: Vinpearl Resort Nha Trang",
  restaurant: "VD: Nhà hàng Madame Lân Đà Nẵng",
  destination: "VD: Bà Nà Hills",
};

type PhotoStatus =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "done"; count: number; failed: number };

/** In đậm phần khớp với từ khóa, giống gợi ý của Google Maps */
function highlight(text: google.maps.places.FormattableText | null): ReactNode {
  if (!text) return null;
  const parts: ReactNode[] = [];
  let cursor = 0;
  [...text.matches]
    .sort((a, b) => a.startOffset - b.startOffset)
    .forEach((m, i) => {
      if (m.startOffset > cursor) parts.push(text.text.slice(cursor, m.startOffset));
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

async function downloadPhoto(uri: string, name: string): Promise<File> {
  const res = await fetch(`/api/google-places/photo?url=${encodeURIComponent(uri)}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const blob = await res.blob();
  if (!ACCEPTED_PHOTO_TYPES.includes(blob.type) || blob.size > MAX_PHOTO_BYTES) {
    throw new Error("Ảnh không hợp lệ");
  }
  const ext = blob.type === "image/png" ? "png" : "jpg";
  return new File([blob], `${name}.${ext}`, { type: blob.type });
}

const PinIcon = ({ className = "size-4" }: { className?: string }) => (
  <svg
    aria-hidden
    className={className}
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

/**
 * Ô tìm địa điểm trên Google Maps; chọn một gợi ý → trả dữ liệu để form tự điền,
 * rồi tải tối đa `maxPhotos` ảnh (qua proxy) và trả về dạng File.
 */
export function GooglePlaceAutofill({
  kind,
  onPick,
  onPhotos,
  maxPhotos = 5,
}: {
  kind: PlaceAutofillKind;
  /** Trả về chuỗi cảnh báo (VD: không xác định được tỉnh) để hiển thị, nếu có */
  onPick: (data: PlaceAutofill) => string | void;
  onPhotos?: (files: File[]) => void;
  /** Số ảnh còn có thể thêm vào form */
  maxPhotos?: number;
}) {
  const libRef = useRef<google.maps.PlacesLibrary | null>(null);
  const sessionRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const suggestReqRef = useRef(0);
  const pickReqRef = useRef(0);
  const skipSuggestRef = useRef(false);

  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<google.maps.places.PlacePrediction[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [picked, setPicked] = useState<PlaceAutofill | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [pickError, setPickError] = useState<string | null>(null);
  const [photoStatus, setPhotoStatus] = useState<PhotoStatus>({ state: "idle" });

  // Chỉ tải Google Maps khi người dùng bắt đầu dùng ô tìm kiếm
  const ensureLoaded = () => {
    if (libRef.current || loadError) return;
    loadGoogleMaps()
      .then((maps) => maps.importLibrary("places") as Promise<google.maps.PlacesLibrary>)
      .then((lib) => {
        libRef.current = lib;
        sessionRef.current = new lib.AutocompleteSessionToken();
        setReady(true);
      })
      .catch((e: Error) => setLoadError(e.message));
  };

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
        const types = PRIMARY_TYPES[kind];
        const { suggestions: list } =
          await lib.AutocompleteSuggestion.fetchAutocompleteSuggestions({
            input,
            sessionToken: sessionRef.current ?? undefined,
            includedRegionCodes: ["vn"],
            language: "vi",
            region: "vn",
            ...(types ? { includedPrimaryTypes: types } : {}),
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
  }, [query, ready, kind]);

  const importPhotos = async (data: PlaceAutofill, reqId: number) => {
    const photos = data.photos.slice(0, Math.max(0, maxPhotos));
    if (!onPhotos || photos.length === 0) {
      setPhotoStatus({ state: "idle" });
      return;
    }
    setPhotoStatus({ state: "loading" });
    const results = await Promise.allSettled(
      photos.map((p, i) => downloadPhoto(p.uri, `google-${data.placeId.slice(0, 12)}-${i + 1}`)),
    );
    // Người dùng đã chọn địa điểm khác trong lúc tải
    if (reqId !== pickReqRef.current) return;
    const files = results.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []));
    if (files.length > 0) onPhotos(files);
    setPhotoStatus({ state: "done", count: files.length, failed: photos.length - files.length });
  };

  const selectPrediction = async (prediction: google.maps.places.PlacePrediction) => {
    const reqId = ++pickReqRef.current;
    skipSuggestRef.current = true;
    setQuery(prediction.mainText?.text ?? prediction.text.text);
    setSuggestions([]);
    setDropdownOpen(false);
    setActiveIndex(-1);
    setFetching(true);
    setPickError(null);
    setWarning(null);
    setPhotoStatus({ state: "idle" });

    const place = prediction.toPlace();
    try {
      await place.fetchFields({ fields: PLACE_AUTOFILL_FIELDS });
      if (reqId !== pickReqRef.current) return;
      const data = toPlaceAutofill(place);
      if (!data) throw new Error("Thiếu dữ liệu địa điểm");
      setPicked(data);
      setWarning(onPick(data) || null);
      void importPhotos(data, reqId);
    } catch {
      if (reqId === pickReqRef.current) setPickError("Không lấy được thông tin địa điểm. Thử lại sau.");
    } finally {
      if (reqId === pickReqRef.current) setFetching(false);
      // Phiên gợi ý kết thúc sau fetchFields → tạo phiên mới
      if (libRef.current) sessionRef.current = new libRef.current.AutocompleteSessionToken();
    }
  };

  const showDropdown = dropdownOpen && suggestions.length > 0;
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      if (!suggestions.length) return;
      event.preventDefault();
      setDropdownOpen(true);
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((i) => (i + step + suggestions.length) % suggestions.length);
    } else if (event.key === "Enter") {
      // Không submit form chính
      event.preventDefault();
      const prediction = suggestions[activeIndex] ?? suggestions[0];
      if (prediction) void selectPrediction(prediction);
    } else if (event.key === "Escape") {
      setDropdownOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div className="rounded-lg border border-dashed border-primary-line bg-primary-50/40 p-3 md:p-4">
      <label className="mb-1 flex items-center gap-x-1.5 text-sm font-medium text-foreground" htmlFor={`gmaps-autofill-${kind}`}>
        <PinIcon className="size-4 text-primary" />
        Tìm trên Google Maps để tự điền
      </label>
      <p className="mb-2 text-xs text-muted-foreground-1">
        Chọn một địa điểm để tự điền tên, địa chỉ, tỉnh/thành, vị trí
        {kind === "restaurant" ? ", số điện thoại" : ""}
        {kind === "destination" ? ", giờ mở cửa" : ""} và ảnh. Bạn vẫn có thể sửa lại.
      </p>

      <div className="relative">
        <input
          aria-autocomplete="list"
          aria-controls={`gmaps-autofill-${kind}-list`}
          aria-expanded={showDropdown}
          autoComplete="off"
          className="block w-full rounded-lg border-layer-line bg-layer px-3 py-2 pe-9 text-foreground placeholder:text-muted-foreground-1 focus:border-primary-focus focus:ring-primary-focus sm:text-sm"
          disabled={Boolean(loadError)}
          id={`gmaps-autofill-${kind}`}
          onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
          onChange={(event) => {
            setQuery(event.target.value);
            setDropdownOpen(true);
          }}
          onFocus={() => {
            ensureLoaded();
            setDropdownOpen(true);
          }}
          onKeyDown={onKeyDown}
          placeholder={PLACEHOLDERS[kind]}
          role="combobox"
          type="text"
          value={query}
        />
        {fetching ? (
          <span className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        ) : null}

        {showDropdown ? (
          <ul
            id={`gmaps-autofill-${kind}-list`}
            className="absolute z-30 mt-1 max-h-72 w-full overflow-auto rounded-lg border border-layer-line bg-layer py-1 shadow-lg"
            role="listbox"
          >
            {suggestions.map((prediction, index) => (
              <li
                aria-selected={index === activeIndex}
                className={`flex cursor-pointer items-start gap-x-2 px-3 py-2 text-sm ${
                  index === activeIndex ? "bg-layer-hover" : "hover:bg-layer-hover"
                }`}
                key={prediction.placeId}
                onMouseDown={(event) => {
                  event.preventDefault();
                  void selectPrediction(prediction);
                }}
                onMouseEnter={() => setActiveIndex(index)}
                role="option"
              >
                <PinIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground-1" />
                <span className="min-w-0">
                  <span className="block truncate text-foreground">
                    {highlight(prediction.mainText ?? prediction.text)}
                  </span>
                  {prediction.secondaryText ? (
                    <span className="block truncate text-xs text-muted-foreground-1">
                      {prediction.secondaryText.text}
                    </span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {loadError ? (
        <p className="mt-2 text-xs text-red-600">
          Không dùng được Google Maps ({loadError}). Bạn có thể nhập tay bên dưới.
        </p>
      ) : null}
      {pickError ? <p className="mt-2 text-xs text-red-600">{pickError}</p> : null}

      {picked ? (
        <div className="mt-3 space-y-1 rounded-lg border border-layer-line bg-layer px-3 py-2 text-xs text-muted-foreground-1">
          <p className="text-sm font-medium text-foreground">
            Đã điền từ Google Maps: {picked.name}
            {picked.rating != null ? (
              <span className="ms-1.5 font-normal text-muted-foreground-1">
                ★ {picked.rating.toFixed(1)}
                {picked.userRatingCount != null ? ` (${picked.userRatingCount.toLocaleString("vi-VN")})` : ""}
              </span>
            ) : null}
          </p>
          <p>Kiểm tra lại các trường trước khi lưu.</p>
          {warning ? <p className="text-amber-600">{warning}</p> : null}
          {photoStatus.state === "loading" ? <p>Đang nhập ảnh từ Google Maps…</p> : null}
          {photoStatus.state === "done" ? (
            <p>
              Đã thêm {photoStatus.count} ảnh
              {photoStatus.failed > 0 ? ` (${photoStatus.failed} ảnh không tải được)` : ""}.
              {picked.photos.some((p) => p.attribution)
                ? ` Ảnh: ${[...new Set(picked.photos.map((p) => p.attribution).filter(Boolean))].join(", ")} / Google Maps.`
                : ""}
            </p>
          ) : null}
          {picked.googleMapsUrl ? (
            <a
              className="inline-block font-medium text-primary hover:underline"
              href={picked.googleMapsUrl}
              rel="noreferrer"
              target="_blank"
            >
              Xem trên Google Maps
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
