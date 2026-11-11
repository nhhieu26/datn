/** Nội dung HTML đã được sanitize khi lưu (xem sanitizeArticleHtml). */
export function ArticleContent({ html }: { html: string }) {
  return (
    <div
      className="article-content text-new-paragraph"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
