"use client";

import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from "ai";
import { ArrowUpIcon, SquareIcon } from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { ChatMarkdown } from "@/features/customer/chat/components/chat-markdown";
import { loadTripChatHandoff, saveTripChatHandoff } from "../lib/chat-handoff";
import type { TripChatMessage } from "../lib/trip-ai";
import {
  type AskUserPart,
  StopPicker,
  collectPlaceDetails,
  describePick,
} from "./trip-stop-picker";

const MUTATION_TOOLS = new Set([
  "tool-addTripStops",
  "tool-removeTripStop",
  "tool-moveTripStop",
  "tool-optimizeTripDays",
]);

const SUGGESTIONS = [
  "Thêm một quán ăn tối ngon vào ngày 1",
  "Gợi ý thêm một điểm tham quan buổi chiều",
  "Thời tiết mấy ngày tới thế nào?",
];

function activeToolLabel(message?: TripChatMessage): string | null {
  if (!message || message.role !== "assistant") return null;
  for (const part of [...message.parts].reverse()) {
    if (!part.type.startsWith("tool-")) continue;
    if (
      "state" in part &&
      (part.state === "output-available" || part.state === "output-error")
    )
      continue;
    if (part.type === "tool-findPlaces") return "Đang tìm địa điểm phù hợp...";
    if (part.type === "tool-getWeather") return "Đang xem dự báo thời tiết...";
    if (MUTATION_TOOLS.has(part.type))
      return "Đang cập nhật & tối ưu lộ trình...";
  }
  return null;
}

type Segment = { key: string; role: "user" | "assistant"; text: string };

// Chia tin nhắn thành các bubble: chữ của AI, và lựa chọn của người dùng trong askUser (hiện như tin nhắn người dùng)
function toSegments(message: TripChatMessage): Segment[] {
  if (message.role === "user") {
    const text = message.parts
      .map((p) => (p.type === "text" ? p.text : ""))
      .join("")
      .trim();
    return text ? [{ key: message.id, role: "user", text }] : [];
  }
  const segments: Segment[] = [];
  let buffer = "";
  const flush = (i: number) => {
    if (buffer.trim())
      segments.push({
        key: `${message.id}-${i}`,
        role: "assistant",
        text: buffer.trim(),
      });
    buffer = "";
  };
  message.parts.forEach((part, i) => {
    if (part.type === "text") buffer += part.text;
    else if (
      part.type === "tool-askUser" &&
      part.state === "output-available"
    ) {
      flush(i);
      segments.push({
        key: `${message.id}-${i}-pick`,
        role: "user",
        text: describePick(part.output),
      });
    }
  });
  flush(message.parts.length);
  return segments;
}

