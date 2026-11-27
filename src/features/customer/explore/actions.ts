"use server";

import { revalidatePath } from "next/cache";
import { searchHistoryRepo } from "@/entities/search-history";
import { auth } from "@/lib/auth";
import { runAction } from "@/shared/lib/action-state";
import { UnauthenticatedError } from "@/shared/lib/errors";

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new UnauthenticatedError();
  return session.user.id;
}

export async function deleteSearchAction(id: string) {
  return runAction(async () => {
    await searchHistoryRepo.remove(await requireUserId(), id);
    revalidatePath("/explore");
  });
}

export async function clearSearchesAction() {
  return runAction(async () => {
    await searchHistoryRepo.clear(await requireUserId());
    revalidatePath("/explore");
  });
}
