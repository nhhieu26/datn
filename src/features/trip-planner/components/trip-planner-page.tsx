"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from "ai";
import { ArrowUpIcon, ChevronDownIcon, GlobeIcon, ListIcon, RouteIcon, SparklesIcon, SquareIcon } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Message, MessageContent } from "@/components/ui/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { QuestionPanel } from "@/features/customer/chat/components/question-panel";
import { FadeIn } from "@/features/customer/components/motion";
import { PageBanner } from "@/features/customer/components/page-banner";
import { formatKm, totals } from "@/features/trip-planner/lib/format";
import type { Itinerary, TravelMode } from "@/features/trip-planner/lib/itinerary";
import { saveTrip, takePendingPrompt, type Trip } from "@/features/trip-planner/lib/storage";
import type { TripChatMessage } from "@/features/trip-planner/lib/tools";
import { useTrips } from "@/features/trip-planner/lib/use-trips";
import { AnimatePresence, motion } from "motion/react";
import { ItineraryList } from "./itinerary-list";
import { TripMap } from "./trip-map";
import { TripMessage } from "./trip-message";

const SUGGESTIONS = [
  "Lộ trình 1 ngày khám phá Ninh Bình, thích hang động và ăn dê núi",
  "2 ngày 1 đêm ở Đà Lạt, thích cà phê view đẹp và chụp ảnh",
  "Nửa ngày buổi chiều dạo phố cổ Hà Nội và ăn tối món Hà Nội",
  "3 ngày Đà Nẵng – Hội An cho gia đình có trẻ nhỏ",
];

type Part = TripChatMessage["parts"][number];
type ItineraryPart = Extract<Part, { type: "tool-setItinerary" }>;

/** Lần setItinerary thành công gần nhất trong đoạn chat. */
function latestItinerary(messages: TripChatMessage[]) {
  for (const m of [...messages].reverse()) {
    for (const p of [...m.parts].reverse()) {
      if (p.type !== "tool-setItinerary" || p.state !== "output-available") continue;
      const out = (p as ItineraryPart & { state: "output-available" }).output;
      if (out.status === "ok") return { toolCallId: p.toolCallId, itinerary: out.itinerary, warnings: out.warnings };
    }
  }
  return null;
}

const NO_WARNINGS: string[] = [];

/** Giá trị đọc/ghi ngoài vòng render (cho callback của transport). */
function createBox<T>(initial: T) {
  let value = initial;
  return { get: () => value, set: (next: T) => void (value = next) };
}

const hasContent = (m: TripChatMessage) => m.parts.some((p) => p.type !== "text" || p.text);

export function TripPlannerPage({ id }: { id: string }) {
  // localStorage chỉ có ở trình duyệt: undefined = đang đọc, null = không có
  const trips = useTrips();
  const trip = trips === undefined ? undefined : (trips[id] ?? null);

  return (
    <div className="font-[family-name:var(--font-dm-sans)] text-new-paragraph">
      <PageBanner
        items={[{ label: "Trang chủ", href: "/" }, { label: "Lộ trình", href: "/trip-planner" }, { label: "Lập lộ trình" }]}
        title="Lập lộ trình"
      />
      <section className="page-x py-10">
        {trip === undefined ? (
          <div className="h-[740px] animate-pulse rounded-md bg-new-section-bg" />
        ) : trip === null ? (
          <div className="rounded-md bg-new-section-bg p-10 text-center">
            <p className="text-lg font-semibold text-new-title">Không tìm thấy lộ trình này trên trình duyệt.</p>
            <Link className="mt-3 inline-block font-semibold text-new-teal-cta hover:underline" href="/trip-planner">
              Về danh sách lộ trình
            </Link>
          </div>
        ) : (
          <TripWorkspace initialTrip={trip} key={trip.id} />
        )}
      </section>
    </div>
  );
}

