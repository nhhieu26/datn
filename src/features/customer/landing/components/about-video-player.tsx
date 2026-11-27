"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { ParsedVideo } from "@/shared/lib/parse-video-url";

export function AboutVideoPlayer({
  video,
  poster,
}: {
  video: ParsedVideo;
  poster?: string;
}) {
  const [open, setOpen] = useState(false);
  const [ytFallback, setYtFallback] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      {!poster && video.kind === "youtube" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt="Ảnh bìa video giới thiệu"
          className="absolute inset-0 size-full object-cover object-center transition-transform duration-1000 group-hover:scale-105"
          onError={() => setYtFallback(true)}
          src={`https://i.ytimg.com/vi/${video.videoId}/${
            ytFallback ? "hqdefault" : "maxresdefault"
          }.jpg`}
        />
      )}
      {!poster && video.kind === "file" && (
        <video
          aria-hidden
          className="pointer-events-none absolute inset-0 size-full object-cover object-center"
          muted
          playsInline
          preload="metadata"
          src={`${video.embedUrl}#t=0.5`}
        />
      )}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
        <button
          aria-label="Phát video"
          className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center bg-white/45 backdrop-blur-md border-[1.5px] border-white/70 shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
          onClick={() => setOpen(true)}
          type="button"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full border border-white/70 animate-ping [animation-duration:2.6s]"
          />
          <span className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center bg-white/30 border border-white/50">
            <svg
              className="w-8 h-8 ml-1 text-new-teal"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <polygon points="6 3 20 12 6 21 6 3" />
            </svg>
          </span>
        </button>
      </div>

      {open &&
        createPortal(
          <div
            aria-modal="true"
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 p-4"
            onClick={() => setOpen(false)}
            role="dialog"
          >
            <div
              className="relative aspect-video w-full max-w-5xl overflow-hidden rounded-2xl bg-black shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {video.kind === "file" ? (
                <video
                  autoPlay
                  className="size-full"
                  controls
                  playsInline
                  src={video.embedUrl}
                />
              ) : (
                <iframe
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                  className="size-full"
                  src={video.embedUrl}
                  title="Video giới thiệu Roamly"
                />
              )}
            </div>
            <button
              aria-label="Đóng video"
              className="absolute top-4 right-4 flex size-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
              onClick={() => setOpen(false)}
              type="button"
            >
              <svg
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}
