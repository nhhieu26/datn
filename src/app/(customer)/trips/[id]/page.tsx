import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TripBuilder } from "@/features/customer/trips";
import { canEditTrip, getTrip } from "@/features/customer/trips/lib/trip-service";
import { auth } from "@/lib/auth";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const trip = await getTrip(id);
  return { title: trip ? `${trip.view.title} — Roamly` : "Không tìm thấy lộ trình" };
}

export default async function TripPage({ params }: Props) {
  const { id } = await params;
  const [trip, session] = await Promise.all([getTrip(id), auth()]);
  if (!trip) notFound();

  return (
    <main className="font-[family-name:var(--font-dm-sans)] text-new-paragraph">
      <TripBuilder
        canEdit={canEditTrip(trip.ownerId, session?.user?.id)}
        initialView={trip.view}
        key={trip.view.id}
      />
    </main>
  );
}
