"use client";

import Markdown from "react-markdown";

export function ChatMarkdown({ children }: { children: string }) {
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
