// Tải Google Maps JavaScript API một lần cho cả trang (client-side)
let loading: Promise<typeof google.maps> | null = null;

export function loadGoogleMaps(): Promise<typeof google.maps> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps chỉ chạy trên trình duyệt"));
  }
  if (window.google?.maps?.Map) return Promise.resolve(window.google.maps);
  if (loading) return loading;

  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY;
  if (!key) return Promise.reject(new Error("Thiếu NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY"));

  loading = new Promise((resolve, reject) => {
    const callback = "__roamlyGoogleMapsReady";
    (window as unknown as Record<string, () => void>)[callback] = () =>
      resolve(window.google.maps);
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?${new URLSearchParams({
      key,
      v: "weekly",
      language: "vi",
      region: "VN",
      loading: "async",
      callback,
    })}`;
    script.async = true;
    script.onerror = () => {
      loading = null;
      reject(new Error("Không tải được Google Maps"));
    };
    document.head.appendChild(script);
  });
  return loading;
}
