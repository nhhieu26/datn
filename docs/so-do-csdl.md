# Sơ đồ cơ sở dữ liệu

PostgreSQL, quản lý bằng Prisma (`prisma/schema.prisma`). Sơ đồ chia thành 3 nhóm để dễ đọc; các bảng xuất hiện ở nhiều nhóm là cùng một bảng.

## 1. Người dùng, nhà cung cấp và dịch vụ

```mermaid
erDiagram
    User ||--o{ ProviderProfile : "sở hữu"
    ProviderProfile ||--o{ Tour : "cung cấp"
    ProviderProfile ||--o{ Hotel : "cung cấp"
    ProviderProfile ||--o{ Restaurant : "cung cấp"

    Province ||--o{ Tour : ""
    Province ||--o{ Hotel : ""
    Province ||--o{ Restaurant : ""
    Province ||--o{ Destination : ""

    Tour ||--o{ TourDeparture : "lịch khởi hành"
    Hotel ||--o{ Room : "loại phòng"
    Restaurant ||--o{ RestaurantTimeSlot : "khung giờ"

    Tag ||--o{ TourTag : ""
    Tour ||--o{ TourTag : ""
    Tag ||--o{ HotelTag : ""
    Hotel ||--o{ HotelTag : ""
    Tag ||--o{ RestaurantTag : ""
    Restaurant ||--o{ RestaurantTag : ""
    Tag ||--o{ DestinationTag : ""
    Destination ||--o{ DestinationTag : ""

    User {
        string id PK
        string email UK
        string phone UK
        string password "bcrypt"
        string fullname
        Role role "customer | provider | admin"
        UserStatus status "active | inactive | banned"
        boolean onboardingCompleted
        json preferences
    }
    ProviderProfile {
        string id PK
        string userId FK
        string businessName
        BusinessType businessType "tour | hotel | restaurant"
        string taxCode
        string licenseUrl
        string photoUrl
        string signatureUrl
        ApprovalStatus approvalStatus "not_submitted | pending | approved | rejected"
        string rejectionReason
        string payoutEmail "PayPal nhận tiền"
        string paypalPayerId
    }
    Province {
        string id PK
        string name UK
        string slug UK
        ProvinceType type "province | city"
    }
    Tag {
        string id PK
        string name UK
        string slug UK
    }
    Tour {
        string id PK
        string providerProfileId FK
        string provinceId FK
        string title
        string slug UK
        json itinerary
        int durationDays
        int durationNights
        decimal basePrice
        ServiceStatus status "published | paused"
        decimal ratingAvg
        int reviewCount
        datetime deleteScheduledAt
        datetime deletedAt
    }
    TourDeparture {
        string id PK
        string tourId FK
        datetime departureDate
        datetime returnDate
        decimal price
        int totalSlots
        int bookedSlots
        TourDepartureStatus status "scheduled | full | cancelled | completed"
    }
    Hotel {
        string id PK
        string providerProfileId FK
        string provinceId FK
        string name
        string slug UK
        string address
        decimal latitude
        decimal longitude
        ServiceStatus status
        decimal ratingAvg
        datetime deletedAt
    }
    Room {
        string id PK
        string hotelId FK
        string name
        int capacity
        int quantity
        decimal basePrice
        ServiceStatus status
    }
    Restaurant {
        string id PK
        string providerProfileId FK
        string provinceId FK
        string name
        string slug UK
        decimal latitude
        decimal longitude
        int capacity
        json menu
        ServiceStatus status
        datetime deletedAt
    }
    RestaurantTimeSlot {
        string id PK
        string restaurantId FK
        string startTime
        string endTime
    }
    Destination {
        string id PK
        string provinceId FK
        string name
        string slug UK
        decimal latitude
        decimal longitude
        string openTime
        string closeTime
        decimal ticketPrice
        boolean isPublished
    }
    TourTag {
        string tourId PK, FK
        string tagId PK, FK
    }
    HotelTag {
        string hotelId PK, FK
        string tagId PK, FK
    }
    RestaurantTag {
        string restaurantId PK, FK
        string tagId PK, FK
    }
    DestinationTag {
        string destinationId PK, FK
        string tagId PK, FK
    }
```

## 2. Đặt chỗ, thanh toán và đánh giá

