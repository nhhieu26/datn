import type { Metadata } from "next";
import { TripPlannerPage } from "@/features/trip-planner";

export const metadata: Metadata = {
  title: "Lập lộ trình — Roamly",
  description: "Lập lộ trình du lịch tối ưu cùng Roamly AI.",
};

export default async function TripPlannerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TripPlannerPage id={id} />;
}
