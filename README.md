# Roamly — Nền tảng đặt dịch vụ du lịch tích hợp AI

> Đồ án tốt nghiệp (DATN). Roamly là sàn thương mại điện tử du lịch kết nối **khách hàng** với **nhà cung cấp dịch vụ** (tour, khách sạn, nhà hàng), có trợ lý AI tư vấn và lập lịch trình chuyến đi.

**Bản triển khai:** https://datn-eta-one.vercel.app

## Tính năng

### Khách hàng
- Trang chủ, khám phá (`/explore`) và tìm kiếm tour, khách sạn, nhà hàng, điểm đến theo tỉnh/thành, thẻ (tag), giá — kết hợp tìm kiếm ngữ nghĩa (Pinecone) và lọc trên CSDL.
- Trang chi tiết dịch vụ có bản đồ (Leaflet), thư viện ảnh, đánh giá.
- Đặt chỗ: tour (theo lịch khởi hành, số khách), phòng khách sạn (theo ngày), bàn nhà hàng (theo khung giờ, chờ nhà hàng xác nhận).
- Thanh toán qua **PayPal** (giữ chỗ có thời hạn, quy đổi VND → USD), hủy và hoàn tiền.
- Quản lý đơn, xem/in hóa đơn, viết đánh giá sau khi sử dụng dịch vụ, bảng điều khiển tài khoản.
- **Roamly AI** (`/chat`): chatbot tư vấn, tìm tour và địa điểm (dữ liệu nội bộ + Google Places + tìm kiếm web).
- **Lập lịch trình AI** (`/trip-planner`): AI sinh lịch trình theo ngày, tính lộ trình và quãng đường thực tế bằng Google Routes.

### Nhà cung cấp (`/provider`)
- Tạo hồ sơ doanh nghiệp (chờ quản trị viên duyệt), liên kết tài khoản PayPal nhận tiền, chữ ký trên hóa đơn.
- Quản lý tour (lịch khởi hành), khách sạn (phòng), nhà hàng (khung giờ, sức chứa); tạm dừng/xóa mềm dịch vụ.
- Quản lý đơn đặt, lịch (calendar), đánh giá, xuất Excel, báo cáo doanh thu.

### Quản trị viên (`/admin`)
- Dashboard tổng quan, duyệt hồ sơ nhà cung cấp, quản lý người dùng và điểm đến.
- Báo cáo & thống kê (xuất Excel), cấu hình hệ thống (hoa hồng sàn, nội dung trang giới thiệu…).

### Mô hình thanh toán
Khách thanh toán → tiền về tài khoản sàn → sau khi dịch vụ hoàn tất, sàn **payout** cho nhà cung cấp (trừ hoa hồng `PLATFORM_COMMISSION_RATE`). Khách hủy → sàn hoàn tiền. Nhà hàng chỉ đặt bàn, không thanh toán trước. Lý do chọn PayPal: xem [`docs/cong-thanh-toan.md`](docs/cong-thanh-toan.md).

## Công nghệ

| Thành phần | Công nghệ |
|---|---|
| Framework | Next.js 16 (App Router, Server Actions), React 19, TypeScript |
| Giao diện | Tailwind CSS 4, shadcn/ui, Base UI, Preline, ApexCharts, Swiper, Leaflet |
| CSDL | PostgreSQL + Prisma 7 (`@prisma/adapter-pg`) |
| Xác thực | Auth.js (NextAuth v5) — Credentials, JWT, phân quyền customer / provider / admin |
| AI | Vercel AI SDK, Gemini trên Vertex AI, embedding `gemini-embedding-001` |
| Tìm kiếm ngữ nghĩa | Pinecone |
| Bản đồ & địa điểm | Google Places API (New), Routes API |
| Thanh toán | PayPal (Orders, Payouts, Webhooks) |
| Lưu trữ ảnh | ImageKit |
| Giám sát AI | Langfuse (OpenTelemetry) |
| Triển khai | Vercel (Cron Jobs) |

## Cấu trúc thư mục

```
src/
├── app/                 # Routes (App Router)
│   ├── (customer)/      # Trang khách hàng: trang chủ, khám phá, chi tiết, đặt chỗ, chat, trip-planner
│   ├── (account)/       # Tài khoản khách hàng: dashboard, đơn đặt, hồ sơ
│   ├── (auth)/          # Đăng ký / đăng nhập
│   ├── (provider)/      # Khu vực nhà cung cấp
│   ├── (admin)/         # Khu vực quản trị
│   └── api/             # Route handlers: auth, chat, trip, PayPal, cron, export
├── entities/            # Tầng dữ liệu theo thực thể: schema (Zod), type, repo (Prisma)
├── features/            # Tính năng theo vai trò: components, actions, lib
├── shared/              # Component và tiện ích dùng chung
├── components/ui/       # shadcn/ui
└── lib/                 # Client dịch vụ ngoài: auth, prisma, paypal, pinecone, vertex, google-maps…
prisma/                  # schema.prisma + migrations
scripts/                 # Seed / dọn dữ liệu
docs/                    # Tài liệu khảo sát và mô tả tính năng
```

## Cài đặt và chạy

Yêu cầu: [Bun](https://bun.sh) ≥ 1.3, PostgreSQL, cùng tài khoản các dịch vụ trong `.env.example`.

```bash
bun install
cp .env.example .env          # điền các biến môi trường
bunx prisma migrate deploy    # tạo bảng
bun run db:seed               # dữ liệu mẫu + tài khoản admin (ADMIN_EMAIL / ADMIN_PASSWORD)
bun run dev                   # http://localhost:2612
```

Chatbot dùng Vertex AI qua ADC: chạy `gcloud auth application-default login` trên máy dev.

### Scripts

| Lệnh | Mô tả |
|---|---|
| `bun run dev` | Chạy dev server (cổng 2612) |
| `bun run build` / `bun run start` | Build và chạy production |
| `bun run lint` | ESLint |
| `bun run db:seed` | Seed dữ liệu mẫu (tỉnh, tag, người dùng, dịch vụ, đơn, đánh giá) |
| `bun run db:clear` | Xóa dữ liệu CSDL |
| `bun run db:happen <mã đơn>` | Dời ngày đơn về quá khứ để demo luồng hoàn thành / đánh giá (`--complete` để hoàn thành luôn) |
| `bun run cloud:clear` | Dọn dữ liệu trên Pinecone / ImageKit |

### Biến môi trường chính

Xem đầy đủ trong [`.env.example`](.env.example): `DATABASE_URL`, `AUTH_SECRET`, `GOOGLE_GENERATIVE_AI_API_KEY`, `GOOGLE_VERTEX_PROJECT`, `PINECONE_*`, `IMAGEKIT_*`, `PAYPAL_*`, `GOOGLE_MAPS_API_KEY`, `CRON_SECRET`, `LANGFUSE_*` (tùy chọn).

## Triển khai

Dự án triển khai trên Vercel. `vercel.json` cấu hình Cron Jobs hằng ngày để xóa vĩnh viễn tour/khách sạn/nhà hàng đã dừng quá 30 ngày. Trên Vercel, Vertex AI xác thực bằng Workload Identity Federation (`GCP_WORKLOAD_IDENTITY_PROVIDER`, `GCP_SERVICE_ACCOUNT_EMAIL`).

## Tài liệu

- [`docs/cong-thanh-toan.md`](docs/cong-thanh-toan.md) — khảo sát và lựa chọn cổng thanh toán.
- [`docs/tinh-nang-dang-ky-dang-nhap.md`](docs/tinh-nang-dang-ky-dang-nhap.md) — mô tả tính năng đăng ký / đăng nhập.
