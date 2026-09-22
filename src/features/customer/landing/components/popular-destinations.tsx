import Image from "next/image";
import Link from "next/link";

const DESTINATIONS = [
  {
    name: "Bali",
    country: "Indonesia",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDLoyP75qClcE4dt7P5ibESNuGvgMM3Jgy4ubfWgnMynw4yJFXCUsko_sdSM_vGK21jVgMviX7K_0hbqxxF_VhmbrL_tQ6x2U3XjLGBiTNV_9iBCnyZcRMPu86ZkokJ2JdKOO8KqLg_5xA2If7zLVPfSEfk1EV09PSyg_DCvI2sofIp_hLWpZBmicWnh1ztFD9SohGnKCWsszb4-Qb5BR8yy3VeGPdqqha6fQbHSuo",
  },
  {
    name: "Tokyo",
    country: "Nhật Bản",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBFJjJkYUs371ghKmWQs6X8VORR1R5_H_tcfllq_joZMfh3XL4A2btnVR77LXpdJkZwulLL9d7KFG6e6364j8B9f6p0RUqGyGyGE8ANwSupUoaA8UpHF-2Ad3pQdRA2ybvH2FmiSyRNbtAeOgmGvjGiv64FTk3efoeJraqs8GJVvzlleVtxTHbqTDzqFi-DZTy5mFU-I95FIgFcr1sjZb-v7W5DMmaGMENcwCU37E8",
  },
  {
    name: "Paris",
    country: "Pháp",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDLWFGMlfBINBZooZLyhDoxpGF6H_ovNk2PR4tJE7L-Yb3ASiu1TUeQuxRby4tKOcmky6LSbWjiC7c2UCchtQyhpvbJyy8cuR8giU_ZlbAw0tP6C6KHt0Q5fXD5MYn9SYlFsTlYPS-rw58np7owBZ_TZOufBPHHOHsSG_8RCrgELYssMRWSm83LHAiocvTt-F7Khc2bLiX2b9mImXUBagqpMQnDKmuBKrcZxprKG44",
  },
  {
    name: "Đà Nẵng",
    country: "Việt Nam",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAwio0hZ6qo1POQN69-os_BBCnJdgvZ5ZOUie0fj3FyyvKbysA820d_VQ1x9HFCRoFAIhNjLfmUcHudltSsGZR3GCDYKcfK81q3XJ1-DOffhzjuLCcKfravfthaz3uHWt7vm5YnX9dlML0Rv4Dpc52aFK8-VlqLscPvbYJR8Au72jb4M4ymLJ2kMZlofFsuoFkJQO-_prSYaWTQmjbo5YG7crurLZNY4IQEzUw86_M",
  },
  {
    name: "Santorini",
    country: "Hy Lạp",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDKimRPDj2MRR52u0bmhW8qOs8mUdfOR0HKV1gqre1mfI3xaoBBJ9bmSWHgLB8PMaxgnE8iV_lnUbV_3XROZ2Mws49vHCiWj6PtBSNs50OjuIzYQxVD6CPA1uF8zYQj--WIY-t1EeFWVqA_Bggsw78IYEWVpC1cE1cIE_ER6KTCwOQ66EZ4L0_sFNofIohq3VMNxc_OBlwJMq_ihTb5rXhvtz1I9NbZjTDUJ5VwCSw",
  },
  {
    name: "New York",
    country: "Hoa Kỳ",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuARMfT6Yy0nAf-61JLWGqpU6bvC87VginsHXAeOyATC1nILx3Oo863SbXZo4d9ICJa2-LIkKOVBN0ad2BSW7nhff3Eity58xlr_623R4j3RHdM6YSkvTT9MmikHdGnzKZ6lrJ3_7TS6x7XvTWpewwOk6x2afXdn7vY5w1GkdFHyZ0EHWtE7XDF4Jt0tcjfDiPXpVBArD0PXPpULR6n9HvnJD2zIyhKj52FjxnVHiCU",
  },
];

export function PopularDestinations() {
  return (
    <section className="space-y-6 mb-12" data-purpose="popular-destinations">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
          Điểm Đến Phổ Biến
        </h2>
        <Link
          className="text-xs sm:text-sm font-semibold text-gray-700 hover:text-black flex items-center gap-1.5 transition"
          href="#all-destinations"
        >
          <span className="">Xem tất cả điểm đến</span>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M14 5l7 7m0 0l-7 7m7-7H3"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {DESTINATIONS.map((destination) => (
          <div
            key={destination.name}
            className="group relative rounded-2xl overflow-hidden aspect-[4/5] shadow-sm cursor-pointer"
          >
            <Image
              alt={destination.name}
              className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
              src={destination.src}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-3 inset-x-3 flex items-end justify-between text-white">
              <div>
                <h3 className="font-bold text-sm leading-tight">
                  {destination.name}
                </h3>
                <p className="text-[11px] text-gray-300">
                  {destination.country}
                </p>
              </div>
              <span className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
