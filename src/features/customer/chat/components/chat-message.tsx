"use client";

import { ExternalLinkIcon, MapPinIcon } from "lucide-react";
import Image from "next/image";
import Markdown from "react-markdown";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Message, MessageContent } from "@/components/ui/message";
import type { Card } from "@/features/customer/chat/lib/cards";
import type { ChatMessage as ChatMessageType } from "@/features/customer/chat/lib/tools";

const heading = (props: object) => <p className="my-2 font-semibold text-new-title" {...props} />;

export const MARKDOWN_COMPONENTS = {
  p: (props: object) => <p className="my-2 first:mt-0 last:mb-0" {...props} />,
  ul: (props: object) => <ul className="my-2 list-disc space-y-1 pl-5" {...props} />,
  ol: (props: object) => <ol className="my-2 list-decimal space-y-1 pl-5" {...props} />,
  strong: (props: object) => <strong className="font-semibold text-new-title" {...props} />,
  a: (props: object) => (
    <a className="font-medium text-new-teal-cta hover:underline" rel="noreferrer" target="_blank" {...props} />
  ),
  h1: heading,
  h2: heading,
  h3: heading,
};

export function ChatMessage({
  message,
  cards,
  activeUrl,
  pinByUrl,
  onHover,
}: {
  message: ChatMessageType;
  cards: Card[];
  activeUrl: string | null;
  pinByUrl: Map<string, number>;
  onHover: (url: string) => void;
}) {
  const isUser = message.role === "user";

  return (
    <Message align={isUser ? "end" : "start"}>
      <MessageContent className="max-w-full">
        <Bubble align={isUser ? "end" : "start"} variant={isUser ? "default" : "muted"}>
          <BubbleContent
            className={`rounded px-4 py-3 text-sm leading-[1.6] ${
              isUser ? "bg-new-teal-cta text-white" : "bg-new-section-bg text-new-paragraph"
            }`}
          >
            {message.parts.map((part, i) => {
              if (part.type === "text" && part.text) {
                return isUser ? (
                  <span key={i}>{part.text}</span>
                ) : (
                  <Markdown components={MARKDOWN_COMPONENTS} key={i}>
                    {part.text}
                  </Markdown>
                );
              }
              if (part.type === "tool-askUser" && part.state === "output-available") {
                return (
                  <div className="my-3 rounded bg-white px-3 py-2 first:mt-0" key={i}>
                    <p className="text-sm font-bold text-new-title">{part.input.question}</p>
                    <p className="mt-0.5 text-xs">Bạn đã chọn: {String(part.output)}</p>
                  </div>
                );
              }
              return null;
            })}

            {cards.length > 0 && (
              <div className="mt-3 flex flex-col gap-2 border-t border-new-chip pt-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-new-title">
                  Gợi ý cho bạn ({cards.length})
                </p>
                {cards.map((card) => (
                  <CardLink
                    active={card.url === activeUrl}
                    card={card}
                    key={card.url}
                    onHover={() => onHover(card.url)}
                    pin={pinByUrl.get(card.url)}
                  />
                ))}
              </div>
            )}
          </BubbleContent>
        </Bubble>
      </MessageContent>
    </Message>
  );
}

function CardLink({
  card,
  pin,
  active,
  onHover,
}: {
  card: Card;
  pin?: number;
  active: boolean;
  onHover: () => void;
}) {
  return (
    <a
      className={`group flex items-center gap-3 rounded border bg-white p-2.5 transition-all hover:border-new-teal-cta ${
        active ? "border-new-teal-cta ring-1 ring-new-teal-cta/30" : "border-new-chip"
      }`}
      href={card.url}
      onFocus={onHover}
      onMouseEnter={onHover}
      rel="noreferrer"
      target="_blank"
    >
      <div className="relative size-16 shrink-0 overflow-hidden rounded">
        <Image alt={card.title} className="object-cover" fill sizes="64px" src={card.image} />
        {pin != null && (
          <span className="absolute top-1 left-1 inline-flex size-5 items-center justify-center rounded-full bg-new-teal-cta text-[10px] font-bold text-white">
            {pin}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-[11px] font-medium">
          <span className="truncate">
            {card.kind} • {card.subtitle}
          </span>
          {pin != null && <MapPinIcon className="ml-auto size-3.5 shrink-0 text-new-teal-cta" />}
        </div>
        <p className="mt-0.5 truncate text-sm font-semibold text-new-title group-hover:text-new-teal-cta">
          {card.title}
        </p>
        {card.highlight && <p className="truncate text-xs">{card.highlight}</p>}
        <div className="mt-1 flex items-center justify-between gap-2 text-xs">
          <span className="font-bold text-new-teal-cta">{card.label}</span>
          <span className="flex items-center gap-2 font-medium text-new-title">
            {card.rating != null && card.reviewCount ? `★ ${card.rating.toFixed(1)} (${card.reviewCount})` : null}
            <ExternalLinkIcon className="size-3.5 text-new-placeholder group-hover:text-new-teal-cta" />
          </span>
        </div>
      </div>
    </a>
  );
}
