import { hotelBookingRepo } from "@/entities/hotel-booking";
import { findRecentBookings } from "@/entities/recent-bookings";
import { findRecentTransactionsForCustomer } from "@/entities/recent-transactions";
import { restaurantBookingRepo } from "@/entities/restaurant-booking";
import { tourBookingRepo } from "@/entities/tour-booking";
import {
  getMyBookingsSummary,
  getMyRestaurantBookingsSummary,
} from "@/features/customer/my-bookings/utils";
import type { CustomerDashboardData } from "./types";

const TRANSACTIONS_LIMIT = 5;
const BOOKINGS_LIMIT = 5;

export async function getCustomerDashboardData(
  customerId: string,
): Promise<CustomerDashboardData> {
  // Nhả các đơn hết hạn giữ chỗ trước khi đếm, giống các trang danh sách đơn
  await Promise.all([
    tourBookingRepo.releaseExpired(),
    hotelBookingRepo.releaseExpired(),
  ]);

  const [tourRows, hotelRows, restaurantRows, transactions, bookings] =
    await Promise.all([
      tourBookingRepo.summarizeByCustomerId(customerId),
      hotelBookingRepo.summarizeByCustomerId(customerId),
      restaurantBookingRepo.summarizeByCustomerId(customerId),
      findRecentTransactionsForCustomer(customerId, TRANSACTIONS_LIMIT),
      findRecentBookings({ customerId }, BOOKINGS_LIMIT),
    ]);

  const tour = getMyBookingsSummary(tourRows);
  const hotel = getMyBookingsSummary(hotelRows);
  const restaurant = getMyRestaurantBookingsSummary(restaurantRows);

  return {
    stats: {
      total: tour.total + hotel.total + restaurant.total,
      tour,
      hotel,
      restaurant,
    },
    transactions: transactions.map((t) => ({ ...t, date: t.date.toISOString() })),
    recentBookings: bookings.map((b) => ({
      id: b.id,
      type: b.type,
      code: b.code,
      title: b.title,
      providerName: b.providerName,
      serviceDate: b.serviceDate.toISOString(),
      guests: b.guests,
      status: b.status,
      totalAmount: b.totalAmount,
    })),
  };
}
