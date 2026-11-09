"use client";

import { CheckCircle2Icon, GlobeIcon, LoaderIcon, MapPinIcon, TriangleAlertIcon } from "lucide-react";
import Markdown from "react-markdown";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Message, MessageContent } from "@/components/ui/message";
import { MARKDOWN_COMPONENTS } from "@/features/customer/chat/components/chat-message";
import type { TripChatMessage } from "@/features/trip-planner/lib/tools";

type Part = TripChatMessage["parts"][number];

const KIND_LABEL = { hotel: "khách sạn", restaurant: "nhà hàng", destination: "điểm tham quan" } as const;

function Status({ icon, children }: { icon: "loading" | "done" | "warn" | "web"; children: React.ReactNode }) {
  const Icon = { loading: LoaderIcon, done: CheckCircle2Icon, warn: TriangleAlertIcon, web: GlobeIcon }[icon];
  return (
    <p className="my-1.5 flex items-start gap-1.5 text-xs font-medium text-new-title first:mt-0">
      <Icon className={`mt-0.5 size-3.5 shrink-0 text-new-teal-cta ${icon === "loading" ? "animate-spin" : ""}`} />
      <span>{children}</span>
    </p>
  );
}

/** Dòng trạng thái ngắn cho mỗi lần gọi tool (đang tìm, đã tìm N nơi, đã cập nhật lộ trình...). */
function ToolStatus({ part }: { part: Part }) {
  if (part.type === "tool-searchPlaces" || part.type === "tool-searchWeb") {
    const kind = part.input?.kind ? KIND_LABEL[part.input.kind] : "địa điểm";
    const where = part.input?.location ?? "";
    const web = part.type === "tool-searchWeb";
    if (part.state !== "output-available") {
      return <Status icon="loading">{web ? `Đang tìm trên web ${kind} ở ${where}...` : `Đang tìm ${kind} ở ${where}...`}</Status>;
    }
    const out = part.output;
    if (out.status !== "ok") return null;
    return (
      <>
        <Status icon={web ? "web" : "done"}>
          Tìm thấy {out.places.length} {kind} ở {out.area}
          {web ? " (từ web)" : ""}
        </Status>
        {"sources" in out && out.sources.length > 0 && (
          <p className="mb-1.5 ml-5 flex flex-wrap gap-x-2 text-[11px]">
            {out.sources.map((s) => (
              <a className="text-new-teal-cta hover:underline" href={s.url} key={s.url} rel="noreferrer" target="_blank">
                {s.title}
              </a>
            ))}
          </p>
        )}
      </>
    );
  }

  if (part.type === "tool-setItinerary") {
    if (part.state !== "output-available") return <Status icon="loading">Đang sắp xếp lộ trình và tính quãng đường...</Status>;
    const out = part.output;
    if (out.status === "ok") {
      return (
        <Status icon="done">
          Đã cập nhật lộ trình <MapPinIcon className="inline size-3 text-new-teal-cta" /> {out.itinerary.title}
        </Status>
      );
    }
    if (out.status === "invalid") return <Status icon="warn">Lộ trình chưa hợp lý, đang điều chỉnh...</Status>;
    return null;
  }

  if (part.type === "tool-askUser" && part.state === "output-available") {
    return (
      <div className="my-3 rounded bg-white px-3 py-2 first:mt-0">
        <p className="text-sm font-bold text-new-title">{part.input.question}</p>
        <p className="mt-0.5 text-xs">Bạn đã chọn: {String(part.output)}</p>
      </div>
    );
  }

  return null;
}

export function TripMessage({ message }: { message: TripChatMessage }) {
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
              if (part.type === "text") {
                if (!part.text) return null;
                return isUser ? (
                  <span key={i}>{part.text}</span>
                ) : (
                  <Markdown components={MARKDOWN_COMPONENTS} key={i}>
                    {part.text}
                  </Markdown>
                );
              }
              return <ToolStatus key={i} part={part} />;
            })}
          </BubbleContent>
        </Bubble>
      </MessageContent>
    </Message>
  );
}
