# Sơ đồ Use Case

## Tác nhân

| Tác nhân | Mô tả |
|---|---|
| **Khách vãng lai** | Người chưa đăng nhập: xem, tìm kiếm, chat với AI, lập lịch trình. |
| **Khách hàng** (`customer`) | Kế thừa khách vãng lai; đặt chỗ, thanh toán, quản lý đơn, đánh giá. |
| **Nhà cung cấp** (`provider`) | Doanh nghiệp tour / khách sạn / nhà hàng; quản lý hồ sơ, dịch vụ, đơn đặt. |
| **Quản trị viên** (`admin`) | Vận hành sàn: duyệt hồ sơ, quản lý người dùng, điểm đến, cấu hình, báo cáo. |
| PayPal | Hệ thống ngoài: thanh toán, hoàn tiền, payout, webhook. |
| Gemini (Vertex AI), Google Maps | Hệ thống ngoài: mô hình AI, tìm địa điểm, tính lộ trình. |
| Vercel Cron | Hệ thống ngoài: xóa mềm dịch vụ đã dừng quá hạn. |

## Tổng quan

```mermaid
flowchart LR
    Guest(["👤 Khách vãng lai"])
    Customer(["👤 Khách hàng"])
    Provider(["👤 Nhà cung cấp"])
    Admin(["👤 Quản trị viên"])
    PayPal[["PayPal"]]
    AI[["Gemini / Google Maps"]]
    Cron[["Vercel Cron"]]

    Customer -. kế thừa .-> Guest

    subgraph Roamly
        direction TB
        UC1([Đăng ký / Đăng nhập])
        UC2([Tìm kiếm, khám phá dịch vụ & điểm đến])
        UC3([Xem chi tiết, bản đồ, đánh giá])
        UC4([Chat với Roamly AI])
        UC5([Lập lịch trình bằng AI])
        UC6([Đặt tour / phòng / bàn])
        UC7([Thanh toán PayPal])
        UC8([Hủy đơn & nhận hoàn tiền])
        UC9([Quản lý đơn, xem hóa đơn])
        UC10([Đánh giá dịch vụ])
        UC11([Quản lý hồ sơ doanh nghiệp])
        UC12([Quản lý tour / khách sạn / nhà hàng])
        UC13([Xử lý đơn đặt])
        UC14([Xem lịch, đánh giá, báo cáo])
        UC15([Duyệt hồ sơ nhà cung cấp])
        UC16([Quản lý người dùng])
        UC17([Quản lý điểm đến])
        UC18([Cấu hình hệ thống])
        UC19([Báo cáo & thống kê])
        UC20([Xóa mềm dịch vụ quá hạn])
    end

    Guest --- UC1 & UC2 & UC3 & UC4 & UC5
    Customer --- UC6 & UC8 & UC9 & UC10
    Provider --- UC1 & UC11 & UC12 & UC13 & UC14
    Admin --- UC15 & UC16 & UC17 & UC18 & UC19

    UC6 -. include .-> UC7
    UC7 --- PayPal
    UC8 --- PayPal
    UC13 --- PayPal
    UC11 --- PayPal
    UC4 --- AI
    UC5 --- AI
    Cron --- UC20
```

## Khách vãng lai & Khách hàng

```mermaid
flowchart LR
    Guest(["👤 Khách vãng lai"])
    Customer(["👤 Khách hàng"])
    PayPal[["PayPal"]]
    AI[["Gemini / Google Maps"]]
    Customer -. kế thừa .-> Guest

    subgraph Roamly
        direction TB
        G1([Đăng ký tài khoản])
        G2([Đăng nhập])
        G3([Xem trang chủ, giới thiệu])
        G4([Khám phá: lọc theo tỉnh, tag, giá])
        G5([Tìm kiếm ngữ nghĩa])
        G6([Xem chi tiết tour / khách sạn / nhà hàng / điểm đến])
        G7([Chat Roamly AI: gợi ý tour, địa điểm])
        G8([Lập lịch trình theo ngày, tính lộ trình])

        C1([Đặt tour theo lịch khởi hành])
        C2([Đặt phòng khách sạn])
        C3([Đặt bàn nhà hàng])
        C4([Thanh toán PayPal])
        C5([Hủy đơn])
        C6([Nhận hoàn tiền])
        C7([Xem danh sách & chi tiết đơn])
        C8([Xem / in hóa đơn])
        C9([Đánh giá sau khi hoàn thành])
        C10([Xem dashboard tài khoản])
        C11([Cập nhật hồ sơ cá nhân])
    end

    Guest --- G1 & G2 & G3 & G4 & G6 & G7 & G8
    Customer --- C1 & C2 & C3 & C5 & C7 & C9 & C10 & C11

    G4 -. include .-> G5
    G7 -. extend .-> G8
    C1 -. include .-> C4
    C2 -. include .-> C4
    C5 -. extend .-> C6
    C7 -. extend .-> C8
    C4 --- PayPal
    C6 --- PayPal
    G7 --- AI
    G8 --- AI
```

## Nhà cung cấp

