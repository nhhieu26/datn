"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { type ActionState, runAction } from "@/shared/lib/action-state";
import {
  addDay,
  assertCanEditTrip,
  createEmptyTrip,
  getTripView,
  moveStop,
  removeDay,
  recomputeTripRoutes,
  removeStop,
  renameTrip,
  reorderDayStops,
} from "./lib/trip-service";
import { MAX_STOPS_PER_DAY, type TripView } from "./lib/types";

const idSchema = z.string().min(1).max(64);
const daySchema = z.number().int().min(1).max(31);
const indexSchema = z.number().int().min(0).max(MAX_STOPS_PER_DAY);

async function editTrip(tripId: string, fn: () => Promise<TripView>): Promise<ActionState<TripView>> {
  return runAction(async () => {
    const session = await auth();
    await assertCanEditTrip(idSchema.parse(tripId), session?.user?.id);
    return fn();
  });
}

export async function createTripAction() {
  const session = await auth();
  const id = await createEmptyTrip(session?.user?.id);
  redirect(`/trips/${id}`);
}

export async function getTripAction(tripId: string): Promise<ActionState<TripView>> {
  return runAction(() => getTripView(idSchema.parse(tripId)));
}

export async function removeTripStopAction(tripId: string, stopId: string) {
  return editTrip(tripId, () => removeStop(tripId, idSchema.parse(stopId)));
}

/** Chuyển điểm dừng tới `index` của ngày `day` (không truyền `index` → cuối ngày); giữ thứ tự người dùng. */
export async function moveTripStopAction(tripId: string, stopId: string, day: number, index?: number) {
  return editTrip(tripId, () =>
    moveStop(tripId, idSchema.parse(stopId), daySchema.parse(day), {
      index: indexSchema.optional().parse(index),
    }),
  );
}

/** Sắp lại thứ tự điểm dừng trong ngày theo kéo thả của người dùng. */
export async function reorderTripStopsAction(tripId: string, day: number, stopIds: string[]) {
  return editTrip(tripId, () =>
    reorderDayStops(tripId, daySchema.parse(day), z.array(idSchema).max(MAX_STOPS_PER_DAY).parse(stopIds)),
  );
}

export async function addTripDayAction(tripId: string) {
  return editTrip(tripId, () => addDay(tripId));
}

export async function removeTripDayAction(tripId: string, day: number) {
  return editTrip(tripId, () => removeDay(tripId, daySchema.parse(day)));
}

export async function renameTripAction(tripId: string, title: string) {
  return editTrip(tripId, () => renameTrip(tripId, z.string().max(200).parse(title)));
}

export async function recomputeTripRoutesAction(tripId: string) {
  return editTrip(tripId, () => recomputeTripRoutes(tripId));
}
