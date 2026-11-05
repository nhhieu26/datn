"use client";

import { useChat } from "@ai-sdk/react";
import { lastAssistantMessageIsCompleteWithToolCalls } from "ai";
import {
  ArrowUpIcon,
  ExternalLinkIcon,
  MapPinIcon,
  SparklesIcon,
  SquareIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Markdown from "react-markdown";
import {
  useMemo,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { Message, MessageContent } from "@/components/ui/message";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { formatVnd } from "@/features/customer/components/cards/card-parts";
import { PageBanner } from "@/features/customer/components/page-banner";
import {
  ChatServiceMap,
  type ServiceMapItem,
} from "@/features/customer/chat/components/chat-service-map";
import type { ChatMessage } from "@/features/customer/chat/lib/ai-tools";

const ROBOT_IMAGE = "/AIbanner.png";

const SUGGESTIONS = [
  "Lịch trình 2 ngày 1 đêm khám phá Ninh Bình trọn gói",
  "Ở Ninh Bình có nhà hàng nào ăn dê núi cơm cháy ngon?",
  "Tìm tour đi thuyền ngắm vịnh Lan Hạ - Cát Bà",
  "Gợi ý khách sạn/resort nghỉ dưỡng gần biển ở Cát Bà",
];

export function ChatPageContent() {
  const {
    messages,
    sendMessage,
    status,
    stop,
    error,
    regenerate,
    addToolOutput,
  } = useChat<ChatMessage>({
    // Tự gửi lại khi tool hỏi ngược đã có câu trả lời từ người dùng
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
  });
  const [input, setInput] = useState("");
  const [activeServiceUrl, setActiveServiceUrl] = useState<string | null>(null);

  const isBusy = status === "submitted" || status === "streaming";

  // Lấy các dịch vụ có tọa độ từ câu trả lời gần nhất của AI để hiển thị lên bản đồ
  const latestMapKey = (() => {
    for (const message of [...messages].reverse()) {
      if (message.role !== "assistant") continue;
      const mappable = toServiceMapItems(collectServiceCards(message));
      if (mappable.length > 0) {
        return `${message.id}:${mappable.map((i) => i.url).join("|")}`;
      }
    }
    return "";
  })();

  const latestMapItems = useMemo<ServiceMapItem[]>(() => {
    if (!latestMapKey) return [];
    for (const message of [...messages].reverse()) {
      if (message.role !== "assistant") continue;
      const mappable = toServiceMapItems(collectServiceCards(message));
      if (mappable.length > 0) return mappable;
    }
    return [];
    // Chỉ tính lại khi danh sách địa điểm gợi ý gần nhất thay đổi
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestMapKey]);

  const mapIndexByUrl = useMemo(() => {
    const map = new Map<string, number>();
    latestMapItems.forEach((item, idx) => {
      map.set(item.url, idx + 1);
    });
    return map;
  }, [latestMapItems]);

  // Câu hỏi hỏi-ngược gần nhất chưa được trả lời → thay ô input bằng các nút lựa chọn
  let pendingQuestion: AskUserPart | null = null;
  for (const message of [...messages].reverse()) {
    for (const part of [...message.parts].reverse()) {
      if (part.type === "tool-askUser" && part.state === "input-available") {
        pendingQuestion = part;
        break;
      }
    }
    if (pendingQuestion) break;
  }

  // Hiện bubble trạng thái khi chờ AI hoặc khi AI đang chạy tool tìm kiếm
  const lastMessage = messages.at(-1);
  const activeToolLabel = isBusy ? getActiveToolLabel(lastMessage) : null;
  const showTyping =
    isBusy &&
    (!lastMessage || !hasVisibleContent(lastMessage) || Boolean(activeToolLabel));

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isBusy) return;
    sendMessage({ text: trimmed });
    setInput("");
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    send(input);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send(input);
    }
  }

  return (
    <div className="font-[family-name:var(--font-dm-sans)] text-new-paragraph">
      <PageBanner
        items={[{ label: "Trang chủ", href: "/" }, { label: "Roamly AI" }]}
        title="Roamly AI"
      />

      <section className="page-x py-10">
        <div className="flex flex-col gap-[30px] lg:flex-row lg:items-start">
          {/* Cột trái: hiển thị bản đồ khi có gợi ý dịch vụ định vị được, ngược lại hiển thị giới thiệu + gợi ý prompt */}
          <aside
            className={
              latestMapItems.length > 0
                ? "flex h-[420px] min-w-0 flex-col rounded-md bg-new-section-bg p-6 lg:h-[740px] lg:flex-1"
                : "hidden min-w-0 flex-1 rounded-md bg-new-section-bg p-6 lg:flex lg:h-[740px] lg:flex-col"
            }
          >
            {latestMapItems.length > 0 ? (
              <ChatServiceMap
                activeUrl={activeServiceUrl}
                items={latestMapItems}
                onSelectUrl={setActiveServiceUrl}
              />
            ) : (
              <>
                <div className="flex min-h-0 flex-1 items-center justify-center rounded bg-white p-6">
                  <Image
                    alt="Trợ lý du lịch Roamly AI"
                    className="h-full max-h-[380px] w-full object-contain"
                    height={1024}
                    priority
                    sizes="50vw"
                    src={ROBOT_IMAGE}
                    width={1536}
                  />
                </div>
                <h2 className="mt-6 text-2xl font-semibold text-new-title">
                  Roamly AI đồng hành cùng chuyến đi của bạn
                </h2>
                <p className="mb-5 mt-1.5 text-sm">
                  Tìm kiếm theo ngữ nghĩa, tư vấn thực đơn & lịch trình chi tiết
                  từ dữ liệu thực tế trên Roamly.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {SUGGESTIONS.map((suggestion) => (
                    <SuggestionButton
                      disabled={isBusy}
                      key={suggestion}
                      onClick={() => send(suggestion)}
                    >
                      {suggestion}
                    </SuggestionButton>
                  ))}
                </div>
              </>
            )}
          </aside>

          {/* Khung chat: mở rộng để hiển thị lịch trình & thẻ dịch vụ trực quan */}
          <div className="flex h-[740px] max-h-[calc(100dvh-6rem)] min-h-[540px] w-full flex-col rounded-md bg-new-section-bg p-6 lg:w-[540px] xl:w-[580px] lg:shrink-0">
            <div className="mb-4 flex items-center gap-2">
              <SparklesIcon className="size-5 text-new-teal-cta" />
              <h1 className="text-lg font-semibold text-new-title">
                Trò chuyện với Roamly AI
              </h1>
            </div>

            <div className="relative min-h-0 flex-1 rounded bg-white p-4">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <span className="material-symbols-outlined text-5xl! text-new-placeholder">
                    chat
                  </span>
                  <p className="text-base font-medium text-new-title">
                    Xin chào! Bạn muốn đi đâu hay trải nghiệm gì?
                  </p>
                  <p className="max-w-xs text-sm">
                    Mô tả tự nhiên sở thích, món ăn muốn thử hoặc nhờ Roamly AI
                    lên lịch trình trọn gói.
                  </p>
                  <div className="mt-2 grid w-full max-w-xs grid-cols-1 gap-2 lg:hidden">
                    {SUGGESTIONS.map((suggestion) => (
                      <SuggestionButton
                        key={suggestion}
                        onClick={() => send(suggestion)}
                      >
                        {suggestion}
                      </SuggestionButton>
                    ))}
                  </div>
                </div>
              ) : (
                <MessageScrollerProvider autoScroll>
                  <MessageScroller className="-m-1">
                    <MessageScrollerViewport>
                      <MessageScrollerContent
                        aria-busy={isBusy}
                        className="gap-3 p-1"
                      >
                        {messages.map((message) => {
                          const isUser = message.role === "user";
                          // Tin nhắn AI chưa có nội dung hiển thị được → không render bubble rỗng
                          if (!isUser && !hasVisibleContent(message))
                            return null;

                          const isStreamingMessage =
                            isBusy && message.id === lastMessage?.id;
                          const serviceCards =
                            isUser || isStreamingMessage
                              ? []
                              : collectServiceCards(message);

                          return (
                            <MessageScrollerItem
                              key={message.id}
                              messageId={message.id}
                              scrollAnchor={isUser || undefined}
                            >
                              <Message align={isUser ? "end" : "start"}>
                                <MessageContent className="max-w-full">
                                  <Bubble
                                    align={isUser ? "end" : "start"}
                                    variant={isUser ? "default" : "muted"}
                                  >
                                    <BubbleContent
                                      className={`rounded px-4 py-3 text-sm leading-[1.6] ${
                                        isUser
                                          ? "bg-new-teal-cta text-white"
                                          : "bg-new-section-bg text-new-paragraph"
                                      }`}
                                    >
                                      {message.parts.map((part, i) => {
                                        if (part.type === "text" && part.text) {
                                          return isUser ? (
                                            <span key={`${message.id}-${i}`}>
                                              {part.text}
                                            </span>
                                          ) : (
                                            <ChatMarkdown
                                              key={`${message.id}-${i}`}
                                            >
                                              {part.text}
                                            </ChatMarkdown>
                                          );
                                        }
                                        if (part.type === "tool-askUser") {
                                          // Câu hỏi đang stream/đang chờ → hiển thị ở ô input, chỉ render thẻ khi đã trả lời
                                          if (part.state !== "output-available")
                                            return null;
                                          return (
                                            <AskUserCard
                                              key={`${message.id}-${i}`}
                                              part={part}
                                            />
                                          );
                                        }
                                        return null;
                                      })}

                                      {serviceCards.length > 0 && (
                                        <ChatServiceCards
                                          activeUrl={activeServiceUrl}
                                          items={serviceCards}
                                          mapIndexByUrl={mapIndexByUrl}
                                          onHoverItem={setActiveServiceUrl}
                                        />
                                      )}
                                    </BubbleContent>
                                  </Bubble>
                                </MessageContent>
                              </Message>
                            </MessageScrollerItem>
                          );
                        })}
                        {showTyping && (
                          <MessageScrollerItem messageId="typing">
                            <Message align="start">
                              <MessageContent>
                                <Bubble align="start" variant="muted">
                                  <BubbleContent className="rounded bg-new-section-bg px-4 py-3 text-sm text-new-paragraph">
                                    <div
                                      aria-label="Roamly AI đang trả lời"
                                      className="flex items-center gap-2.5"
                                      role="status"
                                    >
                                      <span className="flex gap-1">
                                        {[0, 150, 300].map((delay) => (
                                          <span
                                            className="size-1.5 animate-bounce rounded-full bg-new-teal-cta"
                                            key={delay}
                                            style={{
                                              animationDelay: `${delay}ms`,
                                            }}
                                          />
                                        ))}
                                      </span>
                                      {activeToolLabel && (
                                        <span className="text-xs font-medium text-new-title">
                                          {activeToolLabel}
                                        </span>
                                      )}
                                    </div>
                                  </BubbleContent>
                                </Bubble>
                              </MessageContent>
                            </Message>
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
                <button
                  className="font-bold underline"
                  onClick={() => regenerate()}
                  type="button"
                >
                  Thử lại
                </button>
              </div>
            )}

            <form className="mt-4" onSubmit={handleSubmit}>
              {pendingQuestion ? (
                <QuestionPanel
                  key={pendingQuestion.toolCallId}
                  onAnswer={(answer) =>
                    addToolOutput({
                      tool: "askUser",
                      toolCallId: pendingQuestion.toolCallId,
                      output: answer,
                    })
                  }
                  options={(pendingQuestion.input?.options ?? []).filter(
                    (option): option is string => option != null,
                  )}
                  question={pendingQuestion.input?.question}
                />
              ) : (
                <div className="flex items-end gap-2.5">
                  <textarea
                    aria-label="Nhập câu hỏi của bạn"
                    className="max-h-40 min-h-[49px] w-full resize-none rounded border border-new-input-border bg-white px-3.5 py-3 text-base text-new-title placeholder:text-new-placeholder focus:border-new-teal focus:outline-none focus:ring-1 focus:ring-new-teal"
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ví dụ: Đi Ninh Bình 2N1Đ ăn dê núi, ở homestay nào đẹp?..."
                    rows={1}
                    value={input}
                  />
                  {isBusy ? (
                    <button
                      aria-label="Dừng trả lời"
                      className="flex size-[49px] shrink-0 items-center justify-center rounded bg-red-500 text-white transition-colors hover:bg-red-600"
                      onClick={() => stop()}
                      type="button"
                    >
                      <SquareIcon className="size-4 fill-current" />
                    </button>
                  ) : (
                    <button
                      aria-label="Gửi tin nhắn"
                      className="flex size-[49px] shrink-0 items-center justify-center rounded bg-new-teal-cta text-white transition-colors hover:bg-new-teal-hover disabled:opacity-50"
                      disabled={!input.trim()}
                      type="submit"
                    >
                      <ArrowUpIcon className="size-5" />
                    </button>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

const OPTION_CLASS =
  "w-full rounded border border-new-input-border px-4 py-2.5 text-left text-sm text-new-title transition-colors hover:border-new-teal-cta hover:text-new-teal-cta";

// Câu hỏi ngược của AI: 3 gợi ý + "Khác" để tự nhập câu trả lời
function QuestionPanel({
  question,
  options,
  onAnswer,
}: {
  question?: string;
  options: string[];
  onAnswer: (answer: string) => void;
}) {
  const [otherOpen, setOtherOpen] = useState(false);
  const [otherText, setOtherText] = useState("");

  function submitOther() {
    const trimmed = otherText.trim();
    if (trimmed) onAnswer(trimmed);
  }

  return (
    <div className="rounded bg-white p-4">
      <p className="mb-3 text-base font-semibold text-new-title">{question}</p>
      {otherOpen ? (
        <div className="flex flex-col gap-2.5">
          <div className="flex items-end gap-2.5">
            <input
              aria-label="Câu trả lời của bạn"
              autoFocus
              className="h-[49px] w-full rounded border border-new-input-border bg-white px-3.5 text-base text-new-title placeholder:text-new-placeholder focus:border-new-teal focus:outline-none focus:ring-1 focus:ring-new-teal"
              onChange={(e) => setOtherText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  submitOther();
                }
              }}
              placeholder="Nhập câu trả lời của bạn..."
              type="text"
              value={otherText}
            />
            <button
              aria-label="Gửi câu trả lời"
              className="flex size-[49px] shrink-0 items-center justify-center rounded bg-new-teal-cta text-white transition-colors hover:bg-new-teal-hover disabled:opacity-50"
              disabled={!otherText.trim()}
              onClick={submitOther}
              type="button"
            >
              <ArrowUpIcon className="size-5" />
            </button>
          </div>
          <button
            className="self-start text-sm font-medium text-new-teal-cta hover:underline"
            onClick={() => setOtherOpen(false)}
            type="button"
          >
            Quay lại các lựa chọn
          </button>
        </div>
      ) : (
        <div
          aria-label="Các lựa chọn cho câu hỏi của Roamly AI"
          className="flex flex-col gap-2"
        >
          {options.map((option) => (
            <button
              className={OPTION_CLASS}
              key={option}
              onClick={() => onAnswer(option)}
              type="button"
            >
              {option}
            </button>
          ))}
          <button
            className={OPTION_CLASS}
            onClick={() => setOtherOpen(true)}
            type="button"
          >
            Khác...
          </button>
        </div>
      )}
    </div>
  );
}

function ChatMarkdown({ children }: { children: string }) {
  return (
    <Markdown
      components={{
        p: (props) => <p className="my-2 first:mt-0 last:mb-0" {...props} />,
        ul: (props) => (
          <ul
            className="my-2 list-disc space-y-1 pl-5 first:mt-0 last:mb-0"
            {...props}
          />
        ),
        ol: (props) => (
          <ol
            className="my-2 list-decimal space-y-1 pl-5 first:mt-0 last:mb-0"
            {...props}
          />
        ),
        strong: (props) => (
          <strong className="font-semibold text-new-title" {...props} />
        ),
        a: (props) => (
          <a
            className="font-medium text-new-teal-cta hover:underline"
            rel="noreferrer"
            target="_blank"
            {...props}
          />
        ),
        h1: (props) => (
          <p className="my-2 font-semibold text-new-title" {...props} />
        ),
        h2: (props) => (
          <p className="my-2 font-semibold text-new-title" {...props} />
        ),
        h3: (props) => (
          <p className="my-2 font-semibold text-new-title" {...props} />
        ),
      }}
    >
      {children}
    </Markdown>
  );
}

type AskUserPart = Extract<
  ChatMessage["parts"][number],
  { type: "tool-askUser" }
>;

type ServiceCardItem = {
  kind: "Tour" | "Khách sạn" | "Nhà hàng" | "Điểm đến";
  // internal: dịch vụ trên Roamly; external: địa điểm ngoài (Google Maps / OpenStreetMap)
  source: "internal" | "external";
  title: string;
  url: string;
  image: string;
  province: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  meta?: string | null;
  highlight?: string | null;
  priceLabel: string;
  rating?: number | null;
  reviewCount?: number;
};

function toServiceMapItems(cards: ServiceCardItem[]): ServiceMapItem[] {
  return cards.filter(
    (
      card,
    ): card is ServiceCardItem & {
      kind: "Khách sạn" | "Nhà hàng" | "Điểm đến";
      latitude: number;
      longitude: number;
    } =>
      card.kind !== "Tour" &&
      card.latitude != null &&
      card.longitude != null &&
      Number.isFinite(card.latitude) &&
      Number.isFinite(card.longitude),
  );
}

function collectServiceCards(message: ChatMessage): ServiceCardItem[] {
  const cards: ServiceCardItem[] = [];
  const seenUrls = new Set<string>();

  for (const part of message.parts) {
    if (part.type === "tool-searchTours" && part.state === "output-available") {
      for (const item of part.output) {
        if (!item?.url || seenUrls.has(item.url)) continue;
        seenUrls.add(item.url);
        cards.push({
          kind: "Tour",
          source: "internal",
          title: item.title,
          url: item.url,
          image: item.image || "/image-notfound.png",
          province: item.province,
          meta: item.duration,
          highlight: item.itinerary?.[0]?.title ?? item.tags?.slice(0, 2).join(" • "),
          priceLabel: item.price ? formatVnd(item.price) : "Liên hệ",
          rating: item.rating,
          reviewCount: item.reviewCount,
        });
      }
    } else if (
      part.type === "tool-searchHotels" &&
      part.state === "output-available"
    ) {
      for (const item of part.output) {
        if (!item?.url || seenUrls.has(item.url)) continue;
        seenUrls.add(item.url);
        cards.push({
          kind: "Khách sạn",
          source: "internal",
          title: item.name,
          url: item.url,
          image: item.image || "/image-notfound.png",
          province: item.province,
          address: item.address,
          latitude: item.latitude,
          longitude: item.longitude,
          meta: item.rooms?.length ? `${item.rooms.length} hạng phòng` : null,
          highlight: item.amenities?.slice(0, 3).join(" • "),
          priceLabel: item.priceFrom ? `Từ ${formatVnd(item.priceFrom)}/đêm` : "Liên hệ",
          rating: item.rating,
          reviewCount: item.reviewCount,
        });
      }
    } else if (
      part.type === "tool-searchRestaurants" &&
      part.state === "output-available"
    ) {
      for (const item of part.output) {
        if (!item?.url || seenUrls.has(item.url)) continue;
        seenUrls.add(item.url);
        const topDishes = item.dishes
          ?.slice(0, 2)
          .map((d) => d.name)
          .join(", ");
        cards.push({
          kind: "Nhà hàng",
          source: "internal",
          title: item.name,
          url: item.url,
          image: item.image || "/image-notfound.png",
          province: item.province,
          address: item.address,
          latitude: item.latitude,
          longitude: item.longitude,
          meta: item.hours,
          highlight: topDishes ? `Món nổi bật: ${topDishes}` : null,
          priceLabel: item.avgPrice ? `~${formatVnd(item.avgPrice)}/món` : "Xem menu",
          rating: item.rating,
          reviewCount: item.reviewCount,
        });
      }
    } else if (
      part.type === "tool-searchDestinations" &&
      part.state === "output-available"
    ) {
      for (const item of part.output) {
        if (!item?.url || seenUrls.has(item.url)) continue;
        seenUrls.add(item.url);
        cards.push({
          kind: "Điểm đến",
          source: "internal",
          title: item.name,
          url: item.url,
          image: item.image || "/image-notfound.png",
          province: item.province,
          address: item.address,
          latitude: item.latitude,
          longitude: item.longitude,
          meta: item.hours,
          highlight: item.tags?.slice(0, 2).join(" • "),
          priceLabel: item.ticketPrice ? `Vé ${formatVnd(item.ticketPrice)}` : "Miễn phí",
        });
      }
    } else if (
      (part.type === "tool-locatePlaces" || part.type === "tool-confirmPlaces") &&
      part.state === "output-available"
    ) {
      for (const item of part.output.places) {
        if (!item?.url || seenUrls.has(item.url)) continue;
        seenUrls.add(item.url);
        cards.push({
          kind: EXTERNAL_KIND_LABEL[item.kind],
          source: "external",
          title: item.name,
          url: item.url,
          image: item.image || "/image-notfound.png",
          province: item.province,
          address: item.address,
          latitude: item.latitude,
          longitude: item.longitude,
          meta: item.openingHours ?? OSM_TYPE_LABEL[item.type] ?? (item.type || null),
          highlight:
            item.summary ??
            (item.cuisine ? `Ẩm thực: ${item.cuisine}` : (item.address ?? null)),
          priceLabel: EXTERNAL_PRICE_LABEL[item.kind] ?? "Xem trên bản đồ",
          rating: item.rating,
          reviewCount: item.reviewCount ?? undefined,
        });
      }
    }
  }

  // Ưu tiên giữ các thẻ được AI nhắc tới trong câu trả lời (theo link hoặc tên), rồi mới tới phần còn lại
  const answerText = message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("\n")
    .toLowerCase();
  const isMentioned = (card: ServiceCardItem) =>
    answerText.includes(card.url.toLowerCase()) ||
    answerText.includes(card.title.toLowerCase());

  return [
    ...cards.filter(isMentioned),
    ...cards.filter((card) => !isMentioned(card)),
  ].slice(0, MAX_SUGGESTIONS);
}

const MAX_SUGGESTIONS = 5;

const EXTERNAL_KIND_LABEL = {
  hotel: "Khách sạn",
  restaurant: "Nhà hàng",
  destination: "Điểm đến",
} as const;

const EXTERNAL_PRICE_LABEL: Record<string, string> = {
  destination: "Tham quan tự do",
  restaurant: "Quán ăn địa phương",
  hotel: "Lưu trú tham khảo",
};

// Nhãn tiếng Việt cho một số loại đối tượng OpenStreetMap thường gặp
const OSM_TYPE_LABEL: Record<string, string> = {
  hotel: "Khách sạn",
  guest_house: "Nhà nghỉ",
  hostel: "Hostel",
  motel: "Motel",
  apartment: "Căn hộ",
  resort: "Resort",
  restaurant: "Nhà hàng",
  cafe: "Quán cà phê",
  fast_food: "Đồ ăn nhanh",
  food_court: "Khu ẩm thực",
  bar: "Bar",
  pub: "Pub",
  attraction: "Điểm tham quan",
  viewpoint: "Điểm ngắm cảnh",
  museum: "Bảo tàng",
  theme_park: "Công viên giải trí",
  zoo: "Sở thú",
  beach: "Bãi biển",
  peak: "Đỉnh núi",
  park: "Công viên",
  place_of_worship: "Chùa / đền / nhà thờ",
  bridge: "Cầu",
};

function getActiveToolLabel(message?: ChatMessage): string | null {
  if (!message || message.role !== "assistant") return null;
  for (const part of [...message.parts].reverse()) {
    switch (part.type) {
      case "tool-searchTours":
        if (part.state !== "output-available" && part.state !== "output-error")
          return "Đang tìm kiếm tour & lịch trình phù hợp...";
        break;
      case "tool-searchHotels":
        if (part.state !== "output-available" && part.state !== "output-error")
          return "Đang tìm khách sạn & hạng phòng...";
        break;
      case "tool-searchRestaurants":
        if (part.state !== "output-available" && part.state !== "output-error")
          return "Đang tra cứu nhà hàng & thực đơn món ăn...";
        break;
      case "tool-searchDestinations":
        if (part.state !== "output-available" && part.state !== "output-error")
          return "Đang tìm địa điểm tham quan...";
        break;
      case "tool-getWeather":
        if (part.state !== "output-available" && part.state !== "output-error")
          return "Đang kiểm tra dự báo thời tiết...";
        break;
      case "tool-locatePlaces":
        if (part.state !== "output-available" && part.state !== "output-error")
          return "Đang định vị địa điểm trên bản đồ...";
        break;
      case "tool-confirmPlaces":
        if (part.state !== "output-available" && part.state !== "output-error")
          return "Đang xác nhận địa điểm...";
        break;
    }
  }
  return null;
}

// Chỉ tính nội dung hiển thị được: chữ, hoặc câu hỏi ngược đã được trả lời
function hasVisibleContent(message: ChatMessage) {
  return message.parts.some(
    (part) =>
      (part.type === "text" && part.text.length > 0) ||
      (part.type === "tool-askUser" && part.state === "output-available"),
  );
}

function ChatServiceCards({
  items,
  activeUrl,
  mapIndexByUrl,
  onHoverItem,
}: {
  items: ServiceCardItem[];
  activeUrl?: string | null;
  mapIndexByUrl?: Map<string, number>;
  onHoverItem?: (url: string | null) => void;
}) {
  return (
    <div className="mt-3 border-t border-new-chip pt-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-new-title">
        Gợi ý cho bạn ({items.length})
      </p>
      <div className="flex flex-col gap-2">
        {items.map((item) => {
          const hasCoords = item.latitude != null && item.longitude != null;
          const pinNumber = mapIndexByUrl?.get(item.url);
          const isActive = activeUrl === item.url;

          return (
            <Link
              className={`group flex items-center gap-3 rounded border bg-white p-2.5 transition-all hover:border-new-teal-cta hover:shadow-xs ${
                isActive
                  ? "border-new-teal-cta ring-1 ring-new-teal-cta/30"
                  : "border-new-chip"
              }`}
              href={item.url}
              key={item.url}
              onFocus={() => {
                if (hasCoords) onHoverItem?.(item.url);
              }}
              onMouseEnter={() => {
                if (hasCoords) onHoverItem?.(item.url);
              }}
              target="_blank"
            >
              <div className="relative size-16 shrink-0 overflow-hidden rounded">
                <Image
                  alt={item.title}
                  className="object-cover"
                  fill
                  sizes="64px"
                  src={item.image}
                />
                {pinNumber != null && (
                  <span
                    className="absolute top-1 left-1 inline-flex size-5 items-center justify-center rounded-full bg-new-teal-cta text-[10px] font-bold text-white shadow-xs"
                    title="Vị trí trên bản đồ"
                  >
                    {pinNumber}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-[11px] font-medium">
                  <span className="truncate text-new-paragraph">
                    {item.province}
                    {item.meta ? ` • ${item.meta}` : ""}
                  </span>
                  {hasCoords && (
                    <MapPinIcon
                      aria-label="Có vị trí trên bản đồ"
                      className="ml-auto size-3.5 shrink-0 text-new-teal-cta"
                    />
                  )}
                </div>
                <p className="mt-0.5 truncate text-sm font-semibold text-new-title group-hover:text-new-teal-cta">
                  {item.title}
                </p>
                {item.highlight && (
                  <p className="truncate text-xs text-new-paragraph">
                    {item.highlight}
                  </p>
                )}
                <div className="mt-1 flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-new-teal-cta">
                    {item.priceLabel}
                  </span>
                  <div className="flex items-center gap-2">
                    {item.rating != null && item.reviewCount ? (
                      <span className="flex items-center gap-0.5 text-xs font-medium text-new-title">
                        <span
                          aria-hidden
                          className="material-symbols-outlined text-xs! text-[#ffb400]"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          star
                        </span>
                        {item.rating.toFixed(1)} ({item.reviewCount})
                      </span>
                    ) : null}
                    <ExternalLinkIcon className="size-3.5 text-new-placeholder group-hover:text-new-teal-cta" />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function AskUserCard({ part }: { part: AskUserPart }) {
  return (
    <div className="my-3 rounded bg-white px-3 py-2 first:mt-0 last:mb-0">
      <p className="text-sm font-bold text-new-title">{part.input?.question}</p>
      <p className="text-xs text-new-paragraph mt-0.5">
        Bạn đã chọn: {String(part.output)}
      </p>
    </div>
  );
}

function SuggestionButton({
  children,
  disabled,
  onClick,
}: {
  children: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className="rounded bg-white px-4 py-3 text-left text-sm text-new-title transition-colors hover:text-new-teal-cta disabled:opacity-50 disabled:pointer-events-none"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}
