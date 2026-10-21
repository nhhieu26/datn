"use client";

import { useChat } from "@ai-sdk/react";
import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";

const ROBOT_IMAGE = "/AIbanner.png";

const SUGGESTIONS = [
  "Gợi ý lịch trình 3 ngày 2 đêm ở Đà Lạt",
  "Nên đi Phú Quốc vào tháng mấy?",
  "Những món ăn phải thử khi đến Hà Nội",
  "Cần chuẩn bị gì khi đi trekking Sa Pa?",
];

const TIPS = [
  "Nêu rõ điểm đến, số ngày và số người đi cùng.",
  "Chia sẻ ngân sách và sở thích (biển, núi, ẩm thực...).",
  "Hỏi tiếp để Roamly AI chỉnh lại lịch trình cho bạn.",
];

export function ChatPageContent() {
  const { messages, sendMessage, status, stop, error, regenerate } = useChat();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const isBusy = status === "submitted" || status === "streaming";

  function scrollToBottom() {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }

  function handleScroll() {
    const el = scrollRef.current;
    if (el) setIsAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 40);
  }

  // Chỉ tự cuộn theo tin nhắn mới khi người dùng đang ở cuối đoạn chat
  useEffect(() => {
    if (isAtBottom) scrollToBottom();
  }, [messages, status, isAtBottom]);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isBusy) return;
    sendMessage({ text: trimmed });
    setInput("");
    setIsAtBottom(true);
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
    <section className="page-x py-6 h-[calc(100dvh-5rem)] min-h-[560px] font-[family-name:var(--font-dm-sans)]">
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 h-full">
        {/* Nửa phải: khung chat */}
        <div className="lg:col-span-3 flex flex-col h-full min-h-0 bg-white">
          <header className="flex items-center gap-3 py-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-new-teal-cta text-white font-black">
              AI
            </span>
            <div>
              <h1 className="text-lg font-extrabold text-new-ink">
                Roamly AI<span className="text-new-coral">.</span>
              </h1>
              <p className="text-xs text-gray-500">
                {isBusy ? "Đang trả lời..." : "Trợ lý du lịch của bạn"}
              </p>
            </div>
          </header>

          <div className="relative flex-1 min-h-0">
            <div
              className="h-full overflow-y-auto py-6 pr-2 space-y-4 [scrollbar-width:thin] [scrollbar-gutter:stable] [mask-image:linear-gradient(to_bottom,transparent,black_24px,black_calc(100%-24px),transparent)]"
              onScroll={handleScroll}
              ref={scrollRef}
            >
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <h2 className="text-2xl font-extrabold text-new-ink mb-2">
                    Xin chào! Bạn muốn đi đâu?
                  </h2>
                  <p className="text-sm text-gray-500 max-w-md">
                    Hỏi Roamly AI về lịch trình, điểm đến, ẩm thực hay kinh nghiệm du lịch.
                  </p>
                  <div className="grid grid-cols-1 gap-3 w-full max-w-md mt-6 lg:hidden">
                    {SUGGESTIONS.map((suggestion) => (
                      <SuggestionButton key={suggestion} onClick={() => send(suggestion)}>
                        {suggestion}
                      </SuggestionButton>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    key={message.id}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                        message.role === "user"
                          ? "bg-new-teal-cta text-white rounded-br-sm"
                          : "bg-gray-100 text-gray-800 rounded-bl-sm"
                      }`}
                    >
                      {message.parts.map((part, i) =>
                        part.type === "text" ? <span key={`${message.id}-${i}`}>{part.text}</span> : null
                      )}
                    </div>
                  </div>
                ))
              )}

              {status === "submitted" && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-sm bg-gray-100 px-4 py-3 text-sm text-gray-500">
                    Roamly AI đang suy nghĩ...
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-center justify-between gap-3 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                  <span>Đã có lỗi xảy ra. Vui lòng thử lại.</span>
                  <button className="font-bold underline" onClick={() => regenerate()} type="button">
                    Thử lại
                  </button>
                </div>
              )}
            </div>

            {!isAtBottom && (
              <button
                aria-label="Cuộn xuống cuối đoạn chat"
                className="absolute bottom-3 left-1/2 -translate-x-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-new-teal-cta text-white shadow-md hover:shadow-lg transition"
                onClick={scrollToBottom}
                type="button"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>

          <form
            className="flex items-end gap-3 pt-4 px-0.5 pb-0.5"
            onSubmit={handleSubmit}
          >
            <textarea
              className="flex-1 resize-none rounded-2xl border-0 bg-new-input-bg px-4 py-3 text-sm focus:ring-2 focus:ring-new-teal-cta max-h-40"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập câu hỏi của bạn..."
              rows={1}
              value={input}
            />
            {isBusy ? (
              <button
                className="rounded-full bg-new-chip px-5 py-3 text-sm font-bold text-gray-700 hover:bg-gray-200 transition"
                onClick={() => stop()}
                type="button"
              >
                Dừng
              </button>
            ) : (
              <button
                className="rounded-full bg-new-teal-cta px-5 py-3 text-sm font-bold text-white shadow-md hover:shadow-lg transition disabled:opacity-50"
                disabled={!input.trim()}
                type="submit"
              >
                Gửi
              </button>
            )}
          </form>
        </div>

        {/* Nửa trái: giới thiệu & gợi ý */}
        <aside className="hidden lg:flex lg:order-first lg:col-span-7 flex-col h-full min-h-0 rounded-3xl bg-new-about-bg p-8 xl:p-10 overflow-y-auto">
          <div className="flex-1 flex items-center justify-center min-h-0">
            <Image
              alt="Trợ lý du lịch Roamly AI"
              className="w-full h-full max-h-[520px] object-contain drop-shadow-md"
              height={1024}
              priority
              sizes="70vw"
              src={ROBOT_IMAGE}
              width={1536}
            />
          </div>

          <h2 className="text-2xl xl:text-3xl font-extrabold text-new-ink leading-tight mt-6 mb-2">
            Roamly AI đồng hành cùng chuyến đi của bạn
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Gợi ý lịch trình, địa điểm và trải nghiệm phù hợp chỉ trong vài giây.
          </p>

          <p className="text-xs font-bold uppercase tracking-wider text-new-teal mb-3">
            Thử hỏi
          </p>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
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

          <p className="text-xs font-bold uppercase tracking-wider text-new-teal mb-3">
            Mẹo hỏi hiệu quả
          </p>
          <ul className="space-y-2 text-sm text-gray-700">
            {TIPS.map((tip) => (
              <li className="flex gap-2" key={tip}>
                <span className="text-new-coral font-bold">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
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
      className="rounded-2xl bg-new-input-bg lg:bg-white px-4 py-3 text-left text-sm text-gray-700 hover:text-new-teal-cta hover:shadow-sm transition disabled:opacity-50 disabled:pointer-events-none"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}