```mermaid
erDiagram
    User ||--o{ TourBooking : "đặt"
    User ||--o{ HotelBooking : "đặt"
    User ||--o{ RestaurantBooking : "đặt"
    User ||--o{ Review : "viết"

    ProviderProfile ||--o{ TourBooking : "nhận"
    ProviderProfile ||--o{ HotelBooking : "nhận"
    ProviderProfile ||--o{ RestaurantBooking : "nhận"
    ProviderProfile ||--o{ Payout : "được trả"

    TourDeparture |o--o{ TourBooking : ""
    Room |o--o{ HotelBooking : ""
    Restaurant |o--o{ RestaurantBooking : ""
    RestaurantTimeSlot |o--o{ RestaurantBooking : ""

    TourBooking ||--o{ Payment : ""
    HotelBooking ||--o{ Payment : ""
    Payment ||--o{ Refund : ""
    TourBooking ||--o{ Refund : ""
    HotelBooking ||--o{ Refund : ""
    TourBooking ||--o| Payout : ""
    HotelBooking ||--o| Payout : ""

    TourBooking ||--o| Review : ""
    HotelBooking ||--o| Review : ""
    RestaurantBooking ||--o| Review : ""
    Tour ||--o{ Review : ""
    Hotel ||--o{ Review : ""
    Restaurant ||--o{ Review : ""

    TourBooking {
        string id PK
        string code UK "TB-xxxx"
        string customerId FK
        string providerProfileId FK
        string tourDepartureId FK
        string tourTitle "snapshot"
        datetime departureDate
        int guests
        BookingStatus status
        decimal unitPrice
        decimal totalAmount
        decimal commissionRate
        decimal platformFee
        decimal providerAmount
        datetime expiresAt "hạn giữ chỗ"
    }
    HotelBooking {
        string id PK
        string code UK "HB-xxxx"
        string customerId FK
        string providerProfileId FK
        string roomId FK
        string hotelName "snapshot"
        string roomName "snapshot"
        datetime checkInDate
        datetime checkOutDate
        int nights
        int roomQuantity
        int guests
        BookingStatus status
        decimal totalAmount
        decimal platformFee
        decimal providerAmount
        datetime expiresAt
    }
    RestaurantBooking {
        string id PK
        string code UK "RB-xxxx"
        string customerId FK
        string providerProfileId FK
        string restaurantId FK
        string restaurantTimeSlotId FK
        datetime reservationDate
        string startTime
        int guests
        BookingStatus status "mặc định pending_confirmation"
    }
    Payment {
        string id PK
        string tourBookingId FK "đúng 1 trong 2"
        string hotelBookingId FK "đúng 1 trong 2"
        PaymentGateway gateway "paypal"
        TransactionStatus status
        decimal amount "VND"
        decimal chargedAmount "USD"
        string chargedCurrency
        decimal exchangeRate
        string gatewayOrderId UK
        string gatewayCaptureId UK
    }
    Refund {
        string id PK
        string paymentId FK
        string tourBookingId FK
        string hotelBookingId FK
        TransactionStatus status
        decimal amount
        decimal chargedAmount
        string gatewayRefundId UK
        string reason
    }
    Payout {
        string id PK
        string tourBookingId FK, UK
        string hotelBookingId FK, UK
        string providerProfileId FK
        TransactionStatus status
        decimal amount
        decimal chargedAmount
        string receiver "payoutEmail"
        string gatewayBatchId
        string gatewayItemId UK
    }
    Review {
        string id PK
        string customerId FK
        int rating "1-5"
        string content
        string tourId FK
        string hotelId FK
        string restaurantId FK
        string tourBookingId FK, UK
        string hotelBookingId FK, UK
        string restaurantBookingId FK, UK
    }
```

## 3. Bảng độc lập (cache AI và cấu hình)

```mermaid
erDiagram
    ExternalPlace {
        string id PK
        string osmType
        string osmId
        ExternalPlaceKind kind "hotel | restaurant | destination"
        string name
        string address
        decimal latitude
        decimal longitude
        json extra
    }
    ExternalPlaceSearch {
        string id PK
        string queryKey UK
        string[] placeIds "-> ExternalPlace.id"
        datetime expiresAt
    }
    ExternalArea {
        string id PK
        string queryKey UK
        json result "viewport hoặc danh sách tên trùng"
        datetime expiresAt
    }
    SystemSetting {
        string id PK "singleton = default"
        decimal commissionRate "0.1"
        decimal usdRate "25000"
        int bookingHoldMinutes "10"
        int customerCancelCutoffHours "24"
        int restaurantCancelCutoffHours "2"
        int serviceDeleteGraceDays "30"
        string platformName
        string contactEmail
        string aboutVideoUrl
    }
```

## Ghi chú thiết kế

- **Snapshot dữ liệu đơn:** đơn đặt lưu lại tên dịch vụ, giá, tỷ lệ hoa hồng tại thời điểm đặt. Khi dịch vụ bị sửa hoặc xóa, khóa ngoại tới `TourDeparture` / `Room` / `Restaurant` chuyển thành `NULL` (`onDelete: SetNull`), đơn vẫn còn nguyên.
- **Ràng buộc "đúng một trong nhiều":** `Payment` và `Refund` gắn với đúng một trong `TourBooking` / `HotelBooking`; `Review` gắn với đúng một trong `Tour` / `Hotel` / `Restaurant`. Các ràng buộc này là `CHECK` trong migration.
- **Một đơn – một đánh giá – một payout:** khóa `UNIQUE` trên `Review.*BookingId` và `Payout.*BookingId`.
- **Tiền tệ:** giá lưu bằng VND; PayPal không hỗ trợ VND nên `Payment` / `Refund` / `Payout` lưu thêm số tiền thực thu bằng USD (`chargedAmount`, `chargedCurrency`, `exchangeRate`).
- **Xóa mềm dịch vụ:** nhà cung cấp xóa tour/khách sạn/nhà hàng → đặt `deleteScheduledAt`; Vercel Cron đặt `deletedAt` khi hết thời gian ân hạn (`serviceDeleteGraceDays`).
- **Nhà hàng không thanh toán trước:** `RestaurantBooking` không có cột tiền và không liên kết `Payment` / `Payout`.
- **Một user nhiều hồ sơ:** mỗi nhà cung cấp có tối đa một hồ sơ cho mỗi loại hình (`@@unique([userId, businessType])`).
