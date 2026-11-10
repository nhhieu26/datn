"use client";

import type { ProviderProfile } from "@/generated/prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DeleteProfileDialog } from "./delete-profile-dialog";
import { ProfileIcon } from "./profile-icon";

export function DeleteProfileButton({
  profile,
}: {
  profile: Pick<ProviderProfile, "id" | "businessName">;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="inline-flex items-center justify-center gap-x-2 rounded-lg border border-red-200 bg-layer px-3 py-2 text-sm font-medium text-red-600 shadow-2xs hover:bg-red-50 focus:bg-red-50 focus:outline-hidden"
        onClick={() => setOpen(true)}
        type="button"
      >
        <ProfileIcon name="trash" />
        Xóa hồ sơ
      </button>
      {open ? (
        <DeleteProfileDialog
          onClose={() => setOpen(false)}
          onDeleted={() => router.push("/provider/profiles")}
          profile={profile}
        />
      ) : null}
    </>
  );
}
