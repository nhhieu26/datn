"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { buildArticlesUrl } from "../lib/search-params";

const btnClass =
  "inline-flex size-9 items-center justify-center rounded-full border border-new-chip text-new-title transition-colors hover:border-new-teal hover:bg-new-teal hover:text-white";

function FacebookIcon() {
  return (
    <svg aria-hidden className="size-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4z" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg aria-hidden className="size-3.5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.205 2.25h3.308l-7.227 8.26 8.502 11.24H16.13l-5.214-6.817L4.95 21.75H1.64l7.73-8.835L1.215 2.25H8.04l4.713 6.231zm-1.161 17.52h1.833L7.045 4.126H5.078z" />
    </svg>
  );
}
function LinkedInIcon() {
  return (
    <svg aria-hidden className="size-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M6.94 5a2 2 0 1 1-4-.002 2 2 0 0 1 4 .002M7 8.48H3V21h4zm6.32 0H9.34V21h3.94v-6.57c0-3.66 4.77-4 4.77 0V21H22v-7.93c0-6.17-7.06-5.94-8.72-2.91z" />
    </svg>
  );
}

const noopSubscribe = () => () => {};

export function ArticleTagsShare({
  tags,
  title,
}: {
  tags: string[];
  title: string;
}) {
  const url = useSyncExternalStore(
    noopSubscribe,
    () => window.location.href.split("#")[0],
    () => "",
  );
  const [copied, setCopied] = useState(false);

  const enc = encodeURIComponent;
  const shares = [
    { label: "Chia sẻ lên Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`, icon: <FacebookIcon /> },
    { label: "Chia sẻ lên X", href: `https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(title)}`, icon: <XIcon /> },
    { label: "Chia sẻ lên LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`, icon: <LinkedInIcon /> },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* trình duyệt chặn clipboard */
    }
  };

  return (
    <div className="flex flex-col gap-5 border-y border-new-chip py-6 md:flex-row md:items-center md:justify-between">
      {tags.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="me-1 text-lg font-bold text-new-title">Thẻ:</h4>
          {tags.map((tag) => (
            <Link
              className="rounded-md bg-new-chip px-3 py-1 text-sm text-new-title transition-colors hover:bg-new-teal hover:text-white"
              href={buildArticlesUrl({ q: tag })}
              key={tag}
            >
              {tag}
            </Link>
          ))}
        </div>
      ) : (
        <span />
      )}
      <div className="flex items-center gap-2">
        <h4 className="me-1 text-lg font-bold text-new-title">Chia sẻ:</h4>
        {shares.map((s) => (
          <a
            aria-label={s.label}
            className={btnClass}
            href={url ? s.href : undefined}
            key={s.label}
            rel="noopener noreferrer"
            target="_blank"
            title={s.label}
          >
            {s.icon}
          </a>
        ))}
        <button
          aria-label="Sao chép liên kết"
          className={btnClass}
          onClick={copy}
          title={copied ? "Đã sao chép" : "Sao chép liên kết"}
          type="button"
        >
          <span aria-hidden className="material-symbols-outlined text-lg">
            {copied ? "check" : "link"}
          </span>
        </button>
      </div>
    </div>
  );
}
