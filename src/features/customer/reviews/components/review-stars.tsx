export function ReviewStars({ rating }: { rating: number }) {
  return (
    <div aria-label={`${rating}/5 sao`} className="flex text-new-star" role="img">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          aria-hidden
          className={`material-symbols-outlined ${n <= rating ? "" : "text-new-input-border"}`}
          key={n}
          style={{
            fontSize: "16px",
            fontVariationSettings: n <= rating ? "'FILL' 1" : undefined,
          }}
        >
          star
        </span>
      ))}
    </div>
  );
}
