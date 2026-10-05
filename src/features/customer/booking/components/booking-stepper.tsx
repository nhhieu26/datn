export function BookingStepper({
  steps,
  current,
}: {
  steps: string[];
  current: number;
}) {
  const lastIndex = steps.length - 1;
  return (
    <ol className="mx-auto mt-8 flex max-w-2xl">
      {steps.map((label, i) => {
        const done = i < current || current === lastIndex;
        const active = i === current;
        return (
          <li
            key={label}
            aria-current={active ? "step" : undefined}
            className="flex flex-1 flex-col items-center gap-3 text-center"
          >
            <span
              className={`text-sm ${active ? "font-bold text-new-title" : "text-new-paragraph"}`}
            >
              {label}
            </span>
            <span className="relative flex w-full justify-center">
              {i < lastIndex && (
                <span
                  aria-hidden
                  className={`absolute top-1/2 left-1/2 h-0.5 w-full -translate-y-1/2 ${i < current ? "bg-new-teal" : "bg-new-track"}`}
                />
              )}
              <span
                className={`relative z-10 flex size-8 items-center justify-center rounded-full border-2 text-sm font-bold ${
                  done
                    ? "border-new-teal bg-new-teal text-white"
                    : active
                      ? "border-new-teal bg-white text-new-teal"
                      : "border-new-track bg-white text-new-paragraph"
                }`}
              >
                {done ? (
                  <span aria-hidden className="material-symbols-outlined text-lg">
                    check
                  </span>
                ) : (
                  i + 1
                )}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
