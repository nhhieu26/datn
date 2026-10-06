// Tỉ giá VND/USD dùng khi tạo PayPal order (PayPal không hỗ trợ VND)
export const USD_RATE = Number(process.env.PAYPAL_USD_RATE ?? 25_000);