function TripWorkspace({ initialTrip }: { initialTrip: Trip }) {
  const [trip, setTrip] = useState(initialTrip);
  const [input, setInput] = useState("");
  const [selectedDay, setSelectedDay] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [routing, setRouting] = useState(false);
  // Thu gọn danh sách lộ trình để bản đồ chiếm toàn bộ cột trái
  const [listOpen, setListOpen] = useState(true);

  // Transport đọc lộ trình + phương tiện mới nhất lúc gửi, kèm theo mỗi lượt chat (kể cả lượt tự gửi sau askUser)
  const [context] = useState(() => createBox({ itinerary: initialTrip.itinerary, mode: initialTrip.mode }));
  const [transport] = useState(
    () => new DefaultChatTransport({ api: "/api/trip-chat", body: () => ({ ...context.get() }) }),
  );

  const { messages, sendMessage, status, stop, error, regenerate, addToolOutput } = useChat<TripChatMessage>({
    id: initialTrip.id,
    messages: initialTrip.messages,
    transport,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
  });

  const isBusy = status === "submitted" || status === "streaming";
  const lastMessage = messages.at(-1);

  // Lộ trình AI vừa dựng (chưa áp dụng) ưu tiên hơn bản đang lưu; bản lưu có thể đã được sửa tay
  const latest = useMemo(() => latestItinerary(messages), [messages]);
  const fresh = latest && latest.toolCallId !== trip.appliedToolCallId;
  const itinerary = fresh ? latest.itinerary : trip.itinerary;
  const warnings = (fresh ? latest.warnings : trip.warnings) ?? NO_WARNINGS;
  const day = itinerary?.days[Math.min(selectedDay, itinerary.days.length - 1)] ?? null;
  const dayIndex = itinerary ? Math.min(selectedDay, itinerary.days.length - 1) : 0;

  useEffect(() => {
    context.set({ itinerary, mode: trip.mode });
  }, [context, itinerary, trip.mode]);

  // Lưu vào localStorage khi AI trả lời xong hoặc lộ trình thay đổi
  useEffect(() => {
    if (isBusy) return;
    saveTrip({
      ...trip,
      title: itinerary?.title ?? trip.title,
      itinerary,
      warnings,
      appliedToolCallId: latest?.toolCallId ?? trip.appliedToolCallId,
      messages,
    });
  }, [isBusy, trip, itinerary, warnings, latest?.toolCallId, messages]);

  // Câu hỏi chuyển từ /chat hoặc trang danh sách → tự gửi một lần
  // Hoãn sang tick sau: StrictMode giả lập unmount sẽ gọi chat.stop() và hủy mất lượt gửi đầu tiên
  useEffect(() => {
    const timer = setTimeout(() => {
      const prompt = takePendingPrompt(initialTrip.id);
      if (prompt) sendMessage({ text: prompt });
    }, 0);
    return () => clearTimeout(timer);
  }, [initialTrip.id, sendMessage]);

  const pendingQuestion = lastMessage?.parts.find(
    (p) => p.type === "tool-askUser" && p.state === "input-available",
  ) as Extract<Part, { type: "tool-askUser" }> | undefined;

  const showTyping = isBusy && (!lastMessage || lastMessage.role === "user" || !hasContent(lastMessage));

  /** Tính lại quãng đường sau khi người dùng tự sửa lộ trình. */
  async function recompute(next: Itinerary, mode: TravelMode, optimize: boolean) {
    const appliedToolCallId = latest?.toolCallId ?? trip.appliedToolCallId;
    // Hiện ngay thay đổi, quãng đường cập nhật sau
    setTrip((t) => ({ ...t, mode, itinerary: next, appliedToolCallId }));
    setRouting(true);
    try {
      const res = await fetch("/api/trip-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          optimize,
          itinerary: {
            title: next.title,
            days: next.days.map(({ date, start, end, stops }) => ({
              date,
              start,
              end,
              stops: stops.map(({ placeId, slot, time, durationMin, note }) => ({ placeId, slot, time, durationMin, note })),
            })),
          },
        }),
      });
      const result = await res.json();
      if (result.status === "ok") {
        setTrip((t) => ({ ...t, itinerary: result.itinerary, warnings: result.warnings, appliedToolCallId }));
      }
    } catch (e) {
      console.error("trip-route:", e);
    } finally {
      setRouting(false);
    }
  }

  function removeStop(index: number) {
    if (!itinerary) return;
    const days = itinerary.days.map((d, i) => {
      if (i !== dayIndex) return d;
      // Bỏ điểm và gộp hai chặng kề nhau thành một (chờ tính lại)
      return { ...d, stops: d.stops.filter((_, j) => j !== index), legs: [] };
    });
    recompute({ ...itinerary, days }, trip.mode, false);
    setActiveIndex(null);
  }

  function changeMode(mode: TravelMode) {
    if (itinerary) recompute(itinerary, mode, true);
    else setTrip((t) => ({ ...t, mode }));
  }

  function send(text: string) {
    if (!text.trim() || isBusy) return;
    sendMessage({ text: text.trim() });
    setInput("");
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    send(input);
  }

  return (
    <div className="flex flex-col gap-[30px] lg:flex-row lg:items-start">
      {/* Cột trái: bản đồ + lộ trình */}
      <FadeIn
        className="flex min-w-0 flex-col gap-4 rounded-md bg-new-section-bg p-6 lg:h-[740px] lg:flex-1"
        duration={0.48}
        inView={false}
        x={-16}
        y={8}
      >
        <div className="flex items-center gap-2">
          <RouteIcon className="size-5 text-new-teal-cta" />
          <h2 className="min-w-0 flex-1 truncate text-lg font-semibold text-new-title">
            {itinerary?.title ?? "Lộ trình của bạn"}
          </h2>
          <Link
            className="flex items-center gap-1 text-sm font-medium text-new-teal-cta hover:underline"
            href="/trip-planner"
          >
            <ListIcon className="size-4" /> Lộ trình đã lưu
          </Link>
        </div>
        <div className={listOpen ? "h-[300px] shrink-0 lg:h-[46%] transition-all duration-300" : "h-[480px] lg:h-auto lg:min-h-0 lg:flex-1 transition-all duration-300"}>
          <TripMap activeIndex={activeIndex} day={day} onSelect={setActiveIndex} />
        </div>
        <button
          aria-controls="trip-itinerary-panel"
          aria-expanded={listOpen}
          className="-my-1 flex shrink-0 cursor-pointer items-center gap-2 rounded bg-white px-3 py-2 text-left text-sm font-semibold text-new-title transition-colors hover:text-new-teal-cta"
          onClick={() => setListOpen((open) => !open)}
          type="button"
        >
          <span className="min-w-0 flex-1 truncate">
            {listOpen ? "Thu gọn lộ trình" : "Xem lộ trình chi tiết"}
            {!listOpen && day && (
              <span className="ml-2 font-normal text-new-paragraph">
                Ngày {dayIndex + 1} · {day.stops.length} điểm dừng · {formatKm(totals(day.legs).distanceM)}
              </span>
            )}
          </span>
          <ChevronDownIcon className={`size-4 shrink-0 transition-transform duration-200 ${listOpen ? "" : "rotate-180"}`} />
        </button>
        <AnimatePresence initial={false} mode="wait">
          {!listOpen ? null : itinerary ? (
            <motion.div
              key="itinerary-list"
              animate={{ opacity: 1, y: 0 }}
              className="min-h-[320px] flex-1 lg:min-h-0"
              exit={{ opacity: 0, y: 6 }}
              id="trip-itinerary-panel"
              initial={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.22 }}
            >
              <ItineraryList
                activeIndex={activeIndex}
                busy={routing || isBusy}
                days={itinerary.days}
                mode={trip.mode}
                onActivate={setActiveIndex}
                onModeChange={changeMode}
                onRemove={removeStop}
                onSelectDay={(i) => {
                  setSelectedDay(i);
                  setActiveIndex(null);
                }}
                selectedDay={dayIndex}
                warnings={warnings}
              />
            </motion.div>
          ) : (
            <motion.div
              key="itinerary-empty"
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-1 flex-col justify-center rounded bg-white p-6 text-sm"
              exit={{ opacity: 0, y: 6 }}
              id="trip-itinerary-panel"
              initial={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.22 }}
            >
              <p className="font-semibold text-new-title">Chưa có lộ trình</p>
              <p className="mt-1">
                Hãy cho Roamly AI biết bạn muốn đi đâu, bao nhiêu ngày và sở thích. AI sẽ tìm khách sạn, nhà hàng, điểm
                tham quan trên Google Maps, sắp xếp đủ bữa ăn theo giờ và tối ưu quãng đường thực tế.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </FadeIn>

      {/* Khung chat */}
      <FadeIn
        className="flex h-[740px] max-h-[calc(100dvh-6rem)] min-h-[540px] w-full flex-col rounded-md bg-new-section-bg p-6 lg:w-[480px] lg:shrink-0 xl:w-[520px]"
        delay={0.08}
        duration={0.5}
        inView={false}
        x={16}
        y={8}
      >
        <div className="mb-4 flex items-center gap-2">
          <SparklesIcon className="size-5 text-new-teal-cta" />
          <h1 className="text-lg font-semibold text-new-title">Lập lộ trình cùng Roamly AI</h1>
        </div>

        <div className="relative min-h-0 flex-1 rounded bg-white p-4">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <p className="text-base font-medium text-new-title">Bạn muốn đi đâu, trong bao lâu?</p>
              <p className="max-w-xs text-sm">Mô tả chuyến đi, Roamly AI sẽ lập lộ trình và bạn có thể yêu cầu chỉnh sửa.</p>
              <div className="mt-2 grid w-full max-w-sm gap-2">
                {SUGGESTIONS.map((text) => (
                  <button
                    className="rounded bg-new-section-bg px-4 py-2.5 text-left text-sm text-new-title transition-colors hover:text-new-teal-cta"
                    key={text}
                    onClick={() => send(text)}
                    type="button"
                  >
                    {text}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <MessageScrollerProvider autoScroll>
              <MessageScroller className="-m-1">
                <MessageScrollerViewport>
                  <MessageScrollerContent aria-busy={isBusy} className="gap-3 p-1">
                    {messages.map((message) =>
                      message.role === "assistant" && !hasContent(message) ? null : (
                        <MessageScrollerItem
                          key={message.id}
                          messageId={message.id}
                          scrollAnchor={message.role === "user" || undefined}
                        >
                          <TripMessage message={message} />
                        </MessageScrollerItem>
                      ),
                    )}
                    {showTyping && (
                      <MessageScrollerItem messageId="typing">
                        <TypingBubble />
                      </MessageScrollerItem>
                    )}
                  </MessageScrollerContent>
                </MessageScrollerViewport>
                <MessageScrollerButton />
              </MessageScroller>
            </MessageScrollerProvider>
          )}
        </div>

        {error && (
          <div
            className="mt-4 flex items-center justify-between gap-3 rounded bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
            role="alert"
          >
            <span>Đã có lỗi xảy ra. Vui lòng thử lại.</span>
            <button className="font-bold underline" onClick={() => regenerate()} type="button">
              Thử lại
            </button>
          </div>
        )}

        <div className="mt-4">
          {pendingQuestion ? (
            <QuestionPanel
              key={pendingQuestion.toolCallId}
              onAnswer={(answer) =>
                addToolOutput({ tool: "askUser", toolCallId: pendingQuestion.toolCallId, output: answer })
              }
              options={(pendingQuestion.input?.options ?? []).filter((o): o is string => o != null)}
              question={pendingQuestion.input?.question}
            />
          ) : (
            <>
              <form className="flex items-end gap-2.5" onSubmit={handleSubmit}>
                <textarea
                  aria-label="Nhập yêu cầu lộ trình"
                  className="max-h-40 min-h-[49px] w-full resize-none rounded border border-new-input-border bg-white px-3.5 py-3 text-base text-new-title placeholder:text-new-placeholder focus:border-new-teal focus:outline-none focus:ring-1 focus:ring-new-teal"
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) handleSubmit(e);
                  }}
                  placeholder={itinerary ? "Ví dụ: Đổi bữa trưa sang quán hải sản..." : "Ví dụ: 2 ngày ở Ninh Bình, thích leo núi..."}
                  rows={1}
                  value={input}
                />
                {isBusy ? (
                  <button
                    aria-label="Dừng trả lời"
                    className="flex size-[49px] shrink-0 items-center justify-center rounded bg-red-500 text-white hover:bg-red-600"
                    onClick={() => stop()}
                    type="button"
                  >
                    <SquareIcon className="size-4 fill-current" />
                  </button>
                ) : (
                  <button
                    aria-label="Gửi tin nhắn"
                    className="flex size-[49px] shrink-0 items-center justify-center rounded bg-new-teal-cta text-white hover:bg-new-teal-hover disabled:opacity-50"
                    disabled={!input.trim()}
                    type="submit"
                  >
                    <ArrowUpIcon className="size-5" />
                  </button>
                )}
              </form>
              <p className="mt-2 flex items-start gap-1.5 text-xs text-new-paragraph">
                <GlobeIcon className="mt-0.5 size-3.5 shrink-0 text-new-teal-cta" />
                <span>
                  <span className="font-semibold text-new-title">Mẹo:</span> thêm{" "}
                  <span className="font-medium text-new-title">“tìm trên mạng”</span> hoặc{" "}
                  <span className="font-medium text-new-title">“theo review”</span> vào yêu cầu để Roamly AI tìm trên web
                  trước, rồi tra các địa điểm đó trên Google Maps.
                </span>
              </p>
            </>
          )}
        </div>
      </FadeIn>
    </div>
  );
}

function TypingBubble() {
  return (
    <Message align="start">
      <MessageContent>
        <Bubble align="start" variant="muted">
          <BubbleContent className="rounded bg-new-section-bg px-4 py-3 text-sm">
            <div aria-label="Roamly AI đang trả lời" className="flex items-center gap-2.5" role="status">
              <span className="flex gap-1">
                {[0, 150, 300].map((delay) => (
                  <span
                    className="size-1.5 animate-bounce rounded-full bg-new-teal-cta"
                    key={delay}
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </span>
              <span className="text-xs font-medium text-new-title">Đang lập lộ trình...</span>
            </div>
          </BubbleContent>
        </Bubble>
      </MessageContent>
    </Message>
  );
}
