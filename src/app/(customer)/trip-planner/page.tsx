import type { Metadata } from "next";
import { TripList } from "@/features/trip-planner";

export const metadata: Metadata = {
  title: "Lộ trình của tôi — Roamly",
  description: "Lập lộ trình du lịch nhiều điểm dừng cùng Roamly AI, có bản đồ và quãng đường thực tế.",
};

export default function TripPlannerListPage() {
  return <TripList />;
}
