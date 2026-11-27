import sanitizeHtml from "sanitize-html";

/** Chỉ giữ các thẻ mà trình soạn thảo Tiptap tạo ra; bỏ script, style, sự kiện inline. */
export function sanitizeArticleHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "p", "br", "h2", "h3", "h4", "strong", "b", "em", "i", "u", "s",
      "ul", "ol", "li", "blockquote", "a", "img", "hr", "code", "pre",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        target: "_blank",
        rel: "noopener noreferrer nofollow",
      }),
    },
  }).trim();
}

export function htmlToPlainText(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Ước lượng thời gian đọc: ~200 từ/phút, tối thiểu 1 phút. */
export function computeReadMinutes(html: string): number {
  const words = htmlToPlainText(html).split(" ").filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
