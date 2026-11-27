# User Flow

## 1. Khách hàng: tìm kiếm → đặt chỗ → thanh toán → đánh giá

```mermaid
flowchart TD
    Start([Truy cập Roamly]) --> Home[Trang chủ]
    Home --> Explore[Khám phá / tìm kiếm<br/>lọc tỉnh, tag, giá]
    Home --> Chat[Chat Roamly AI]
    Chat -->|AI gợi ý thẻ dịch vụ| Detail
    Explore --> Detail[Trang chi tiết<br/>ảnh, bản đồ, đánh giá]
    Detail --> BookBtn{Bấm Đặt ngay}
    BookBtn --> LoggedIn{Đã đăng nhập?}
    LoggedIn -- Chưa --> SignIn[Đăng nhập / Đăng ký] --> BookForm
    LoggedIn -- Rồi --> BookForm[Form đặt chỗ<br/>chọn lịch / ngày / khung giờ, số khách, liên hệ]
    BookForm --> Kind{Loại dịch vụ}

    Kind -- Nhà hàng --> RB[Tạo đơn<br/>pending_confirmation]
    RB --> WaitR[Chờ nhà hàng xác nhận]
    WaitR --> RConf{Nhà hàng xử lý}
    RConf -- Xác nhận --> RConfirmed[confirmed] --> Dine[Dùng bữa] --> Done
    RConf -- Từ chối --> Cancelled([cancelled])

    Kind -- Tour / Khách sạn --> Hold[Tạo đơn pending_payment<br/>giữ chỗ N phút]
    Hold --> PayPal[Chuyển sang PayPal<br/>VND quy đổi USD]
    PayPal --> PayRes{Kết quả}
    PayRes -- Thanh toán thành công --> Paid[paid]
    PayRes -- Hủy / quá hạn giữ chỗ --> Expired([expired<br/>trả lại chỗ])
    Paid --> WaitP[Chờ nhà cung cấp xác nhận] --> Confirmed[confirmed]
    Confirmed --> Use[Sử dụng dịch vụ] --> Done[Nhà cung cấp hoàn thành<br/>completed]

    Paid -. Khách hủy trước hạn .-> Refund([cancelled + hoàn tiền PayPal])
    Confirmed -. Khách hủy trước hạn .-> Refund

    Done --> Invoice[Xem / in hóa đơn]
    Done --> Review[Viết đánh giá 1–5 sao]
```

## 2. Khách: chat AI và lập lịch trình

```mermaid
flowchart TD
    A([Mở /chat]) --> B[Nhập câu hỏi<br/>vd: đi Đà Lạt 3 ngày nên ở đâu?]
    B --> C{AI chọn tool}
    C -- searchTours --> D[Tìm tour trong hệ thống<br/>Pinecone + PostgreSQL]
    C -- searchPlaces --> E[Tìm khách sạn / nhà hàng / điểm đến<br/>nội bộ + Google Places + web]
    C -- askUser --> F[Hỏi lại khi địa danh mơ hồ] --> B
    C -- openTripPlanner --> G[Gợi ý mở trình lập lịch trình]
    D --> H[Trả lời kèm thẻ dịch vụ]
    E --> H
    H --> I{Người dùng}
    I -- Bấm thẻ --> J[Trang chi tiết → đặt chỗ]
    I -- Hỏi tiếp --> B
    G --> K([Mở /trip-planner])

    K --> L[Mô tả chuyến đi<br/>điểm đến, số ngày, sở thích, phương tiện]
    L --> M{AI cần thêm thông tin?}
    M -- Có --> N[askUser] --> L
    M -- Không --> O[searchPlaces / searchWeb]
    O --> P[setItinerary: lịch trình theo ngày]
    P --> Q[Google Routes tính quãng đường, thời gian]
    Q --> R[Hiển thị lịch trình + bản đồ]
    R --> S{Chỉnh sửa}
    S -- Chat yêu cầu AI sửa --> L
    S -- Sửa tay --> R
    R --> T([Lưu trong trình duyệt])
```

## 3. Nhà cung cấp: đăng ký → được duyệt → bán dịch vụ → nhận tiền

