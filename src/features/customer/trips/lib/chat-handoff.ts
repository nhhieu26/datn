import type { UIMessage } from "ai";

// Chuyển hội thoại từ /chat sang trang lộ trình (chỉ phần chữ, vì hai trang dùng bộ tool khác nhau)
const key = (tripId: string) => `roamly-trip-chat:${tripId}`;

export type HandoffMessage = {
  id: string;
  role: "user" | "assistant";
  parts: { type: "text"; text: string }[];
};

export function saveTripChatHandoff(tripId: string, messages: UIMessage[]) {
  const textOnly: HandoffMessage[] = messages
    .filter((m): m is UIMessage & { role: "user" | "assistant" } => m.role !== "system")
    .map((m) => ({
      id: m.id,
      role: m.role,
      parts: m.parts
        .filter((p): p is { type: "text"; text: string } => p.type === "text" && Boolean(p.text))
        .map((p) => ({ type: "text" as const, text: p.text })),
    }))
    .filter((m) => m.parts.length > 0);
  try {
    sessionStorage.setItem(key(tripId), JSON.stringify(textOnly));
  } catch {
    // Trình duyệt chặn storage → trang lộ trình bắt đầu hội thoại mới
  }
}

export function loadTripChatHandoff(tripId: string): HandoffMessage[] {
  try {
    const raw = sessionStorage.getItem(key(tripId));
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? (parsed as HandoffMessage[]) : [];
  } catch {
    return [];
  }
}