export function TripChat({
  tripId,
  onTripChanged,
  addedKeys,
  dayCount,
}: {
  tripId: string;
  onTripChanged: () => void;
  addedKeys: Set<string>;
  dayCount: number;
}) {
  const [transport] = useState(
    () =>
      new DefaultChatTransport<TripChatMessage>({
        api: `/api/trips/${tripId}/chat`,
      }),
  );
  const {
    messages,
    sendMessage,
    setMessages,
    status,
    stop,
    error,
    regenerate,
    addToolOutput,
  } = useChat<TripChatMessage>({
    id: `trip-${tripId}`,
    transport,
    // Người dùng chọn xong trong askUser → tự gửi lại để AI thêm điểm dừng
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
  });
  const [input, setInput] = useState("");
  const handledTools = useRef(new Set<string>());
  const restored = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const onTripChangedRef = useRef(onTripChanged);

  useEffect(() => {
    onTripChangedRef.current = onTripChanged;
  }, [onTripChanged]);

  const isBusy = status === "submitted" || status === "streaming";

  // Khôi phục hội thoại chuyển từ /chat (hoặc lần mở trước) — chỉ chạy trên trình duyệt
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    const saved = loadTripChatHandoff(tripId);
    if (saved.length > 0) setMessages(saved as TripChatMessage[]);
  }, [tripId, setMessages]);

  useEffect(() => {
    if (status === "ready" && messages.length > 0)
      saveTripChatHandoff(tripId, messages);
  }, [status, messages, tripId]);

  // AI vừa thêm/xóa/chuyển điểm dừng → tải lại lộ trình để bản đồ cập nhật
  useEffect(() => {
    let changed = false;
    for (const message of messages) {
      for (const part of message.parts) {
        if (!MUTATION_TOOLS.has(part.type) || !("toolCallId" in part)) continue;
        if (
          part.state !== "output-available" ||
          handledTools.current.has(part.toolCallId)
        )
          continue;
        handledTools.current.add(part.toolCallId);
        changed = true;
      }
    }
    if (changed) onTripChangedRef.current();
  }, [messages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, status]);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isBusy) return;
    sendMessage({ text: trimmed });
    setInput("");
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    send(input);
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send(input);
    }
  }

  // Câu hỏi chọn điểm dừng đang chờ người dùng trả lời → thay ô nhập bằng bảng chọn
  let pendingPick: AskUserPart | null = null;
  const last = messages.at(-1);
  if (last?.role === "assistant") {
    for (const part of last.parts) {
      if (part.type === "tool-askUser" && part.state === "input-available")
        pendingPick = part;
    }
  }
  const placeDetails = useMemo(() => collectPlaceDetails(messages), [messages]);

  const lastMessage = messages.at(-1);
  const toolLabel = isBusy ? activeToolLabel(lastMessage) : null;
  const lastHasText =
    lastMessage?.role === "assistant" &&
    lastMessage.parts.some((p) => p.type === "text" && p.text);
  const showTyping = isBusy && (!lastHasText || Boolean(toolLabel));

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex h-full flex-col justify-end gap-2">
            <p className="text-sm text-new-paragraph">
              Nhờ Roamly AI gợi ý, thêm, bớt hoặc chuyển điểm dừng.
            </p>
            {SUGGESTIONS.map((s) => (
              <button
                className="rounded border border-new-chip bg-white px-3 py-2 text-left text-sm text-new-title transition-colors hover:border-new-teal-cta"
                key={s}
                onClick={() => send(s)}
                type="button"
              >
                {s}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.flatMap(toSegments).map(({ key, role, text }) => {
              const isUser = role === "user";
              return (
                <div
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                  key={key}
                >
                  <div
                    className={`max-w-[90%] rounded px-3.5 py-2.5 text-sm leading-[1.6] ${
                      isUser
                        ? "bg-new-teal-cta text-white"
                        : "bg-new-section-bg text-new-paragraph"
                    }`}
                  >
                    {isUser ? text : <ChatMarkdown>{text}</ChatMarkdown>}
                  </div>
                </div>
              );
            })}
            {showTyping && (
              <div
                className="flex items-center gap-2.5 self-start rounded bg-new-section-bg px-3.5 py-2.5"
                role="status"
              >
                <span className="flex gap-1">
                  {[0, 150, 300].map((delay) => (
                    <span
                      className="size-1.5 animate-bounce rounded-full bg-new-teal-cta"
                      key={delay}
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </span>
                {toolLabel && (
                  <span className="text-xs font-medium text-new-title">
                    {toolLabel}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <div
          className="mx-4 mb-2 flex items-center justify-between rounded bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          <span>Đã có lỗi xảy ra.</span>
          <button
            className="font-semibold underline"
            onClick={() => regenerate()}
            type="button"
          >
            Thử lại
          </button>
        </div>
      )}

      {pendingPick?.state === "input-available" ? (
        <StopPicker
          addedKeys={addedKeys}
          dayCount={dayCount}
          details={placeDetails}
          input={pendingPick.input}
          key={pendingPick.toolCallId}
          onAnswer={(output) =>
            addToolOutput({
              tool: "askUser",
              toolCallId: pendingPick.toolCallId,
              output,
            })
          }
        />
      ) : (
        <form
          className="flex items-end gap-2 border-t border-new-chip p-3"
          onSubmit={onSubmit}
        >
          <textarea
            aria-label="Nhắn cho Roamly AI"
            className="max-h-32 min-h-[44px] w-full resize-none rounded border border-new-input-border bg-white px-3 py-2.5 text-sm text-new-title placeholder:text-new-placeholder focus:border-new-teal focus:outline-none focus:ring-1 focus:ring-new-teal"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Vd: thêm quán cà phê view đẹp vào ngày 2..."
            rows={1}
            value={input}
          />
          {isBusy ? (
            <button
              aria-label="Dừng trả lời"
              className="flex size-11 shrink-0 items-center justify-center rounded bg-red-500 text-white hover:bg-red-600"
              onClick={() => stop()}
              type="button"
            >
              <SquareIcon className="size-4 fill-current" />
            </button>
          ) : (
            <button
              aria-label="Gửi"
              className="flex size-11 shrink-0 items-center justify-center rounded bg-new-teal-cta text-white hover:bg-new-teal-hover disabled:opacity-50"
              disabled={!input.trim()}
              type="submit"
            >
              <ArrowUpIcon className="size-5" />
            </button>
          )}
        </form>
      )}
    </div>
  );
}