```mermaid
flowchart TD
    A([Đăng ký tài khoản nhà cung cấp]) --> B[Đăng nhập /provider]
    B --> C[Tạo hồ sơ doanh nghiệp<br/>loại hình: tour / khách sạn / nhà hàng]
    C --> D[Liên kết PayPal<br/>Log in with PayPal]
    D --> E[Gửi hồ sơ → pending]
    E --> F{Quản trị viên duyệt}
    F -- Từ chối + lý do --> G[rejected] --> H[Sửa hồ sơ] --> E
    F -- Duyệt --> I[approved]
    I --> J[Tạo dịch vụ<br/>tour + lịch khởi hành / khách sạn + phòng / nhà hàng + khung giờ]
    J --> K[Dịch vụ published<br/>đồng bộ embedding lên Pinecone]
    K --> L[Nhận đơn đặt]
    L --> M{Xử lý đơn}
    M -- Xác nhận --> N[confirmed]
    M -- Hủy --> O([cancelled<br/>tour/khách sạn: hoàn tiền khách])
    N --> P[Dịch vụ diễn ra] --> Q[Bấm Hoàn thành → completed]
    Q --> R{Tour / khách sạn?}
    R -- Có --> S[Tạo Payout = tổng tiền − hoa hồng<br/>gửi về PayPal nhà cung cấp]
    R -- Nhà hàng --> T([Kết thúc])
    S --> T
    K -. Tạm dừng / Xóa .-> U[paused / chờ xóa<br/>Cron xóa mềm sau N ngày]
    L -.-> V[Lịch, đánh giá, báo cáo, xuất Excel, hóa đơn]
```

## 4. Quản trị viên

```mermaid
flowchart TD
    A([Đăng nhập /admin/sign-in]) --> B[Dashboard tổng quan]
    B --> C[Duyệt hồ sơ]
    C --> C1[Xem chi tiết, giấy phép] --> C2{Quyết định}
    C2 -- Duyệt --> C3[approved]
    C2 -- Từ chối --> C4[rejected + lý do]
    B --> D[Người dùng] --> D1[Xem chi tiết, đơn đặt] --> D2{Vi phạm?}
    D2 -- Có --> D3[Khóa tài khoản banned]
    D2 -- Không --> D4[Mở khóa / giữ nguyên]
    B --> E[Điểm đến] --> E1[Thêm / sửa / ẩn]
    B --> F[Cấu hình hệ thống] --> F1[Hoa hồng, tỷ giá USD, thời gian giữ chỗ,<br/>hạn hủy, thời gian ân hạn xóa, thông tin sàn]
    B --> G[Báo cáo & thống kê] --> G1[Lọc theo thời gian] --> G2[Xuất Excel]
```

## 5. Vòng đời trạng thái đơn đặt

### Tour / Khách sạn (có thanh toán)

```mermaid
stateDiagram-v2
    [*] --> pending_payment: Khách tạo đơn (giữ chỗ)
    pending_payment --> paid: PayPal capture thành công
    pending_payment --> expired: Quá thời gian giữ chỗ
    paid --> confirmed: Nhà cung cấp xác nhận
    paid --> cancelled: Khách / nhà cung cấp hủy (hoàn tiền)
    confirmed --> cancelled: Khách / nhà cung cấp hủy (hoàn tiền)
    confirmed --> completed: Nhà cung cấp hoàn thành (tạo Payout)
    expired --> [*]
    cancelled --> [*]
    completed --> [*]: Khách đánh giá
```

### Nhà hàng (không thanh toán trước)

```mermaid
stateDiagram-v2
    [*] --> pending_confirmation: Khách đặt bàn
    pending_confirmation --> confirmed: Nhà hàng xác nhận
    pending_confirmation --> cancelled: Khách hủy / nhà hàng từ chối
    confirmed --> cancelled: Khách hủy trước hạn / nhà hàng hủy
    confirmed --> completed: Nhà hàng hoàn thành
    cancelled --> [*]
    completed --> [*]: Khách đánh giá
```

## 6. Luồng thanh toán PayPal (tour / khách sạn)

```mermaid
sequenceDiagram
    actor K as Khách hàng
    participant R as Roamly
    participant DB as PostgreSQL
    participant P as PayPal

    K->>R: Gửi form đặt chỗ
    R->>DB: Tạo đơn pending_payment, giữ chỗ, expiresAt
    R->>P: Tạo Order (VND → USD theo tỷ giá)
    P-->>R: orderId + link duyệt
    R->>DB: Tạo Payment (pending)
    R-->>K: Chuyển hướng sang PayPal
    K->>P: Đăng nhập & duyệt thanh toán
    P-->>R: Redirect /api/paypal/orders/return
    R->>P: Capture order
    P-->>R: captureId
    R->>DB: Payment succeeded, đơn → paid
    R-->>K: Trang chi tiết đơn
    P--)R: Webhook (đối soát capture / refund / payout)

    Note over R,P: Khi hủy: tạo Refund → PayPal refund capture
    Note over R,P: Khi hoàn thành: tạo Payout → PayPal Payouts tới payoutEmail
```
