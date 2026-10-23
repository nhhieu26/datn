"use client";

import { useChat } from "@ai-sdk/react";
import { lastAssistantMessageIsCompleteWithToolCalls } from "ai";
import { ArrowUpIcon, SquareIcon } from "lucide-react";
import Image from "next/image";
import Markdown from "react-markdown";
import { useState, type FormEvent, type KeyboardEvent } from "react";
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
import { PageBanner } from "@/features/customer/components/page-banner";
import type { ChatMessage } from "@/features/customer/chat/lib/ai-tools";

const ROBOT_IMAGE = "/AIbanner.png";

const SUGGESTIONS = [
  "Gợi ý lịch trình 3 ngày 2 đêm ở Đà Lạt",
  "Nên đi Phú Quốc vào tháng mấy?",
  "Những món ăn phải thử khi đến Hà Nội",
  "Cần chuẩn bị gì khi đi trekking Sa Pa?",
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

  const isBusy = status === "submitted" || status === "streaming";

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

  // Hiện bubble 3 chấm khi chờ AI, tới lúc AI bắt đầu có nội dung để hiển thị
  const lastMessage = messages.at(-1);
  const showTyping =
    isBusy && (!lastMessage || !hasVisibleContent(lastMessage));

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
          {/* Giới thiệu + gợi ý: cùng kiểu panel với sidebar tài khoản */}
          <aside className="hidden min-w-0 flex-1 rounded-md bg-new-section-bg p-6 lg:flex lg:h-[720px] lg:flex-col">
            <div className="flex min-h-0 flex-1 items-center justify-center rounded bg-white p-6">
              <Image
                alt="Trợ lý du lịch Roamly AI"
                className="h-full max-h-[400px] w-full object-contain"
                height={1024}
                priority
                sizes="55vw"
                src={ROBOT_IMAGE}
                width={1536}
              />
            </div>
            <h2 className="mt-6 text-2xl font-semibold text-new-title">
              Roamly AI đồng hành cùng chuyến đi của bạn
            </h2>
            <p className="mb-5 mt-1.5 text-sm">
              Gợi ý lịch trình, địa điểm và trải nghiệm phù hợp chỉ trong vài
              giây.
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
          </aside>

          {/* Khung chat: panel xám + thẻ trắng như trang "Đơn đặt tour" */}
          <div className="flex h-[720px] max-h-[calc(100dvh-6rem)] min-h-[520px] w-full flex-col rounded-md bg-new-section-bg p-6 lg:w-[460px] lg:shrink-0">
            <div className="mb-4 flex items-center">
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
                    Xin chào! Bạn muốn đi đâu?
                  </p>
                  <p className="max-w-xs text-sm">
                    Hỏi Roamly AI về lịch trình, điểm đến, ẩm thực hay kinh
                    nghiệm du lịch.
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
                          // Tin nhắn AI chưa có nội dung (mới có step/reasoning/tool đang stream) → không render bubble rỗng
                          if (!isUser && !hasVisibleContent(message))
                            return null;
                          return (
                            <MessageScrollerItem
                              key={message.id}
                              messageId={message.id}
                              scrollAnchor={isUser || undefined}
                            >
                              <Message align={isUser ? "end" : "start"}>
                                <MessageContent>
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
                                    <span
                                      aria-label="Roamly AI đang trả lời"
                                      className="flex gap-1"
                                      role="status"
                                    >
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
                    placeholder="Nhập câu hỏi của bạn..."
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

// Chỉ tính nội dung hiển thị được: chữ, hoặc câu hỏi ngược đã được trả lời
function hasVisibleContent(message: ChatMessage) {
  return message.parts.some(
    (part) =>
      (part.type === "text" && part.text.length > 0) ||
      (part.type === "tool-askUser" && part.state === "output-available"),
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
