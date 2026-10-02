const REASONS = [
  {
    title: "Đặt chỗ nhanh chóng",
    description:
      "Tìm kiếm và đặt tour, khách sạn, nhà hàng chỉ trong vài bước đơn giản, mọi lúc mọi nơi.",
  },
  {
    title: "Hướng dẫn viên chuyên nghiệp",
    description:
      "Đội ngũ đối tác giàu kinh nghiệm đồng hành để mỗi chuyến đi đều trọn vẹn và an toàn.",
  },
  {
    title: "Cam kết giá tốt nhất",
    description:
      "Giá minh bạch từ nhà cung cấp, không phí ẩn, giúp bạn yên tâm lên kế hoạch.",
  },
];

export function WhyChooseUsSection() {
  return (
    <section
      className="w-full relative z-20 py-12 px-8 lg:px-16 bg-white"
      data-purpose="why-choose-us"
    >
      <div className="max-w-[1440px] mx-auto">
        <div className="relative flex items-center justify-center my-6">
          <div className="w-full border-t border-gray-300/80" />
          <span className="absolute px-6 text-base md:text-lg font-bold text-gray-900 tracking-tight bg-white">
            Vì sao chọn chúng tôi
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mt-10">
          {REASONS.map((reason) => (
            <div
              key={reason.title}
              className="why-card-bg rounded-2xl p-6 sm:p-7 flex items-start gap-4 border-t border-x border-white/80"
            >
              <div className="w-12 h-12 shrink-0 bg-new-teal text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-sm">
                $
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-gray-900 leading-snug">
                  {reason.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {reason.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
