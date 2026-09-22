# Tóm tắt tính năng Đăng ký & Đăng nhập

## 1. Stack & công nghệ

| Thành phần | Công nghệ |
|---|---|
| Framework | Next.js 16.3.5 (App Router) |
| Xác thực | NextAuth / Auth.js `^5.0.0-beta.32` |
| ORM | Prisma 7.10.0 + `@prisma/adapter-pg` (PostgreSQL) |
| Hash mật khẩu | `bcryptjs` (cost 10) |
| Validate | Zod 4 |
| UI | React 19, Tailwind 4 |

## 2. Kiến trúc thư mục

- `src/lib/auth.ts` — cấu hình NextAuth (Credentials provider, callbacks).
- `src/app/api/auth/[...nextauth]/route.ts` — export `GET`/`POST` handlers.
- `src/features/auth/` — UI + server action:
  - `components/login-form.tsx`, `components/register-form.tsx`
  - `actions.ts` — server action `registerAction`
  - `schema.ts` — `registerFormSchema` (mở rộng từ `createUserSchema`)
- `src/entities/user/` — schema, type, repo (`findByEmail`, `createUser`).
- `src/app/(auth)/sign-in/page.tsx`, `src/app/(auth)/sign-up/page.tsx`.
- `src/lib/next-auth.d.ts` — khai báo mở rộng type cho `User`, `Session`, `JWT`.

## 3. Đăng nhập (Sign-in)

- Provider duy nhất: **Credentials** (`email` + `password` + `role`).
- Session dùng chiến lược **JWT** (`session: { strategy: "jwt" }`).
- Trang đăng nhập tùy chỉnh: `pages.signIn = "/sign-in"`.
- Luồng `authorize` (`src/lib/auth.ts:19`):
  1. Validate input bằng `loginSchema`.
  2. Tìm user theo email.
  3. Chặn nếu `status !== "active"`.
  4. **Bắt buộc `user.role === role`** gửi từ client.
  5. So sánh mật khẩu bằng `bcrypt.compare`.
  6. Trả về `id, email, name, role, status, onboardingCompleted`.
- JWT callback lưu `id/role/status/onboardingCompleted`; session callback đưa các field này vào `session.user`.
- UI: 2 tab **Khách hàng / Nhà cung cấp**, giá trị tab chính là `role` gửi kèm khi gọi `signIn`. Có nút hiện/ẩn mật khẩu.
- Đăng nhập thành công chuyển hướng về `/`.

## 4. Đăng ký (Sign-up)

- Dùng **server action** `registerAction` (`src/features/auth/actions.ts:13`) + `useActionState`.
- Validate bằng `registerFormSchema`:
  - `email` — trim, lowercase, đúng định dạng email.
  - `phone` — regex `^(\+84|0)\d{9,10}$`.
  - `password` — tối thiểu 8 ký tự.
  - `fullname` — không rỗng.
  - `role` — enum `customer | provider`.
  - `confirm_password` — phải khớp `password` (refine).
- Kiểm tra trùng email (`findByEmail`) → lỗi "Email này đã được sử dụng."
- Hash mật khẩu `bcrypt.hash(password, 10)` rồi `createUser`.
- Sau khi action trả `success`, form **tự động gọi `signIn`** với credentials đã lưu trong `useRef` và điều hướng về `/`. Nếu auto sign-in lỗi → chuyển về `/sign-in`.
- UI: 2 tab Khách hàng / Nhà cung cấp (`role` gửi qua hidden input), checkbox đồng ý điều khoản (bắt buộc).

## 5. Mô hình dữ liệu (`prisma/schema.prisma`)

- `User`: `id (cuid)`, `email @unique`, `phone @unique`, `password` (đã hash), `fullname`, `status` (enum `UserStatus`), `onboardingCompleted` (default `false`), `preferences` (JSON), `role` (enum `Role`).
- Enum `Role`: `customer | provider`.
- Enum `UserStatus`: `active | inactive | banned`.
- Quan hệ: `User 1-n ProviderProfile` (hồ sơ nhà cung cấp, gồm `businessType`, `approvalStatus`, `licenseUrl`...).
- `preferences` và `photos` kiểu JSON — linh hoạt nhưng không ràng buộc schema.

## 6. Điểm đáng chú ý / rủi ro

### Bảo mật
- **Không có middleware / bảo vệ route**: chưa có `src/middleware.ts`; mọi trang đều truy cập được, session chỉ được đọc ở nơi cần.
- **Không có rate limiting / chống brute-force** cho đăng nhập.
- **Không có xác thực email/số điện thoại**, không có luồng quên/đặt lại mật khẩu (link "Quên mật khẩu?" đang là `#`).
- **Không kiểm tra trùng `phone`** trước khi tạo user; DB có unique constraint nên có thể ném lỗi Prisma chưa được bắt (email thì đã check).
- Mật khẩu chỉ yêu cầu tối thiểu 8 ký tự, không có ràng buộc độ mạnh/tối đa.
- NextAuth mặc định có CSRF cho luồng auth; chưa thấy cấu hình bổ sung.

### Chức năng / logic
- Checkbox **"Ghi nhớ đăng nhập"** ở form đăng nhập chưa có xử lý (không gắn state/handler).
- **Role do client quyết định**: đăng nhập yêu cầu `role` khớp; đăng ký auto sign-in dùng biến state `accountType` phía client thay vì `role` đã parse từ server — có nguy cơ lệch nếu state thay đổi giữa chừng.
- `onboardingCompleted` đã có trong schema/session nhưng **chưa có luồng onboarding** sử dụng.
- Link "Điều khoản dịch vụ" / "Chính sách bảo mật" đang là `#`.
- Type `role`/`status` trong `next-auth.d.ts` khai báo `string` thay vì enum `Role`/`UserStatus` → giảm type-safety.

### Cấu trúc
- Tách lớp rõ ràng: `entities` (schema/type/repo) ↔ `features` (UI/action), hạn chế truy cập Prisma trực tiếp từ UI.
- `toPublicUser` loại bỏ `password` trước khi trả ra ngoài — tốt cho việc lộ dữ liệu.
- Validate Zod dùng chung giữa client form và server action.

## 7. Tóm tắt luồng

```
Đăng ký:  Form → registerAction (Zod + check email + bcrypt.hash + createUser)
          → success → tự động signIn → "/" (hoặc "/sign-in" nếu lỗi)

Đăng nhập: Form (email/password/role) → signIn("credentials")
           → authorize (Zod + status active + role khớp + bcrypt.compare)
           → JWT chứa id/role/status/onboardingCompleted → session → "/"
```