```mermaid
flowchart LR
    Provider(["👤 Nhà cung cấp"])
    PayPal[["PayPal"]]

    subgraph Roamly
        direction TB
        P1([Đăng ký / Đăng nhập])
        P2([Tạo / sửa hồ sơ doanh nghiệp])
        P3([Liên kết tài khoản PayPal])
        P4([Gửi hồ sơ chờ duyệt])
        P5([Cập nhật chữ ký hóa đơn])
        P6([Quản lý tour & lịch khởi hành])
        P7([Quản lý khách sạn & loại phòng])
        P8([Quản lý nhà hàng & khung giờ])
        P9([Tạm dừng / xóa dịch vụ])
        P10([Xác nhận đơn])
        P11([Hủy đơn])
        P12([Hoàn thành đơn])
        P13([Nhận payout])
        P14([Xem lịch đặt chỗ])
        P15([Xem đánh giá])
        P16([Dashboard & báo cáo doanh thu])
        P17([Xuất Excel đơn đặt])
        P18([Xem / in hóa đơn])
    end

    Provider --- P1 & P2 & P5 & P6 & P7 & P8 & P9 & P10 & P11 & P12 & P14 & P15 & P16 & P17 & P18
    P2 -. include .-> P3
    P2 -. include .-> P4
    P12 -. include .-> P13
    P3 --- PayPal
    P11 --- PayPal
    P13 --- PayPal
```

## Quản trị viên

```mermaid
flowchart LR
    Admin(["👤 Quản trị viên"])
    Cron[["Vercel Cron"]]

    subgraph Roamly
        direction TB
        A1([Đăng nhập trang quản trị])
        A2([Xem dashboard tổng quan])
        A3([Duyệt / từ chối hồ sơ nhà cung cấp])
        A4([Xem danh sách & chi tiết người dùng])
        A5([Khóa / mở khóa tài khoản])
        A6([Thêm / sửa / ẩn điểm đến])
        A7([Cấu hình hoa hồng, tỷ giá, thời gian giữ chỗ, hạn hủy])
        A8([Cấu hình thông tin & video giới thiệu])
        A9([Báo cáo & thống kê])
        A10([Xuất báo cáo Excel])
        A11([Xem hóa đơn đặt chỗ])
        S1([Xóa mềm dịch vụ đã dừng quá hạn])
    end

    Admin --- A1 & A2 & A3 & A4 & A6 & A7 & A8 & A9 & A11
    A4 -. extend .-> A5
    A9 -. extend .-> A10
    Cron --- S1
```

## Đặc tả tóm tắt các use case chính

| Use case | Tác nhân | Tiền điều kiện | Luồng chính | Hậu điều kiện |
|---|---|---|---|---|
| Đặt tour / phòng | Khách hàng | Đã đăng nhập; còn chỗ / còn phòng | Chọn lịch / ngày → nhập thông tin liên hệ → tạo đơn `pending_payment` giữ chỗ → chuyển sang PayPal | Đơn được giữ trong `bookingHoldMinutes` phút |
| Thanh toán PayPal | Khách hàng, PayPal | Đơn `pending_payment` chưa hết hạn | Quy đổi VND → USD → PayPal duyệt → capture → ghi `Payment` | Đơn `paid`; quá hạn thì `expired` và trả chỗ |
| Đặt bàn | Khách hàng | Đã đăng nhập; khung giờ còn sức chứa | Chọn ngày, khung giờ, số khách → tạo đơn | Đơn `pending_confirmation` chờ nhà hàng xác nhận |
| Hủy đơn | Khách hàng / Nhà cung cấp | Đơn `paid` / `confirmed` (khách: trước hạn hủy) | Cập nhật `cancelled` → tạo `Refund` → hoàn tiền qua PayPal | Khách nhận lại tiền, chỗ được trả lại |
| Hoàn thành đơn | Nhà cung cấp | Đơn `confirmed`, dịch vụ đã diễn ra | Cập nhật `completed` → tạo `Payout` (sau khi trừ hoa hồng) | Nhà cung cấp nhận tiền về PayPal; khách được đánh giá |
| Đánh giá | Khách hàng | Đơn `completed`, chưa đánh giá | Chấm 1–5 sao, viết nội dung | Cập nhật `ratingAvg`, `reviewCount` của dịch vụ |
| Duyệt hồ sơ | Quản trị viên | Hồ sơ ở trạng thái `pending` | Xem giấy phép, thông tin → duyệt hoặc từ chối kèm lý do | `approved`: được đăng dịch vụ; `rejected`: sửa và gửi lại |
| Chat Roamly AI | Khách vãng lai | — | Gửi câu hỏi → AI gọi tool tìm tour / địa điểm / web → trả lời kèm thẻ dịch vụ | Có thể chuyển sang lập lịch trình |
| Lập lịch trình | Khách vãng lai | — | Mô tả chuyến đi → AI hỏi thêm, tìm địa điểm → tạo lịch trình theo ngày → tính lộ trình | Lịch trình lưu trong trình duyệt, có thể chỉnh tay |
