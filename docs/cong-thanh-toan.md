# Khảo sát cổng thanh toán (booking & payout)

Mô hình: customer thanh toán → tiền về tài khoản sàn → sau khi dùng dịch vụ xong sàn payout cho provider (trừ hoa hồng `PLATFORM_COMMISSION_RATE`). Khách hủy → sàn refund lại. Restaurant chỉ đặt bàn, không thanh toán.

## So sánh

| Cổng | TK ngân hàng VN | DN Việt Nam | Payout | Payout trong sandbox |
|---|---|---|---|---|
| **PayPal** | ✅ rút về NH VN (~60k/lần + ~3% quy đổi) | ✅ VN = "send, receive, withdraw" | ✅ Payouts API | ✅ bật sẵn trong sandbox |
| payOS | ✅ | ✅ | ✅ `/v1/payouts` | ❌ không có sandbox |
| VNPay | ✅ | ✅ | ⚠️ chi hộ phải ký hợp đồng riêng | ❌ sandbox công khai chỉ có thanh toán |
| MoMo | ✅ | ✅ | ✅ disbursement (ví/NH) | ⚠️ phải onboard với MoMo |
| Stripe | ❌ | ❌ không hỗ trợ DN VN | — | — |

**Chọn PayPal** — cổng duy nhất đủ cả 4 điều kiện. Lưu ý: PayPal không hỗ trợ VND → thu bằng USD (lưu `chargedAmount`, `chargedCurrency`, `exchangeRate`); provider nhận payout qua `ProviderProfile.payoutEmail`.

## Tài liệu tham khảo

### PayPal
- [Payouts – Countries and supported features](https://developer.paypal.com/payouts/supported-features)
- [Set up accounts and environment for payouts](https://docs.paypal.ai/growth/payouts/set-up)
- [Get started with PayPal REST APIs](https://developer.paypal.com/api/rest)
- [Enabling Payouts in Sandbox – PayPal Community](https://www.paypal-community.com/t5/Sandbox-Environment/Enabling-Payouts-Payouts-Web-and-Mass-Payments-in-Sandbox/td-p/3008100)
- [Phí rút tiền PayPal về ngân hàng VN](https://burgerprints.com/en/paypal-withdrawal-fees/)
- [VND không được PayPal hỗ trợ – PayPal Community](https://www.paypal-community.com/t5/Ask-an-Expert/Set-up-VND-as-main-currency/td-p/1290859)

### payOS
- [payOS API docs (có Payout API)](https://payos.vn/docs/api/)
- [NodeJS SDK](https://payos.vn/docs/sdks/back-end/node/)
- [payos-payout-demo-nodejs](https://github.com/payOSHQ/payos-payout-demo-nodejs)
- [Thủ tục đăng ký (không có sandbox)](https://payos.vn/thu-tuc-dang-ky-cong-thanh-toan/)

### VNPay
- [Giới thiệu – Sandbox VNPay](https://sandbox.vnpayment.vn/apis/docs/gioi-thieu/)
- [Hướng dẫn tích hợp thanh toán PAY](https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html)
- [Payout / chi hộ là gì – SePay](https://sepay.vn/blog/payout-la-gi/)

### MoMo
- [Single Disbursement API](https://developers.momo.vn/v3/docs/payment/api/disbursement-v2/)
- [Batch Disbursement API](https://developers.momo.vn/v3/docs/payment/api/bulk-disbursement-v2/)
- [MoMo Payment Platform (test)](https://test-payment.momo.vn/payment-platform/)

### Stripe
- [Stripe supported countries 2026](https://www.cs-cart.com/blog/stripe-supported-countries/)
- [Stripe Connect cross-border payouts](https://docs.stripe.com/connect/cross-border-payouts)
