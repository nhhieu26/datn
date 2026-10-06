-- Booking đã thanh toán (PayPal capture thành công)
ALTER TYPE "BookingStatus" ADD VALUE 'paid' AFTER 'pending_payment';
