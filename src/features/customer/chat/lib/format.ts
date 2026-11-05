export const num = (value: { toString(): string } | null | undefined) =>
  value == null ? null : Number(value.toString());

export const truncate = (text: string | null | undefined, maxLength = 280) => {
  if (!text) return null;
  const cleaned = text.replace(/\s+/g, " ").trim();
  return cleaned.length <= maxLength
    ? cleaned
    : `${cleaned.slice(0, maxLength - 1)}…`;
};
