"use client";

import { useChat } from "@ai-sdk/react";
import { lastAssistantMessageIsCompleteWithToolCalls } from "ai";
import { ArrowUpIcon, SparklesIcon, SquareIcon } from "lucide-react";
import Image from "next/image";
import { type FormEvent, useMemo, useState } from "react";
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
import { ChatMessage } from "@/features/customer/chat/components/chat-message";
import { ChatServiceMap } from "@/features/customer/chat/components/chat-service-map";
import { QuestionPanel } from "@/features/customer/chat/components/question-panel";
import { getCards, isMapCard } from "@/features/customer/chat/lib/cards";
import type { ChatMessage as ChatMessageType } from "@/features/customer/chat/lib/tools";
import { PageBanner } from "@/features/customer/components/page-banner";

const SUGGESTIONS = [
  "Lịch trình 2 ngày 1 đêm khám phá Ninh Bình trọn gói",
  "Ở Ninh Bình có nhà hàng nào ăn dê núi cơm cháy ngon?",
  "Tìm tour đi thuyền ngắm vịnh Lan Hạ - Cát Bà",
  "Gợi ý khách sạn/resort nghỉ dưỡng gần biển ở Cát Bà",
];

// Tin nhắn AI có nội dung hiển thị được (chữ hoặc câu hỏi đã trả lời)
const hasContent = (m: ChatMessageType) =>
  m.parts.some(
    (p) => (p.type === "text" && p.text) || (p.type === "tool-askUser" && p.state === "output-available"),
  );

export function ChatPageContent() {
  const { messages, sendMessage, status, stop, error, regenerate, addToolOutput } = useChat<ChatMessageType>({
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
  });
  const [input, setInput] = useState("");
  const [activeUrl, setActiveUrl] = useState<string | null>(null);

  const isBusy = status === "submitted" || status === "streaming";
  const lastMessage = messages.at(-1);

  // Thẻ của từng tin nhắn AI (bỏ qua tin đang stream)
  const cardsById = useMemo(
    () =>
      new Map(
        messages
          .filter((m) => m.role === "assistant" && !(isBusy && m.id === lastMessage?.id))
          .map((m) => [m.id, getCards(m)]),
      ),
    [messages, isBusy, lastMessage?.id],
  );

  // Bản đồ hiển thị địa điểm của tin nhắn AI gần nhất có tọa độ
  const mapCards = useMemo(() => {
    for (const cards of [...cardsById.values()].reverse()) {
      const mappable = cards.filter(isMapCard);
      if (mappable.length > 0) return mappable;
    }
    return [];
  }, [cardsById]);
  const pinByUrl = useMemo(() => new Map(mapCards.map((c, i) => [c.url, i + 1])), [mapCards]);

  const pendingQuestion = lastMessage?.parts.find(
    (p) => p.type === "tool-askUser" && p.state === "input-available",
  ) as Extract<ChatMessageType["parts"][number], { type: "tool-askUser" }> | undefined;

  const showTyping = isBusy && (!lastMessage || lastMessage.role === "user" || !hasContent(lastMessage));

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
    <div className="font-[family-name:var(--font-dm-sans)] text-new-paragraph">
      <PageBanner items={[{ label: "Trang chủ", href: "/" }, { label: "Roamly AI" }]} title="Roamly AI" />

      <section className="page-x py-10">
        <div className="flex flex-col gap-[30px] lg:flex-row lg:items-start">
          {/* Cột trái: bản đồ khi có địa điểm, ngược lại là giới thiệu + gợi ý */}
          <aside
            className={
              mapCards.length > 0
                ? "flex h-[420px] min-w-0 flex-col rounded-md bg-new-section-bg p-6 lg:h-[740px] lg:flex-1"
                : "hidden min-w-0 flex-1 flex-col rounded-md bg-new-section-bg p-6 lg:flex lg:h-[740px]"
            }
          >
            {mapCards.length > 0 ? (
              <ChatServiceMap activeUrl={activeUrl} items={mapCards} onSelectUrl={setActiveUrl} />
            ) : (
              <>
                <div className="flex min-h-0 flex-1 items-center justify-center rounded bg-white p-6">
                  <Image
                    alt="Trợ lý du lịch Roamly AI"
                    className="h-full max-h-[380px] w-full object-contain"
                    height={1024}
                    priority
                    sizes="50vw"
                    src="/AIbanner.png"
                    width={1536}
                  />
                </div>
                <h2 className="mt-6 text-2xl font-semibold text-new-title">
                  Roamly AI đồng hành cùng chuyến đi của bạn
                </h2>
                <p className="mb-5 mt-1.5 text-sm">
                  Gợi ý tour, khách sạn, quán ăn, điểm tham quan và lịch trình chi tiết.
                </p>
                <Suggestions className="grid grid-cols-2 gap-3" disabled={isBusy} onPick={send} />
              </>
            )}
          </aside>

          {/* Khung chat */}
          <div className="flex h-[740px] max-h-[calc(100dvh-6rem)] min-h-[540px] w-full flex-col rounded-md bg-new-section-bg p-6 lg:w-[540px] lg:shrink-0 xl:w-[580px]">
            <div className="mb-4 flex items-center gap-2">
              <SparklesIcon className="size-5 text-new-teal-cta" />
              <h1 className="text-lg font-semibold text-new-title">Trò chuyện với Roamly AI</h1>
            </div>

            <div className="relative min-h-0 flex-1 rounded bg-white p-4">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <p className="text-base font-medium text-new-title">Xin chào! Bạn muốn đi đâu hay trải nghiệm gì?</p>
                  <p className="max-w-xs text-sm">
                    Mô tả sở thích, món ăn muốn thử hoặc nhờ Roamly AI lên lịch trình trọn gói.
                  </p>
                  <Suggestions className="mt-2 grid w-full max-w-xs gap-2 lg:hidden" onPick={send} />
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
                              <ChatMessage
                                activeUrl={activeUrl}
                                cards={cardsById.get(message.id) ?? []}
                                message={message}
                                onHover={setActiveUrl}
                                pinByUrl={pinByUrl}
                              />
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
                <form className="flex items-end gap-2.5" onSubmit={handleSubmit}>
                  <textarea
                    aria-label="Nhập câu hỏi của bạn"
                    className="max-h-40 min-h-[49px] w-full resize-none rounded border border-new-input-border bg-white px-3.5 py-3 text-base text-new-title placeholder:text-new-placeholder focus:border-new-teal focus:outline-none focus:ring-1 focus:ring-new-teal"
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) handleSubmit(e);
                    }}
                    placeholder="Ví dụ: Đi Ninh Bình 2N1Đ ăn dê núi, ở homestay nào đẹp?..."
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
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Suggestions({
  className,
  disabled,
  onPick,
}: {
  className: string;
  disabled?: boolean;
  onPick: (text: string) => void;
}) {
  return (
    <div className={className}>
      {SUGGESTIONS.map((text) => (
        <button
          className="rounded bg-white px-4 py-3 text-left text-sm text-new-title transition-colors hover:text-new-teal-cta disabled:pointer-events-none disabled:opacity-50"
          disabled={disabled}
          key={text}
          onClick={() => onPick(text)}
          type="button"
        >
          {text}
        </button>
      ))}
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
              <span className="text-xs font-medium text-new-title">Đang tìm kiếm...</span>
            </div>
          </BubbleContent>
        </Bubble>
      </MessageContent>
    </Message>
  );
}
