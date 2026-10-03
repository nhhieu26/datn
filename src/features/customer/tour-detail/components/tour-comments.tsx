// ponytail: chưa có bảng đánh giá/bình luận trong DB nên dùng dữ liệu mẫu
const COMMENTS = [
  {
    id: "1",
    name: "Nguyễn Minh Anh",
    date: "12/01/2025",
    content:
      "Chuyến đi rất tuyệt vời, hướng dẫn viên nhiệt tình và lịch trình sắp xếp hợp lý. Gia đình mình ai cũng hài lòng, chắc chắn sẽ quay lại.",
  },
  {
    id: "2",
    name: "Trần Quốc Bảo",
    date: "08/01/2025",
    content:
      "Cảnh đẹp, đồ ăn ngon, xe đưa đón đúng giờ. Chỉ tiếc thời gian ở một vài điểm hơi ngắn nhưng nhìn chung rất đáng tiền.",
  },
  {
    id: "3",
    name: "Lê Thu Hà",
    date: "03/01/2025",
    content:
      "Lần đầu đi tour ghép nhưng trải nghiệm vượt mong đợi. Mọi người trong đoàn thân thiện, dịch vụ chu đáo từ đầu đến cuối.",
  },
];

export function TourComments() {
  return (
    <section>
      <h4 className="mb-[30px] text-2xl font-bold text-new-title">
        ({COMMENTS.length}) Bình luận
      </h4>
      {COMMENTS.map((c) => (
        <article
          key={c.id}
          className="mb-5 border-b border-new-checkbox-border pb-[15px]"
        >
          <div className="mb-[15px] flex items-center justify-between gap-3">
            <div className="flex items-center gap-[15px]">
              <span
                aria-hidden
                className="flex size-[50px] shrink-0 items-center justify-center rounded-full bg-new-chip font-bold text-new-teal"
              >
                {c.name.split(" ").at(-1)?.[0]}
              </span>
              <h4 className="text-lg font-semibold text-new-title">{c.name}</h4>
            </div>
            <p className="text-sm text-new-title">{c.date}</p>
          </div>
          <p className="text-sm leading-[1.6] text-new-paragraph">
            {c.content}
          </p>
        </article>
      ))}
    </section>
  );
}
