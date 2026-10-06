-- Đơn đặt bàn chờ nhà hàng xác nhận (không có thanh toán)
ALTER TYPE "BookingStatus" ADD VALUE 'pending_confirmation' AFTER 'pending_payment';
