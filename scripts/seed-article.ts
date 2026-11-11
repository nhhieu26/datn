/**
 * Seed bài viết giới thiệu + vài bình luận mẫu.
 * Chạy sau seed province/tag/user (đã gọi trong scripts/seed.ts), hoặc chạy riêng:
 *
 *   bun scripts/seed-article.ts
 *
 * Upsert theo slug nên chạy lại không tạo trùng; bình luận seed được tạo lại mỗi lần.
 */
import "dotenv/config";
import type { ArticleCategory } from "../src/generated/prisma/client";
import { prisma } from "../src/lib/prisma";
import { computeReadMinutes } from "../src/shared/lib/article-html";

const DAY_MS = 24 * 60 * 60 * 1000;

type SeedArticle = {
  slug: string;
  title: string;
  excerpt: string;
  category: ArticleCategory;
  province: string | null;
  tags: string[];
  content: string;
};

const ARTICLES: SeedArticle[] = [
  {
    slug: "7-trai-nghiem-khong-the-bo-lo-o-da-lat",
    title: "7 trải nghiệm không thể bỏ lỡ khi đến Đà Lạt",
    excerpt:
      "Săn mây đồi chè Cầu Đất, cà phê view rừng thông, chợ đêm và những đồi hoa bốn mùa — gợi ý lịch trình trọn vẹn cho thành phố ngàn hoa.",
    category: "destination",
    province: "Lâm Đồng",
    tags: ["Núi", "Thiên nhiên", "Cặp đôi"],
    content: `<p>Đà Lạt luôn có cách níu chân du khách: khí hậu se lạnh quanh năm, những rừng thông bạt ngàn và nhịp sống chậm rãi. Dù bạn đến lần đầu hay đã quay lại nhiều lần, thành phố này vẫn còn nhiều điều để khám phá.</p>
<h2>1. Săn mây ở đồi chè Cầu Đất</h2>
<p>Khởi hành khoảng 4 giờ sáng để kịp đón bình minh. Biển mây trải dài dưới chân đồi chè xanh mướt là khung cảnh khiến bất cứ ai cũng phải trầm trồ.</p>
<h2>2. Cà phê giữa rừng thông</h2>
<p>Đà Lạt có hàng trăm quán cà phê, nhưng những quán nằm lưng chừng đồi với tầm nhìn ra rừng thông luôn được yêu thích nhất. Hãy chọn buổi chiều để ngắm hoàng hôn.</p>
<h2>3. Dạo chợ đêm và thưởng thức ẩm thực</h2>
<ul><li>Bánh tráng nướng — “pizza Việt Nam” giòn rụm.</li><li>Sữa đậu nành nóng và bánh mì xíu mại.</li><li>Lẩu gà lá é cho buổi tối se lạnh.</li></ul>
<blockquote><p>Đà Lạt không vội vàng. Đến đây là để sống chậm lại và lắng nghe chính mình.</p><p>Một du khách Roamly</p></blockquote>
<h2>4. Những trải nghiệm khác</h2>
<p>Đi cáp treo qua thiền viện Trúc Lâm, chèo thuyền trên hồ Tuyền Lâm, ghé làng hoa Vạn Thành, thăm ga Đà Lạt cổ kính — mỗi nơi mang một màu sắc riêng của cao nguyên Lâm Viên.</p>
<p><strong>Mẹo nhỏ:</strong> mang theo áo khoác mỏng kể cả vào mùa hè và đặt phòng sớm nếu đi vào cuối tuần hoặc dịp lễ.</p>`,
  },
  {
    slug: "kinh-nghiem-du-lich-hoi-an-tu-tuc",
    title: "Kinh nghiệm du lịch Hội An tự túc 3 ngày 2 đêm",
    excerpt:
      "Phố cổ lung linh đèn lồng, rừng dừa Bảy Mẫu và biển An Bàng — lịch trình chi tiết, chi phí và những lưu ý khi tự túc khám phá Hội An.",
    category: "experience",
    province: "Đà Nẵng",
    tags: ["Văn hóa - lịch sử", "Gia đình", "Ẩm thực đường phố"],
    content: `<p>Hội An là điểm đến lý tưởng cho chuyến đi ngắn ngày: nhỏ gọn, dễ di chuyển và có đủ phố cổ, biển, làng quê. Dưới đây là lịch trình 3 ngày 2 đêm đã được nhiều khách Roamly áp dụng.</p>
<h2>Ngày 1: Phố cổ về đêm</h2>
<p>Nhận phòng, nghỉ ngơi rồi dạo phố cổ từ chiều. Khi đèn lồng sáng lên, hãy thả hoa đăng trên sông Hoài và thưởng thức cao lầu, mì Quảng.</p>
<h2>Ngày 2: Rừng dừa và làng gốm</h2>
<ul><li>Sáng: ngồi thúng chai ở rừng dừa Bảy Mẫu.</li><li>Trưa: cơm gà Hội An.</li><li>Chiều: làng gốm Thanh Hà, làng rau Trà Quế.</li></ul>
<h2>Ngày 3: Biển An Bàng</h2>
<p>Tắm biển buổi sáng sớm khi nắng còn dịu, sau đó mua đặc sản và trả phòng.</p>
<blockquote><p>Hội An đẹp nhất vào những đêm rằm, khi cả phố tắt đèn điện và chỉ còn ánh đèn lồng.</p><p>Hướng dẫn viên địa phương</p></blockquote>
<h3>Chi phí tham khảo</h3>
<p>Khoảng 2,5 – 3,5 triệu đồng/người chưa gồm vé máy bay, tùy loại hình lưu trú.</p>`,
  },
  {
    slug: "an-gi-o-ha-noi-mon-ngon-pho-co",
    title: "Ăn gì ở Hà Nội? 10 món ngon phải thử trong phố cổ",
    excerpt:
      "Phở, bún chả, chả cá Lã Vọng, bánh cuốn Thanh Trì… bản đồ ẩm thực phố cổ Hà Nội cho tín đồ ăn uống.",
    category: "food",
    province: "Hà Nội",
    tags: ["Ẩm thực đường phố", "Đặc sản địa phương"],
    content: `<p>Ẩm thực Hà Nội tinh tế, thanh nhã và gắn liền với từng con phố. Chỉ cần một ngày lang thang phố cổ, bạn đã có thể nếm thử phần lớn tinh hoa ẩm thực nơi đây.</p>
<h2>Những món ăn sáng</h2>
<ul><li><strong>Phở bò</strong> — nước dùng trong, ngọt thanh từ xương.</li><li><strong>Bánh cuốn</strong> — mỏng mềm, ăn kèm chả quế.</li><li><strong>Xôi xéo</strong> — dẻo thơm với hành phi.</li></ul>
<h2>Bữa trưa và chiều</h2>
<ul><li><strong>Bún chả</strong> — thịt nướng than hoa thơm lừng.</li><li><strong>Chả cá Lã Vọng</strong> — ăn cùng thì là và mắm tôm.</li><li><strong>Bún đậu mắm tôm</strong> — món “quốc dân” của giới trẻ.</li></ul>
<h2>Ăn vặt và đồ uống</h2>
<p>Cà phê trứng, kem Tràng Tiền, nem chua rán và chè bốn mùa là những lựa chọn hoàn hảo cho buổi tối dạo phố.</p>
<blockquote><p>Muốn hiểu Hà Nội, hãy bắt đầu từ một bát phở buổi sớm.</p><p>Nhà văn Thạch Lam (ý)</p></blockquote>`,
  },
  {
    slug: "cam-nang-phu-quoc-mua-nao-dep-nhat",
    title: "Cẩm nang Phú Quốc: đi mùa nào đẹp nhất?",
    excerpt:
      "Thời điểm lý tưởng, cách di chuyển, nơi lưu trú và những bãi biển đẹp nhất đảo ngọc Phú Quốc.",
    category: "guide",
    province: "An Giang",
    tags: ["Biển", "Nghỉ dưỡng", "Resort"],
    content: `<p>Phú Quốc sở hữu những bãi biển cát trắng, nước trong xanh cùng hệ thống khu nghỉ dưỡng hiện đại. Chọn đúng thời điểm sẽ giúp chuyến đi trọn vẹn hơn.</p>
<h2>Thời điểm đẹp nhất</h2>
<p>Từ tháng 11 đến tháng 4 năm sau là mùa khô: biển êm, trời trong, rất thích hợp tắm biển và lặn ngắm san hô ở quần đảo An Thới.</p>
<h2>Di chuyển trên đảo</h2>
<ul><li>Thuê xe máy để chủ động khám phá.</li><li>Taxi, xe công nghệ cho gia đình có trẻ nhỏ.</li><li>Cáp treo Hòn Thơm — một trong những tuyến cáp treo vượt biển dài nhất thế giới.</li></ul>
<h2>Bãi biển nên ghé</h2>
<p>Bãi Sao, Bãi Khem, Bãi Dài và Ông Lang là những cái tên được yêu thích. Đừng quên ngắm hoàng hôn ở Dinh Cậu.</p>
<blockquote><p>Biển Phú Quốc trong đến mức bạn có thể nhìn thấy cát dưới chân ở độ sâu vài mét.</p><p>Roamly</p></blockquote>`,
  },
  {
    slug: "sa-pa-mua-lua-chin",
    title: "Sa Pa mùa lúa chín: thiên đường ruộng bậc thang",
    excerpt:
      "Tháng 9 – 10, ruộng bậc thang Mường Hoa nhuộm vàng óng. Gợi ý cung đường trekking và bản làng nên ghé.",
    category: "destination",
    province: "Lào Cai",
    tags: ["Núi", "Phượt", "Phiêu lưu mạo hiểm"],
    content: `<p>Mỗi năm, vào cuối thu, những thửa ruộng bậc thang ở Sa Pa chuyển sang sắc vàng rực rỡ, thu hút đông đảo du khách và nhiếp ảnh gia.</p>
<h2>Cung trekking gợi ý</h2>
<ol><li>Sa Pa – Lao Chải – Tả Van (khoảng 12 km, dễ đi).</li><li>Tả Van – Bản Hồ (cho người có thể lực tốt).</li><li>Y Tý – nơi săn mây đẹp bậc nhất Tây Bắc.</li></ol>
<h2>Lưu ý khi trekking</h2>
<ul><li>Mang giày bám tốt, áo mưa mỏng.</li><li>Thuê hướng dẫn viên người địa phương.</li><li>Tôn trọng phong tục của đồng bào H’Mông, Dao.</li></ul>
<blockquote><p>Đứng giữa thung lũng Mường Hoa mùa lúa chín, bạn sẽ hiểu vì sao người ta gọi đây là những bậc thang lên thiên đường.</p><p>Một nhiếp ảnh gia</p></blockquote>`,
  },
  {
    slug: "meo-san-ve-may-bay-gia-re",
    title: "8 mẹo săn vé máy bay giá rẻ cho chuyến du lịch",
    excerpt:
      "Đặt vé vào thời điểm nào, theo dõi khuyến mãi ra sao và những sai lầm khiến bạn mua vé đắt hơn.",
    category: "experience",
    province: null,
    tags: ["Giá rẻ", "Một mình", "Bạn bè"],
    content: `<p>Vé máy bay thường chiếm phần lớn chi phí chuyến đi. Áp dụng vài mẹo nhỏ dưới đây, bạn có thể tiết kiệm đáng kể.</p>
<h2>Thời điểm đặt vé</h2>
<p>Với chặng nội địa, đặt trước 3 – 6 tuần thường có giá tốt. Dịp Tết và lễ lớn nên đặt trước 2 – 3 tháng.</p>
<h2>Những mẹo hữu ích</h2>
<ol><li>Linh hoạt ngày bay, ưu tiên giữa tuần.</li><li>Bật thông báo giá trên các ứng dụng so sánh.</li><li>Theo dõi các đợt khuyến mãi định kỳ của hãng.</li><li>Chọn chuyến bay sớm hoặc muộn trong ngày.</li><li>Cân nhắc hành lý ký gửi trước khi chốt giá.</li></ol>
<blockquote><p>Vé rẻ nhất không phải lúc nào cũng tốt nhất — hãy tính cả hành lý, giờ bay và chi phí di chuyển ra sân bay.</p><p>Roamly</p></blockquote>`,
  },
  {
    slug: "hue-co-kinh-mot-ngay-kham-pha",
    title: "Huế cổ kính: lịch trình một ngày khám phá cố đô",
    excerpt:
      "Đại Nội, lăng Khải Định, chùa Thiên Mụ và thuyền rồng trên sông Hương — trọn vẹn cố đô trong một ngày.",
    category: "guide",
    province: "Huế",
    tags: ["Văn hóa - lịch sử", "Gia đình"],
    content: `<p>Huế mang vẻ đẹp trầm mặc với hệ thống di tích được UNESCO công nhận. Một ngày là đủ để bạn cảm nhận những nét tinh túy nhất.</p>
<h2>Buổi sáng</h2>
<p>Tham quan Đại Nội khi trời còn mát, sau đó ghé lăng Khải Định với lối kiến trúc giao thoa Đông – Tây độc đáo.</p>
<h2>Buổi chiều</h2>
<ul><li>Chùa Thiên Mụ bên bờ sông Hương.</li><li>Đi thuyền rồng nghe ca Huế.</li><li>Thưởng thức bún bò, bánh bèo, chè Huế.</li></ul>
<blockquote><p>Sông Hương chảy chậm như chính nhịp sống của người Huế.</p><p>Ký sự du lịch</p></blockquote>`,
  },
  {
    slug: "roamly-ra-mat-tro-ly-lap-lich-trinh-ai",
    title: "Roamly ra mắt trợ lý lập lịch trình bằng AI",
    excerpt:
      "Chỉ cần nhập điểm đến, số ngày và ngân sách, Roamly AI sẽ gợi ý lịch trình theo ngày cùng lộ trình di chuyển tối ưu.",
    category: "news",
    province: null,
    tags: ["Gia đình", "Bạn bè"],
    content: `<p>Roamly chính thức giới thiệu tính năng <strong>Lập lịch trình AI</strong>, giúp bạn lên kế hoạch chuyến đi chỉ trong vài phút.</p>
<h2>Tính năng nổi bật</h2>
<ul><li>Gợi ý lịch trình theo ngày dựa trên sở thích và ngân sách.</li><li>Tính quãng đường, thời gian di chuyển thực tế giữa các điểm.</li><li>Tối ưu thứ tự tham quan trong ngày.</li><li>Trò chuyện để chỉnh sửa lịch trình theo ý muốn.</li></ul>
<h2>Cách sử dụng</h2>
<p>Truy cập mục <a href="/trip-planner">Lộ trình</a>, mô tả chuyến đi mong muốn và để AI làm phần còn lại.</p>
<blockquote><p>Chúng tôi muốn mọi người đều có thể lên kế hoạch du lịch dễ dàng như trò chuyện với một người bạn am hiểu.</p><p>Đội ngũ Roamly</p></blockquote>`,
  },
];

