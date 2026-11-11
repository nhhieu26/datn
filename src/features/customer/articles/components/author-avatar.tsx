import { initialsOf } from "../lib/view-model";

const SIZES = {
  sm: "size-6 text-[10px]",
  md: "size-9 text-xs",
  lg: "size-20 text-2xl",
} as const;

/** Avatar chữ cái đầu (hệ thống chưa có ảnh đại diện người dùng). */
export function AuthorAvatar({
  name,
  size = "sm",
  tone = "teal",
}: {
  name: string;
  size?: keyof typeof SIZES;
  tone?: "teal" | "coral";
}) {
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white ${SIZES[size]} ${
        tone === "teal" ? "bg-new-teal" : "bg-new-coral"
      }`}
    >
      {initialsOf(name)}
    </span>
  );
}
