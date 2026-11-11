import { AuthorAvatar } from "./author-avatar";

export function AuthorBox({ name }: { name: string }) {
  return (
    <div className="flex flex-col gap-5 rounded-lg bg-new-banner-bg/60 p-6 sm:flex-row sm:items-center">
      <AuthorAvatar name={name} size="lg" />
      <div>
        <h4 className="text-xl font-bold text-new-title">{name}</h4>
        <p className="mb-2 text-sm text-new-teal">Biên tập viên Roamly</p>
        <p className="text-sm leading-relaxed text-new-paragraph">
          Đội ngũ biên tập Roamly chọn lọc điểm đến, kinh nghiệm và cẩm nang du
          lịch thực tế, giúp bạn lên kế hoạch cho những chuyến đi trọn vẹn.
        </p>
      </div>
    </div>
  );
}