const COMMENTS = [
  "Bài viết rất hữu ích, mình sẽ áp dụng cho chuyến đi sắp tới!",
  "Cảm ơn Roamly, thông tin chi tiết và dễ hiểu.",
  "Mình đã đi theo gợi ý này và thật sự rất tuyệt.",
  "Ảnh đẹp quá, muốn xách balo lên đi ngay.",
  "Có thể viết thêm về chi phí cụ thể không ạ?",
];

export async function seedArticles() {
  const admin = await prisma.user.findFirst({ where: { role: "admin" } });
  if (!admin) {
    console.log("⚠ Chưa có tài khoản admin, bỏ qua seed bài viết.");
    return;
  }
  const [customers, provinces, tags] = await Promise.all([
    prisma.user.findMany({ where: { role: "customer" }, take: 5 }),
    prisma.province.findMany({ select: { id: true, name: true } }),
    prisma.tag.findMany({ select: { id: true, name: true } }),
  ]);
  const provinceId = new Map(provinces.map((p) => [p.name, p.id]));
  const tagId = new Map(tags.map((t) => [t.name, t.id]));

  for (const [index, a] of ARTICLES.entries()) {
    const coverUrl = `https://picsum.photos/seed/${a.slug}/1200/800`;
    const data = {
      title: a.title,
      excerpt: a.excerpt,
      content: a.content,
      category: a.category,
      status: "published" as const,
      provinceId: a.province ? (provinceId.get(a.province) ?? null) : null,
      coverImage: { url: coverUrl, fileId: coverUrl },
      readMinutes: computeReadMinutes(a.content),
      publishedAt: new Date(Date.now() - (index * 3 + 1) * DAY_MS),
      authorId: admin.id,
    };
    const tagIds = a.tags.flatMap((name) => tagId.get(name) ?? []);

    const article = await prisma.article.upsert({
      where: { slug: a.slug },
      create: { ...data, slug: a.slug },
      update: data,
    });
    await prisma.articleTag.deleteMany({ where: { articleId: article.id } });
    await prisma.articleTag.createMany({
      data: tagIds.map((id) => ({ articleId: article.id, tagId: id })),
    });

    await prisma.articleComment.deleteMany({ where: { articleId: article.id } });
    const commentCount = customers.length ? (index % 3) + 1 : 0;
    await prisma.articleComment.createMany({
      data: Array.from({ length: commentCount }, (_, i) => ({
        articleId: article.id,
        userId: customers[(index + i) % customers.length].id,
        content: COMMENTS[(index + i) % COMMENTS.length],
        createdAt: new Date(data.publishedAt.getTime() + (i + 1) * 6 * 60 * 60 * 1000),
      })),
    });
  }

  console.log(`✓ ${ARTICLES.length} bài viết`);
}

if (process.argv[1]?.endsWith("seed-article.ts")) {
  seedArticles()
    .catch((err) => {
      console.error(err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
